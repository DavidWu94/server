module.exports = (sqlPlugin,log,mailer,req,res)=>{
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
      // if(ret["accountType"]=="admin"){
  
      // }
      // TODO: fetching data.
      res.json({
        "status":200,
      });
    }
    // res.sendStatus(403);s
    
}