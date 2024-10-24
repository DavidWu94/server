const valid = require("../plugins/checkvalid");

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

    let ret = sqlPlugin.checkHash(account,cookie);
    if (ret==null){
      res.json({
        "status":403
      });
    }else{
      if(ret["accountType"]!="admin"){
        res.sendStatus(403);
      }
      var returnList = sqlPlugin.getAllUsers();

      res.json({
        data:returnList
      });
    }
    // res.sendStatus(403);
}