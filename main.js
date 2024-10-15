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
const multer = require("multer");
const AdmZip = require("adm-zip");
const fs = require("fs")

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

const posts = ['login','employee','admin','session',"register",'dayoff','request','query','permit','init'];
(()=>{
  posts.forEach(v=>{
    app.post(`/${v}`,require(`./system/${v}.js`).bind(null,sqlPlugin,log,mailer));
  })
})();

/* ====================================== DEPRECATED ================================================= */
const deprecated = ["upload"];
(()=>{
  deprecated.forEach(v=>{
    app.all(`/${v}`,(req,res)=>{
      res.send({
        "status": 404,
        "msg": "page deprecated."
      })
    });
  })
})();



/* ====================================== MULTIER FILE HANDLING ================================================= */

/**
 * @type {multer()}
 */
const upload = require("./plugins/multer.js");

app.post("/upload",upload,(req, res, next) => {
  const file = req.file;
  if (file) {
    var zip = new AdmZip();
    // console.log(`${file.originalname}`)
    zip.addLocalFile(`./proofs/${file.originalname}`);
    zip.writeZip(`./proofs/${file.originalname.split(".")[0]}.zip`);
    fs.rm(`./proofs/${file.originalname}`,(err)=>console.log);
  }

  require("./system/upload.js")(sqlPlugin,log,mailer,req,res,file);
  // res.send("awa");

})
// Set up a route for file uploads


// 啟動伺服器
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
  log.logFormat("Server online.");
  const mailerStatus = mailer.verify();
  if(!mailerStatus){
    console.error("")
  }
});