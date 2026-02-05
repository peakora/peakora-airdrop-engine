const { ethers } = require("ethers");
require("dotenv").config();

function getProvider() {
  const urls = process.env.RPC_URLS ? process.env.RPC_URLS.split(",") : [];
  if (urls.length === 0) {
    throw new Error("No RPC_URLS defined in .env");
  }

  // Try each URL until one works
  for (const url of urls.map(u => u.trim())) {
    try {
      console.log(`Attempting provider: ${url}`);
      return new ethers.JsonRpcProvider(url);
    } catch (err) {
      console.error(`Failed to connect with ${url}: ${err.message}`);
    }
  }

  throw new Error("All RPC providers failed.");
}

module.exports = { getProvider };
