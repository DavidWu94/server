const valid = require("../plugins/checkvalid");
const mailer = require("../plugins/mailer");
const logger = require("../plugins/logger");

/**
 * 
 * @param {sql} sqlPlugin 
 * @param {logger} log 
 * @param {mailer} mailer
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

    if(!valid(dataReceived,["account","cookie"])){
      res.sendStatus(400);
      return;
    }

    let ret = sqlPlugin.checkHash(account,cookie);
    if (ret==null||ret["accountType"]!="admin"){
      res.sendStatus(403);
      return;
    }
    var returnList = sqlPlugin.getAllUsers();

    res.json({
      data:returnList
    });
    // res.sendStatus(403);
}