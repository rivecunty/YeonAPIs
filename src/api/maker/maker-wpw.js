const axios = require('axios');

const FILTERS = ['Coklat', 'Hitam', 'Nerd', 'Piggy', 'Carbon', 'Botak'];

module.exports = function(app) {
  async function Hytamkan(imageUrl, filter = 'Hitam') {
    const selected = FILTERS.find(f => f.toLowerCase() === filter.toLowerCase());
    if (!selected) throw new Error(`Filter '${filter}' tidak tersedia.`);

    const imgRes = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const base64Input = Buffer.from(imgRes.data).toString('base64');

    const res = await axios.post('https://wpw.my.id/api/process-image', {
      imageData: base64Input,
      filter: selected.toLowerCase()
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'https://wpw.my.id',
        'Referer': 'https://wpw.my.id/'
      }
    });

    const dataUrl = res.data?.processedImageUrl;
    if (!dataUrl?.startsWith('data:image/')) throw new Error('ga ada result');

    const base64Output = dataUrl.split(',')[1];
    return Buffer.from(base64Output, 'base64');
  }

  app.get('/ai/penghitamanwaifu', async (req, res) => {
    const { url, filter = 'Hitam' } = req.query;
    if (!url) return res.status(400).json({ status: false, error: 'url parameter is required' });

    try {
      const resultBuffer = await Hytamkan(url, filter);
      res.writeHead(200, {
        'Content-Type': 'image/png',
        'Content-Length': resultBuffer.length
      });
      res.end(resultBuffer);
    } catch (err) {
      res.status(500).json({ status: false, error: err.message });
    }
  });
};
