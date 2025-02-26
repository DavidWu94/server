import { Request,Response } from "express";
import { valid } from "../plugins/checkvalid";
import { mailer } from "../plugins/mailer";
import logger from "../plugins/logger";
import { sql } from "../plugins/sql";
import fs from 'fs';
import { downloadJSON } from "../plugins/dayoff_reader";
// import { digit } from "../types/types";

export async function utils(sqlPlugin:sql,log:logger,mailer:mailer,res:Response,req:Request):Promise<void>{
    const dataReceived:{[key:string]:any} = req.body;

    const account = dataReceived["account"];
    const cookie = dataReceived["cookie"];

    if(!valid(dataReceived,["account","cookie"])){
        res.sendStatus(400);
        return;
    }
    
    let ret = sqlPlugin.checkHash(account,cookie);
    if (ret==null){
        res.sendStatus(403);
        return;
    }
    
    log.logFormat(`${account} is requesting a working day json file.`);
    var rocYear = req.url.replace("/api/","");
    if (parseInt(rocYear)>1911){
        rocYear = (parseInt(rocYear)-1911).toString();
    }
    const filePath = `./api/office_calendar_${rocYear}.json`;

    if (!fs.existsSync(filePath)) {
        log.logFormat("Can't find file.");
        await downloadJSON(rocYear);
    }
    const data = require(`../api/office_calendar_${rocYear}.json`);
    res.json(data);
}