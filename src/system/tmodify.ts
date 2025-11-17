import { Request,Response } from "express";
import { valid } from "../plugins/checkvalid";
import { mailer } from "../plugins/mailer";
import logger from "../plugins/logger";
import { sql } from "../plugins/sql";
import { caculateTime } from "../plugins/dayoff_calculate";
import { digit } from "../types/types";


module.exports = async function utils(sqlPlugin:sql,log:logger,mailer:mailer,req:Request,res:Response):Promise<void>{
    const dataReceived:{[key:string]:any} = req.body;

    const account = dataReceived["account"] as string;
    const cookie = dataReceived["cookie"] as string;
    // const user = dataReceived["user"] as string;
    const action = dataReceived["action"] as digit;
    const num = dataReceived["serialnum"]as digit;
    const state = dataReceived["state"] as digit;
    const type = dataReceived["type"] as string;
    const reason = dataReceived["reason"] as string;
    // data below requires front-end format time into 2024-01-01
    const start = dataReceived["start"] as string;
    const end = dataReceived["end"] as string;

    if(!valid(dataReceived,["account","cookie","serialnum","state","action","type","start","end","reason"])){
        console.log("tmodify invalid data");
        res.sendStatus(400);
        return;
    }
    
    let ret = sqlPlugin.checkHash(account,cookie);
    if (ret==null||ret["accountType"]=="employee"){
        res.sendStatus(403);
        return;
    }
    const totalTime = await caculateTime(start,end);
    const result = sqlPlugin.modifyTicket(num.toString(),parseInt(`${action}`),type,start,end,totalTime,state,reason);
    if(result===null){
        res.sendStatus(403);
        return;
    }
    res.json({
        "status":200
    });
  
}