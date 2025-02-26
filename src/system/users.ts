import { Request,Response } from "express";
import { valid } from "../plugins/checkvalid";
import { mailer } from "../plugins/mailer";
import logger from "../plugins/logger";
import { sql } from "../plugins/sql";


export function utils(sqlPlugin:sql,log:logger,mailer:mailer,res:Response,req:Request):void{
    const dataReceived:{[key:string]:any} = req.body;

    const account = dataReceived["account"];
    const cookie = dataReceived["cookie"];

    if(!valid(dataReceived,["account","cookie"])){
      res.sendStatus(400);
      return;
    }

    let ret = sqlPlugin.checkHash(account,cookie);
    if (ret==null||ret["accountType"]!="admin"){
      res.sendStatus(403);
      return;
    }
    var returnList = sqlPlugin.getAllUsers();

    res.json({
      data:returnList
    });
    // res.sendStatus(403);
}