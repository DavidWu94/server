const dotenv = require('dotenv');
const request = require("request");
const valid = require("../plugins/checkvalid");
dotenv.config();

module.exports = (sqlPlugin,log,mailer,req,res)=>{
    /**
     * @type {object}
     */
    const dataReceived = req.body;

    const account = dataReceived["account"];
    const password = dataReceived["pwd"];
    const cookie = dataReceived["cookie"];
    const twoFA = dataReceived["twoFA"];

    if(!valid(dataReceived,["account","pwd"])){
        res.sendStatus(400);
        return;
      }

    if(cookie==null && (account==null || password==null)){
        log.logFormat(`Someone tried to login but was lack of info.`);
        res.sendStatus(403);
        return;
    }

    let ret = sqlPlugin.login(account,password,cookie?cookie:"NULL");
    if(ret.msg=="success"){
        // log.logFormat(`${account} logged in successfully.`);
        if(account=='root'){
            if(isNaN(parseInt(twoFA))){
                res.sendStatus(400);
                return;
            }
            request.get(`https://www.authenticatorApi.com/Validate.aspx?Pin=${twoFA}&SecretCode=${process.env.SECRET}`,(err,resp,body)=>{
                // console.log(body)
                if(body=="True"){
                    res.json(ret);
                }else{
                    res.sendStatus(403);
                }
            })
        }else{
            res.json(ret);
        }
    }else{
        res.sendStatus(403);
    }
}