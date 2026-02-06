// fuelCollector/fuelCollector.js
const logger = require('../logger/logger');
const quests = require('./quests');
const network = require('../network/network');

async function resolveWalletAddress(walletKeyOrAddress) {
  // Accept either a raw address or a key name that maps to an env var
  if (!walletKeyOrAddress) return null;
  if (walletKeyOrAddress.startsWith('0x') && walletKeyOrAddress.length === 42) {
    return walletKeyOrAddress;
  }
  // try env var named exactly, then KEY_ADDRESS
  const fromEnv = process.env[walletKeyOrAddress] || process.env[`${walletKeyOrAddress}_ADDRESS`];
  if (fromEnv && fromEnv.startsWith('0x')) return fromEnv;
  return null;
}

async function collectRewards(walletKeyOrAddress, opts = {}) {
  const walletAddress = await resolveWalletAddress(walletKeyOrAddress);
  if (!walletAddress) {
    logger.warn(`No wallet address found for "${walletKeyOrAddress}". Aborting collection.`);
    return { ok: false, reason: 'no_wallet_address' };
  }

  logger.info(`Starting fuel collection for ${walletAddress}`);

  try {
    // ensure network is reachable
    await network.ensureReady();

    // run each quest provider in sequence; each returns {ok, details}
    const results = {};
    results.galxe = await quests.runGalxeQuest(walletAddress, opts).catch(err => {
      logger.error('Galxe quest failed', err);
      return { ok: false, error: String(err) };
    });

    results.zealy = await quests.runZealyQuest(walletAddress, opts).catch(err => {
      logger.error('Zealy quest failed', err);
      return { ok: false, error: String(err) };
    });

    results.layer3 = await quests.runLayer3Quest(walletAddress, opts).catch(err => {
      logger.error('Layer3 quest failed', err);
      return { ok: false, error: String(err) };
    });

    logger.info('Fuel collection finished', { wallet: walletAddress, results });
    return { ok: true, wallet: walletAddress, results };
  } catch (err) {
    logger.error('Unexpected error in collectRewards', err);
    return { ok: false, error: String(err) };
  }
}

// CLI / test runner support
if (require.main === module) {
  const arg = process.argv[2] || 'WALLET_KEY_1';
  (async () => {
    const out = await collectRewards(arg, { test: true });
    console.log(JSON.stringify(out, null, 2));
    process.exit(0);
  })();
}

module.exports = { collectRewards, resolveWalletAddress };
