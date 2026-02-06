// dashboard/index.js
const express = require('express');
const fs = require('fs');
const path = require('path');

function showDashboard(port = process.env.PORT || 3000) {
  const app = express();

  app.use(express.static(path.join(__dirname, 'public')));

  app.get('/health', (req, res) => {
    res.json({ ok: true, ts: Date.now() });
  });

  app.get('/logs', (req, res) => {
    const logsDir = path.join(__dirname, '../logs');
    fs.readdir(logsDir, (err, files) => {
      if (err) return res.status(500).send('Error reading logs');
      const logFiles = files.filter(f => f.endsWith('.log'));
      res.json(logFiles);
    });
  });

  app.get('/logs/:file', (req, res) => {
    const filePath = path.join(__dirname, '../logs', req.params.file);
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) return res.status(404).send('Log not found');
      res.json({ file: req.params.file, content: data });
    });
  });

  // fallback for SPA routes
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  });

  const server = app.listen(port, () => {
    console.log(`Dashboard running at http://localhost:${port}`);
  });

  return server;
}

// If run directly, start the server
if (require.main === module) {
  showDashboard();
}

module.exports = { showDashboard };
