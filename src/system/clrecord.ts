import { Request,Response } from "express";
import { valid } from "../plugins/checkvalid";
import { mailer } from "../plugins/mailer";
import logger from "../plugins/logger";
import { sql } from "../plugins/sql";
import {output_excel} from "../plugins/clockin_excel";

module.exports = async function utils(sqlPlugin:sql,log:logger,mailer:mailer,res:Response,req:Request):Promise<void>{
    const dataReceived:{[key:string]:any} = req.body;

    const account = dataReceived["account"];
    const cookie = dataReceived["cookie"];
    const year = dataReceived["year"];
    const month = dataReceived["month"].padStart(2,'0');

    if(!valid(dataReceived,["account","cookie","year","month"])){
        res.sendStatus(400);
        return;
    }
    
    let ret = sqlPlugin.checkHash(account,cookie);
    if (ret==null||ret["accountType"]=="empolyee"){
        res.sendStatus(403);
        return;
    }

    const data = await sqlPlugin.clockinRecord(year,month);
    await output_excel(data,year,month);
    
    res.sendStatus(200);
    // res.sendFile(`/app/clock/${year}-${month}clockin_record.xlsx`, (err) => {
    //     if (err) {
    //         log.logFormat(`Error sending file /app/clock/${year}-${month}clockin_record.xlsx` + err);
    //         res.sendStatus(500);
    //     }
    // });
  
}