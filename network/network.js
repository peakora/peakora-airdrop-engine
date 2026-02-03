const { ethers } = require("ethers");
require("dotenv").config();

const rpcUrls = (process.env.RPC_URLS || process.env.RPC_URL).split(",");

// Try connecting to multiple RPCs
function getProvider() {
  for (const url of rpcUrls) {
    try {
      return new ethers.JsonRpcProvider(url.trim());
    } catch (err) {
      console.error(`Failed to connect RPC: ${url}`, err);
    }
  }
  throw new Error("No RPC providers available");
}

module.exports = { getProvider };
