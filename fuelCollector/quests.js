// fuelCollector/quests.js
const puppeteer = require("puppeteer");
const logger = require("../logger/logger");

const DEFAULT_PUPPETEER_ARGS = [
  "--no-sandbox",
  "--disable-setuid-sandbox",
  "--disable-dev-shm-usage",
  "--disable-gpu",
  "--single-process",
  "--no-zygote"
];

async function launchBrowser() {
  const executablePath = process.env.PUPPETEER_CHROME_PATH || undefined;
  const headless = process.env.PUPPETEER_HEADLESS !== "false";
  const launchOptions = {
    headless,
    args: DEFAULT_PUPPETEER_ARGS,
    executablePath
  };
  logger.info("Launching puppeteer", { headless, executablePath });
  return puppeteer.launch(launchOptions);
}

async function safeClick(page, selector, timeout = 5000) {
  try {
    await page.waitForSelector(selector, { timeout });
    await page.click(selector);
    return true;
  } catch (err) {
    logger.warn(`Selector not found or clickable: ${selector}`, err && err.message ? err.message : String(err));
    return false;
  }
}

async function runGalxeQuest(walletAddress, opts = {}) {
  logger.info("runGalxeQuest start", { walletAddress });
  const browser = await launchBrowser();
  const page = await browser.newPage();
  try {
    await page.goto("https://galxe.com", { waitUntil: "networkidle2", timeout: 30000 });

    // Example connect flow - these selectors are best-effort and may need tuning
    const connectSelector = 'button[aria-label="Connect Wallet"], button.connect-wallet, button[title*="Connect"]';
    const connected = await safeClick(page, connectSelector, 8000);
    if (!connected) {
      logger.warn("Galxe connect selector not found; aborting galxe flow");
      await browser.close();
      return { ok: false, reason: "connect_selector_missing" };
    }

    await page.waitForTimeout(1500);

    // Example claim selector - replace with real selector if you have it
    const claimSelector = ".claim-button, button.claim, button[title*='Claim']";
    const claimed = await safeClick(page, claimSelector, 5000);
    await page.waitForTimeout(1000);

    await browser.close();
    return { ok: true, claimed: !!claimed };
  } catch (err) {
    logger.error("Error in runGalxeQuest", err && err.message ? err.message : String(err));
    try { await browser.close(); } catch (e) {}
    return { ok: false, error: String(err) };
  }
}

async function runZealyQuest(walletAddress, opts = {}) {
  logger.info("runZealyQuest start", { walletAddress });
  const browser = await launchBrowser();
  const page = await browser.newPage();
  try {
    await page.goto("https://zealy.io", { waitUntil: "networkidle2", timeout: 30000 });

    const connectSelector = 'button[aria-label="Connect Wallet"], button.connect-wallet, button[title*="Connect"]';
    await safeClick(page, connectSelector, 7000);
    await page.waitForTimeout(1000);

    const taskSelector = ".task-claim, button.claim, button[title*='Complete']";
    const ok = await safeClick(page, taskSelector, 5000);

    await browser.close();
    return { ok: true, completed: !!ok };
  } catch (err) {
    logger.error("Error in runZealyQuest", err && err.message ? err.message : String(err));
    try { await browser.close(); } catch (e) {}
    return { ok: false, error: String(err) };
  }
}

async function runLayer3Quest(walletAddress, opts = {}) {
  logger.info("runLayer3Quest start", { walletAddress });
  const browser = await launchBrowser();
  const page = await browser.newPage();
  try {
    await page.goto("https://layer3.xyz", { waitUntil: "networkidle2", timeout: 30000 });

    const connectSelector = 'button[aria-label="Connect Wallet"], button.connect-wallet, button[title*="Connect"]';
    await safeClick(page, connectSelector, 7000);
    await page.waitForTimeout(1000);

    const actionSelector = ".action-button, button.action, button[title*='Claim']";
    const ok = await safeClick(page, actionSelector, 5000);

    await browser.close();
    return { ok: true, acted: !!ok };
  } catch (err) {
    logger.error("Error in runLayer3Quest", err && err.message ? err.message : String(err));
    try { await browser.close(); } catch (e) {}
    return { ok: false, error: String(err) };
  }
}

module.exports = {
  runGalxeQuest,
  runZealyQuest,
  runLayer3Quest,
  launchBrowser // exported for debugging if needed
};
