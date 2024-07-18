const sql = require("../plugins/sql");
const mailer = require("../plugins/mailer")
/**
 * 
 * @param {sql} sqlPlugin 
 * @param {*} log 
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
    const user = dataReceived["user"];
    const password = dataReceived["pwd"];
    const mail = dataReceived["mail"];
    const name = dataReceived["name"];
    const jointime = dataReceived["date"];
    const type = dataReceived["type"]?dataReceived["type"]:"employee";
    const mgroup = dataReceived["mgroup"];
    const permit = dataReceived["permit"]?1:0;

    let ret = sqlPlugin.checkHash(account,cookie);
    if (ret==null){
        res.sendStatus(403);
    }else{
        try{
            sqlPlugin.register(user,password,mail,name,type,jointime,mgroup,permit);
            log.logFormat(`${account} successfully created an account with id: ${user}`);
            mailer.send(mail,"請假系統帳號註冊成功",`${name} 您好，您的請假系統帳號已成功開通\n\n帳號為: ${user}\n密碼為您的身分證字號\n如有任何問題請洽主管\n\n<此信為系統自動發送，請勿回覆>`)
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