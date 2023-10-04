const express = require("express");
const axios = require("axios");
const uuid = require("uuid");
const loginRoute = require("./validation")
const cors = require("cors");
const cookieParser = require("cookie-parser");
const app = express();
const {session ,client,save}= require("./session");
const main = require("./main");



module.exports = {
    express,
    axios,
    uuid,
    app,
    loginRoute,
    cors,cookieParser,session,client,save,main
};
