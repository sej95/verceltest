// index.js
const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('Hello from Vercel! welcome test');
});

// Vercel 部署需要导出 Serverless 函数
module.exports = app;
