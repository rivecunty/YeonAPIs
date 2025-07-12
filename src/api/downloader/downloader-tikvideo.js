const axios = require("axios");
const cheerio = require("cheerio");
const { wrapper } = require("axios-cookiejar-support");
const { CookieJar } = require("tough-cookie");

const jar = new CookieJar();
const client = wrapper(axios.create({
  jar,
  withCredentials: true
}));

const headers = {
  accept: "*/*",
  "accept-language": "id-ID,id;q=0.9",
  "cache-control": "no-cache",
  "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
  origin: "https://tikvideo.app",
  pragma: "no-cache",
  priority: "u=1, i",
  referer: "https://tikvideo.app/id",
  "sec-ch-ua": '"Chromium";v="131", "Not_A Brand";v="24", "Microsoft Edge Simulate";v="131", "Lemur";v="131"',
  "sec-ch-ua-mobile": "?1",
  "sec-ch-ua-platform": '"Android"',
  "sec-fetch-dest": "empty",
  "sec-fetch-mode": "cors",
  "sec-fetch-site": "same-origin",
  "user-agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36",
  "x-requested-with": "XMLHttpRequest"
};

module.exports = function (app) {
  app.get('/downloader/tikvideo', async (req, res) => {
    const { url } = req.query;
    if (!url) {
      return res.status(400).json({
        status: false,
        error: "Parameter 'url' tidak boleh kosong"
      });
    }

    try {
      const postData = new URLSearchParams();
      postData.append("q", url);
      postData.append("lang", "id");
      postData.append("cftoken", "");

      const response = await client.post("https://tikvideo.app/api/ajaxSearch", postData, { headers });
      const $ = cheerio.load(response.data.data);

      const result = $(".video-data .tik-video").map((_, el) => ({
        thumbnail: $(el).find(".thumbnail img").attr("src") || "",
        title: $(el).find(".content h3").text() || "No Title",
        download: $(el).find(".dl-action a").map((_, em) => ({
          title: $(em).text().trim() || "No Label",
          link: $(em).attr("href") || "#"
        })).get()
      })).get()[0];

      if (!result) {
        return res.status(404).json({
          status: false,
          error: "Gagal mengambil data. Coba link lain."
        });
      }

      return res.status(200).json({
        status: true,
        result
      });

    } catch (e) {
      console.error("Scrape Error:", e.message);
      return res.status(500).json({
        status: false,
        error: "Internal server error"
      });
    }
  });
};
