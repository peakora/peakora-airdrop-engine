/**
 * multisend.js
 * - Simple sequential multisend helper using PRIVATE_KEY_PRIMARY
 * - For production gas savings, replace with a multisend contract
 */

require('dotenv').config();
const { ethers } = require('ethers');
const logger = require('./logger');

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY_PRIMARY, provider);

async function multisend(recipients, amountEth) {
  for (const r of recipients) {
    try {
      const tx = await wallet.sendTransaction({ to: r, value: ethers.parseEther(amountEth) });
      logger.info('Sent %s ETH to %s tx=%s', amountEth, r, tx.hash);
      await tx.wait();
    } catch (err) {
      logger.error('Multisend failed to %s: %s', r, err?.message || err);
    }
  }
}

module.exports = multisend;
