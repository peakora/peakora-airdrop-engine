const { ethers } = require("ethers");
const { getProvider } = require("../network/network");

function loadWallet(keyName) {
  const provider = getProvider();
  const privateKey = process.env[keyName];
  return new ethers.Wallet(privateKey, provider);
}

async function checkBalance(wallet) {
  const balance = await wallet.provider.getBalance(wallet.address);
  console.log(`Wallet ${wallet.address} balance: ${ethers.formatEther(balance)} ETH`);
  return balance;
}

module.exports = { loadWallet, checkBalance };
