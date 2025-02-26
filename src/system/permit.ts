import { Request,Response } from "express";
import { valid } from "../plugins/checkvalid";
import { mailer } from "../plugins/mailer";
import logger from "../plugins/logger";
import { sql } from "../plugins/sql";


export function utils(sqlPlugin:sql,log:logger,mailer:mailer,res:Response,req:Request):void{
    const dataReceived:{[key:string]:any} = req.body;

    const account = dataReceived["account"];
    const cookie = dataReceived["cookie"];
    const num = dataReceived["num"];
    const permit = dataReceived["permit"];

    if(!valid(dataReceived,["account","cookie","num","permit"])){
        res.sendStatus(400);
        return;
      }
    
    let ret = sqlPlugin.checkHash(account,cookie);
    if (ret==null){
        res.sendStatus(403);
        return;
    }
    const mail = sqlPlugin.setPermit(num,(permit)?1:-1);
    mailer.send(mail,`假單審核結果${(permit)?"通過":"未通過"}`,`您好，\n您的主管於剛才${permit?"批准":"拒絕"}了您的假單。\n如有任何問題請私訊主管。\n\n<此信為系統自動發送，請勿回覆>`);
    res.json({
        "status":200
    });
}