const { transferETH } = require("../tasks/task");

// Run a task with delay
function scheduleTask(taskFn, args, delayMs) {
  setTimeout(async () => {
    try {
      const result = await taskFn(...args);
      console.log(`Task executed successfully: ${result}`);
    } catch (err) {
      console.error("Task failed:", err);
    }
  }, delayMs);
}

// Example: stagger tasks for multiple wallets
function staggerTransfers() {
  scheduleTask(transferETH, ["WALLET_KEY_1", process.env.WALLET_KEY_2_ADDRESS, 0.001], 1000);
  scheduleTask(transferETH, ["WALLET_KEY_2", process.env.WALLET_KEY_3_ADDRESS, 0.001], 5000);
  scheduleTask(transferETH, ["WALLET_KEY_3", process.env.WALLET_KEY_1_ADDRESS, 0.001], 10000);
}

module.exports = { scheduleTask, staggerTransfers };
