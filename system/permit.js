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
    const num = dataReceived["num"];
    const permit = dataReceived["permit"];
    
    let ret = sqlPlugin.checkHash(account,cookie);
    if (ret==null){
        res.sendStatus(403);
    }else{
        const mail = sqlPlugin.setPermit(num,(permit)?1:-1);
        console.log(mail);
        res.json({
            "status":200
        });
    }
}