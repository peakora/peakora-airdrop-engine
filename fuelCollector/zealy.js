// fuelCollector/zealy.js
// Full-featured Zealy adapter for the fuelCollector.
// This module exposes `runZealy` which wraps the quest automation with
// retries, optional dry-run, and structured logging.

const logger = require("../logger/logger");
const { runZealyQuest } = require("./quests");

/**
 * Run Zealy collection with retries and optional dry-run.
 * @param {string} walletAddress - 0x... address to use
 * @param {object} opts - options: { retries, retryDelayMs, timeoutMs, dryRun }
 * @returns {Promise<object>} result object { ok, completed, attempts, error }
 */
async function runZealy(walletAddress, opts = {}) {
  const retries = Number(opts.retries ?? 2);
  const retryDelayMs = Number(opts.retryDelayMs ?? 2000);
  const timeoutMs = Number(opts.timeoutMs ?? 60_000);
  const dryRun = !!opts.dryRun;

  if (!walletAddress || typeof walletAddress !== "string" || !walletAddress.startsWith("0x")) {
    const err = new Error("Invalid walletAddress passed to runZealy");
    logger.error(err.message, { walletAddress });
    return { ok: false, error: err.message };
  }

  logger.info("runZealy: starting", { wallet: walletAddress, retries, dryRun });

  if (dryRun) {
    logger.info("runZealy: dryRun enabled — skipping browser automation");
    return { ok: true, completed: false, dryRun: true };
  }

  let attempt = 0;
  let lastError = null;

  while (attempt <= retries) {
    attempt += 1;
    logger.info("runZealy: attempt", { attempt, wallet: walletAddress });

    try {
      const resultPromise = runZealyQuest(walletAddress, { attempt });
      const result = await promiseWithTimeout(resultPromise, timeoutMs, `Zealy attempt ${attempt} timed out`);
      if (result && result.ok) {
        logger.info("runZealy: success", { wallet: walletAddress, attempt, result });
        return { ok: true, completed: !!result.completed, attempts: attempt, details: result };
      }
      lastError = result && result.error ? result.error : "unknown_failure";
      logger.warn("runZealy: attempt returned non-ok", { attempt, lastError });
    } catch (err) {
      lastError = err && err.message ? err.message : String(err);
      logger.error("runZealy: attempt threw", { attempt, error: lastError });
    }

    if (attempt <= retries) {
      logger.info("runZealy: retrying after delay", { attempt, delayMs: retryDelayMs });
      await sleep(retryDelayMs);
    }
  }

  logger.error("runZealy: all attempts failed", { wallet: walletAddress, attempts: attempt, lastError });
  return { ok: false, error: lastError, attempts: attempt };
}

/* Helpers */

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function promiseWithTimeout(promise, ms, timeoutMessage) {
  let timer;
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      timer = setTimeout(() => reject(new Error(timeoutMessage)), ms);
    })
  ]).finally(() => clearTimeout(timer));
}

module.exports = { runZealy };
