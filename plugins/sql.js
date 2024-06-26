// const mysql = require('mysql');
const crypto = require('crypto');
const logger = require("./logger.js");
const log = new logger(`./logs/${new Date().toDateString()}.log`);

class sql{

    constructor(){
        this.login_db = require('better-sqlite3')('./databases/loginDatabase.db');
    }

    login(user,pwd,cookie){
        const currentTime = new Date()
        const sqldata = this.login_db.prepare(`SELECT * FROM userinfo WHERE id='${user}'`).all()[0];
        const loginHashData = this.login_db.prepare(`SELECT * FROM logininfo WHERE id='${user}';`).all()[0];

        
        if (sqldata==undefined){
            log.logFormat(`Someone failed to log in with an incorrect account.`,currentTime);
            return {msg:"wrong account"}
        };
        // cookie here must be stripped.
        // accepted types: null, string.
        var hash = "";
        var expired = false;
        if(cookie&&loginHashData!=undefined){   // if u got a cookie, there must be ur data in the database.
            const ret = this.checkHash(user,cookie);
            if (ret) return ret;
            else expired=true;
        }
        if(pwd==sqldata["pwd"]){
            // Checking database if the user have logined before. Or hash expired.
            if(loginHashData==undefined||expired){
                // Generating hash.
                hash = crypto.randomBytes(5).toString('hex');
                while(this.login_db.prepare(`SELECT * FROM logininfo WHERE sKey='${hash}';`).all()[0]){
                    hash = crypto.randomBytes(5).toString('hex');
                    // console.log(this.login_db.prepare(`SELECT * FROM logininfo WHERE sKey='${hash}';`).all())
                }
                this.login_db.prepare(`INSERT INTO logininfo (id,sKey) VALUES ('${user}','${hash}');`).run();
            }else{
                // Have logined before. Refresh the time cooldown.
                hash = loginHashData["sKey"];
                this.login_db.prepare(`UPDATE logininfo SET createTime = strftime('%Y-%m-%d %H:%M:%S', 'now', '+8 hours') WHERE id='${user}';`).run();
            }

            log.logFormat(`${user} has logined with password successfully.`,currentTime);
            return {msg:"success",accountType:sqldata["type"],sessionKey:hash,name:sqldata["name"]};
        }else{ 
            log.logFormat(`${user} Failed to log in with password: ${pwd}`,currentTime);
            return {msg:"wrong pwd"};
        }
    }

    // TODO: feature haven't been implemented.
    getDayOffInfo(user){

    }

    // TODO: feature haven't been implemented.
    getEmployeeDayOffList(){

    }

    // TODO: feature haven't been implemented.
    register(user,password,mail,name,type="employee"){
        // id,pwd,type,email,name
        return;
    }

    // TODO: feature haven't been implemented.
    modify(user,dayoff){

    }


    checkHash(user,cookie){
        const sqldata = this.login_db.prepare(`SELECT * FROM userinfo WHERE id='${user}'`).all()[0];
        const loginHashData = this.login_db.prepare(`SELECT * FROM logininfo WHERE id='${user}';`).all()[0];
        const current = new Date();
        const lastLogin = Date.parse(loginHashData["createTime"]);
        const DateLastLogin = new Date(lastLogin);
        
        if(((current.getTime()-DateLastLogin.getTime())/1000/60/60)<=1){    // Caculating the elapsed time
            // if elapsed time <= 1 hr
            if (loginHashData["sKey"]==cookie){
                // if cookie correct.
                this.login_db.prepare(`UPDATE logininfo SET createTime = strftime('%Y-%m-%d %H:%M:%S', 'now', '+8 hours') WHERE id='${user}';`).run();
                log.logFormat(`${user} has logined with cookie successfully.`,current);
                return {msg:"success",accountType:sqldata["type"]};
            }else{
                return null;
            }
        }else{  // if elapsed time > 1 hr
            log.logFormat(`${user} tried to login with cookie but it had expired.`,current);
            return null;
        }
    }


}

module.exports = sql;