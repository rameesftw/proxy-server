const express = require("express");
const main = express.Router();
const axios = require("axios");
const ytdl = require("ytdl-core");
const { client, handleDb } = require("./session");
const HttpsProxyAgent = require('https-proxy-agent');

const proxy = '182.16.171.65:51459'; // Proxy URL without authentication
const agent = new HttpsProxyAgent(proxy);
main.get("/audio/search",(req,res)=>{
  res.render('search')
})
main.get("/audio/search/:q", (req, res) => {
  let q = req.params.q;
  q=q.replace("-download-mp3","")
  console.log(req.headers["x-forwarded-for"] || req.socket.remoteAddress);
  axios
    .get(
      "https://www.googleapis.com/youtube/v3/search?part=snippet&key=AIzaSyD-eKz53eTLx3XQdIctqCuGrdbrzF8iD08&type=video&q=" +
        q
    )
    .then((axios) => {
     const data=axios.data.items[0]
      const render = {
    title: data.snippet.title,
    description:data.snippet.description,
    downloadUrl:`download/file/${data.id.videoId}`,
  };
  res.render('index', render);
}).catch((err)=>{console.log(err);})})

main.get('/download/file/:query', async (req, res) => {
  const videoURL = req.params.query; // Get the video URL from the query parameter

  if (!videoURL) {
    return res.status(400).send('Please provide a valid YouTube video URL.');
  }

  // Use ytdl-core to fetch video data
  try {
    const videoInfo = await ytdl.getInfo(videoURL);
    const stream = ytdl(videoURL, {
      quality: 'highestaudio',
      filter: 'audioonly',
      requestOptions:{agent}
    });
    res.set('Content-Type', 'audio/mpeg');
    stream.pipe(res);
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).send('An error occurred while fetching the video.');
  }
});

main.get("/search/:q", (req, res) => {
  const q = req.params.q;
  console.log(req.headers["x-forwarded-for"] || req.socket.remoteAddress);
  axios
    .get(
      "https://www.googleapis.com/youtube/v3/search?part=snippet&key=AIzaSyD-eKz53eTLx3XQdIctqCuGrdbrzF8iD08&type=video&q=" +
        q
    )
    .then((axios) => {
      return axios.data.items.map((value) => {
        return {
          videoid: value.id.videoId,
          title: value.snippet.title,
          thumbnail: value.snippet.thumbnails.medium,
        };
      });
    })
    .then((data) => {
      res.json(data);
    });
});

main.get("/getUrl/:id", (req, res) => {
  ytdl.getInfo(req.params.id).then((resp) => {
    res.json(resp.formats);
  });
});
main.post("/data/:options", async (req, res) => {
  switch (req.params.options) {
    case "save":
      console.log(req.body);
      await client
        .db("songData")
        .collection(req.session.username)
        .updateOne(req.body, { $set: req.body }, { upsert: true })
        .then((data) => console.log(data));
        break;
    case "get":
      console.log("get:"+req.params);
      client.db("songData").collection(req.session.username).find({}).toArray().then(data=>{console.log(data);res.json(data)})
  }
});
module.exports = main;
