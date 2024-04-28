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
        if (realPwd==undefined) return {msg:"wrong account"}
        // console.log(a)
        if(pwd==realPwd["pwd"]){
            // call for data
            const hash = crypto.randomBytes(5).toString('hex');
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

module.exports = sql