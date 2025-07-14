import { Request,Response } from "express";
import { valid } from "../plugins/checkvalid";
import { mailer } from "../plugins/mailer";
import logger from "../plugins/logger";
import { sql } from "../plugins/sql";
import { caculateTime } from "../plugins/dayoff_calculate";


module.exports = async function utils(sqlPlugin:sql,log:logger,mailer:mailer,req:Request,res:Response):Promise<void>{
    const dataReceived:{[key:string]:any} = req.body;

    const account = dataReceived["account"];
    const cookie = dataReceived["cookie"];
    // const user = dataReceived["user"];
    const action = dataReceived["action"];
    const num = dataReceived["serialnum"];
    const state = dataReceived["state"];
    const type = dataReceived["type"];
    const reason = dataReceived["reason"];
    // data below requires front-end format time into 2024-01-01
    const start = dataReceived["start"];
    const end = dataReceived["end"];

    if(!valid(dataReceived,["account","cookie","serialnum","state","action","type","start","end","reason"])){
        res.sendStatus(400);
        return;
    }
    
    let ret = sqlPlugin.checkHash(account,cookie);
    if (ret==null||ret["accountType"]=="employee"){
        res.sendStatus(403);
        return;
    }
    const totalTime = await caculateTime(start,end);
    sqlPlugin.modifyTicket(num,action,type,start,end,totalTime,state,reason);
    res.json({
        "status":200
    });
  
}