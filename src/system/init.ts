import { Request,Response } from "express";
import { valid } from "../plugins/checkvalid";
import { mailer } from "../plugins/mailer";
import logger from "../plugins/logger";
import { sql } from "../plugins/sql";


export function utils(sqlPlugin:sql,log:logger,mailer:mailer,res:Response,req:Request):void{
    const dataReceived:{[key:string]:any} = req.body;

    const account = dataReceived["account"];
    const cookie = dataReceived["cookie"];
    const user = dataReceived["user"];
    const year = dataReceived["year"];
    
    if(!valid(dataReceived,["account","cookie","user"])){
        res.sendStatus(400);
        return;
    }

    let ret = sqlPlugin.checkHash(account,cookie);
    if (ret==null||account!="root"){
        res.sendStatus(403);
        return;
    }
    sqlPlugin.init(user,year);
    res.json({
        "status":200
    });

}