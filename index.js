const express = require("express")
const axios = require("axios")
const app = express();  
const ytsr = require('ytsr');
const ytdl = require('ytdl-core')
app.use(express.static('public'))

app.get("/search/:q",(req,res)=>{
  const q = req.params.q;
  console.log( req.headers['x-forwarded-for'] || req.socket.remoteAddress )  
  axios.get("https://www.googleapis.com/youtube/v3/search?part=snippet&key=AIzaSyD4LkDVhw9RnkgprtkWLcc6fBi5u6LO5hg&type=video&q="+q)
  .then((axios)=>{return axios.data.items.map((value=>{return {videoid:value.id.videoId,title:value.snippet.title,thumbnail:value.snippet.thumbnails.medium}}))}).then((data)=>{  
    res.json(data);
    
   

   
})
})

app.get("/getUrl/:id",(req,res)=>{
  ytdl.getInfo(req.params.id).then(resp=>{
    
    res.json(resp.formats);
    
  })
})


// Example of filtering the formats to audio only.

//AIzaSyCdMdqblqRy4ObnC7IFI-xTz5rjO9qS0zc
app.get("/",(req,res)=>{
  const ip= req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  console.log(ip);
    res.sendFile(__dirname+"/public/index.html");
})
const PORT = process.env.PORT ||3000;
app.listen(PORT,()=>{console.log("SERVER ON");})