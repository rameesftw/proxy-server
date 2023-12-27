const express = require("express");
const main = express.Router();
const axios = require("axios");
const ytdl = require("ytdl-core");
const { client, handleDb } = require("./session");
const { ProxyAgent } = require("proxy-agent");
const ytsr = require("@citoyasha/yt-search");
const ytsearch = require("yt-search");

const agent = new ProxyAgent("http://139.59.1.14:3128");

main.get("/audio/search", (req, res) => {
  res.render("search");
});
main.get("/audio/search/:q", async (req, res) => {
  let q = req.params.q;
  q = q.replace("-download-mp3", "");

  var youtubeSearchData = await ytsearch
    .search({ query: q, pages: 1 })
    .then((data) => data.all[0]);

  if (!youtubeSearchData) {
    res.status(500).write("server error due to unexpected search");
    res.end();
    return;
  }

  const render = {
    title: youtubeSearchData.title,
    description: youtubeSearchData.description,
    downloadUrl: `download/file/${youtubeSearchData.videoId}`,
  };
  res.render("index", render);
});
main.get("/stream/:id",async (req, res) => {
  const videoURL = req.params.id;

  // Parse the Range header
  const rangeHeader = req.headers.range;
  const matches = rangeHeader && rangeHeader.match(/bytes=(\d+)-(\d*)/);
  
  let start = 0;
  let end ;

  if (matches) {
    start = parseInt(matches[1], 10);
    end = matches[2] ? parseInt(matches[2], 10) : undefined;
  }

  // Fetch video info to get content length
  info = await ytdl.getInfo(
    videoURL,
    {
      quality: 'highestaudio',
      filter: 'audioonly',
      requestOptions:{agent}
    })
      const fileSize = info.formats[0].contentLength;
      const chunksize = end ? end - start + 1 : fileSize - start;

      // Log values for debugging
      console.log('start:', start);
      console.log('end:', end);
      console.log('fileSize:', fileSize);

      // Set appropriate headers for a partial content response
      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end || fileSize - 1}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': 'audio/mpeg', // Update with the actual content type
      });

      // Create a readable stream for the specified range using ytdl-core
      const videoStream = ytdl.downloadFromInfo(info, { range: { start, end },
        quality: 'highestaudio',
        filter: 'audioonly',
       });

      // Pipe the partial content to the response
      videoStream.pipe(res);
    
});
main.get("/download/file/:query", async (req, res) => {
  const videoURL = req.params.query; // Get the video URL from the query parameter

  if (!videoURL) {
    return res.status(400).send("Please provide a valid YouTube video URL.");
  }
  const stream = ytdl(videoURL, {
    quality: "highestaudio",
    filter: "audioonly",
    requestOptions: { agent },
    highWaterMark: 1024 * 1024 * 3,
  });
  res.set("Content-Type", "audio/mpeg");
  res.setHeader(
    "Content-disposition",
    `attachment; filename=ytomp3-${
      Math.floor(Math.random() * 90000) + 10000
    }.mp3`
  );

  stream.on("data", (chunk) => {
    res.write(chunk);
  });

  stream.on("end", () => {
    res.end();
  });
});

main.get("/search/:q", async (req, res) => {
  const q = req.params.q;

  var youtubeSearchData = await ytsr.search(q, 5);

  youtubeSearchData = youtubeSearchData.map((value) => {
    return {
      videoId: value.id,
      title: value.title,
      thumbnail: value.thumbnail,
    };
  });
  res.json(youtubeSearchData);
});

main.get("/getUrl/:id", (req, res) => {
  ytdl.getInfo(req.params.id).then((resp) => {
    res.json(resp.formats);
  });
});
main.post("/data/:options", async (req, res) => {
  switch (req.params.options) {
    case "save":
      await client
        .db("songData")
        .collection(req.session.username)
        .updateOne(req.body, { $set: req.body }, { upsert: true });
      break;
    case "get":
      client
        .db("songData")
        .collection(req.session.username)
        .find({})
        .toArray()
        .then((data) => {
          res.json(data);
        });
  }
});
module.exports = main;
