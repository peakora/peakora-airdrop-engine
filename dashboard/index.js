const express = require('express');
const fs = require('fs');
const path = require('path');

function showDashboard() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(express.static(path.join(__dirname, 'public')));

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

  app.listen(PORT, () => {
    console.log(`Dashboard running at http://localhost:${PORT}`);
  });
}

module.exports = { showDashboard };
