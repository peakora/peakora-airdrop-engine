const { collectRewards } = require("./fuelCollector");

async function main() {
  console.log("=== Fuel Collector Test ===");
  await collectRewards("WALLET_KEY_1");
  console.log("=== Test Finished ===");
}

main();
