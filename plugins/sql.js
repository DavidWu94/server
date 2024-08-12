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
            // Checking database if the user have logined before.
            if(loginHashData==undefined){
                // Generating hash.
                hash = crypto.randomBytes(5).toString('hex');
                while(this.login_db.prepare(`SELECT * FROM logininfo WHERE sKey='${hash}';`).all()[0]){
                    hash = crypto.randomBytes(5).toString('hex');
                }
                this.login_db.prepare(`INSERT INTO logininfo (id,sKey) VALUES ('${user}','${hash}');`).run();
            }else if(expired){
                // hash expired.
                hash = crypto.randomBytes(5).toString('hex');
                while(this.login_db.prepare(`SELECT * FROM logininfo WHERE sKey='${hash}';`).all()[0]){
                    hash = crypto.randomBytes(5).toString('hex');
                }
                this.login_db.prepare(`UPDATE logininfo SET createTime = strftime('%Y-%m-%d %H:%M:%S', 'now', '+8 hours'),sKey='${hash}' WHERE id='${user}';`).run();
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
    getEmployeeDayOffList(user,year){
        try{
            const dayoffData = this.login_db.prepare(`SELECT * FROM dayoffinfo WHERE id='${user}' AND year='${year}';`).all()[0];
            console.log(dayoffData);
            return dayoffData;
        }catch{
            return null;
        }
    }

    // TODO: feature haven't been implemented.
    register(user,password,mail,name,type,jointime,mgroup,permit){
        // id,pwd,type,email,name,type,mgroup
        this.login_db.prepare(`INSERT INTO userinfo (id,pwd,type,email,name,joinTime,mgroup,permit) VALUES ('${user}','${password}','${type}','${mail}','${name}',(strftime('%Y-%m-%d', '${jointime}')),${mgroup},${permit});`).run();
        return;
    }

    // TODO: feature haven't been implemented.
    modify(user,dayoff){

    }

    /**
     * 
     * @param {string} user 
     * @param {string} cookie 
     * @returns 
     */
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
                return {msg:"success",accountType:sqldata["type"],sessionKey:cookie};
            }else{
                return null;
            }
        }else{  // if elapsed time > 1 hr
            log.logFormat(`${user} tried to login with cookie but it had expired.`,current);
            return null;
        }
    }

    init(user,data){
        // {
        //     "annual":0,
        //     "personal":0,
        //     "care":0,
        //     "sick":0,
        //     "wedding":0,
        //     "funeral":0,
        //     "birth":0,
        //     "pcheckup":0,
        //     "miscarriage":0,
        //     "paternity":0,
        //     "maternity":0,
        //     "other":0,
        //     "total":0,
        //     "year":0,
        // }
        // ["annual","personal","care","sick","wedding","funeral","birth","pcheckup","miscarriage","paternity","maternity","other","total","year"]
        this.login_db.prepare(`INSERT INTO dayoffinfo (id) VALUES ('${user}');`).run();

    }

    /**
     * Get dayoff info
     * @param {*} user 
     * @param {*} year 
     * @returns 
     */
    dayoff(user,year){
        try{
            const sqldata = this.login_db.prepare(`SELECT * FROM dayoffinfo WHERE id='${user}' AND year='${year}'`).all()[0];
            // console.log(sqldata);
            return sqldata;
        }catch(e){
            console.warn(e);
        }
    }

    /**
     * 
     * @param {*} user 
     * @param {*} type 
     * @param {*} start 
     * @param {*} end 
     * @returns 
     */
    newRequest(user,type,start,end){
        const mgroup = this.login_db.prepare(`SELECT * FROM userinfo WHERE id='${user}'`).all()[0];
        const currentYear = new Date().getFullYear()
        const count = this.login_db.prepare(`SELECT COUNT(*) FROM requestquery WHERE year=${currentYear}`).all()[0];
        const name = mgroup["name"];
        // console.log(count)
        this.login_db.prepare(`INSERT INTO requestquery (serialnum,id,type,start,end,mgroup) VALUES ('${currentYear}${count["COUNT(*)"]}','${name}','${type}',(strftime('%Y-%m-%d', '${start}')),(strftime('%Y-%m-%d', '${end}')),${mgroup["mgroup"]});`).run();
        return {"mgroup":mgroup["mgroup"],"name":name};
    }

    showQuery(user){
        const mgroup = this.login_db.prepare(`SELECT * FROM userinfo WHERE id='${user}'`).all()[0]["mgroup"];
        const query = this.login_db.prepare(`SELECT serialnum,id,type,start,end FROM requestquery WHERE mgroup=${mgroup} AND state=0`).all();
        return query;
    }

}

module.exports = sql;