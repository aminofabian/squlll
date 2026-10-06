# Squl frontend: Vercel → Coolify (ops note)

Cut over completed **2 Oct 2026**. Nest API at `skool.zelisline.com` was **not** moved.

## Runtime

| Item | Value |
| --- | --- |
| Host | Coolify on `148.113.255.170` (UI `:8000`) |
| Project / env / app | `squl` / `production` / `squl-frontend` |
| App UUID | `lyryozr5xh9q27v3fihvvedk` |
| Image | `ghcr.io/aminofabian/squlll:coolify` |
| Branch / build | `deploy/coolify` via GitHub Actions → GHCR |
| Port | `3000` |
| Domains | `https://squl.co.ke`, `https://www.squl.co.ke`, `*.squl.co.ke` |
| Smoke URL | `http://lyryozr5xh9q27v3fihvvedk.148.113.255.170.sslip.io/` |

## Env (Coolify)

- `GRAPHQL_API_URL=https://skool.zelisline.com/graphql`
- `NEXT_PUBLIC_API_BASE_URL=https://skool.zelisline.com/graphql`
- `NEXT_PUBLIC_WS_URL=https://skool.zelisline.com`
- `NEXT_PUBLIC_SITE_URL=https://www.squl.co.ke`
- Plus any remaining secrets pulled from Vercel (not committed).

`NEXT_PUBLIC_*` are baked at **image build** time in GHA. Changing them requires a new image push + Coolify redeploy.

## TLS / Traefik (148)

Dynamic configs under Coolify → Server → Proxy → Dynamic Configurations:

- `squl-origin-certs.yaml` — Cloudflare Origin CA for `squl.co.ke` + `*.squl.co.ke`
- `squl-tenants.yaml` — apex/www + `HostRegexp` school subdomains → `http-0-lyryozr5xh9q27v3fihvvedk@docker` (priority 10000 for apex/www)

Do **not** point Traefik file routers at `https-0-…@docker` unless that Coolify docker service has healthy backends; use `http-0-…@docker` (same pattern that serves the sslip HTTP route).

## Cloudflare (`squl.co.ke`)

- SSL/TLS: **Full (strict)**
- Edge: **Always Use HTTPS** on
- Speed: **Rocket Loader** off
- Security → Bot traffic: **Bot Fight Mode** off
- DNS (proxied A → `148.113.255.170`): `*`, `@`, `www`

## Smoke / rollback

```bash
# Direct origin (Origin CA → use -k)
curl -sk --resolve squl.co.ke:443:148.113.255.170 https://squl.co.ke/ -o /dev/null -w "%{http_code}\n"
curl -sk --resolve demo.squl.co.ke:443:148.113.255.170 https://demo.squl.co.ke/ -o /dev/null -w "%{http_code}\n"

# Via Cloudflare (after cutover)
curl -sS https://squl.co.ke/ -o /dev/null -w "%{http_code}\n"
curl -sS https://www.squl.co.ke/ -o /dev/null -w "%{http_code}\n"
```

**Rollback:** point `*`, `@`, and `www` A records back at the previous Vercel targets (kept on the Vercel project for ~1 week). Do not delete the Vercel project until stable.

## Deploy loop

1. Push to `deploy/coolify` (or merge workflow as configured).
2. Wait for GHA to publish `ghcr.io/aminofabian/squlll:coolify`.
3. Coolify UI → `squl-frontend` → **Deploy** (API token currently lacks Deploy permission).

## Not in this cutover

- Nest / `skool.zelisline.com` stays where it is.
- Vercel project deletion deferred until ~1 week of stable Coolify traffic.
