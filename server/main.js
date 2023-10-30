const express = require("express");
const main = express.Router();
const axios = require("axios");
const ytdl = require("ytdl-core");
const { client, handleDb } = require("./session");

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




main.get('/download/file', (req, res) => {
  const videoURL = req.query.url; // Get the YouTube video URL from the query parameter

  if (!videoURL) {
    return res.status(400).send('Please provide a valid YouTube video URL.');
  }

  const stream = ytdl(videoURL, {
    quality: 'highestaudio',
    filter: 'audioonly',
  });

  stream.on('error', (error) => {
    console.error('Error:', error);
    res.send('An error occurred while processing the video.');
    return;
  });

  stream.on('info', (info, format) => {
    res.setHeader('Content-Disposition', `attachment; filename="ytomp3-music-name.mp3"`);
    res.setHeader('Content-Type', 'audio/mpeg');
    console.log(format)
  });

  stream.pipe(res);
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
