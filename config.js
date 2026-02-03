require('dotenv').config();

module.exports = {
  rpcUrl: process.env.RPC_URL,
  maxGas: parseFloat(process.env.MAX_GAS || "0.001"),
};
