const axios = require('axios');

module.exports = function (app) {
  app.get('/aiimg/freebox', async (req, res) => {
    const { prompt, aspectRatio = '16:9', slug = 'ai-art-generator' } = req.query;

    const validRatios = ['1:1', '2:3', '9:16', '16:9'];
    const validSlugs = [
      'ai-art-generator',
      'ai-fantasy-map-creator',
      'ai-youtube-thumbnail-generator',
      'ai-old-cartoon-characters-generator'
    ];

    if (!prompt) {
      return res.status(400).json({
        status: false,
        error: 'Prompt tidak boleh kosong'
      });
    }

    if (!validRatios.includes(aspectRatio)) {
      return res.status(400).json({
        status: false,
        error: `Aspect ratio tidak valid. Pilih salah satu: ${validRatios.join(', ')}`
      });
    }

    if (!validSlugs.includes(slug)) {
      return res.status(400).json({
        status: false,
        error: `Slug tidak valid. Pilih salah satu: ${validSlugs.join(', ')}`
      });
    }

    try {
      const response = await axios.post('https://aifreebox.com/api/image-generator', {
        userPrompt: prompt,
        aspectRatio,
        slug
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Origin': 'https://aifreebox.com',
          'Referer': `https://aifreebox.com/image-generator/${slug}`,
          'User-Agent': 'Mozilla/5.0 (Linux; Android 13; Mobile) AppleWebKit/537.36 Safari/537.36'
        }
      });

      const { data } = response;

      if (data?.success && data.imageUrl) {
        return res.status(200).json({
          status: true,
          result: {
            imageUrl: data.imageUrl,
            slug,
            aspectRatio,
            prompt
          }
        });
      } else {
        return res.status(500).json({
          status: false,
          error: 'Gagal mendapatkan gambar dari AI Freebox'
        });
      }

    } catch (err) {
      console.error('Error Freebox:', err.message);
      return res.status(500).json({
        status: false,
        error: err.message || 'Internal error'
      });
    }
  });
};
