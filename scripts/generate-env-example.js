// scripts/generate-env-example.js
const fs = require('fs');
const path = require('path');

const envPath = path.resolve(process.cwd(), '.env');
const outPath = path.resolve(process.cwd(), '.env.example');

if (!fs.existsSync(envPath)) {
  console.error('.env not found in repo root. Create .env first and re-run this script.');
  process.exit(1);
}

const content = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);

// Map of keys to placeholder values for .env.example
const placeholderMap = {
  RPC_URLS: 'https://rpc.arbitrum.io,https://rpc.ankr.com/arbitrum,https://arb1.arbitrum.io/rpc',
  CHAIN_ID: '42161',
  CHROME_PATH: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  CHROME_PROFILE_PATH: 'C:/Users/you/AppData/Local/Google/Chrome/User Data/Profile 1',
  PRIMARY_ADDRESS: '0xYourPrimaryAddress',
  PRIVATE_KEY_PRIMARY: 'your_primary_private_key_here',
  PRIVATE_KEY_NODE: 'your_node_private_key_here',
  ONEINCH_API: 'https://api.1inch.io/v5.0',
  DISTRIBUTION_ADDRESSES: '0xAddr1,0xAddr2,0xAddr3',
  DISTRIBUTION_THRESHOLD_ETH: '0.02',
  DISTRIBUTION_AMOUNT_ETH: '0.005',
  POLL_INTERVAL_MS: '20000',
  QUEST_URL: 'https://layer3.xyz/quests',
  QUEST_ACTION_SELECTOR: 'button[data-qa="start-quest"], .quest-card button',
  LOG_LEVEL: 'info'
};

const normalized = content.map(line => {
  if (!line || line.trim().startsWith('#')) return line;
  const [rawKey, ...rest] = line.split('=');
  const key = rawKey && rawKey.trim();
  if (!key) return line;
  if (Object.prototype.hasOwnProperty.call(placeholderMap, key)) {
    return `${key}=${placeholderMap[key]}${key === 'PRIMARY_ADDRESS' || key === 'PRIVATE_KEY_PRIMARY' ? '   # <<< CHANGE THIS in your local .env only' : ''}`;
  }
  // Keep unknown keys but strip values for safety if they look secret-like
  if (/KEY|SECRET|PRIVATE|PASSWORD|TOKEN/i.test(key)) {
    return `${key}=REDACTED   # <<< CHANGE THIS in your local .env only`;
  }
  return line;
});

// Ensure common keys exist in example even if missing in .env
Object.keys(placeholderMap).forEach(k => {
  if (!normalized.some(l => l.startsWith(`${k}=`))) {
    const suffix = (k === 'PRIMARY_ADDRESS' || k === 'PRIVATE_KEY_PRIMARY') ? '   # <<< CHANGE THIS in your local .env only' : '';
    normalized.push(`${k}=${placeholderMap[k]}${suffix}`);
  }
});

fs.writeFileSync(outPath, normalized.join('\n'), { mode: 0o644 });
console.log('Wrote .env.example with placeholders. Review it before committing.');
