const express = require('express');
const { exec } = require('child_process');
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

app.post('/login', (req, res) => {
  /**
   * @type {object}
   */
  const dataReceived = req.body;

  const account = dataReceived["account"];
  const password = dataReceived["pwd"];
  const cookie = dataReceived["cookie"];

  if(cookie==null && (account==null || password==null)){
    log.logFormat(`Someone tried to login but was lack of info.`);
    res.sendStatus(403);
    return;
  }

  // FIXME: Prevent SQL Injection.
  let ret = sqlPlugin.login(account,password,cookie);
  if(ret.msg=="success"){
    // log.logFormat(`${account} logged in successfully.`);
    res.json(ret);
  }else{
    res.sendStatus(403);
  }
});

// TODO: features haven't been implemented.
app.post('/employee', (req, res) => {
  /**
   * @type {object}
   */
  const dataReceived = req.body;

  const account = dataReceived["account"];
  const cookie = dataReceived["cookie"];

  let ret = sqlPlugin.checkHash(account,cookie);
  if (ret==null){
    res.json({
      "status":403
    });
  }else{
    // if(ret["accountType"]=="admin"){

    // }
    // TODO: fetching data.
    res.json({
      "status":200,
    });
  }
  // res.sendStatus(403);s
});

// TODO: features haven't been implemented.
app.post('/admin', (req, res) => {
  /**
   * @type {object}
   */
  const dataReceived = req.body;
  const account = dataReceived["account"];
  const cookie = dataReceived["cookie"];

  let ret = sqlPlugin.checkHash(account,cookie);
  if (ret==null){
    res.json({
      "status":403
    });
  }else{
    if(ret["accountType"]=="empolyee"){
      res.json({
        "status":403
      });
    }else{
      // TODO: fetching data.
      res.json({
        "status":200,
      });
    }
  }
});

// TODO: features haven't been implemented.
app.post('/register', (req, res) => {
  /**
   * @type {object}
   */
  const dataReceived = req.body;
  res.sendStatus(403);
});

// 啟動伺服器
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
  log.logFormat("Server online.");
});