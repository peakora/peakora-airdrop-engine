/**
 * swap-and-distribute.js
 * - Uses 1inch public API to build a swap from token -> native ETH
 * - Signs and sends the swap using PRIVATE_KEY_PRIMARY
 * - After swap, distributes ETH to DISTRIBUTION_ADDRESSES if threshold met
 *
 * Configure via .env: RPC_URL, PRIVATE_KEY_PRIMARY, CHAIN_ID, ONEINCH_API,
 * DISTRIBUTION_THRESHOLD_ETH, DISTRIBUTION_AMOUNT_ETH, DISTRIBUTION_ADDRESSES (in file)
 *
 * WARNING: This script sends real transactions. Test on testnet first.
 */

require('dotenv').config();
const axios = require('axios');
const { ethers } = require('ethers');
const logger = require('./logger');

const RPC = process.env.RPC_URL;
const provider = new ethers.JsonRpcProvider(RPC);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY_PRIMARY, provider);
const CHAIN_ID = parseInt(process.env.CHAIN_ID || '1', 10);
const ONEINCH_API = process.env.ONEINCH_API || 'https://api.1inch.io/v5.0';

const DISTRIBUTION_ADDRESSES = (process.env.DISTRIBUTION_ADDRESSES || '').split(',').filter(Boolean);
const DISTRIBUTION_THRESHOLD = ethers.parseEther(process.env.DISTRIBUTION_THRESHOLD_ETH || '0.02');
const DISTRIBUTION_AMOUNT = ethers.parseEther(process.env.DISTRIBUTION_AMOUNT_ETH || '0.005');

async function buildAndSendSwap(tokenAddress) {
  logger.info('Building swap for token %s', tokenAddress);
  // Use a conservative amount for quote; production should compute actual token decimals and amounts
  const amount = '1000000000000000000'; // 1 token unit placeholder
  try {
    const swapResp = await axios.get(`${ONEINCH_API}/${CHAIN_ID}/swap`, {
      params: {
        fromTokenAddress: tokenAddress,
        toTokenAddress: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
        amount,
        fromAddress: wallet.address,
        slippage: 1
      },
      timeout: 15000
    });

    if (!swapResp?.data?.tx) {
      logger.error('Invalid swap response');
      return null;
    }

    const txData = swapResp.data.tx;
    const tx = {
      to: txData.to,
      data: txData.data,
      value: txData.value ? ethers.parseUnits(txData.value.toString(), 'wei') : undefined,
      gasLimit: txData.gas ? ethers.parseUnits(txData.gas.toString(), 'wei') : undefined,
      gasPrice: txData.gasPrice ? ethers.parseUnits(txData.gasPrice.toString(), 'wei') : undefined
    };

    const sent = await wallet.sendTransaction(tx);
    logger.info('Swap tx sent %s', sent.hash);
    const receipt = await sent.wait();
    logger.info('Swap confirmed %s', receipt.transactionHash);
    return receipt;
  } catch (err) {
    logger.error('Swap error: %s', err?.response?.data || err?.message || err);
    return null;
  }
}

async function distributeIfNeeded() {
  const balance = await provider.getBalance(wallet.address);
  logger.info('Primary ETH balance %s', ethers.formatEther(balance));
  if (balance.lt(DISTRIBUTION_THRESHOLD)) {
    logger.info('Balance below threshold, skipping distribution');
    return;
  }

  for (const addr of DISTRIBUTION_ADDRESSES) {
    try {
      const tx = await wallet.sendTransaction({ to: addr, value: DISTRIBUTION_AMOUNT });
      logger.info('Sent %s ETH to %s tx=%s', ethers.formatEther(DISTRIBUTION_AMOUNT), addr, tx.hash);
      await tx.wait();
    } catch (err) {
      logger.error('Distribution error to %s: %s', addr, err?.message || err);
    }
  }
}

(async () => {
  const tokenAddress = process.argv[2];
  if (!tokenAddress) {
    logger.error('Usage: node swap-and-distribute.js <tokenAddress>');
    process.exit(1);
  }

  const receipt = await buildAndSendSwap(tokenAddress);
  if (receipt) {
    await distributeIfNeeded();
  }
})();
