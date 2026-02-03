const { checkBalance, loadWallet } = require("../wallets/wallet");
const logger = require("../logger/logger");

async function showDashboard() {
  console.clear();
  console.log("=== Peakora Airdrop Engine Dashboard ===");

  const wallets = ["WALLET_KEY_1", "WALLET_KEY_2", "WALLET_KEY_3"];

  for (const key of wallets) {
    const wallet = loadWallet(key);
    const balance = await checkBalance(wallet);
    console.log(`${wallet.address} → ${balance.toString()} wei`);
    logger.info(`Dashboard balance check: ${wallet.address} → ${balance.toString()} wei`);
  }

  console.log("========================================");
}

module.exports = { showDashboard };
