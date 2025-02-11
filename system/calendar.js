const sql = require("../plugins/sql");
const valid = require("../plugins/checkvalid");
const logger = require("../plugins/logger");
const calen = require("../plugins/dayoff_calendar");

/**
 * 
 * @param {sql} sqlPlugin 
 * @param {logger} log 
 * @param {*} req 
 * @param {*} res 
 */
module.exports = async (sqlPlugin,log,mailer,req,res)=>{
    /**
     * @type {object}
     */
    const dataReceived = req.body;

    const account = dataReceived["account"];
    const cookie = dataReceived["cookie"];
    const year = dataReceived["year"];
    const month = dataReceived["month"];

    if(!valid(dataReceived,["account","cookie","year","month"])){
        res.sendStatus(400);
        return;
    }
    
    let ret = sqlPlugin.checkHash(account,cookie);
    if (ret==null||ret["accountType"]=="empolyee"){
        res.sendStatus(403);
        return;
    }
    log.logFormat(`${account} is requesting a calendar.`);
    await calen(year,month,sqlPlugin);
    log.logFormat(`Calendar has generated. Sending File /app/calendars/${year}-${month}calendar.xlsx...`);
    res.download(`/app/calendars/${year}-${month}calendar.xlsx`,"休假行事曆.xlsx");
}