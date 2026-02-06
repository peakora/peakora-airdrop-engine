// fuelCollector/galxe.js
// Full-featured Galxe adapter for the fuelCollector.
// This module exposes a single function `runGalxe` that wraps the lower-level
// quest automation and adds retries, timeouts, and structured logging.

const logger = require("../logger/logger");
const { runGalxeQuest } = require("./quests");

/**
 * Run Galxe collection with retries and optional dry-run.
 * @param {string} walletAddress - 0x... address to use
 * @param {object} opts - options: { retries, retryDelayMs, timeoutMs, dryRun }
 * @returns {Promise<object>} result object { ok, claimed, attempts, error }
 */
async function runGalxe(walletAddress, opts = {}) {
  const retries = Number(opts.retries ?? 2);
  const retryDelayMs = Number(opts.retryDelayMs ?? 2000);
  const timeoutMs = Number(opts.timeoutMs ?? 60_000);
  const dryRun = !!opts.dryRun;

  if (!walletAddress || typeof walletAddress !== "string" || !walletAddress.startsWith("0x")) {
    const err = new Error("Invalid walletAddress passed to runGalxe");
    logger.error(err.message, { walletAddress });
    return { ok: false, error: err.message };
  }

  logger.info("runGalxe: starting", { wallet: walletAddress, retries, dryRun });

  if (dryRun) {
    logger.info("runGalxe: dryRun enabled — skipping browser automation");
    return { ok: true, claimed: false, dryRun: true };
  }

  let attempt = 0;
  let lastError = null;

  while (attempt <= retries) {
    attempt += 1;
    logger.info("runGalxe: attempt", { attempt, wallet: walletAddress });

    try {
      // enforce a per-attempt timeout
      const resultPromise = runGalxeQuest(walletAddress, { attempt });
      const result = await promiseWithTimeout(resultPromise, timeoutMs, `Galxe attempt ${attempt} timed out`);
      // normalize result
      if (result && result.ok) {
        logger.info("runGalxe: success", { wallet: walletAddress, attempt, result });
        return { ok: true, claimed: !!result.claimed, attempts: attempt, details: result };
      }
      // if result.ok is false but no exception, treat as retryable
      lastError = result && result.error ? result.error : "unknown_failure";
      logger.warn("runGalxe: attempt returned non-ok", { attempt, lastError });
    } catch (err) {
      lastError = err && err.message ? err.message : String(err);
      logger.error("runGalxe: attempt threw", { attempt, error: lastError });
    }

    if (attempt <= retries) {
      logger.info("runGalxe: retrying after delay", { attempt, delayMs: retryDelayMs });
      await sleep(retryDelayMs);
    }
  }

  logger.error("runGalxe: all attempts failed", { wallet: walletAddress, attempts: attempt, lastError });
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

module.exports = { runGalxe };
