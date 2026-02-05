/**
 * puppeteer-metamask-automation.js
 * - Uses Puppeteer v22 to drive a quest action on a target page
 * - Detects MetaMask extension popup windows and clicks Next/Connect/Confirm
 * - Designed to run with a Chrome profile that has MetaMask installed and unlocked
 *
 * Configure via .env:
 *  CHROME_PATH, CHROME_PROFILE_PATH, QUEST_URL, QUEST_ACTION_SELECTOR
 */

require('dotenv').config();
const puppeteer = require('puppeteer');
const logger = require('./logger');

const CHROME_PATH = process.env.CHROME_PATH || '/usr/bin/google-chrome';
const PROFILE_PATH = process.env.CHROME_PROFILE_PATH || '/path/to/profile';
const QUEST_URL = process.env.QUEST_URL || 'https://layer3.xyz/quests';
const QUEST_ACTION_SELECTOR = process.env.QUEST_ACTION_SELECTOR || 'button[data-qa="start-quest"], .quest-card button';

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
async function humanDelay(msMin = 600, msMax = 1800) {
  return new Promise(r => setTimeout(r, rand(msMin, msMax)));
}

(async () => {
  logger.info('Starting Puppeteer automation, profile=%s', PROFILE_PATH);

  const browser = await puppeteer.launch({
    headless: false,
    executablePath: CHROME_PATH,
    userDataDir: PROFILE_PATH,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 900 });

    logger.info('Navigating to %s', QUEST_URL);
    await page.goto(QUEST_URL, { waitUntil: 'networkidle' });
    await humanDelay(1000, 2000);

    logger.info('Waiting for quest action selector: %s', QUEST_ACTION_SELECTOR);
    await page.waitForSelector(QUEST_ACTION_SELECTOR, { timeout: 20000 });
    await humanDelay(400, 900);
    await page.click(QUEST_ACTION_SELECTOR);
    await humanDelay(1200, 2600);

    logger.info('Looking for MetaMask extension popup...');
    let metamaskPage = null;
    for (let i = 0; i < 30; i++) {
      const pages = await browser.pages();
      metamaskPage = pages.find(p => p.url().startsWith('chrome-extension://'));
      if (metamaskPage) break;
      await humanDelay(300, 600);
    }

    if (!metamaskPage) {
      logger.warn('MetaMask popup not detected. Ensure MetaMask is unlocked and the site triggered a connect/tx.');
      return;
    }

    logger.info('MetaMask popup detected, interacting...');
    await metamaskPage.bringToFront();
    await humanDelay(400, 900);

    const clickIfExists = async (p, xpath) => {
      try {
        const els = await p.$x(xpath);
        if (els.length) {
          await els[0].click();
          await humanDelay(400, 900);
          return true;
        }
      } catch (e) {
        logger.warn('clickIfExists error for %s: %s', xpath, e.message);
      }
      return false;
    };

    // Common MetaMask flows: Next -> Connect -> Approve/Confirm/Sign
    await clickIfExists(metamaskPage, "//button[contains(., 'Next')]");
    await clickIfExists(metamaskPage, "//button[contains(., 'Connect') or contains(., 'Connect Wallet')]");
    await clickIfExists(metamaskPage, "//button[contains(., 'Approve')]");
    await clickIfExists(metamaskPage, "//button[contains(., 'Confirm') or contains(., 'Sign')]");
    await humanDelay(800, 1400);

    await page.bringToFront();
    await humanDelay(1000, 2000);
    logger.info('Attempted connect/confirm. Inspect platform UI for success.');

  } catch (err) {
    logger.error('Automation error: %s', err?.message || err);
  } finally {
    // keep browser open for debugging; close manually if desired
    // await browser.close();
  }
})();
