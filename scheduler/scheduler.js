console.log("Scheduler started...");

const { transferETH } = require("../tasks/task");

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

function staggerTransfers() {
  if (!process.env.WALLET_KEY_1 || !process.env.WALLET_KEY_2 || !process.env.WALLET_KEY_3) {
    console.error("Missing wallet private keys in .env (WALLET_KEY_1, WALLET_KEY_2, WALLET_KEY_3).");
    return;
  }
  if (!process.env.WALLET_KEY_2_ADDRESS || !process.env.WALLET_KEY_3_ADDRESS || !process.env.WALLET_KEY_1_ADDRESS) {
    console.error("Missing wallet addresses in .env (WALLET_KEY_1_ADDRESS, WALLET_KEY_2_ADDRESS, WALLET_KEY_3_ADDRESS).");
    return;
  }

  scheduleTask(transferETH, ["WALLET_KEY_1", process.env.WALLET_KEY_2_ADDRESS, 0.001], 1000);
  scheduleTask(transferETH, ["WALLET_KEY_2", process.env.WALLET_KEY_3_ADDRESS, 0.001], 5000);
  scheduleTask(transferETH, ["WALLET_KEY_3", process.env.WALLET_KEY_1_ADDRESS, 0.001], 10000);
}

// Run immediately when scheduler starts
staggerTransfers();

console.log("Scheduler finished.");
module.exports = { scheduleTask, staggerTransfers };
