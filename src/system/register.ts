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
    const password = dataReceived["pwd"] as string;
    const mail = dataReceived["mail"] as string;
    const name = dataReceived["name"] as string;
    const jointime = dataReceived["date"] as string;
    const type = dataReceived["type"]?dataReceived["type"] as string:"employee";
    const mgroup = dataReceived["mgroup"] as digit;
    // permit:1 == NEED permition
    const permit = dataReceived["permit"];

    if(!valid(dataReceived,["account","cookie","user","pwd","mail","name","date","mgroup","permit"])){
        res.sendStatus(400);
        return;
    }

    let ret = sqlPlugin.checkHash(account,cookie);
    if (ret==null){
        res.sendStatus(403);
        return;
    }
    try{
        sqlPlugin.register(user,password,mail,name,type,jointime,mgroup,permit);
        sqlPlugin.init(user);
        log.logFormat(`${account} successfully created an account with id: ${user}`);
        mailer.send(mail,"請假系統帳號註冊成功",`${name} 您好，您的請假系統帳號已成功開通\n\n帳號為: ${user}\n密碼為您的身分證字號\n如有任何問題請洽主管\n\n<此信為系統自動發送，請勿回覆>`)
        res.json({
            "status":200,
            "success":1
        });
    }catch{
        res.json({
            "status":200,
            "success":0
        });
    }
}