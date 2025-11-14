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
    const data = dataReceived["data"] as string;

    if(!valid(dataReceived,["account","cookie","user","data","year"])&&typeof data!="object"){
        res.sendStatus(400);
        return;
    }
    
    let ret = sqlPlugin.checkHash(account,cookie);
    if (ret==null||ret["accountType"]=="employee"){
        res.sendStatus(403);
        return;
    }
    // console.log(data)
    sqlPlugin.modify(user,year,data);
    res.sendStatus(200);

}