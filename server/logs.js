const { WebSocketServer } = require("ws");

const { client } = require("./session");

const log = require("express").Router()
log.use((req,res,next)=>{
    const logObj = {
        ipaddress:(req.ip=='::1')?req.headers['x-forwarded-for']:req.ip||req.connection.remoteAddress,
        path:decodeURIComponent(req.path),
        timestamp:(new Date()).toISOString(),
        referer:req.get("referer")?req.get("referer"):"/"
    }
    client.db("ytomp3").collection("logs").insertOne(logObj)
    next();
})
log.get("/admin",async(req,res)=>{
      if(req.query.pass=="rameesftwisback")
         res.render("dashboard");
        else res.sendStatus(404);
})

var watchDb = (wss) =>{
    wss.on("connection",async(socket)=>{
        console.log("connected")
        socket.on("message",(data)=>{console.log(data.toString())})
        
        const storedLogs =await client.db("ytomp3").collection("logs").find().sort({timestamp:-1}).limit(20).toArray()
        socket.send(JSON.stringify(storedLogs))
        let logListner = client.db("ytomp3").collection("logs").watch();
logListner.on("change",(change)=>{
    socket.send(JSON.stringify([change.fullDocument]))
})
    })

}

module.exports = {log,watchDb}
