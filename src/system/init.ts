import { Request,Response } from "express";
import { valid } from "../plugins/checkvalid";
import { mailer } from "../plugins/mailer";
import logger from "../plugins/logger";
import { sql } from "../plugins/sql";
import { digit } from "../types/types";


module.exports = function utils(sqlPlugin:sql,log:logger,mailer:mailer,req:Request,res:Response):void{
    const dataReceived:{[key:string]:any} = req.body;

    const account = dataReceived["account"] as string;
    const cookie = dataReceived["cookie"] as string;
    const user = dataReceived["user"] as string;
    const year = dataReceived["year"] as digit;
    
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