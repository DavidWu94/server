const valid = require("../plugins/checkvalid");

module.exports = (sqlPlugin,log,mailer,req,res)=>{
    /**
     * @type {object}
     */
    const dataReceived = req.body;

    const account = dataReceived["account"];
    const cookie = dataReceived["cookie"];
    const user = dataReceived["user"]?dataReceived["user"]:account;
    const year = dataReceived["year"];

    if(!valid(dataReceived,["account","cookie","year"])){
      res.sendStatus(400);
      return;
    }

    let ret = sqlPlugin.checkHash(account,cookie);
    if (ret==null){
      res.sendStatus(403);
      return;
    } 
    const dayoffdata = sqlPlugin.getEmployeeDayOffList(user,year);
    if(dayoffdata){
      res.json(dayoffdata);
    }else{
      res.sendStatus(500);
    }
    // res.sendStatus(403);
}