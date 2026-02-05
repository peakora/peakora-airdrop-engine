/**
 * wallet-watcher.js
 * - Polls for token arrivals to PRIMARY_ADDRESS
 * - When a watched token balance > 0 is detected, spawns swap-and-distribute.js
 *
 * Configure via .env: RPC_URL, PRIMARY_ADDRESS
 */

require('dotenv').config();
const { ethers } = require('ethers');
const logger = require('./logger');
const { spawn } = require('child_process');

const RPC = process.env.RPC_URL;
const provider = new ethers.JsonRpcProvider(RPC);
const PRIMARY_ADDRESS = process.env.PRIMARY_ADDRESS;
const POLL_INTERVAL_MS = parseInt(process.env.POLL_INTERVAL_MS || '20000', 10);

if (!PRIMARY_ADDRESS) {
  logger.error('PRIMARY_ADDRESS not set in .env');
  process.exit(1);
}

// Add tokens you expect to receive
const WATCH_TOKENS = [
  // { symbol: 'EXAMPLE', address: '0xTokenAddress' }
];

const ERC20_ABI = [
  'function balanceOf(address) view returns (uint256)'
];

async function checkTokenBalances() {
  try {
    for (const t of WATCH_TOKENS) {
      const token = new ethers.Contract(t.address, ERC20_ABI, provider);
      const bal = await token.balanceOf(PRIMARY_ADDRESS);
      if (bal && bal.gt(0)) {
        logger.info('Detected %s balance %s', t.symbol, bal.toString());
        const child = spawn('node', ['swap-and-distribute.js', t.address, t.symbol], { stdio: 'inherit' });
        child.on('close', code => logger.info('swap-and-distribute exited with %d', code));
      }
    }
  } catch (err) {
    logger.error('Watcher error: %s', err?.message || err);
  }
}

(async () => {
  logger.info('Starting wallet watcher for %s', PRIMARY_ADDRESS);
  while (true) {
    await checkTokenBalances();
    await new Promise(r => setTimeout(r, POLL_INTERVAL_MS));
  }
})();
