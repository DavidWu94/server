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
    
    let ret = sqlPlugin.checkHash(account,cookie);
    if (ret==null||account!="root"){
        res.sendStatus(403);
    }else{
        sqlPlugin.init(user);
        res.json({
            "status":200
        });
    }
}