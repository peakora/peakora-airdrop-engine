require("dotenv").config();
const { ethers } = require("ethers");
const { transferETH } = require("../tasks/task");
const { loadWallet, checkBalance } = require("../wallets/wallet");

console.log("Scheduler started...");

function scheduleTask(taskFn, args, delayMs) {
  setTimeout(async () => {
    try {
      const result = await taskFn(...args);
      console.log(`Task executed successfully: ${result}`);
    } catch (err) {
      console.error("Task failed:", err.message);
    }
  }, delayMs);
}

async function staggerTransfers() {
  const requiredKeys = [
    "WALLET_KEY_1",
    "WALLET_KEY_2",
    "WALLET_KEY_3",
    "WALLET_KEY_1_ADDRESS",
    "WALLET_KEY_2_ADDRESS",
    "WALLET_KEY_3_ADDRESS"
  ];

  const missing = requiredKeys.filter(k => !process.env[k]);
  if (missing.length > 0) {
    console.error("Missing environment variables:", missing.join(", "));
    return;
  }

  // Check balances before scheduling
  const wallets = [
    { key: "WALLET_KEY_1", to: process.env.WALLET_KEY_2_ADDRESS, amount: 0.001, delay: 1000 },
    { key: "WALLET_KEY_2", to: process.env.WALLET_KEY_3_ADDRESS, amount: 0.001, delay: 5000 },
    { key: "WALLET_KEY_3", to: process.env.WALLET_KEY_1_ADDRESS, amount: 0.001, delay: 10000 }
  ];

  for (const { key, to, amount, delay } of wallets) {
    const wallet = loadWallet(key);
    const balance = await checkBalance(wallet);

    if (balance < ethers.parseEther(amount.toString())) {
      console.error(`Skipping transfer: Wallet ${wallet.address} has insufficient funds.`);
      continue;
    }

    scheduleTask(transferETH, [key, to, amount], delay);
  }
}

module.exports = { scheduleTask, staggerTransfers };

console.log("Scheduler finished.");
