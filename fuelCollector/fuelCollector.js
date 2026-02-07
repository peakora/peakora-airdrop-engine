// fuelCollector/fuelCollector.js
// New unified fuelCollector section (self-contained).
// - Does NOT require any old adapter files.
// - Inlined placeholders for Layer3, Galxe, Zealy.
// - Safe guard: browser only launches when RUN_BROWSER=true.
// - Replace TODO blocks with real automation logic.

const logger = require("../logger/logger"); // reuse project logger if present

let puppeteer = null;
try { puppeteer = require("puppeteer"); } catch (e) { /* puppeteer optional until RUN_BROWSER=true */ }

/* -------------------------
   Utilities and guards
   ------------------------- */

function attachPagePolyfills(page) {
  try {
    if (!page) return;
    if (typeof page.waitForTimeout !== "function") {
      page.waitForTimeout = function(ms) { return new Promise(r => setTimeout(r, ms)); };
    }
  } catch (e) {}
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function launchBrowser(ctx = {}) {
  // Safety guard: do not launch browser unless explicitly enabled
  if (process.env.RUN_BROWSER !== "true") {
    throw new Error("Browser launch disabled. Set RUN_BROWSER=true to enable real browser runs.");
  }
  if (!puppeteer) throw new Error("puppeteer not installed in this environment.");
  const opts = {
    headless: (process.env.PUPPETEER_HEADLESS === "true") || !!ctx.headless,
    args: ["--no-sandbox", "--disable-setuid-sandbox", ...(ctx.launchArgs || [])],
  };
  if (process.env.PUPPETEER_CHROME_PATH) opts.executablePath = process.env.PUPPETEER_CHROME_PATH;
  return await puppeteer.launch(opts);
}

/* -------------------------
   Small helpers used by implementations
   ------------------------- */

async function safeClick(page, selector, timeout = 5000) {
  try {
    if (!page || !selector) return false;
    await page.waitForSelector(selector, { timeout });
    await page.click(selector);
    return true;
  } catch (e) {
    return false;
  }
}

/* -------------------------
   Layer3 implementation placeholder
   Replace the TODO block with the real automation steps.
   Implementations should accept (walletAddress, ctx) where ctx.attachPagePolyfills(page) is available.
   ------------------------- */

async function runLayer3Quest(walletAddress, ctx = {}) {
  logger.info("runLayer3Quest start", { walletAddress });
  // If you want to run real browser automation, set RUN_BROWSER=true and ensure puppeteer is installed
  try {
    // Example: guard so this function can be used in dry runs without launching Chromium
    if (process.env.RUN_BROWSER !== "true") {
      logger.info("runLayer3Quest dry-run mode (no browser).");
      return { ok: true, note: "dry-run: layer3 skipped" };
    }

    const browser = await launchBrowser(ctx);
    const page = await browser.newPage();
    attachPagePolyfills(page);

    try {
      // TODO: Replace the following placeholder steps with the real Layer3 automation
      await page.goto("https://layer3.xyz", { waitUntil: "networkidle2" });
      // Example selectors (replace with real ones)
      // await safeClick(page, 'button.connect-wallet', 8000);
      // await safeClick(page, '.action-button', 5000);
      await sleep(300);
      await browser.close();
      return { ok: true, note: "layer3 placeholder completed" };
    } catch (err) {
      try { await browser.close(); } catch (e) {}
      logger.error("Layer3 automation error", err && err.message);
      return { ok: false, error: String(err) };
    }
  } catch (err) {
    logger.warn("runLayer3Quest skipped or failed to start browser", err && err.message);
    return { ok: false, error: String(err) };
  }
}

/* -------------------------
   Galxe implementation placeholder
   Replace the TODO block with the real automation steps.
   ------------------------- */

async function runGalxeQuest(walletAddress, ctx = {}) {
  logger.info("runGalxeQuest start", { walletAddress });
  if (process.env.RUN_BROWSER !== "true") {
    logger.info("runGalxeQuest dry-run mode (no browser).");
    return { ok: true, note: "dry-run: galxe skipped" };
  }
  try {
    const browser = await launchBrowser(ctx);
    const page = await browser.newPage();
    attachPagePolyfills(page);
    try {
      // TODO: implement Galxe automation here
      await page.goto("https://galxe.xyz", { waitUntil: "networkidle2" });
      await sleep(300);
      await browser.close();
      return { ok: true, note: "galxe placeholder completed" };
    } catch (err) {
      try { await browser.close(); } catch (e) {}
      logger.error("Galxe automation error", err && err.message);
      return { ok: false, error: String(err) };
    }
  } catch (err) {
    logger.warn("runGalxeQuest skipped or failed to start browser", err && err.message);
    return { ok: false, error: String(err) };
  }
}

/* -------------------------
   Zealy implementation placeholder
   Replace the TODO block with the real automation steps.
   ------------------------- */

async function runZealyQuest(walletAddress, ctx = {}) {
  logger.info("runZealyQuest start", { walletAddress });
  if (process.env.RUN_BROWSER !== "true") {
    logger.info("runZealyQuest dry-run mode (no browser).");
    return { ok: true, note: "dry-run: zealy skipped" };
  }
  try {
    const browser = await launchBrowser(ctx);
    const page = await browser.newPage();
    attachPagePolyfills(page);
    try {
      // TODO: implement Zealy automation here
      await page.goto("https://zealy.io", { waitUntil: "networkidle2" });
      await sleep(300);
      await browser.close();
      return { ok: true, note: "zealy placeholder completed" };
    } catch (err) {
      try { await browser.close(); } catch (e) {}
      logger.error("Zealy automation error", err && err.message);
      return { ok: false, error: String(err) };
    }
  } catch (err) {
    logger.warn("runZealyQuest skipped or failed to start browser", err && err.message);
    return { ok: false, error: String(err) };
  }
}

/* -------------------------
   Orchestrator
   ------------------------- */

function resolveWalletAddress(walletKeyOrAddress) {
  if (!walletKeyOrAddress) return null;
  if (typeof walletKeyOrAddress === "string" && walletKeyOrAddress.startsWith("0x") && walletKeyOrAddress.length === 42) return walletKeyOrAddress;
  const direct = process.env[walletKeyOrAddress];
  if (direct && direct.startsWith("0x")) return direct;
  const alt = process.env[`${walletKeyOrAddress}_ADDRESS`];
  if (alt && alt.startsWith("0x")) return alt;
  return null;
}

async function collectRewards(walletKeyOrAddress) {
  try {
    const walletAddress = resolveWalletAddress(walletKeyOrAddress);
    if (!walletAddress) {
      logger.error("No wallet address found for key/address: " + walletKeyOrAddress);
      return { ok: false, reason: "no_wallet_address" };
    }
    logger.info("Starting reward collection for wallet: " + walletAddress);

    const layer3 = await runLayer3Quest(walletAddress, { attachPagePolyfills });
    const galxe = await runGalxeQuest(walletAddress, { attachPagePolyfills });
    const zealy = await runZealyQuest(walletAddress, { attachPagePolyfills });

    const results = { layer3, galxe, zealy };
    logger.info("Reward collection finished for wallet: " + walletAddress, { results });
    return { ok: true, wallet: walletAddress, results };
  } catch (err) {
    logger.error("collectRewards failed: " + (err && err.message));
    return { ok: false, error: String(err) };
  }
}

/* -------------------------
   CLI runner and exports
   ------------------------- */

if (require.main === module) {
  const arg = process.argv[2] || "WALLET_KEY_1";
  (async () => {
    const out = await collectRewards(arg);
    console.log(JSON.stringify(out, null, 2));
    process.exit(0);
  })();
}

module.exports = { collectRewards, resolveWalletAddress, attachPagePolyfills, runLayer3Quest, runGalxeQuest, runZealyQuest };
