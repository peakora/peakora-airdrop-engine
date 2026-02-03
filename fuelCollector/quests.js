const puppeteer = require("puppeteer");
const logger = require("../logger/logger");

/**
 * Automates Layer3 quest flow:
 * - Opens Layer3 site
 * - Connects wallet (simulated)
 * - Opens a quest
 * - Completes quest (placeholder)
 * - Claims reward
 */
async function runLayer3Quest(walletAddress) {
  logger.info(`Starting Layer3 quest automation for ${walletAddress}`);

  const browser = await puppeteer.launch({
    headless: true, // set to false if you want to see the browser
    defaultViewport: null,
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });

  const page = await browser.newPage();

  try {
    // Navigate to Layer3 quests
    await page.goto("https://layer3.xyz/quests", { waitUntil: "networkidle2" });
    logger.info("Navigated to Layer3 quests page");

    // Example: simulate wallet connect
    const connectButton = "button[data-testid='connect-wallet']";
    if (await page.$(connectButton)) {
      await page.click(connectButton);
      logger.info("Clicked connect wallet button");
      await page.waitForTimeout(3000);
    } else {
      logger.warn("Connect wallet button not found");
    }

    // Example: click on first quest
    const questLink = "a[href*='/quest/']";
    if (await page.$(questLink)) {
      await page.click(questLink);
      logger.info("Opened a quest");
      await page.waitForTimeout(5000);
    } else {
      logger.warn("No quest link found");
    }

    // Simulate completing quest
    logger.info("Quest completion simulated (replace with real logic)");

    // Example: claim reward
    const claimButton = "button[data-testid='claim-reward']";
    if (await page.$(claimButton)) {
      await page.click(claimButton);
      logger.info("Clicked claim reward button");
      await page.waitForTimeout(3000);
    } else {
      logger.warn("Claim reward button not found");
    }

    logger.info(`Layer3 quest automation finished for ${walletAddress}`);
  } catch (err) {
    logger.error(`Layer3 quest automation failed: ${err.message}`);
  } finally {
    await browser.close();
  }
}

module.exports = { runLayer3Quest };
