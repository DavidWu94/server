const sql = require("../plugins/sql")
const mail = require("../plugins/mailer")
const upload = require('../plugins/multer');

/**
 * 
 * @param {sql} sqlPlugin 
 * @param {*} log 
 * @param {mail} mailer 
 * @param {*} req 
 * @param {*} res 
 */
module.exports = (sqlPlugin,log,mailer,req,res)=>{
  // Handle the uploaded file
  upload(req,res,(err)=>{
    if (err) {
      console.error(err);
      return res.status(500).json({ error: err });
     }
    /**
     * @type {object}
     */
    const dataReceived = req.body;

    const account = dataReceived["account"];
    const cookie = dataReceived["cookie"];
    const type = dataReceived["type"];
    // data below requires front-end format time into 2024-01-01
    const start = dataReceived["start"];
    const end = dataReceived["end"];  
    const totalTime = dataReceived["totalTime"];  
    // TODO: Add permission check

    let ret = sqlPlugin.checkHash(account,cookie);
    if (ret==null){
      res.json({
        "status":403
      });
      return;
    }else{
      const ret = sqlPlugin.newRequest(account,type,start,end,totalTime);

      if (!ret){
        res.sendStatus(501);
        return;
      }

      var man = ["jeff@eucan.com.tw","catherine@eucan.com.tw"]
      mailer.send(man[ret["mgroup"]],"請假審核要求",`您好，\n員工 ${ret["name"]}於剛才發送請假要求。\n詳細內容請登入請假系統審核。\n\n<此信為系統自動發送，請勿回覆>`)
      res.send("已向主管提出請假申請，請點擊上一頁回到請假頁面")
    }
    // console.log(req.body)
  })
}