const logger = require("../logger/logger");
const { transferETH } = require("../tasks/task");
const { loadWallet } = require("../wallets/wallet");

// Example placeholder for task sources
const taskSources = [
  { name: "Layer3", url: "https://layer3.xyz/quests" },
  { name: "Galxe", url: "https://galxe.com/" },
  { name: "Zealy", url: "https://zealy.io/" }
];

// Simulated reward collector
async function collectRewards(walletKey) {
  const wallet = loadWallet(walletKey);

  // Placeholder: simulate reward claim
  const rewardAmount = 0.001; // ETH equivalent
  logger.info(`Collected ${rewardAmount} ETH worth of rewards for ${wallet.address}`);

  // Distribute fuel if balance is low
  await distributeFuel(wallet, rewardAmount);
}

async function distributeFuel(wallet, rewardAmount) {
  // Example: send ETH to another wallet if balance < threshold
  const threshold = 0.001;
  const balance = await wallet.provider.getBalance(wallet.address);

  if (balance < ethers.parseEther(threshold.toString())) {
    const targetAddress = process.env.WALLET_KEY_2_ADDRESS;
    const txHash = await transferETH(process.env.WALLET_KEY_1, targetAddress, rewardAmount);
    logger.info(`Fuel distributed: ${rewardAmount} ETH → ${targetAddress}, TX: ${txHash}`);
  } else {
    logger.info(`Wallet ${wallet.address} has sufficient fuel: ${balance.toString()} wei`);
  }
}

module.exports = { collectRewards };
