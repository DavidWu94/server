const sql = require("../plugins/sql");
const valid = require("../plugins/checkvalid");
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
    if (ret==null||account!="root"){
        res.sendStatus(403);
    }else{
        sqlPlugin.init(user);
        res.json({
            "status":200
        });
    }
}