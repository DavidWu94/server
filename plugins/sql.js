// const mysql = require('mysql');
const crypto = require('crypto');
const logger = require("./logger.js");
const log = new logger(`./logs/${new Date().toDateString()}.log`);

class sql{

    constructor(){
        this.login_db = require('better-sqlite3')('./databases/loginDatabase.db');
        this.login_db.pragma('journal_mode = WAL');
        log.logFormat("Database is connected with server.",new Date());
    }

    login(user,pwd,cookie){
        const currentTime = new Date();
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
            if (ret){
                log.logFormat(`${user} has logined with cookie successfully.`);
                return {msg:"success",accountType:sqldata["type"],sessionKey:hash,name:sqldata["name"]};
            }
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
            }else{
                // hash expired.
                hash = crypto.randomBytes(5).toString('hex');
                while(this.login_db.prepare(`SELECT * FROM logininfo WHERE sKey='${hash}';`).all()[0]){
                    hash = crypto.randomBytes(5).toString('hex');
                }
                this.login_db.prepare(`UPDATE logininfo SET createTime = strftime('%Y-%m-%d %H:%M:%S', 'now', '+8 hours'),sKey='${hash}' WHERE id='${user}';`).run();
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

    getAllUsers(){
        const data = this.login_db.prepare(`SELECT * FROM userinfo;`).all();
        return data;
    }

    getEmployeeDayOffList(user,year){
        try{
            const dayoffData = this.login_db.prepare(`SELECT * FROM dayoffinfo WHERE id='${user}' AND year='${year}';`).all()[0];
            // console.log(dayoffData);
            return dayoffData;
        }catch{
            return null;
        }
    }

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
        log.logFormat(`${user}'s dayoffinfo has been initialize.`,new Date());

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
    newRequest(user,type,start,end,totalTime,reason){
        const query = this.login_db.prepare(`SELECT * FROM userinfo WHERE id='${user}'`).all()[0];
        const currentYear = new Date().getFullYear()
        const count = this.login_db.prepare(`SELECT COUNT(*) FROM requestquery WHERE year=${currentYear}`).all()[0];
        const name = query["name"];
        // console.log(count)
        this.login_db.prepare(`INSERT INTO requestquery (serialnum,id,name,type,start,end,mgroup,totalTime,reason) VALUES ('${currentYear}${count["COUNT(*)"]}','${user}','${name}','${type}',(strftime('%Y-%m-%d %H:%M', '${start}')),(strftime('%Y-%m-%d %H:%M', '${end}')),${query["mgroup"]},${totalTime},'${reason}');`).run();
        log.logFormat(`${user} just request a new dayoff.`,new Date())
        return {"mgroup":query["mgroup"],"name":name,"num":`${currentYear}${count["COUNT(*)"]}`};
    }

    showQuery(user,state=0){
        const mgroup = this.login_db.prepare(`SELECT * FROM userinfo WHERE id='${user}'`).all()[0]["mgroup"];
        const query = this.login_db.prepare(`SELECT serialnum,name,type,start,end,reason,totalTime FROM requestquery WHERE mgroup=${mgroup} AND state=${state}`).all();
        return query;
    }

    setPermit(num,state){
        const query = this.login_db.prepare(`SELECT * FROM requestquery WHERE serialnum='${num}'`).all()[0];
        
        const table = {
            "特休假":"annual",
            "事假":"personal",
            "家庭照顧假":"care",
            "普通傷病假":"sick",
            "婚假":"wedding",
            "喪假":"funeral",
            "分娩假":"birth",
            "產檢假":"pcheckup",
            "流產假":"miscarriage",
            "陪產假":"paternity",
            "產假":"maternity",
            "其他":"other"
        };
        
        if(state==1) this.login_db.prepare(`UPDATE dayoffinfo SET ${table[query["type"]]}=${table[query["type"]]}+${query["totalTime"]} WHERE id='${query["id"]}';`).run();
        this.login_db.prepare(`UPDATE requestquery SET state=${state} WHERE serialnum='${num}';`).run();
        log.logFormat(`Dayoff ticket #${num} has been set to ${state?"accepted":"denied"}.`);
        return this.login_db.prepare(`SELECT * FROM userinfo WHERE id='${query["id"]}'`).all()[0]["email"];
    }

    /**
     * The function check if the user requires the permission to have a dayoff
     * @param {*} user 
     * @returns {number|null} 1 means require a permission
     */
    getPermission(user){
        const query = this.login_db.prepare(`SELECT * FROM userinfo WHERE id='${user}'`).all()[0];
        if(query) return query["permit"];
        return null
    }

}

module.exports = sql;