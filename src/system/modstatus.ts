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
    const status = dataReceived["status"];

    if(!valid(dataReceived,["account","cookie","user","status"])){
      res.sendStatus(400);
      return;
    }

    let ret = sqlPlugin.checkHash(account,cookie);
    if (ret==null||ret["accountType"]!="admin"){
      res.sendStatus(403);
      return;
    }
    sqlPlugin.modifyEmployeeStatus(user,status);

    res.sendStatus(200);
}