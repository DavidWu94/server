const express = require('express');
const app = express();
const PORT = 3000;
const bodyParser = require('body-parser');
const logger = require("./plugins/logger.js");
const cors = require("cors");
const sql = require("./plugins/sql.js");
const sqlPlugin = new sql();
const log = new logger(`./logs/${new Date().toDateString()}.log`);

app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 

app.use( bodyParser.json() );       // to support JSON-encoded bodies

app.use(cors({
  "origin": "*",
  "methods": "GET,POST",
  "preflightContinue": false,
  "optionsSuccessStatus": 204,
  "Access-Control-Allow-Origin": "*"
}));

app.all('/',(req,res)=>{
  res.send("System online.");
});

const posts = ['login','employee','admin','register'];
(()=>{
  posts.forEach(v=>{
    app.post(`/${v}`,require(`./system/${v}.js`).bind(null,sqlPlugin,log));
  })
})();


// 啟動伺服器
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
  log.logFormat("Server online.");
});