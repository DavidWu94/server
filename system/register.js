const sql = require("../plugins/sql");
/**
 * 
 * @param {sql} sqlPlugin 
 * @param {*} log 
 * @param {*} req 
 * @param {*} res 
 */
module.exports = (sqlPlugin,log,req,res)=>{
    /**
     * @type {object}
     */
    const dataReceived = req.body;

    const account = dataReceived["account"];
    const cookie = dataReceived["cookie"];
    const user = dataReceived["user"];
    const password = dataReceived["pwd"];
    const mail = dataReceived["mail"];
    const name = dataReceived["name"];
    const jointime = dataReceived["date"];
    const type = dataReceived["type"]?dataReceived["type"]:"employee";
    const mgroup = dataReceived["mgroup"];

    let ret = sqlPlugin.checkHash(account,cookie);
    if (ret==null){
        res.sendStatus(403);
    }else{
        try{
            sqlPlugin.register(user,password,mail,name,type,jointime,mgroup);
            log.logFormat(`${account} successfully created an account with id: ${user}`);
            res.json({
                "status":200,
                "success":1
            });
        }catch{
            res.json({
                "status":200,
                "success":0
            });
        }
    }
}