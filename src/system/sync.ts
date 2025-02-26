import { Request,Response } from "express";
import { valid } from "../plugins/checkvalid";
import { mailer } from "../plugins/mailer";
import logger from "../plugins/logger";
import { sql } from "../plugins/sql";


export function utils(sqlPlugin:sql,log:logger,mailer:mailer,res:Response,req:Request):void{
    const dataReceived:{[key:string]:any} = req.body;

    const account = dataReceived["account"];
    const cookie = dataReceived["cookie"];
    const year = dataReceived["year"];
    const user = dataReceived["user"];

    if(!valid(dataReceived,["account","cookie","user","year"])){
        res.sendStatus(400);
        return;
    }
    
    let ret = sqlPlugin.checkHash(account,cookie);
    if (ret==null||ret["accountType"]=="empolyee"){
        res.sendStatus(403);
        return;
    }
    
    sqlPlugin.syncTickets(user,year);

    res.json({
        "status":200
    });
  
}