const valid = require("../plugins/checkvalid");
const sql = require("../plugins/sql");
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

    if(!valid(dataReceived,["account","cookie","user"])){
      res.sendStatus(400);
      return;
    }
    let ret = sqlPlugin.checkHash(account,cookie);
    if (ret==null||ret["accountType"]=="empolyee"){
      res.sendStatus(403);
      return;
    }
    sqlPlugin.deleteAccount(user);
    res.sendStatus(200); 
}