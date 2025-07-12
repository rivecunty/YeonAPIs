const axios = require('axios');

module.exports = function (app) {
  app.get('/aiimg/ghibliimg', async (req, res) => {
    const { prompt, style = 'Spirited Away' } = req.query;

    const allowedStyles = [
      'Spirited Away',
      "Howl's Castle",
      'Princess Mononoke',
      'Totoro'
    ];

    if (!prompt) {
      return res.status(400).json({
        status: false,
        error: 'Prompt tidak boleh kosong'
      });
    }

    if (!allowedStyles.includes(style)) {
      return res.status(400).json({
        status: false,
        error: `Style tidak tersedia. Gunakan salah satu dari: ${allowedStyles.join(', ')}`
      });
    }

    try {
      const response = await axios.post(
        'https://ghibliimagegenerator.net/api/generate-image',
        { prompt, style },
        {
          headers: {
            'content-type': 'application/json',
            'origin': 'https://ghibliimagegenerator.net',
            'referer': 'https://ghibliimagegenerator.net/generator',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/117.0 Safari/537.36'
          }
        }
      );

      const base64 = response.data?.imageData;
      if (!base64) {
        return res.status(500).json({
          status: false,
          error: 'Gagal mendapatkan data gambar dari server'
        });
      }

      const buffer = Buffer.from(base64.split(',')[1], 'base64');

      res.writeHead(200, {
        'Content-Type': 'image/webp',
        'Content-Length': buffer.length
      });
      res.end(buffer);

    } catch (error) {
      console.error('[GHIBLI ERROR]', error.message);
      res.status(500).json({
        status: false,
        error: error.message || 'Internal server error'
      });
    }
  });
};
