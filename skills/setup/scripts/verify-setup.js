#!/usr/bin/env node

/**
 * Prerequisite verification script for char-setup skill
 *
 * Verifies:
 * - Node.js version
 * - Browser availability
 * - MCP server availability (optional)
 * - Anthropic API key format
 * - Network connectivity
 *
 * Usage:
 *   node scripts/verify-setup.js
 *   node scripts/verify-setup.js --check-api-key sk-ant-api03-...
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
  const required = '14.0.0';
  const current = process.version.slice(1); // Remove 'v' prefix

  const [reqMajor, reqMinor] = required.split('.').map(Number);
  const [curMajor, curMinor] = current.split('.').map(Number);

  if (curMajor > reqMajor || (curMajor === reqMajor && curMinor >= reqMinor)) {
    log(symbols.success, `Node.js ${current} (>= ${required})`, colors.green);
    return true;
  } else {
    log(symbols.fail, `Node.js ${current} found, need >= ${required}`, colors.red);
    log(symbols.info, 'Install from: https://nodejs.org/', colors.blue);
    return false;
  }
}

function checkBrowser() {
  const browsers = [
    // macOS app bundle paths
    { name: 'Google Chrome', cmd: '"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --version', pattern: /Google Chrome (\d+)/ },
    // Linux/Windows command-line paths
    { name: 'Google Chrome', cmd: 'google-chrome --version || chrome --version', pattern: /Chrome\/(\d+)/ },
    { name: 'Microsoft Edge', cmd: 'microsoft-edge --version || msedge --version', pattern: /Edge\/(\d+)/ },
    { name: 'Chromium', cmd: 'chromium --version', pattern: /Chromium\/(\d+)/ },
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
        } else {
          log(symbols.warning, `${browser.name} ${version} found, recommend >= 90`, colors.yellow);
          return true; // Still works, just warn
        }
      }
    } catch (e) {
      // Browser not found, try next
      continue;
    }
  }

  log(symbols.fail, 'Chrome, Edge, or Chromium not found', colors.red);
  log(symbols.info, 'WebMCP tools require Chrome/Edge/Chromium 90+', colors.blue);
  log(symbols.info, 'Install from: https://www.google.com/chrome/', colors.blue);
  return false;
}

function checkMCPServers() {
  // Check if Claude Code is available and has MCP servers
  // This is optional - skill works without them, just with manual testing

  const hasClaudeCode = checkCommandExists('claude');
  if (!hasClaudeCode) {
    log(symbols.warning, 'Claude Code CLI not found (optional)', colors.yellow);
    log(symbols.info, 'Install from: https://code.claude.com/', colors.blue);
    return { chromeDevTools: false, webmcpDocs: false };
  }

  log(symbols.success, 'Claude Code CLI found', colors.green);

  // Try to check for MCP servers (this would require running `claude mcp list`)
  // For now, just provide info
  log(symbols.info, 'Check MCP servers with: /mcp', colors.blue);
  log(symbols.info, 'Recommended: chrome-devtools (automated testing)', colors.blue);

  return { chromeDevTools: null, webmcpDocs: null }; // Unknown state
}

function checkCommandExists(command) {
  try {
    execSync(`which ${command}`, { stdio: 'ignore' });
    return true;
  } catch (e) {
    return false;
  }
}

function checkApiKeyFormat(apiKey) {
  if (!apiKey) {
    log(symbols.warning, 'No API key provided (use --check-api-key)', colors.yellow);
    log(symbols.info, 'Get your key from: https://console.anthropic.com/settings/keys', colors.blue);
    return null;
  }

  const trimmed = apiKey.trim();

  // Check format
  if (!trimmed.startsWith('sk-ant-')) {
    log(symbols.fail, 'API key should start with "sk-ant-"', colors.red);
    return false;
  }

  // Check length (typical key is ~100 chars)
  if (trimmed.length < 50) {
    log(symbols.fail, 'API key seems too short', colors.red);
    return false;
  }

  // Check for common issues
  if (trimmed.includes('\n') || trimmed.includes(' ')) {
    log(symbols.fail, 'API key contains whitespace/newlines', colors.red);
    return false;
  }

  log(symbols.success, `API key format looks correct (${trimmed.length} chars)`, colors.green);
  return true;
}

function checkNetworkConnectivity() {
  try {
    // Try to reach Anthropic API (just DNS check, not actual request)
    execSync('ping -c 1 -W 1 api.anthropic.com', { stdio: 'ignore' });
    log(symbols.success, 'Network connectivity to api.anthropic.com', colors.green);
    return true;
  } catch (e) {
    log(symbols.warning, 'Cannot reach api.anthropic.com', colors.yellow);
    log(symbols.info, 'Check your internet connection', colors.blue);
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
    } else {
      log(symbols.warning, `Only ${Math.round(freeMB)}MB disk space available`, colors.yellow);
      return true; // Warn but don't fail
    }
  } catch (e) {
    log(symbols.warning, 'Could not check disk space', colors.yellow);
    return true; // Don't fail on this
  }
}

function checkTemplateExists() {
  const templatePath = path.join(__dirname, '..', 'assets', 'templates', 'demo.html');
  if (fs.existsSync(templatePath)) {
    log(symbols.success, 'Demo template found', colors.green);
    return true;
  } else {
    log(symbols.fail, 'Demo template not found', colors.red);
    log(symbols.info, `Expected at: ${templatePath}`, colors.blue);
    return false;
  }
}

function main() {
  const args = process.argv.slice(2);
  const apiKeyIndex = args.indexOf('--check-api-key');
  const apiKey = apiKeyIndex !== -1 ? args[apiKeyIndex + 1] : null;

  console.log(`\n${colors.blue}=== Char Setup Prerequisite Verification ===${colors.reset}\n`);

  const checks = [
    { name: 'Node.js version', fn: checkNodeVersion, required: true },
    { name: 'Browser availability', fn: checkBrowser, required: true },
    { name: 'Template files', fn: checkTemplateExists, required: true },
    { name: 'Disk space', fn: checkDiskSpace, required: false },
    { name: 'Network connectivity', fn: checkNetworkConnectivity, required: false },
    { name: 'MCP servers', fn: checkMCPServers, required: false },
  ];

  if (apiKey) {
    checks.push({
      name: 'API key format',
      fn: () => checkApiKeyFormat(apiKey),
      required: true
    });
  }

  let allPassed = true;
  let requiredPassed = true;

  for (const check of checks) {
    const result = check.fn();
    if (result === false) {
      allPassed = false;
      if (check.required) {
        requiredPassed = false;
      }
    }
  }

  console.log('');
  if (requiredPassed) {
    log(symbols.success, 'All required checks passed!', colors.green);
    if (!allPassed) {
      log(symbols.warning, 'Some optional checks failed - setup will work but may lack features', colors.yellow);
    }
    console.log('');
    console.log('Next steps:');
    console.log('  1. Ask: "Create a Char demo page"');
    console.log('  2. Provide your Anthropic API key when prompted');
    console.log('  3. Open demo.html in Chrome/Edge');
    console.log('');
    process.exit(0);
  } else {
    log(symbols.fail, 'Some required checks failed', colors.red);
    console.log('');
    console.log('Fix the issues above and run this script again.');
    console.log('');
    process.exit(1);
  }
}

// Run main if this is the entry point
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

// Export functions for testing
export {
  checkNodeVersion,
  checkBrowser,
  checkApiKeyFormat,
  checkNetworkConnectivity,
};
