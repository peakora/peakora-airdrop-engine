// fuelCollector/quests.js
const puppeteer = require('puppeteer');
const logger = require('../logger/logger');

const DEFAULT_PUPPETEER_ARGS = [
  '--no-sandbox',
  '--disable-setuid-sandbox',
  '--disable-dev-shm-usage',
  '--disable-gpu',
  '--single-process',
  '--no-zygote'
];

async function launchBrowser() {
  const launchOptions = {
    headless: process.env.PUPPETEER_HEADLESS !== 'false',
    args: DEFAULT_PUPPETEER_ARGS,
    // allow overriding path if environment provides a system chrome
    executablePath: process.env.CHROME_PATH || undefined,
  };
  logger.info('Launching puppeteer', { launchOptions: { headless: launchOptions.headless } });
  return puppeteer.launch(launchOptions);
}

async function safeClick(page, selector, timeout = 5000) {
  try {
    await page.waitForSelector(selector, { timeout });
    await page.click(selector);
    return true;
  } catch (err) {
    logger.warn(`Selector not found or clickable: ${selector}`, err);
    return false;
  }
}

async function runGalxeQuest(walletAddress, opts = {}) {
  logger.info('runGalxeQuest start', { walletAddress });
  // placeholder: if you have a non-headless flow or API, prefer that
  const browser = await launchBrowser();
  const page = await browser.newPage();
  try {
    await page.goto('https://galxe.com', { waitUntil: 'networkidle2', timeout: 30000 });
    // example flow: wait for connect button, click, etc.
    const connectSelector = 'button[aria-label="Connect Wallet"], button.connect-wallet';
    const connected = await safeClick(page, connectSelector, 7000);
    if (!connected) {
      logger.warn('Galxe connect button not found; skipping interactive flow');
      await browser.close();
      return { ok: false, reason: 'connect_selector_missing' };
    }

    // wait a bit for wallet popup or injected provider to settle
    await page.waitForTimeout(1500);

    // simulate completing a quest; real selectors must be validated against the live site
    const claimSelector = '.claim-button, button.claim';
    const claimed = await safeClick(page, claimSelector, 5000);
    await page.waitForTimeout(1000);

    await browser.close();
    return { ok: true, claimed: !!claimed };
  } catch (err) {
    logger.error('Error in runGalxeQuest', err);
    try { await browser.close(); } catch (e) {}
    return { ok: false, error: String(err) };
  }
}

async function runZealyQuest(walletAddress, opts = {}) {
  logger.info('runZealyQuest start', { walletAddress });
  // Zealy often has API or OAuth flows; this is a best-effort Puppeteer fallback
  const browser = await launchBrowser();
  const page = await browser.newPage();
  try {
    await page.goto('https://zealy.io', { waitUntil: 'networkidle2', timeout: 30000 });
    // example selectors; replace with real ones for your flows
    const connectSelector = 'button[aria-label="Connect Wallet"], button.connect-wallet';
    await safeClick(page, connectSelector, 7000);
    await page.waitForTimeout(1000);
    // attempt to claim or mark task complete
    const taskSelector = '.task-claim, button.claim';
    const ok = await safeClick(page, taskSelector, 5000);
    await browser.close();
    return { ok: true, completed: !!ok };
  } catch (err) {
    logger.error('Error in runZealyQuest', err);
    try { await browser.close(); } catch (e) {}
    return { ok: false, error: String(err) };
  }
}

async function runLayer3Quest(walletAddress, opts = {}) {
  logger.info('runLayer3Quest start', { walletAddress });
  // Layer3 flows can be automated similarly; keep defensive waits and retries
  const browser = await launchBrowser();
  const page = await browser.newPage();
  try {
    await page.goto('https://layer3.xyz', { waitUntil: 'networkidle2', timeout: 30000 });
    const connectSelector = 'button[aria-label="Connect Wallet"], button.connect-wallet';
    await safeClick(page, connectSelector, 7000);
    await page.waitForTimeout(1000);
    const actionSelector = '.action-button, button.action';
    const ok = await safeClick(page, actionSelector, 5000);
    await browser.close();
    return { ok: true, acted: !!ok };
  } catch (err) {
    logger.error('Error in runLayer3Quest', err);
    try { await browser.close(); } catch (e) {}
    return { ok: false, error: String(err) };
  }
}

module.exports = {
  runGalxeQuest,
  runZealyQuest,
  runLayer3Quest
};
