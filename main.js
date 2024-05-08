const express = require('express');
const app = express();
const PORT = 3000;
const bodyParser = require('body-parser')
const cors = require("cors");
const sql = require("./sqlInteractions/sql.js")
const a = new sql()

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
}))

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
    console.warn("Lack of info")
    res.sendStatus(403);
    return;
  }
  
  let b = a.login(account,password,cookie);
  res.json(b);
});

app.post('/employee', (req, res) => {
  /**
   * @type {object}
   */
  const dataReceived = req.body;
  res.sendStatus(403);
});

app.post('/admin', (req, res) => {
  /**
   * @type {object}
   */
  const dataReceived = req.body;
  res.sendStatus(403);
});

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
});