const { runLayer3Quest } = require("./quests");
const logger = require("../logger/logger");

/**
 * Collect rewards from supported quest platforms
 * @param {string} walletKey - The environment variable key for the wallet
 */
async function collectRewards(walletKey) {
  try {
    const walletAddress = process.env[walletKey + "_ADDRESS"];
    if (!walletAddress) {
      logger.error(`No wallet address found for key: ${walletKey}`);
      return;
    }

    logger.info(`Starting reward collection for wallet: ${walletAddress}`);

    // Example: run Layer3 quest automation
    await runLayer3Quest(walletAddress);

    logger.info(`Reward collection finished for wallet: ${walletAddress}`);
  } catch (err) {
    logger.error(`Reward collection failed: ${err.message}`);
  }
}

module.exports = { collectRewards };
