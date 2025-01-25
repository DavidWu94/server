const valid = require("../plugins/checkvalid");
const sql = require("../plugins/sql");

/**
 * 
 * @param {sql} sqlPlugin 
 * @param {*} log 
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
    if (ret==null){
      res.sendStatus(403);
    }else{
      if(ret["accountType"]=="empolyee"){
        res.sendStatus(403);
      }else{
        sqlPlugin.deleteAccount(user);
        res.sendStatus(200);
      }
    }
}