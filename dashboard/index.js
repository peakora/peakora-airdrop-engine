// dashboard/index.js
const express = require('express');
const path = require('path');
const dashboard = require('./dashboard');
const logger = require('../logger/logger');

const PORT = process.env.PORT || 3000;
const app = express();

// serve static UI
app.use(express.static(path.join(__dirname, 'public')));

// basic JSON API used by pollers / central station
app.get('/health', (req, res) => {
  res.json({ ok: true, ts: Date.now() });
});

app.get('/status', async (req, res) => {
  try {
    const status = await dashboard.getStatus ? dashboard.getStatus() : { running: true };
    res.json({ ok: true, status });
  } catch (err) {
    logger.error('Error in /status', err);
    res.status(500).json({ ok: false, error: String(err) });
  }
});

// fallback to index.html for SPA routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Dashboard running at http://localhost:${PORT}`);
  logger.info(`Dashboard listening on ${PORT}`);
});
