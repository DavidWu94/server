const sql = require("../plugins/sql");
const valid = require("../plugins/checkvalid");
const fs = require("fs");
const download = require("../plugins/dayoff_reader");
const logger = require("../plugins/logger");

/**
 * 
 * @param {sql} sqlPlugin 
 * @param {logger} log 
 * @param {*} req 
 * @param {*} res 
 */
module.exports = async (sqlPlugin,log,mailer,req,res)=>{
    // console.log("awa")
    /**
     * @type {object}
     */
    const dataReceived = req.body;

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
        await download(rocYear)
    }
    const data = require(`../api/office_calendar_${rocYear}.json`);
    res.json(data);
    
}