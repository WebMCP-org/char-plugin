#!/usr/bin/env node

/**
 * Prerequisite verification script for char-setup skill
 *
 * Verifies:
 * - Node.js version
 * - Browser availability
 * - MCP server availability (optional)
 * - Publishable key format (optional)
 * - Network connectivity
 *
 * Usage:
 *   node scripts/verify-setup.js
 *   node scripts/verify-setup.js --check-publishable-key pk_live_...
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ANSI color codes for output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

const symbols = {
  success: '✓',
  fail: '✗',
  warning: '⚠',
  info: 'ℹ',
};

function log(symbol, message, color = colors.reset) {
  console.log(`${color}${symbol}${colors.reset} ${message}`);
}

function checkNodeVersion() {
  const required = '18.0.0';
  const current = process.version.slice(1);

  const [reqMajor, reqMinor] = required.split('.').map(Number);
  const [curMajor, curMinor] = current.split('.').map(Number);

  if (curMajor > reqMajor || (curMajor === reqMajor && curMinor >= reqMinor)) {
    log(symbols.success, `Node.js ${current} (>= ${required})`, colors.green);
    return true;
  }

  log(symbols.fail, `Node.js ${current} found, need >= ${required}`, colors.red);
  log(symbols.info, 'Install from: https://nodejs.org/', colors.blue);
  return false;
}

function checkBrowser() {
  const browsers = [
    { name: 'Google Chrome', cmd: '"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --version', pattern: /Google Chrome (\d+)/ },
    { name: 'Google Chrome', cmd: 'google-chrome --version || chrome --version', pattern: /(\d+)/ },
    { name: 'Microsoft Edge', cmd: 'microsoft-edge --version || msedge --version', pattern: /(\d+)/ },
    { name: 'Chromium', cmd: 'chromium --version', pattern: /(\d+)/ },
  ];

  for (const browser of browsers) {
    try {
      const output = execSync(browser.cmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] });
      const match = output.match(browser.pattern);
      if (match) {
        const version = parseInt(match[1], 10);
        if (version >= 90) {
          log(symbols.success, `${browser.name} ${version} found (>= 90)`, colors.green);
          return true;
        }
        log(symbols.warning, `${browser.name} ${version} found, recommend >= 90`, colors.yellow);
        return true;
      }
    } catch {
      // Try next browser
    }
  }

  log(symbols.fail, 'Chrome, Edge, or Chromium not found', colors.red);
  return false;
}

function checkCommandExists(command) {
  try {
    execSync(`which ${command}`, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function checkMCPServers() {
  const hasClaudeCode = checkCommandExists('claude');
  if (!hasClaudeCode) {
    log(symbols.warning, 'Claude Code CLI not found (optional)', colors.yellow);
    return { chromeDevTools: false, webmcpDocs: false };
  }

  log(symbols.success, 'Claude Code CLI found', colors.green);
  log(symbols.info, 'Check MCP servers with: /mcp', colors.blue);
  log(symbols.info, 'Recommended: chrome-devtools, webmcp-docs, char-docs, char-saas', colors.blue);

  return { chromeDevTools: null, webmcpDocs: null };
}

function checkPublishableKeyFormat(key) {
  if (!key) {
    log(symbols.warning, 'No publishable key provided (use --check-publishable-key)', colors.yellow);
    return null;
  }

  const trimmed = key.trim();

  if (!trimmed.startsWith('pk_')) {
    log(symbols.fail, 'Publishable key should start with "pk_"', colors.red);
    return false;
  }

  if (trimmed.length < 20) {
    log(symbols.fail, 'Publishable key seems too short', colors.red);
    return false;
  }

  if (trimmed.includes('\n') || trimmed.includes(' ')) {
    log(symbols.fail, 'Publishable key contains whitespace/newlines', colors.red);
    return false;
  }

  log(symbols.success, `Publishable key format looks correct (${trimmed.length} chars)`, colors.green);
  return true;
}

function checkNetworkConnectivity() {
  try {
    execSync('ping -c 1 -W 1 app.usechar.ai', { stdio: 'ignore' });
    log(symbols.success, 'Network connectivity to app.usechar.ai', colors.green);
    return true;
  } catch {
    log(symbols.warning, 'Cannot reach app.usechar.ai', colors.yellow);
    return false;
  }
}

function checkDiskSpace() {
  try {
    const stats = fs.statfsSync('.');
    const freeMB = (stats.bavail * stats.bsize) / (1024 * 1024);

    if (freeMB > 100) {
      log(symbols.success, `${Math.round(freeMB)}MB disk space available`, colors.green);
      return true;
    }

    log(symbols.warning, `Only ${Math.round(freeMB)}MB disk space available`, colors.yellow);
    return true;
  } catch {
    log(symbols.warning, 'Could not check disk space', colors.yellow);
    return true;
  }
}

function checkTemplateExists() {
  const templatePath = path.join(__dirname, '..', 'assets', 'templates', 'demo.html');
  if (fs.existsSync(templatePath)) {
    log(symbols.success, 'Demo template found', colors.green);
    return true;
  }

  log(symbols.fail, 'Demo template not found', colors.red);
  log(symbols.info, `Expected at: ${templatePath}`, colors.blue);
  return false;
}

function main() {
  const args = process.argv.slice(2);
  const keyIndex = args.indexOf('--check-publishable-key');
  const publishableKey = keyIndex !== -1 ? args[keyIndex + 1] : null;

  console.log(`\n${colors.blue}=== Char Setup Prerequisite Verification ===${colors.reset}\n`);

  const checks = [
    { name: 'Node.js version', fn: checkNodeVersion, required: true },
    { name: 'Browser availability', fn: checkBrowser, required: true },
    { name: 'Template files', fn: checkTemplateExists, required: true },
    { name: 'Disk space', fn: checkDiskSpace, required: false },
    { name: 'Network connectivity', fn: checkNetworkConnectivity, required: false },
    { name: 'MCP servers', fn: checkMCPServers, required: false },
  ];

  if (publishableKey) {
    checks.push({
      name: 'Publishable key format',
      fn: () => checkPublishableKeyFormat(publishableKey),
      required: true,
    });
  }

  let allPassed = true;
  let requiredPassed = true;

  for (const check of checks) {
    const result = check.fn();
    if (result === false) {
      allPassed = false;
      if (check.required) requiredPassed = false;
    }
  }

  console.log('');
  if (requiredPassed) {
    log(symbols.success, 'All required checks passed!', colors.green);
    if (!allPassed) {
      log(symbols.warning, 'Some optional checks failed - setup will still work', colors.yellow);
    }
    console.log('');
    console.log('Next steps:');
    console.log('  1. Ask: "Create a Char demo page"');
    console.log('  2. Provide your publishable key');
    console.log('  3. Open demo.html in Chrome/Edge');
    console.log('');
    process.exit(0);
  }

  log(symbols.fail, 'Some required checks failed', colors.red);
  console.log('');
  console.log('Fix the issues above and run this script again.');
  console.log('');
  process.exit(1);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export {
  checkNodeVersion,
  checkBrowser,
  checkPublishableKeyFormat,
  checkNetworkConnectivity,
};
