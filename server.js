const express = require('express');
const DataForwarder = require('./index');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Start the forwarder
const forwarder = new DataForwarder();
forwarder.start();

// Start Express server (required by Render)
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

module.exports = app;
