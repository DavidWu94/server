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

    let ret = sqlPlugin.checkHash(account,cookie);
    if (ret==null){
        res.sendStatus(403);
    }else{
        const ret = sqlPlugin.showQuery(account);
        res.send({"data":ret});
    }
}