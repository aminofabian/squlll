#!/usr/bin/env node

/**
 * Script to clear production cache and restart the application
 * Run this when experiencing caching issues in production
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🧹 Clearing production cache...');

try {
  // Clear Next.js cache
  const nextCacheDir = path.join(process.cwd(), '.next');
  if (fs.existsSync(nextCacheDir)) {
    console.log('📁 Removing .next directory...');
    fs.rmSync(nextCacheDir, { recursive: true, force: true });
  }

  // Clear node_modules cache (optional)
  const nodeModulesDir = path.join(process.cwd(), 'node_modules');
  if (fs.existsSync(nodeModulesDir)) {
    console.log('📦 Clearing node_modules cache...');
    execSync('npm cache clean --force', { stdio: 'inherit' });
  }

  // Clear any build artifacts
  const buildDir = path.join(process.cwd(), 'build');
  if (fs.existsSync(buildDir)) {
    console.log('🏗️ Removing build directory...');
    fs.rmSync(buildDir, { recursive: true, force: true });
  }

  // Clear any temporary files
  const tempDirs = ['.turbo', '.vercel'];
  tempDirs.forEach(dir => {
    const tempDir = path.join(process.cwd(), dir);
    if (fs.existsSync(tempDir)) {
      console.log(`🗑️ Removing ${dir} directory...`);
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  console.log('✅ Cache cleared successfully!');
  console.log('');
  console.log('🔄 Next steps:');
  console.log('1. Reinstall dependencies: npm install');
  console.log('2. Rebuild the application: npm run build');
  console.log('3. Restart your production server');
  console.log('');
  console.log('💡 If using Vercel, you can also:');
  console.log('- Go to your Vercel dashboard');
  console.log('- Navigate to your project');
  console.log('- Go to Settings > General');
  console.log('- Click "Clear Build Cache"');
  console.log('- Redeploy your application');

} catch (error) {
  console.error('❌ Error clearing cache:', error.message);
  process.exit(1);
} 