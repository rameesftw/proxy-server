const express = require("express")
const axios = require("axios")
const app = express();  
const ytsr = require('ytsr');
const ytdl = require('ytdl-core')

app.get("/search/:q",(req,res)=>{
  const q = req.params.q;
  
  axios.get("https://www.googleapis.com/youtube/v3/search?part=snippet&key=AIzaSyCdMdqblqRy4ObnC7IFI-xTz5rjO9qS0zc&type=video&q="+q)
  .then((axios)=>{return axios.data.items.map((value=>{return {videoid:value.id.videoId,title:value.snippet.title}}))}).then((data)=>{
    const videoID = data[0].videoid;
    console.log(videoID);
ytdl.getInfo(videoID).then(resp=>{
    res.json(resp.formats);
  })
   
})
})




// Example of filtering the formats to audio only.

//AIzaSyCdMdqblqRy4ObnC7IFI-xTz5rjO9qS0zc
app.get("/",(req,res)=>{
    res.sendFile(__dirname+"/public/index.html");
})
app.listen(80,()=>{console.log("SERVER ON");})