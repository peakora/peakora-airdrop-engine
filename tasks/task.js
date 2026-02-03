const { ethers } = require("ethers");
require("dotenv").config();
const { loadWallet } = require("../wallets/wallet");

// Example: simple ETH transfer task
async function transferETH(fromKey, toAddress, amountETH) {
  const wallet = loadWallet(fromKey);
  const tx = await wallet.sendTransaction({
    to: toAddress,
    value: ethers.parseEther(amountETH.toString()),
  });
  console.log(`Transfer from ${wallet.address} → ${toAddress}, TX: ${tx.hash}`);
  await tx.wait();
  return tx.hash;
}

module.exports = { transferETH };
