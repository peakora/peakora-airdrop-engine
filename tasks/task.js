const { ethers } = require("ethers");
require("dotenv").config();
const { loadWallet } = require("../wallets/wallet");
const logger = require("../logger/logger");

async function transferETH(fromKey, toAddress, amountETH) {
  const wallet = loadWallet(fromKey);
  try {
    const tx = await wallet.sendTransaction({
      to: toAddress,
      value: ethers.parseEther(amountETH.toString()),
    });
    logger.info(`Transfer from ${wallet.address} → ${toAddress}, TX: ${tx.hash}`);
    await tx.wait();
    logger.info(`Transaction confirmed: ${tx.hash}`);
    return tx.hash;
  } catch (err) {
    logger.error(`Transfer failed from ${wallet.address}: ${err.message}`);
    throw err;
  }
}

module.exports = { transferETH };
