#!/usr/bin/env node
import { chromium } from 'playwright';
import { spawn } from 'child_process';

console.log('🚀 Starting dev server and browser test...\n');

// Start dev server
const devServer = spawn('npm', ['run', 'dev'], {
  stdio: ['ignore', 'pipe', 'pipe'],
  shell: true
});

let serverReady = false;

devServer.stdout.on('data', (data) => {
  const output = data.toString();
  console.log('[DEV SERVER]', output.trim());
  if (output.includes('Local:') || output.includes('localhost')) {
    serverReady = true;
  }
});

devServer.stderr.on('data', (data) => {
  console.error('[DEV SERVER ERROR]', data.toString().trim());
});

// Wait for server to be ready
await new Promise(resolve => {
  const checkInterval = setInterval(() => {
    if (serverReady) {
      clearInterval(checkInterval);
      resolve();
    }
  }, 100);
});

console.log('\n✅ Dev server ready! Launching browser...\n');

// Launch browser
const browser = await chromium.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox']
});
const context = await browser.newContext();
const page = await context.newPage();

// Track console logs
const consoleLogs = [];
const consoleErrors = [];

page.on('console', msg => {
  const text = msg.text();
  const type = msg.type();

  if (type === 'error') {
    console.log('❌ [CONSOLE ERROR]', text);
    consoleErrors.push(text);
  } else if (type === 'warning') {
    console.log('⚠️  [CONSOLE WARN]', text);
  } else if (text.includes('✓ Material registered') || text.includes('registered')) {
    console.log('✅ [MATERIAL]', text);
  } else if (!text.includes('Download the React DevTools')) {
    console.log(`📝 [CONSOLE ${type.toUpperCase()}]`, text);
  }
});

// Track page errors
page.on('pageerror', error => {
  console.log('💥 [PAGE ERROR]', error.message);
  console.log('Stack:', error.stack);
  consoleErrors.push(error.message);
});

// Track network errors
page.on('requestfailed', request => {
  console.log('🌐 [NETWORK ERROR]', request.url(), request.failure().errorText);
});

// Navigate to app
console.log('🌐 Navigating to http://localhost:3000...\n');

try {
  await page.goto('http://localhost:3000', {
    waitUntil: 'networkidle',
    timeout: 30000
  });

  console.log('\n✅ Page loaded successfully!');

  // Wait a bit to capture any delayed errors
  await page.waitForTimeout(3000);

  // Try to take screenshot (may fail due to WebGL)
  try {
    await page.screenshot({ path: 'test-screenshot.png', fullPage: true });
    console.log('📸 Screenshot saved to test-screenshot.png');
  } catch (err) {
    console.log('⚠️  Screenshot failed (WebGL limitation in headless):', err.message);
  }

  // Check for specific elements
  const canvasExists = await page.$('canvas');
  console.log('\n🎨 Canvas element:', canvasExists ? '✅ Found' : '❌ Not found');

  const surfacePanelExists = await page.$('.surface-panel');
  console.log('📋 Surface panel:', surfacePanelExists ? '✅ Found' : '❌ Not found');

  // Summary
  console.log('\n📊 SUMMARY');
  console.log('===========');
  console.log('Console errors:', consoleErrors.length);
  if (consoleErrors.length > 0) {
    console.log('\nErrors found:');
    consoleErrors.forEach((err, i) => {
      console.log(`  ${i + 1}. ${err.substring(0, 100)}...`);
    });
  }

} catch (error) {
  console.error('\n❌ Failed to load page:', error.message);
  try {
    await page.screenshot({ path: 'test-error-screenshot.png', fullPage: true });
    console.log('📸 Error screenshot saved to test-error-screenshot.png');
  } catch {
    console.log('⚠️  Could not capture error screenshot');
  }
}

// Cleanup
await browser.close();
devServer.kill();

console.log('\n✅ Test complete!');
process.exit(consoleErrors.length > 0 ? 1 : 0);
