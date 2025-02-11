const sql = require("../plugins/sql");
const valid = require("../plugins/checkvalid");
const logger = require("../plugins/logger");
const write = require("../plugins/clockin_excel");

/**
 * 
 * @param {sql} sqlPlugin 
 * @param {logger} log 
 * @param {*} req 
 * @param {*} res 
 */
module.exports = (sqlPlugin,log,mailer,req,res)=>{
    /**
     * @type {object}
     */
    const dataReceived = req.body;

    const account = dataReceived["account"];
    const cookie = dataReceived["cookie"];
    const year = dataReceived["year"];
    const month = dataReceived["month"].padStart(2,'0');

    if(!valid(dataReceived,["account","cookie","year","month"])){
        res.sendStatus(400);
        return;
    }
    
    let ret = sqlPlugin.checkHash(account,cookie);
    if (ret==null||ret["accountType"]=="empolyee"){
        res.sendStatus(403);
        return;
    }

    const data = sqlPlugin.clockinRecord();
    write(data,year,month);
    
    res.sendFile(`/app/clock/${year}-${month}clockin_record.xlsx`, (err) => {
        if (err) {
            log.logFormat(`Error sending file /app/clock/${year}-${month}clockin_record.xlsx` + err);
            res.sendStatus(500);
        }
    });
  
}