console.log("RPC_URLS from env:", process.env.RPC_URLS);

const { ethers } = require("ethers");

function getProvider() {
  const urls = process.env.RPC_URLS ? process.env.RPC_URLS.split(",") : [];
  if (urls.length === 0) {
    throw new Error("No RPC_URLS defined in .env");
  }

  // Try the first valid URL
  const url = urls[0].trim();
  console.log(`Using RPC provider: ${url}`);
  return new ethers.JsonRpcProvider(url);
}

module.exports = { getProvider };
