import { Request,Response } from "express";
import { valid } from "../plugins/checkvalid";
import { mailer } from "../plugins/mailer";
import logger from "../plugins/logger";
import { sql } from "../plugins/sql";


module.exports = function utils(sqlPlugin:sql,log:logger,mailer:mailer,req:Request,res:Response):void{
    const dataReceived:{[key:string]:any} = req.body;

    const account = dataReceived["account"];
    const cookie = dataReceived["cookie"];
    const user = dataReceived["user"];
    const year = dataReceived["year"];
    const month = dataReceived["month"];

    if(!valid(dataReceived,["account","cookie"])){
        res.sendStatus(400);
        return;
    }
    
    let ret = sqlPlugin.checkHash(account,cookie);
    if (ret==null||(user&&ret["accountType"]=="employee")){
        res.sendStatus(403);
        return;
    }
    var search_user = user?user:account;
    const r = sqlPlugin.calculateAnnualQuota(search_user,year,month);
    res.json(r);
}