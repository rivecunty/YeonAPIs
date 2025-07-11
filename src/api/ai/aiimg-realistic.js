const axios = require('axios');
const FormData = require('form-data');

const styleMap = {
  photorealistic: 'photorealistic style image',
  cinematic: 'cinematic style image',
  hyperreal: 'hyperrealistic style image',
  portrait: 'portrait style image'
};

const resolutionMap = {
  '512x512': { width: 512, height: 512 },
  '768x768': { width: 768, height: 768 },
  '1024x1024': { width: 1024, height: 1024 },
  '1920x1080': { width: 1920, height: 1080 }
};

module.exports = function(app) {
  async function RealisticImage({ prompt, style = 'photorealistic', resolution = '768x768', seed = null }) {
    const selectedStyle = styleMap[style.toLowerCase()];
    const selectedRes = resolutionMap[resolution];

    if (!selectedStyle || !selectedRes) {
      throw new Error('Style atau resolusi ga valid');
    }

    const fullPrompt = `${selectedStyle}: ${prompt}`;
    const form = new FormData();
    form.append('action', 'generate_realistic_ai_image');
    form.append('prompt', fullPrompt);
    form.append('seed', (seed || Math.floor(Math.random() * 100000)).toString());
    form.append('width', selectedRes.width.toString());
    form.append('height', selectedRes.height.toString());

    const res = await axios.post('https://realisticaiimagegenerator.com/wp-admin/admin-ajax.php', form, {
      headers: {
        ...form.getHeaders(),
        'origin': 'https://realisticaiimagegenerator.com',
        'referer': 'https://realisticaiimagegenerator.com/',
        'user-agent': 'Mozilla/5.0 (X11; Linux x86_64)',
        'accept': '*/*'
      }
    });

    const json = res.data;
    if (!json?.success || !json.data?.imageUrl) throw new Error('Ga ada result');
    return json.data.imageUrl;
  }

  app.get('/ai/realisticimage', async (req, res) => {
    const { prompt, style = 'photorealistic', resolution = '768x768', seed = null } = req.query;
    if (!prompt) return res.status(400).json({ status: false, error: 'prompt parameter is required' });

    try {
      const imageUrl = await RealisticImage({ prompt, style, resolution, seed });
      const img = await axios.get(imageUrl, { responseType: 'arraybuffer' });

      res.writeHead(200, {
        'Content-Type': 'image/png',
        'Content-Length': img.data.length
      });
      res.end(img.data);
    } catch (error) {
      res.status(500).json({ status: false, error: error.message });
    }
  });
};
