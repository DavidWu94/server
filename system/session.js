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

    if(!valid(dataReceived,["account","cookie"])){
        res.sendStatus(400);
        return;
    }
    // console.log(dataReceived)
    let ret = sqlPlugin.checkHash(account,cookie);
    if (ret==null){
        res.sendStatus(403);
    }else{
        res.json({
            "status":200
        });
    }
}