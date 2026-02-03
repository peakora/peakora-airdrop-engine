const { collectRewards } = require("./fuelCollector");

async function main() {
  await collectRewards("WALLET_KEY_1");
}

main();
