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
    const limit = dataReceived["limit"];

    var search_query = "";
    const query_list = [user?`id='${user}'`:"",year?`year='${user}'`:"",month?`month='${month}'`:""].filter((x)=>x!="");
    search_query = query_list.join("AND ");
    if(search_query) search_query = " AND " + search_query;
    var limit_query = "";
    if(limit) limit_query = `ORDER BY serialnum DESC LIMIT ${limit}`;
    if(!valid(dataReceived,["account","cookie"])){
        res.sendStatus(400);
        return;
    }
    
    let ret = sqlPlugin.checkHash(account,cookie);
    if (ret==null){
        res.sendStatus(403);
        return;
    }
    const retu = sqlPlugin.showQuery(account,1,search_query,limit_query);
    res.send({"data":retu});
}