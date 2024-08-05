const sql = require("../plugins/sql");
const request = require("request");
const dotenv = require('dotenv');
dotenv.config();
/**
 * 
 * @param {sql} sqlPlugin 
 * @param {*} log 
 * @param {*} req 
 * @param {*} res 
 */
module.exports = (sqlPlugin,log,mailer,req,res)=>{
    /**
     * @type {object}
     */
    const dataReceived = req.body;

    const account = dataReceived["account"];
    const twoFA = dataReceived["2FA"];
    request.get(`https://www.authenticatorApi.com/Validate.aspx?Pin=${twoFA}&SecretCode=${process.env.SECRET}`,(err,resp,body)=>{
        if(body=="True"){
            res.send(`true`);
        }else{
            res.send(`false`);
        }
    })
    
    // console.log(`https://www.authenticatorApi.com/Validate.aspx?Pin=${twoFA}&SecretCode=${process.env.SECRET}`)
    // console.log(w.json())
    
}