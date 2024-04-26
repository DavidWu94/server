const mysql = require('mysql');
const { deprecate } = require('util');

class sql{

    sql(){
        this.con = mysql.createConnection({
            host: "localhost",
            user: process.env.USER_ID,
            password: process.env.PWD
        });

        this.con.connect(function(err) {
            if (err) throw err;
            console.log("Connected!");
        });
    }

    login(user,pwd){
        
    }

    getUserType(user){

    }

    getDayOffInfo(user){

    }

    getEmployeeDayOffList(){

    }


}

module.exports = sql