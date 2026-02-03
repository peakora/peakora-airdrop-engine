const { transferETH } = require("./task");

async function main() {
  // Example: transfer 0.001 ETH from Wallet 1 to Wallet 2
  const txHash = await transferETH("WALLET_KEY_1", process.env.WALLET_KEY_2_ADDRESS, 0.001);
  console.log("Transaction hash:", txHash);
}

main();
