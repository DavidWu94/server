// const mysql = require('mysql');
const crypto = require('crypto');

class sql{

    constructor(){
        this.login_db = require('better-sqlite3')('./databases/loginDatabase.db');
    }


    login(user,pwd,cookie){
        // if(cookie){
        //     return {msg:"success",accountType:realPwd["type"]};
        // }
        let realPwd = this.login_db.prepare(`SELECT * FROM userinfo WHERE id='${user}'`).all()[0];
        if (realPwd==undefined) return {msg:"wrong account"};
        // console.log(a)
        if(pwd==realPwd["pwd"]){
            // call for data
            var hash = "";
            const loginHashData = this.login_db.prepare(`SELECT * FROM logininfo WHERE id='${user}';`).all()[0];
            if(loginHashData==undefined){   // time expire havent added
                hash = crypto.randomBytes(5).toString('hex');
                this.login_db.prepare(`INSERT INTO logininfo (id,sKey) VALUES ('${user}','${hash}');`).run();
            }else{
                hash = loginHashData["sKey"];
                this.login_db.prepare(`UPDATE logininfo SET createTime = CURRENT_TIMESTAMP WHERE id='${user}';`).run();
            }
            return {msg:"success",accountType:realPwd["type"],sessionKey:hash};
        }else{
            return {msg:"wrong pwd"};
        }
    }

    getDayOffInfo(user){

    }

    getEmployeeDayOffList(){

    }


}

module.exports = sql;