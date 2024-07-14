module.exports = (sqlPlugin,log,mailer,req,res)=>{
    /**
     * @type {object}
     */
    const dataReceived = req.body;

    const account = dataReceived["account"];
    const password = dataReceived["pwd"];
    const cookie = dataReceived["cookie"];

    if(cookie==null && (account==null || password==null)){
    log.logFormat(`Someone tried to login but was lack of info.`);
    res.sendStatus(403);
    return;
    }

    // FIXME: Prevent SQL Injection.
    let ret = sqlPlugin.login(account,password,cookie);
    if(ret.msg=="success"){
    // log.logFormat(`${account} logged in successfully.`);
    res.json(ret);
    }else{
    res.sendStatus(403);
    }
}