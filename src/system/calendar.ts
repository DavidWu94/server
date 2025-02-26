import { Request,Response } from "express";
import { valid } from "../plugins/checkvalid";
import { mailer } from "../plugins/mailer";
import logger from "../plugins/logger";
import { sql } from "../plugins/sql";
import { main } from "../plugins/dayoff_calendar";
// const calen = require("../plugins/dayoff_calendar");


module.exports = async function utils(sqlPlugin:sql,log:logger,mailer:mailer,res:Response,req:Request):Promise<void>{
    const dataReceived:{[key:string]:any} = req.body;

    const account = dataReceived["account"];
    const cookie = dataReceived["cookie"];
    const year = dataReceived["year"];
    const month = dataReceived["month"];

    if(!valid(dataReceived,["account","cookie","year","month"])){
        res.sendStatus(400);
        return;
    }
    
    let ret = sqlPlugin.checkHash(account,cookie);
    if (ret==null||ret["accountType"]=="empolyee"){
        res.sendStatus(403);
        return;
    }
    log.logFormat(`${account} is requesting a calendar.`);
    await main(year,month,sqlPlugin);
    log.logFormat(`Calendar has generated. Sending File /app/calendars/${year}-${month}calendar.xlsx...`);
    res.sendStatus(200);
    // res.download(`/app/calendars/${year}-${month}calendar.xlsx`,`${year}-${month}calendar.xlsx`);
}