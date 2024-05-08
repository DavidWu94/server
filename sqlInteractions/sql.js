// const mysql = require('mysql');
const crypto = require('crypto');

class sql{

    constructor(){
        this.login_db = require('better-sqlite3')('./databases/loginDatabase.db');
    }

    login(user,pwd,cookie){
        let sqldata = this.login_db.prepare(`SELECT * FROM userinfo WHERE id='${user}'`).all()[0];
        const loginHashData = this.login_db.prepare(`SELECT * FROM logininfo WHERE id='${user}';`).all()[0];

        // cookie here must be stripped.
        // accepted types: null, string.
        var hash = "";
        if(cookie&&loginHashData!=undefined){   // if u got a cookie, there must be ur data in the database.
            const current = new Date();
            const lastLogin = Date.parse(loginHashData["createTime"]);
            const DateLastLogin = new Date(lastLogin);
            
            if(((current.getTime()-DateLastLogin.getTime())/1000/60/60)<=1){    // Caculating the elapsed time
                // if elapsed time <= 1 hr
                if (loginHashData["sKey"]==cookie){
                    // if cookie correct.
                    this.login_db.prepare(`UPDATE logininfo SET createTime = strftime('%Y-%m-%d %H:%M:%S', 'now', '+8 hours') WHERE id='${user}';`).run();
                    return {msg:"success",accountType:sqldata["type"]};
                }
            }else{  // if elapsed time > 1 hr
                hash = crypto.randomBytes(5).toString('hex');
                this.login_db.prepare(`UPDATE logininfo SET sKey = '${hash}' WHERE id='${user}';`).run();   // Give new Hash
            }
        }

        if (sqldata==undefined) return {msg:"wrong account"};
        
        if(pwd==sqldata["pwd"]){
            if(loginHashData==undefined){
                hash = crypto.randomBytes(5).toString('hex');
                this.login_db.prepare(`INSERT INTO logininfo (id,sKey) VALUES ('${user}','${hash}');`).run();
            }else{
                hash = loginHashData["sKey"];
                this.login_db.prepare(`UPDATE logininfo SET createTime = strftime('%Y-%m-%d %H:%M:%S', 'now', '+8 hours') WHERE id='${user}';`).run();
            }
            return {msg:"success",accountType:sqldata["type"],sessionKey:hash,name:sqldata["name"]};
        }else{
            return {msg:"wrong pwd"};
        }
    }

    getDayOffInfo(user){

    }

    getEmployeeDayOffList(){

    }

    register(user,password,mail,name,type="employee"){
        // id,pwd,type,email,name
        return;
    }


}

module.exports = sql;