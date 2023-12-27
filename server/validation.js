const { client, handleDb, save, uuid } = require("./session");
const express = require("express");
const loginRoute = express.Router();
const path = require("../path");

loginRoute.get("/login", (req, res) => {
  if (req.session != undefined) {
    res.redirect("/");
    return;
  }
  res.sendFile(path + "/public/login.html");
});
loginRoute.get("/signup", (req, res) => {
  if (req.session != undefined) {
    res.redirect("/");
    return;
  }
  res.sendFile(path + "/public/signup.html");
});

loginRoute.post("/signup", async (req, res) => {
  const result = await handleDb({
    find: { username: req.body.username },
    collection: "loginData",
    method: "get",
  }).then((data) => {
    return data.length;
  });

  if (result == 1) {
    res.cookie("errorMessage", "Username already exist");
    res.redirect("/signup");
  } else if (result == 0) {
    if (req.body.password == req.body.confirm_password) {
      var sid = uuid.v4();
      req.session = {
        sid: sid,
        username: req.body.username,
        isFirst: true,
      };
      await save(req).then(async () => {
        res.cookie("sid",{ maxAge: 2 * 60 * 60 * 1000, httpOnly: true });
        res.redirect("/");
        await handleDb({
          method: "insert",
          body: {
            username: req.body.username,
            password: Buffer.from(req.body.password).toString("base64"),
          },
          collection: "loginData",
        });
      });
    }
  }
});

loginRoute.post("/login", async (req, res) => {
  if (req.body)
    if (req.body.username && req.body.password) {
      data = await handleDb({
        method: "get",
        find: {
          username: req.body.username,
          password: Buffer.from(req.body.password).toString("base64"),
        },
        collection: "loginData",
      });
    
      if(data.length==1){
        sid = uuid.v4();
        req.session={
          sid:sid,
          username:data[0].username,
          isFirst:true
        };
        save(req).then(()=>{
          res.cookie("sid",sid, { maxAge: 14*24 * 60 * 60 * 1000, httpOnly: true });
          res.redirect("/");
        })


      }else{
        res.cookie("errorMessage","Credintials not match");
        res.redirect("/login");
      }
    }else{
      res.cookie("errorMessage","Enter username and password");
      res.redirect("/login")
    }
});

module.exports = loginRoute;
