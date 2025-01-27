const sql = require("../plugins/sql");
const valid = require("../plugins/checkvalid");
const logger = require("../plugins/logger");

/**
 * 
 * @param {sql} sqlPlugin 
 * @param {logger} log 
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
    const year = dataReceived["year"];
    const limit = dataReceived["limit"];

    var search_query = "";
    if(user){
        search_query += `id='${user}'`;
        if(year){
            search_query += ` AND year='${year}'`;
        }
    }else{
        if(year){
            search_query += `year='${year}'`;
        }
    }
    if(search_query) search_query = "AND " + search_query;
    var limit_query = "";
    if(limit) limit_query = `ORDER BY serialnum DESC LIMIT ${limit}`;
    if(!valid(dataReceived,["account","cookie"])){
        res.sendStatus(400);
        return;
    }
    
    let ret = sqlPlugin.checkHash(account,cookie);
    if (ret==null){
        res.sendStatus(403);
        return;
    }
    const retu = sqlPlugin.showQuery(account,1,search_query,limit_query);
    res.send({"data":retu});
}