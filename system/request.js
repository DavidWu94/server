const sql = require("../plugins/sql");
const mail = require("../plugins/mailer");
const fs = require("fs");
const valid = require("../plugins/checkvalid");
const caculateTime = require("../plugins/dayoff_calculate");
// const upload = require('../plugins/multer');
const logger = require("../plugins/logger");

/**
 * 
 * @param {sql} sqlPlugin 
 * @param {logger} log 
 * @param {mailer} mailer
 * @param {*} req 
 * @param {*} res 
 */
module.exports = async (sqlPlugin,log,mailer,req,res)=>{
    // if (err) {
    //   console.error(err);
    //   return res.status(500).json({ error: err });
    //  }
    /**
     * @type {object}
     */
    const dataReceived = req.body;
	  // console.log(req.account);
    const account = dataReceived["account"];
    const cookie = dataReceived["cookie"];
    const type = dataReceived["type"];
    // data below requires front-end format time into 2024-01-01
	  const reason = dataReceived["reason"]
    const start = dataReceived["start"];
    const end = dataReceived["end"];

	if(!valid(dataReceived,["account","cookie","type","reason","start","end"])){
		res.sendStatus(400);
		return;
	}

    if(!(validTime(start) && validTime(end))){
      res.sendStatus(403);
      return;
    }
    const totalTime = await caculateTime(start,end);
    
    const permission = sqlPlugin.getPermission(account);
    if(permission===null){
      res.sendStatus(403);
      return;
    }

    let ret1 = sqlPlugin.checkHash(account,cookie);
    if (ret1==null){
		  res.sendStatus(403);
      return;
    }
    const ret = sqlPlugin.newRequest(account,type,start,end,totalTime,reason);

    if (!ret){
      res.sendStatus(501);
      return;
    }
    if(permission==0){
      log.logFormat("此假單無須審核，正在自動通過");
      sqlPlugin.setPermit(ret["num"],1);
      res.send("已成功請假");
    }else{
      var man = ["jeff@eucan.com.tw","catherine@eucan.com.tw"]
      mailer.send(man[ret["mgroup"]],"請假審核要求",`您好，\n員工 ${ret["name"]}於剛才發送請假要求。\n詳細內容請登入請假系統審核。\n\n<此信為系統自動發送，請勿回覆>`)
      res.send("已向主管提出請假申請，請點擊上一頁回到請假頁面")
    }
}

function validTime(time){
	const T = time.split(" ")[1].split(":");
	// if(0<=date.getHours()<=8)
	if(8 <= parseInt(T[0]) &&  parseInt(T[0]) <= 17){
		if(T[0]=='08' && T[1]=="00"){
			return false;
		}
		if(T[1]!="00" && T[1]!="30"){
			return false;
		}else{
			return true;
		}
	}else{
		return false;
	}
}