const express = require("express");
const main = express.Router();
const axios = require("axios");
const ytdl = require("ytdl-core");
const { client, handleDb } = require("./session");
const {ProxyAgent} = require('proxy-agent');
const ytsr = require("@citoyasha/yt-search")
const ytsearch = require("yt-search")

const agent = new ProxyAgent('http://139.59.1.14:3128');

main.get("/audio/search",(req,res)=>{
  res.render('search')
})
main.get("/audio/search/:q", async(req, res) => {
  let q = req.params.q;
  q=q.replace("-download-mp3","")
  
   var youtubeSearchData = await ytsearch.search({query:q,pages:1}).then(data=>data.all[0])
   
    if(!youtubeSearchData){res.status(500).write("server error due to unexpected search");res.end();return;}
    
      const render = {
    title: youtubeSearchData.title,
    description:youtubeSearchData.description,
    downloadUrl:`download/file/${youtubeSearchData.videoId}`,
  };
  res.render('index', render);
})

main.get('/download/file/:query', async (req, res) => {
  const videoURL = req.params.query; // Get the video URL from the query parameter

  if (!videoURL) {
    return res.status(400).send('Please provide a valid YouTube video URL.');
  }
  const stream = ytdl(videoURL, {
      quality: 'highestaudio',
      filter: 'audioonly',
      
    });
  res.set('Content-Type', 'audio/mpeg');
  res.setHeader('Content-disposition', `attachment; filename=ytomp3-${Math.floor(Math.random()*90000) + 10000}.mp3`);
  var chunks = [];

    stream.on('data', (chunk) => {
      
      res.write(chunk)
    });

    stream.on('end', () => {
     
      
      res.end()
    });
    
    
   
 // stream.pipe(res,{ highWaterMark:  5 * 1024 * 1024 });
  
  
  
  
});

main.get("/search/:q", async(req, res) => {
  const q = req.params.q;
  
  var youtubeSearchData=await ytsr.search(q, 5)

   youtubeSearchData=youtubeSearchData.map((value) => {
        return {
          videoId: value.id,
          title: value.title,
          thumbnail: value.thumbnail,
        };
      });
      res.json(youtubeSearchData)
    })
    
    



main.get("/getUrl/:id", (req, res) => {
  ytdl.getInfo(req.params.id,{
    quality: 'highestaudio',
    filter: 'audioonly'
  }).then((resp) => {
    res.json(resp.formats);
  });
});
main.post("/data/:options", async (req, res) => {
  switch (req.params.options) {
    case "save":
      
      await client
        .db("songData")
        .collection(req.session.username)
        .updateOne(req.body, { $set: req.body }, { upsert: true })
        break;
    case "get":
      client.db("songData").collection(req.session.username).find({}).toArray().then(data=>{res.json(data)})
  }
});
module.exports = main;
