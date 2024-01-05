const {express,session,client,axios, uuid,app,store, ytdl,cors,cookieParser,save, main, loginRoute} = require("./server/app.js");
const http = require("http")
const server = http.createServer(app);
const {WebSocketServer} = require("ws")
const {log,watchDb}=require("./server/logs.js")

app.set('view engine', 'ejs');
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json())
app.use(cookieParser());
app.use(session);
app.use(log)
app.use(main)
app.use(loginRoute)



app.use((req,res,next)=>{
  

next();

})
app.get("/admin",(req,res)=>res.render("dashboard"))
app.get("/googlee14021efb173ffe1.html",(req,res)=>{res.sendFile(__dirname+"/googlee14021efb173ffe1.html")})
app.get("/favicon.ico",(req,res)=>res.sendFile(__dirname+"/public/image.png"))
app.get("/sitemap.xml",(req,res)=>res.sendFile(__dirname+"/public/sitemap.xml"))
app.get("/home",(req,res)=>res.render('home'))
app.use("/src",express.static("public"));
app.get("/robots.txt",(req,res)=>res.sendFile(__dirname+"/public/robot.txt"))
//AIzaSyCdMdqblqRy4ObnC7IFI-xTz5rjO9qS0zc
app.get("/", (req, res) => {
  
  if(req.session==undefined)res.render("home");
  else{res.sendFile(__dirname + "/public/index.html");req.session.isFirst=false}   
save(req);
});
const wss = new WebSocketServer({server})
watchDb(wss);

const PORT = 3000;

server.listen(PORT, () => {
  console.log("SERVER ON");
});
setInterval(() => {
  axios.get("https://ytomp3.onrender.com").catch(err=>{throw err;});
}, 720000);
