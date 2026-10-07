#!/usr/bin/env node
/**
 * Dependency-free secret scanner for git hooks and CI.
 *
 *   node scripts/scan-secrets.mjs          # scan the staged changes (pre-commit)
 *   node scripts/scan-secrets.mjs --all    # scan every tracked file
 *
 * Exits 1 when something looks like a committed secret. Allow a benign match
 * with a `.secretsallow` file at the repo root — one regex per line, tested
 * against `<path>:<line text>`, so `#` starts a comment.
 *
 * No dependencies on purpose: it has to run inside a git hook and in CI without
 * installing anything.
 */

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';

const ALLOW_FILE = '.secretsallow';
const MAX_LINE = 4000;

const SKIP_EXT = new Set([
  'png', 'jpg', 'jpeg', 'gif', 'webp', 'ico', 'bmp', 'tiff', 'avif', 'heic',
  'pdf', 'zip', 'gz', 'tgz', 'bz2', 'xz', '7z', 'rar', 'jar', 'whl',
  'so', 'dylib', 'dll', 'exe', 'node', 'wasm', 'class', 'bin', 'o', 'a',
  'map', 'lock', 'log', 'sqlite', 'db', 'mp3', 'mp4', 'mov', 'wav',
  'woff', 'woff2', 'ttf', 'otf', 'eot', 'icns',
]);

const SKIP_NAME = new Set([
  'package-lock.json', 'bun.lockb', 'bun.lock', 'yarn.lock', 'pnpm-lock.yaml',
  'composer.lock', 'Cargo.lock', 'poetry.lock',
]);

/** Vendored / third-party trees: never where your own secrets live. */
const SKIP_DIR = /(?:^|\/)(?:node_modules|bower_components|vendor|\.git)(?:\/|$)/;

/** `.env` files are never committed — only the template variants are allowed. */
const ENV_ALLOWED = /(?:^|\/)\.env\.(?:example|sample|template)$/;
const ENV_FILE = /(?:^|\/)\.env(?:\.|$)/;

const PLACEHOLDER =
  /(process\.env|import\.meta\.env|example|placeholder|change[-_]?me|your[-_ ]|xxx{2,}|<[^>]+>|dummy|sample|redacted|\*\*\*|__[A-Z_]+__|\.\.\.|\bpassword\b|\bsecret\b)/i;

const RULES = [
  { id: 'aws-access-key', re: /\bAKIA[0-9A-Z]{16}\b/ },
  { id: 'google-api-key', re: /\bAIza[0-9A-Za-z_-]{35}\b/ },
  { id: 'private-key', re: /-----BEGIN (?:[A-Z ]+ )?PRIVATE KEY-----/ },
  { id: 'resend-key', re: /\bre_[A-Za-z0-9]{20,}\b/ },
  { id: 'stripe-secret', re: /\bsk_live_[0-9a-zA-Z]{20,}\b/ },
  {
    id: 'github-token',
    re: /\b(?:gh[pousr]_[A-Za-z0-9]{36}|github_pat_[A-Za-z0-9_]{30,})\b/,
  },
  { id: 'slack-token', re: /\bxox[baprs]-[0-9A-Za-z-]{10,}\b/ },
  { id: 'sendgrid-key', re: /\bSG\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{40,}\b/ },
  { id: 'openai-key', re: /\bsk-(?:proj-)?[A-Za-z0-9_-]{24,}\b/ },
  {
    id: 'jwt',
    re: /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/,
  },
  {
    id: 'db-url-with-password',
    re: /\b(?:postgres(?:ql)?|mysql|mongodb(?:\+srv)?|redis|amqp):\/\/[^:@\s/]+:[^@\s/]+@/,
  },
  {
    // Known-sensitive keys with a real-looking value — what leaked in
    // `.env.development` and `app.controller.ts`. Entropy-independent, so even
    // a weak secret is caught.
    id: 'sensitive-assignment',
    re: /\b(?:JWT_SECRET|JWT_KEY|SECRET_KEY|ENCRYPTION_KEY|SIGNING_KEY|[A-Z0-9_]*PASSWORD|[A-Z0-9_]*SECRET|[A-Z0-9_]*API_?KEY|[A-Z0-9_]*ACCESS_TOKEN|[A-Z0-9_]*PRIVATE_KEY)\b\s*[:=]\s*['"]?([A-Za-z0-9+/=_\-]{8,})['"]?/,
    value: 1,
  },
];

function shannon(value) {
  const counts = new Map();
  for (const ch of value) counts.set(ch, (counts.get(ch) ?? 0) + 1);
  let out = 0;
  for (const n of counts.values()) {
    const p = n / value.length;
    out -= p * Math.log2(p);
  }
  return out;
}

/**
 * Generic high-entropy assignment, for secrets with no known key name or
 * provider prefix. Deliberately conservative to keep the noise down.
 */
function highEntropyAssignment(line) {
  const m = line.match(
    /\b[A-Za-z_][A-Za-z0-9_]*\s*[:=]\s*['"]([A-Za-z0-9+/=_-]{24,})['"]/,
  );
  if (!m) return null;
  const value = m[1];
  // A random secret mixes case, digits and a symbol. Human-written identifiers,
  // enum values and migration names do not — requiring all four character
  // classes is what keeps this rule usable on a real codebase. Secrets under a
  // known key name are caught by `sensitive-assignment` regardless of shape.
  if (!/[a-z]/.test(value) || !/[A-Z]/.test(value)) return null;
  if (!/[0-9]/.test(value) || !/[+/=_-]/.test(value)) return null;
  if (shannon(value) < 3.7) return null;
  return { id: 'high-entropy-value', value };
}

function mask(text) {
  return text.length <= 12 ? `${text.slice(0, 2)}…` : `${text.slice(0, 6)}…${text.slice(-3)}`;
}

function loadAllowlist() {
  if (!existsSync(ALLOW_FILE)) return [];
  return readFileSync(ALLOW_FILE, 'utf8')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'))
    .map((line) => new RegExp(line));
}

function scanText(path, text, allow) {
  const findings = [];
  const lines = text.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].slice(0, MAX_LINE);
    if (!line.trim()) continue;
    if (allow.some((re) => re.test(`${path}:${line}`))) continue;

    let hit = null;
    for (const rule of RULES) {
      const m = line.match(rule.re);
      if (!m) continue;
      const captured = rule.value === undefined ? m[0] : m[rule.value];
      if (rule.value !== undefined && PLACEHOLDER.test(captured)) continue;
      hit = { rule: rule.id, sample: mask(captured) };
      break;
    }

    if (!hit) {
      const generic = highEntropyAssignment(line);
      if (generic && !PLACEHOLDER.test(generic.value)) {
        hit = { rule: generic.id, sample: mask(generic.value) };
      }
    }

    if (hit) findings.push({ path, line: i + 1, ...hit });
  }

  return findings;
}

function isBinary(buffer) {
  return buffer.subarray(0, 8000).includes(0);
}

function skipped(path) {
  if (SKIP_DIR.test(path)) return true;
  const name = path.split('/').pop();
  if (SKIP_NAME.has(name)) return true;
  const ext = name.includes('.') ? name.split('.').pop().toLowerCase() : '';
  return SKIP_EXT.has(ext);
}

function gitLines(args) {
  return execFileSync('git', args, { encoding: 'utf8' }).split('\0').filter(Boolean);
}

function main() {
  const all = process.argv.includes('--all');
  const allow = loadAllowlist();
  const findings = [];
  const files = all
    ? gitLines(['ls-files', '-z'])
    : gitLines(['diff', '--cached', '--name-only', '--diff-filter=ACM', '-z']);

  for (const path of files) {
    if (ENV_FILE.test(path) && !ENV_ALLOWED.test(path)) {
      findings.push({ path, line: 0, rule: 'env-file', sample: '(whole file)' });
      continue;
    }
    if (skipped(path)) continue;

    let buffer;
    try {
      buffer = all
        ? readFileSync(path)
        : execFileSync('git', ['show', `:${path}`], { maxBuffer: 64 * 1024 * 1024 });
    } catch {
      continue; // deleted or unreadable — nothing to scan
    }
    if (isBinary(buffer)) continue;

    findings.push(...scanText(path, buffer.toString('utf8'), allow));
  }

  const where = all ? 'tracked files' : 'staged changes';
  if (findings.length === 0) {
    console.log(`secret-scan: clean (${files.length} ${where})`);
    return;
  }

  console.error(`\n✖ secret-scan: ${findings.length} possible secret(s) in ${where}\n`);
  for (const f of findings) {
    console.error(`  ${f.line ? `${f.path}:${f.line}` : f.path}\n      [${f.rule}] ${f.sample}`);
  }
  console.error(
    '\nRemove the secret (and rotate it), or add a regex to .secretsallow for a false positive.',
  );
  console.error('Bypass once with: git commit --no-verify\n');
  process.exitCode = 1;
}

main();
