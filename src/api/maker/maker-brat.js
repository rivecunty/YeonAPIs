const { renderTextToBuffer } = require('../lib/brat-render');
const { parse } = require('twemoji-parser');
const axios = require('axios');
const Jimp = require('jimp');
const { createCanvas, loadImage } = require('canvas');

module.exports = function(app) {
  app.get('/maker/brat', async (req, res) => {
    const { text } = req.query;
    if (!text) return res.status(400).json({ status: false, error: 'text parameter is required' });

    try {
      const imageBuffer = await renderTextWithEmoji(text, {
        background: '#000',
        color: '#fff',
        blur: 1
      });

      res.writeHead(200, {
        'Content-Type': 'image/png',
        'Content-Length': imageBuffer.length
      });
      res.end(imageBuffer);
    } catch (err) {
      res.status(500).json({ status: false, error: err.message });
    }
  });
};
