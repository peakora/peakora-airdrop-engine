const puppeteer = require("puppeteer");
const logger = require("../logger/logger");

/**
 * Automates Galxe campaign flow:
 * - Opens Galxe site
 * - Connects wallet (simulated)
 * - Opens a campaign
 * - Completes task (placeholder)
 * - Claims reward (NFT or token)
 */
async function runGalxeQuest(walletAddress) {
  logger.info(`Starting Galxe quest automation for ${walletAddress}`);

  const browser = await puppeteer.launch({
    headless: true, // set to false if you want to see the browser
    defaultViewport: null,
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });

  const page = await browser.newPage();

  try {
    // Navigate to Galxe campaigns
    await page.goto("https://galxe.com/", { waitUntil: "networkidle2" });
    logger.info("Navigated to Galxe homepage");

    // Example: simulate wallet connect
    const connectButton = "button[data-testid='connect-wallet']";
    if (await page.$(connectButton)) {
      await page.click(connectButton);
      logger.info("Clicked connect wallet button");
      await page.waitForTimeout(3000);
    } else {
      logger.warn("Connect wallet button not found");
    }

    // Example: click on first campaign
    const campaignLink = "a[href*='/campaign/']";
    if (await page.$(campaignLink)) {
      await page.click(campaignLink);
      logger.info("Opened a campaign");
      await page.waitForTimeout(5000);
    } else {
      logger.warn("No campaign link found");
    }

    // Simulate completing campaign task
    logger.info("Campaign task completion simulated (replace with real logic)");

    // Example: claim reward
    const claimButton = "button[data-testid='claim-reward']";
    if (await page.$(claimButton)) {
      await page.click(claimButton);
      logger.info("Clicked claim reward button");
      await page.waitForTimeout(3000);
    } else {
      logger.warn("Claim reward button not found");
    }

    logger.info(`Galxe quest automation finished for ${walletAddress}`);
  } catch (err) {
    logger.error(`Galxe quest automation failed: ${err.message}`);
  } finally {
    await browser.close();
  }
}

module.exports = { runGalxeQuest };
