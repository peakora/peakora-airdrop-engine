const { ethers } = require("ethers");
const config = require("../config");

// Load wallet from private key (encrypted later)
function loadWallet(privateKey) {
  try {
    const provider = new ethers.JsonRpcProvider(config.rpcUrl);
    const wallet = new ethers.Wallet(privateKey, provider);
    return wallet;
  } catch (err) {
    console.error("Error loading wallet:", err);
    return null;
  }
}

// Check wallet balance
async function checkBalance(wallet) {
  try {
    const balance = await wallet.provider.getBalance(wallet.address);
    console.log(`Wallet ${wallet.address} balance: ${ethers.formatEther(balance)} ETH`);
    return balance;
  } catch (err) {
    console.error("Error checking balance:", err);
    return null;
  }
}

module.exports = { loadWallet, checkBalance };
