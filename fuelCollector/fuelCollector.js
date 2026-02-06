// fuelCollector/fuelCollector.js
const { runLayer3Quest } = require("./quests");
const { runGalxeQuest } = require("./galxe");
const { runZealyQuest } = require("./zealy");
const logger = require("../logger/logger");

/**
 * Resolve a wallet key or raw address to a 0x... address string.
 * Accepts:
 *  - raw address: "0xabc..."
 *  - env key: "WALLET_KEY_1" -> looks up WALLET_KEY_1_ADDRESS or WALLET_KEY_1
 */
function resolveWalletAddress(walletKeyOrAddress) {
  if (!walletKeyOrAddress) return null;
  // raw address passed
  if (typeof walletKeyOrAddress === "string" && walletKeyOrAddress.startsWith("0x") && walletKeyOrAddress.length === 42) {
    return walletKeyOrAddress;
  }
  // try exact env key, then KEY_ADDRESS
  const direct = process.env[walletKeyOrAddress];
  if (direct && direct.startsWith("0x")) return direct;
  const alt = process.env[`${walletKeyOrAddress}_ADDRESS`];
  if (alt && alt.startsWith("0x")) return alt;
  return null;
}

/**
 * Collect rewards from supported quest platforms
 * @param {string} walletKeyOrAddress - The environment variable key for the wallet or a raw address
 */
async function collectRewards(walletKeyOrAddress) {
  try {
    const walletAddress = resolveWalletAddress(walletKeyOrAddress);
    if (!walletAddress) {
      logger.error(`No wallet address found for key/address: ${walletKeyOrAddress}`);
      return { ok: false, reason: "no_wallet_address" };
    }

    // helpful debug log so you can confirm the resolved address in logs
    logger.info(`Starting reward collection for wallet: ${walletAddress}`);
    console.log(`collectRewards: resolved walletAddress = ${walletAddress}`);

    // Run Layer3 quest automation
    const layer3Result = await runLayer3Quest(walletAddress).catch(err => {
      logger.error("runLayer3Quest error", err);
      return { ok: false, error: String(err) };
    });

    // Run Galxe quest automation
    const galxeResult = await runGalxeQuest(walletAddress).catch(err => {
      logger.error("runGalxeQuest error", err);
      return { ok: false, error: String(err) };
    });

    // Run Zealy quest automation
    const zealyResult = await runZealyQuest(walletAddress).catch(err => {
      logger.error("runZealyQuest error", err);
      return { ok: false, error: String(err) };
    });

    const results = { layer3: layer3Result, galxe: galxeResult, zealy: zealyResult };
    logger.info(`Reward collection finished for wallet: ${walletAddress}`, { results });
    return { ok: true, wallet: walletAddress, results };
  } catch (err) {
    logger.error(`Reward collection failed: ${err && err.message ? err.message : String(err)}`);
    return { ok: false, error: String(err) };
  }
}

// CLI / test runner support
if (require.main === module) {
  const arg = process.argv[2] || "WALLET_KEY_1";
  (async () => {
    const out = await collectRewards(arg);
    console.log(JSON.stringify(out, null, 2));
    process.exit(0);
  })();
}

module.exports = { collectRewards, resolveWalletAddress };
