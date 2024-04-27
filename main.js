const express = require('express');
const app = express();
const PORT = 3000;
const bodyParser = require('body-parser')
const cors = require("cors");
const sql = require("./sqlInteractions/sql.js")
const a = new sql()
// 處理POST請求
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


app.post('/login', (req, res) => {
  // 接收POST請求的資料
  /**
   * @type {object}
   */
  const dataReceived = req.body;
  // console.log(req.body)

  if(dataReceived["account"]==null || dataReceived["pwd"]==null){
    console.warn("Lack of info")
    res.sendStatus(403);
    // res.json({
    //   status:403,
    //   message:`錯誤，並未輸入${dataReceived["account"]==null&&dataReceived["pwd"]==null ? "帳號及密碼":dataReceived["account"]==null ? "帳號":"密碼"}`
    // })
    return;
  }


  // 回傳處理後的資料作為回應
  // console.log((req.body));
  let b = a.login(dataReceived["account"],dataReceived["pwd"]);
  res.json(b);
});

// 啟動伺服器
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
  // var a = new sql();
  // a.connect();
});