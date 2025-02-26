import { Request,Response } from "express";
import { valid } from "../plugins/checkvalid";
import { mailer } from "../plugins/mailer";
import logger from "../plugins/logger";
import { sql } from "../plugins/sql";

export function utils(sqlPlugin:sql,log:logger,mailer:mailer,res:Response,req:Request):void{
    const dataReceived:{[key:string]:any} = req.body;

    const account = dataReceived["account"];
    const cookie = dataReceived["cookie"];
    const day = dataReceived["day"];

    /*
        Type can be these values:
        0: no specfic, enter searching mode
        1: clock in
        -1: clock out
    */
    const type = dataReceived["type"];

    if(!valid(dataReceived,["account","cookie","type"])){
        res.sendStatus(400);
        return;
    }
    
    let ret = sqlPlugin.checkHash(account,cookie);
    if (ret==null){
        res.sendStatus(403);
        return;
    }
    var date = (`${type}`=="0"&&day)?new Date(day):new Date();
    // date.setDate(date.getHours() + 8);
    log.logFormat(`${account} tries to ${type==0?"lookup clocking history":type==1?"clock-in":"clock-out"}.`)
    const returns = sqlPlugin.clockinAction(account,type,date);
    res.json(returns);

}