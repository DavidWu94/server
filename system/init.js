const sql = require("../plugins/sql");
const valid = require("../plugins/checkvalid");
const logger = require("../plugins/logger");

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
    const user = dataReceived["user"];
    const year = dataReceived["year"];
    
    if(!valid(dataReceived,["account","cookie","user"])){
        res.sendStatus(400);
        return;
    }

    let ret = sqlPlugin.checkHash(account,cookie);
    if (ret==null||account!="root"){
        res.sendStatus(403);
        return;
    }
    sqlPlugin.init(user,year);
    res.json({
        "status":200
    });

}