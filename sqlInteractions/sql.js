// const mysql = require('mysql');

class sql{

    constructor(){
        this.login_db = require('better-sqlite3')('./databases/loginDatabase.db');
        this.sessionKeyDb = require('better-sqlite3')('./databases/sessionKey.db');
    }


    login(user,pwd){
        let realPwd = this.login_db.prepare(`SELECT * FROM userinfo WHERE id='${user}'`).all()[0];
        if (realPwd==undefined) return {msg:"wrong account"}
        // console.log(a)
        if(pwd==realPwd["pwd"]){
            // call for data
            return {msg:"success",accountType:realPwd["type"]};
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