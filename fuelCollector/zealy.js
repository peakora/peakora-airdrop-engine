const puppeteer = require("puppeteer");
const logger = require("../logger/logger");

/**
 * Automates Zealy quest flow:
 * - Opens Zealy site
 * - Connects wallet (simulated)
 * - Opens a community quest
 * - Completes task (placeholder)
 * - Claims reward (points/tokens)
 */
async function runZealyQuest(walletAddress) {
  logger.info(`Starting Zealy quest automation for ${walletAddress}`);

  const browser = await puppeteer.launch({
    headless: true, // set to false if you want to see the browser
    defaultViewport: null,
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });

  const page = await browser.newPage();

  try {
    // Navigate to Zealy quests
    await page.goto("https://zealy.io/", { waitUntil: "networkidle2" });
    logger.info("Navigated to Zealy homepage");

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
      logger.info("Opened a Zealy quest");
      await page.waitForTimeout(5000);
    } else {
      logger.warn("No quest link found");
    }

    // Simulate completing quest
    logger.info("Zealy quest completion simulated (replace with real logic)");

    // Example: claim reward
    const claimButton = "button[data-testid='claim-reward']";
    if (await page.$(claimButton)) {
      await page.click(claimButton);
      logger.info("Clicked claim reward button");
      await page.waitForTimeout(3000);
    } else {
      logger.warn("Claim reward button not found");
    }

    logger.info(`Zealy quest automation finished for ${walletAddress}`);
  } catch (err) {
    logger.error(`Zealy quest automation failed: ${err.message}`);
  } finally {
    await browser.close();
  }
}

module.exports = { runZealyQuest };
