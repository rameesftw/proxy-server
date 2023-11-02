const express = require("express");
const main = express.Router();
const axios = require("axios");
const ytdl = require("ytdl-core");
const { client, handleDb } = require("./session");
const {ProxyAgent} = require('proxy-agent');


const agent = new ProxyAgent('http://139.59.1.14:3128');

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
  //   const videoInfo = await ytdl.getInfo(videoURL);
  //   res.json(videoInfo)
  //   const stream = ytdl(videoURL, {
  //     quality: 'highestaudio',
  //     filter: 'audioonly',
  //     requestOptions:{agent}
  //   });
  //  // res.set('Content-Type', 'audio/mpeg');
  //   stream.pipe(res);
  url="https://rr1---sn-3xg5a5-jjwl.googlevideo.com/videoplayback?expire=1698965218&ei=gtJDZdKTKpz34-EP-t-W-AM&ip=13.228.225.19&id=o-AIA7rgPbEV3Q4PJByRuoRDDcbGbnnmlXWydjyXAW9rBp&itag=18&source=youtube&requiressl=yes&mh=Yk&mm=31%2C29&mn=sn-3xg5a5-jjwl%2Csn-h557snsl&ms=au%2Crdu&mv=m&mvi=1&pcm2cms=yes&pl=24&gcr=in&initcwndbps=832500&spc=UWF9f7JsleXnU8Uf0w04mRP1JG-SA48XIMVEiaMmhA&vprv=1&svpuc=1&mime=video%2Fmp4&ns=ecIxfytu4-OU5EN8bsTAEDUP&cnr=14&ratebypass=yes&dur=300.977&lmt=1694129402058371&mt=1698943282&fvip=2&fexp=24007246&beids=24350018&c=WEB&txp=4538434&n=enynmmlvX1axnA&sparams=expire%2Cei%2Cip%2Cid%2Citag%2Csource%2Crequiressl%2Cgcr%2Cspc%2Cvprv%2Csvpuc%2Cmime%2Cns%2Ccnr%2Cratebypass%2Cdur%2Clmt&lsparams=mh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpcm2cms%2Cpl%2Cinitcwndbps&lsig=AM8Gb2swRAIgbPEVoaexR1yX8GK2ShFOmIqxxAIdYhzeqHvue5R2JiACIEYZDhyNFa7p1Ly2CXhz2rqOYS75n65mLHge4gr-ETP9&sig=ANLwegAwRQIhAJvzG9G1HOo4QGtWAgR39_R2yAQFn74VFJsU5-Gzda6dAiAppa7ydABRVFX1oxzwmyvpcq9WgxG_PQ9zzRPypeb86g%3D%3D"
  const response = await axios.get(url, { responseType: 'stream' });

    // Create a writable stream to save the audio file

    // Pipe the HTTP response data to the file stream
    response.data.pipe(res);
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
