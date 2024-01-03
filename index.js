const {express,session,client,axios, uuid,app,store, ytdl,cors,cookieParser,save, main, loginRoute} = require("./server/app.js");

app.set('view engine', 'ejs');
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json())
app.use(cookieParser());
app.use(session);
app.use(main)
app.use(loginRoute)

app.use("/src",(req,res,next)=>{
  // if(req.session==undefined){
  //   res.sendFile(__dirname+"/public/login.html");
  //   return;
  // }
next();

})
app.use("/",express.static("/"));
app.get("/favicon.ico",(req,res)=>res.sendFile(__dirname+"/public/image.png"))
app.get("/sitemap.xml",(req,res)=>res.sendFile(__dirname+"/public/sitemap.xml"))
app.get("/home",(req,res)=>res.render('home'))
app.use("/src",express.static("public"));
//AIzaSyCdMdqblqRy4ObnC7IFI-xTz5rjO9qS0zc
app.get("/", (req, res) => {
  
  if(req.session==undefined)res.sendFile(__dirname+"/public/login.html");
  else{res.sendFile(__dirname + "/public/index.html");req.session.isFirst=false}   
save(req);
});


const PORT = 3000;

app.listen(PORT, () => {
  console.log("SERVER ON");
});
setInterval(() => {
  axios.get("https://ytomp3.onrender.com").catch(err=>{throw err;});
}, 720000);
