import { Request,Response } from "express";
import { valid } from "../plugins/checkvalid";
import { mailer } from "../plugins/mailer";
import logger from "../plugins/logger";
import { sql } from "../plugins/sql";

module.exports = function utils(sqlPlugin:sql,log:logger,mailer:mailer,req:Request,res:Response):void{
  const dataReceived:{[key:string]:any} = req.body;

    const account = dataReceived["account"];
    const cookie = dataReceived["cookie"];
    const user = dataReceived["user"]?dataReceived["user"]:account;
    const year = dataReceived["year"];

    if(!valid(dataReceived,["account","cookie","year"])){
      res.sendStatus(400);
      return;
    }

    let ret = sqlPlugin.checkHash(account,cookie);
    if (ret==null||(dataReceived["user"]&&ret["accountType"]=="employee")){
      res.sendStatus(403);
      return;
    } 
    const dayoffdata = sqlPlugin.getEmployeeDayOffList(user,year);
    if(dayoffdata){
      res.json(dayoffdata);
    }else{
      res.sendStatus(500);
    }
    // res.sendStatus(403);
}