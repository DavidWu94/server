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
    const data = dataReceived["data"];

    if(!valid(dataReceived,["account","cookie","user","data","year"])&&typeof(data)!=Object){
        res.sendStatus(400);
        return;
    }
    
    let ret = sqlPlugin.checkHash(account,cookie);
    if (ret==null||ret["accountType"]=="empolyee"){
        res.sendStatus(403);
        return;
    }
    // console.log(data)
    sqlPlugin.modify(user,year,data);
    res.sendStatus(200);

}