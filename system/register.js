// const sql = require("../plugins/sql");

module.exports = (sqlPlugin,log,req,res)=>{
    /**
     * @type {object}
     */
    const dataReceived = req.body;

    const account = dataReceived["account"];
    const cookie = dataReceived["cookie"];

    let ret = sqlPlugin.checkHash(account,cookie);
    if (ret==null){
        res.json({
            "status":403
        });
    }else{
        sqlPlugin.register(user,password,mail,name,type,mgroup)
        res.json({
            "status":200,
        });
    }
}