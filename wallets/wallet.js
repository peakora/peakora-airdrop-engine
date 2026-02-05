const { ethers } = require("ethers");
const { getProvider } = require("../network/network");

function loadWallet(keyName) {
  const provider = getProvider();
  const privateKey = process.env[keyName];

  if (!privateKey) {
    throw new Error(`Missing environment variable for wallet: ${keyName}`);
  }

  try {
    return new ethers.Wallet(privateKey, provider);
  } catch (err) {
    console.error(`Failed to load wallet ${keyName}:`, err.message);
    throw err;
  }
}

async function checkBalance(wallet) {
  try {
    const balance = await wallet.provider.getBalance(wallet.address);
    console.log(`Wallet ${wallet.address} balance: ${ethers.formatEther(balance)} ETH`);
    return balance;
  } catch (err) {
    console.error(`Failed to check balance for wallet ${wallet.address}:`, err.message);
    throw err;
  }
}

module.exports = { loadWallet, checkBalance };
