const express = require('express');
const fs = require('fs');
const path = require('path');

function showDashboard() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  // Serve a simple homepage
  app.get('/', (req, res) => {
    res.send('<h1>Peakora Dashboard</h1><p>Logs and farming status will appear here.</p><p>Visit <a href="/logs">/logs</a> to see log files.</p>');
  });

  // List all log files
  app.get('/logs', (req, res) => {
    const logsDir = path.join(__dirname, '../logs');
    fs.readdir(logsDir, (err, files) => {
      if (err) return res.status(500).send('Error reading logs');
      const logFiles = files.filter(f => f.endsWith('.log'));
      res.json(logFiles);
    });
  });

  // View a specific log file
  app.get('/logs/:file', (req, res) => {
    const filePath = path.join(__dirname, '../logs', req.params.file);
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) return res.status(404).send('Log not found');
      res.send(`<h2>${req.params.file}</h2><pre>${data}</pre>`);
    });
  });

  app.listen(PORT, () => {
    console.log(`Dashboard running at http://localhost:${PORT}`);
  });
}

module.exports = { showDashboard };
