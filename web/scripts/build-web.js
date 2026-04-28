const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const projectRoot = path.resolve(__dirname, '..');
const distDir = path.join(projectRoot, 'dist');
const indexHtmlPath = path.join(distDir, 'index.html');

function runExpoExport() {
  const command = process.platform === 'win32' ? 'npx.cmd' : 'npx';
  const result = spawnSync(command, ['expo', 'export', '--platform', 'web'], {
    cwd: projectRoot,
    stdio: 'inherit',
  });

  if (result.status !== 0) {
    process.exit(result.status || 1);
  }
}

function ensureFileCopied(fromRelativePath, toRelativePath) {
  const sourcePath = path.join(projectRoot, fromRelativePath);
  const targetPath = path.join(distDir, toRelativePath);

  fs.mkdirSync(path.dirname(targetPath), { recursive: true });
  fs.copyFileSync(sourcePath, targetPath);
}

function injectPwaTags() {
  const headSnippet = [
    '  <meta name="theme-color" content="#FF6B6B" />',
    '  <meta name="apple-mobile-web-app-capable" content="yes" />',
    '  <meta name="apple-mobile-web-app-status-bar-style" content="default" />',
    '  <meta name="apple-mobile-web-app-title" content="WhatToEat" />',
    '  <meta name="mobile-web-app-capable" content="yes" />',
    '  <meta name="description" content="A meal planning companion for discovering brunch and dinner ideas." />',
    '  <link rel="manifest" href="/manifest.webmanifest" />',
    '  <link rel="apple-touch-icon" href="/icon-1024.png" />',
  ].join('\n');

  const registrationSnippet = [
    '<script>',
    "  if ('serviceWorker' in navigator) {",
    "    window.addEventListener('load', function () {",
    "      navigator.serviceWorker.register('/service-worker.js').catch(function (error) {",
    "        console.warn('Service worker registration failed', error);",
    '      });',
    '    });',
    '  }',
    '</script>',
  ].join('\n');

  let indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');

  if (!indexHtml.includes('manifest.webmanifest')) {
    indexHtml = indexHtml.replace('</head>', `${headSnippet}\n</head>`);
  }

  if (!indexHtml.includes("navigator.serviceWorker.register('/service-worker.js')")) {
    indexHtml = indexHtml.replace('</body>', `${registrationSnippet}\n</body>`);
  }

  fs.writeFileSync(indexHtmlPath, indexHtml);
}

runExpoExport();

ensureFileCopied('pwa/manifest.webmanifest', 'manifest.webmanifest');
ensureFileCopied('pwa/service-worker.js', 'service-worker.js');
ensureFileCopied('assets/icon.png', 'icon-1024.png');
ensureFileCopied('assets/adaptive-icon.png', 'maskable-icon-1024.png');

injectPwaTags();
