const sql = require("../plugins/sql");
const valid = require("../plugins/checkvalid");
const logger = require("../plugins/logger");
const caculateTime = require("../plugins/dayoff_calculate");

/**
 * 
 * @param {sql} sqlPlugin 
 * @param {logger} log 
 * @param {*} req 
 * @param {*} res 
 */
module.exports = async(sqlPlugin,log,mailer,req,res)=>{
    /**
     * @type {object}
     */
    const dataReceived = req.body;

    const account = dataReceived["account"];
    const cookie = dataReceived["cookie"];
    // const user = dataReceived["user"];
    const action = dataReceived["action"];
    const num = dataReceived["serialnum"];
    const state = dataReceived["state"];
    const type = dataReceived["type"];
    // data below requires front-end format time into 2024-01-01
    const start = dataReceived["start"];
    const end = dataReceived["end"];

    if(!valid(dataReceived,["account","cookie","serialnum","state","action","type","start","end"])){
        res.sendStatus(400);
        return;
    }
    
    let ret = sqlPlugin.checkHash(account,cookie);
    if (ret==null||ret["accountType"]=="empolyee"){
        res.sendStatus(403);
        return;
    }
    const totalTime = await caculateTime(start,end);
    sqlPlugin.modifyTicket(num,action,type,start,end,totalTime,state);
    res.json({
        "status":200
    });
  
}