import { Request,Response } from "express";
import { valid } from "../plugins/checkvalid";
import { mailer } from "../plugins/mailer";
import logger from "../plugins/logger";
import { sql } from "../plugins/sql";
import { caculateTime } from "../plugins/dayoff_calculate";
import { dayofftype } from "../types/types";


module.exports = async function utils(sqlPlugin:sql,log:logger,mailer:mailer,req:Request,res:Response):Promise<void>{
    const dataReceived:{[key:string]:any} = req.body;
	  // console.log(req.account);
    const account = dataReceived["account"];
    const cookie = dataReceived["cookie"];
    const type = (dataReceived["type"] as keyof dayofftype);
    const checkObj:dayofftype = {
      "特休假":"annual",
      "事假":"personal",
      "家庭照顧假":"care",
      "普通傷病假":"sick",
      "婚假":"wedding",
      "喪假":"funeral",
      "分娩假":"birth",
      "產檢假":"pcheckup",
      "流產假":"miscarriage",
      "陪產假":"paternity",
      "產假":"maternity",
      "其他":"other"
    };
    // data below requires front-end format time into 2024-01-01
	  const reason = dataReceived["reason"]
    const start = dataReceived["start"];
    const end = dataReceived["end"];

    if(!valid(dataReceived,["account","cookie","type","reason","start","end"])|| Object.keys(checkObj).includes(type)){
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
      mailer.send(man[(ret["mgroup"] as number)],"請假審核要求",`您好，\n員工 ${ret["name"]}於剛才發送請假要求。\n詳細內容請登入請假系統審核。\n\n<此信為系統自動發送，請勿回覆>`)
      res.send("已向主管提出請假申請，請點擊上一頁回到請假頁面")
    }
}

function validTime(time:string):boolean{
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