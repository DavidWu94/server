module.exports = (sqlPlugin,log,mailer,req,res)=>{
    /**
     * @type {object}
     */
    const dataReceived = req.body;

    const account = dataReceived["account"];
    const cookie = dataReceived["cookie"];
    const user = dataReceived["user"]?dataReceived["user"]:account;
    const year = dataReceived["year"];

    let ret = sqlPlugin.checkHash(account,cookie);
    if (ret==null){
      res.json({
        "status":403
      });
    }else{
      // if(ret["accountType"]=="admin"){
  
      // }
      // TODO: fetching data.
      const dayoffdata = sqlPlugin.dayoff(user,year);
      res.json({
        "status":200,
        "data": dayoffdata
      });
    }
    // res.sendStatus(403);s
    
}