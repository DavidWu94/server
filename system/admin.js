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
      res.sendStatus(403);
    }else{
      if(ret["accountType"]=="empolyee"){
        res.sendStatus(403);
      }else{
        // TODO: fetching data.
        res.json({
          "status":200,
        });
      }
    }
}