var express = require("express");
var expressStaticGzip = require("express-static-gzip");
var app = express();

app.use((req, res, next) => {
  res.append("Access-Control-Allow-Origin", "*");
  // res.append('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  // res.append('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

app.use("/", expressStaticGzip("data/"));
app.listen(3001);
