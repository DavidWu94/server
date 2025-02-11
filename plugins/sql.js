// const mysql = require('mysql');
const crypto = require('crypto');
const logger = require("./logger.js");
const log = new logger(`./logs/${new Date().toISOString().split('T')[0]}.log`);

class sql{

    constructor(){
        this.login_db = require('better-sqlite3')('./databases/loginDatabase.db');
        this.login_db.pragma('journal_mode = WAL');
        log.logFormat("Database is connected with server.",new Date());
    }

    /**
     * 
     * @param {string} user 
     * @param {string|undefined} pwd 
     * @param {string|undefined} cookie 
     * @returns {object}
     */
    login(user,pwd,cookie){
        if(user.match(/['"?><:;\\|)(*&^%$#@!~`]/)||cookie.match(/['"?><:;\\|)(*&^%$#@!~`]/)||cookie.match(/['"?><:;\\|)(*&^%$#@!~`]/)){
            return {msg:"wrong type"};
        }
        const currentTime = new Date();
        const sqldata = this.login_db.prepare(`SELECT * FROM userinfo WHERE id='${user}'`).all()[0];
        const loginHashData = this.login_db.prepare(`SELECT * FROM logininfo WHERE id='${user}';`).all()[0];

        
        if (sqldata==undefined){
            log.logFormat(`Someone failed to log in with an incorrect account.`,currentTime);
            return {msg:"wrong account"};
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

    /**
     * 
     * @returns {Array<object>}
     */
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

    modify(user,year,dayoff){
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
        const entries = Object.entries(dayoff)
        const query = entries.map((v,i,a)=>{
            return `${v[0]} = ${v[1]}`;
        });
        // console.log(query.join(","))
        this.login_db.prepare(`UPDATE dayoffinfo SET ${query.join(",")} WHERE id='${user}' AND year='${year}'`).run();
        return;

    }

    /**
     * 
     * @param {string} user 
     * @param {string} cookie 
     * @returns 
     */
    checkHash(user,cookie){
        if(user.match(/['"?><:;\\|)(*&^%$#@!~`]/)||cookie.match(/['"?><:;\\|)(*&^%$#@!~`]/)){
            return null;
        }
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

    init(user,year){
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

        try{
            if(year != undefined){
                this.login_db.prepare(`SELECT * FROM dayoffinfo WHERE id='${user}' AND year='${year}';`).all()[0];
                this.login_db.prepare(`DELETE FROM dayoffinfo WHERE id='${user}' AND year='${year}';`).run();
                this.login_db.prepare(`INSERT INTO dayoffinfo (id,year) VALUES ('${user}','${year}');`).run();
            }else{
                throw new Error("cant find the user");
            }
        }catch(e){
            this.login_db.prepare(`INSERT INTO dayoffinfo (id) VALUES ('${user}');`).run();
            log.logFormat(`${user}'s dayoffinfo has been initialize.`,new Date());
        }

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
        const currentYear = new Date().getFullYear();
        const month = parseInt(start.split("-")[1]);
        const count = this.login_db.prepare(`SELECT COUNT(*) FROM requestquery WHERE year=${currentYear}`).all()[0];
        const name = query["name"];
        // console.log(count)
        this.login_db.prepare(`INSERT INTO requestquery (serialnum,id,name,type,start,end,mgroup,totalTime,reason,month) VALUES ('${currentYear}${count["COUNT(*)"].toString().padStart(4,'0')}','${user}','${name}','${type}',(strftime('%Y-%m-%d %H:%M', '${start}')),(strftime('%Y-%m-%d %H:%M', '${end}')),${query["mgroup"]},${totalTime},'${reason}','${month}');`).run();
        log.logFormat(`${user} just request a new dayoff.`,new Date())
        return {"mgroup":query["mgroup"],"name":name,"num":`${currentYear}${count["COUNT(*)"].toString().padStart(4,'0')}`};
    }

    showQuery(user,state=0,search_query="",limit_query=""){
        const mgroup = this.login_db.prepare(`SELECT * FROM userinfo WHERE id='${user}'`).all()[0]["mgroup"];
        const query = this.login_db.prepare(`SELECT serialnum,name,type,start,end,reason,totalTime FROM requestquery WHERE mgroup=${mgroup} AND state=${state} ${search_query} ${limit_query};`).all();
        log.logFormat(`showquery executed with query: SELECT serialnum,name,type,start,end,reason,totalTime FROM requestquery WHERE mgroup=${mgroup} AND state=${state} ${search_query} ${limit_query};`);
        return query;
    }

    setPermit(num,state){
        const query = this.login_db.prepare(`SELECT * FROM requestquery WHERE serialnum='${num}'`).all()[0];
        const year = num.substring(0,4);
        
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
        
        if(state==1) {
            if( this.login_db.prepare(`SELECT * FROM dayoffinfo WHERE id='${query["id"]}' AND year='${year}';`).all()){
                this.init(query["id"],year);
                this.login_db.prepare(`UPDATE dayoffinfo SET ${table[query["type"]]}=${table[query["type"]]}+${query["totalTime"]} WHERE id='${query["id"]}' AND year='${year}';`).run();
            }else{
                this.login_db.prepare(`UPDATE dayoffinfo SET ${table[query["type"]]}=${table[query["type"]]}+${query["totalTime"]} WHERE id='${query["id"]}' AND year='${year}';`).run();
            }
        }
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
        const query = this.login_db.prepare(`SELECT permit FROM userinfo WHERE id='${user}'`).all()[0];
        if(query) return query["permit"];
        return null
    }

    clockinAction(user,type,now){
        const year = now.getFullYear();
        const month = now.getMonth()+1>9?(now.getMonth()+1):'0'+(now.getMonth()+1).toString();
        const date = now.getDate()>9?(now.getDate()):'0'+(now.getDate()).toString();
        const hour = now.getHours()>9?(now.getHours()):'0'+(now.getHours()).toString();
        const min = now.getMinutes()>9?(now.getMinutes()):'0'+(now.getMinutes()).toString();

        const datetime = `${year}-${month}-${date} ${hour}:${min}`;
        if(type==0){
            return this.login_db.prepare(`SELECT * FROM clockinrecord WHERE id='${user}' AND date='${datetime.split(" ")[0]}'`).all();
        }
        const name = this.login_db.prepare(`SELECT name FROM userinfo WHERE id='${user}';`).all()[0]["name"];
        // const count = this.login_db.prepare(`SELECT COUNT(*) FROM clockinrecord WHERE year=${year}`).all()[0];
        this.login_db.prepare(`INSERT INTO clockinrecord (id,name,type,date,time) VALUES ('${user}','${name}','${type}','${datetime.split(" ")[0]}','${datetime.split(" ")[1]}');`).run();
        return {"status":200};
    }

    showPersonalQuery(user,year){
        const query = this.login_db.prepare(`SELECT serialnum,name,type,start,end,reason,totalTime,state FROM requestquery WHERE id='${user}' AND year='${year}'`).all();
        return query;
    }

    deleteAccount(user){
        this.login_db.prepare(`DELETE FROM userinfo WHERE id='${user}'`).run();
        return;
    }

    calculateAnnualQuota(user){
        // TODO: Add year and month elapse
        const joinTime = new Date(this.login_db.prepare(`SELECT * FROM userinfo WHERE id='${user}'`).all()[0]["joinTime"]);
        const elapse = calculate(joinTime);
        const months = elapse['m'], days = elapse['d'];
        const years = months/12;
        var quota;
        if(months<6) quota = 0;
        if(months>=6&&months<12){
            quota = 3;
        }else if(years>=1&&years<2){
            quota = 7;
        }else if(years>=2&&years<3){
            quota = 10;
        }else if(years>=3&&years<5){
            quota = 14;
        }else if(years>=5&&years<10){
            quota = 15;
        }else if(years>=10){
            const w = Math.floor(years)+6;
            quota = (w>=30?30:w);
        }
        return {"quota":quota*8,"years":Math.floor(years),"month":(months-(Math.floor(years)*12)),"days":days};

    }

    showQueryInMonth(year,month){
        const query = this.login_db.prepare(`SELECT name,start,end FROM requestquery WHERE state=1 AND year='${year}' AND month='${month}'`).all();
        return query;
    }

    /**
     * 
     * @param {string} year 
     * @param {string} month 
     */
    async clockinRecord(year,month){
        const query = this.login_db.prepare(`SELECT * FROM clockinrecord WHERE date LIKE '${year}-${month}-%'`).all();
        return new Promise(res=>{res(query)});
    }


}

function calculate(startDate) {
    if (!(startDate instanceof Date) || isNaN(startDate.getTime())) {
        throw new Error("Invalid date. Please provide a valid startDate as a Date object.");
    }

    const endDate = new Date();

    let months = (endDate.getFullYear() - startDate.getFullYear()) * 12;
    months += endDate.getMonth() - startDate.getMonth();
    let days = endDate.getDate() - startDate.getDate();

    if (days < 0) {
        months -= 1;
        const previousMonth = new Date(endDate.getFullYear(), endDate.getMonth(), 0); // Last day of previous month
        days += previousMonth.getDate(); // Add days from previous month
    }

    return { "m":months,"d":days };
}

module.exports = sql;