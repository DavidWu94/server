const express = require('express');
const app = express();
const PORT = 3000;
const bodyParser = require('body-parser');
const logger = require("./plugins/logger.js");
const cors = require("cors");
const sql = require("./plugins/sql.js");
const sqlPlugin = new sql();
const log = new logger(`./logs/${new Date().toDateString()}.log`);
const nMailer = require("./plugins/mailer.js");
const mailer = new nMailer();

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

const posts = ['login','employee','admin','register','session'];
(()=>{
  posts.forEach(v=>{
    app.post(`/${v}`,require(`./system/${v}.js`).bind(null,sqlPlugin,log));
  })
})();


// 啟動伺服器
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
  log.logFormat("Server online.");
  const mailerStatus = mailer.verify();
  if(!mailerStatus){
    console.error("")
  }
  // mailer.send("catherine@eucan.com.tw","Testing mail","Sent by nodemailer").then(ret=>{
  //   console.log(`Success. ${ret}`)
  // });
});