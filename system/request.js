const sql = require("../plugins/sql")
const mail = require("../plugins/mailer")
/**
 * 
 * @param {sql} sqlPlugin 
 * @param {*} log 
 * @param {mail} mailer 
 * @param {*} req 
 * @param {*} res 
 */
module.exports = (sqlPlugin,log,mailer,req,res)=>{
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

    // TODO: Add permission check
    

    let ret = sqlPlugin.checkHash(account,cookie);
    if (ret==null){
      res.json({
        "status":403
      });
    }else{
      const mgroup = sqlPlugin.newRequest(account,type,start,end);

      if (!mgroup){
        res.sendStatus(501);
        return;
      }

      var man = ["jeff@eucan.com.tw","catherine@eucan.com.tw"]
      // console.log(man[mgroup["mgroup"]])
      mailer.send(man[mgroup["mgroup"]],"請假審核要求",`您好，員工編號${account}於剛才發送請假要求。\n詳細內容請登入請假系統審核。\n\n<此信為系統自動發送，請勿回覆>`)
      res.json({
        "status":200,
      });
    }
    // res.sendStatus(403);s
    
}