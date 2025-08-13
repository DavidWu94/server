import crypto from "crypto";
import Database from "better-sqlite3";
import logger from './logger'
import  { userinfo,dayoffinfo,clockinrecord,requestquery,logininfo,digit,dayofftype, dayoffinfo_ret } from "../types/types";
import { join } from "path";
// const logger = require("./logger.js");
const log:logger = new logger(`./logs/${new Date().toISOString().split('T')[0]}.log`);

export class sql{

    private login_db:Database.Database;

    public constructor(){
        this.login_db = new Database('./databases/loginDatabase.db');
        this.login_db.pragma('journal_mode = WAL');
        log.logFormat("Database is connected with server.",new Date());
    }

    login(user:string,pwd:string|null,cookie:string|null):{msg:string,accountType?:string,sessionKey?:string,name?:string}{
        if(cookie!==null){
            if(user.match(/['"?><:;\\|)(*&^%$#@!~`]/)||cookie.match(/['"?><:;\\|)(*&^%$#@!~`]/)||cookie.match(/['"?><:;\\|)(*&^%$#@!~`]/)){
                return {msg:"wrong type"};
            }
        }
        const currentTime:Date = new Date();
        const sqldata:userinfo|undefined = (this.login_db.prepare(`SELECT * FROM userinfo WHERE id='${user}'`).all()[0] as userinfo|undefined);
        const loginHashData:logininfo|undefined = (this.login_db.prepare(`SELECT * FROM logininfo WHERE id='${user}';`).all()[0] as logininfo|undefined);

        
        if (sqldata==undefined){
            log.logFormat(`Someone failed to log in with an incorrect account.`,currentTime);
            return {msg:"wrong account"};
        };
        // cookie here must be stripped.
        // accepted types: null, string.
        var hash:string = "";
        var expired:boolean = false;
        if(cookie&&loginHashData!=undefined){   // if u got a cookie, there must be ur data in the database.
            const ret:null|object = this.checkHash(user,cookie);
            if (ret&&user!="monitor"){
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
            if(user!="monitor")
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
    getAllUsers():userinfo[]{
        const data = (this.login_db.prepare(`SELECT * FROM userinfo;`).all() as userinfo[]);
        return data;
    }

    getEmployeeDayOffList(user:string,year:string):null|dayoffinfo_ret{
        try{
            const userinfo = (this.login_db.prepare(`SELECT * FROM userinfo WHERE id='${user}';`).all()[0] as userinfo);
            const joinTime = userinfo["joinTime"];
            if(joinTime.split('-')[0]==year){
                const rq_all = (this.login_db.prepare(`SELECT * FROM requestquery WHERE id='${user}' AND year='${year}' AND state=1;`).all() as requestquery[]|undefined);
                const joinMonth = parseInt(userinfo.joinTime.split("-")[1]);
                const joinDay = parseInt(userinfo.joinTime.split("-")[2]);
                var first_half:dayoffinfo = {
                    id: user,
                    annual: 0,
                    personal: 0,
                    care: 0,
                    sick:0,
                    wedding:0,
                    funeral:0,
                    birth:0,
                    pcheckup:0,
                    miscarriage:0,
                    paternity:0,
                    maternity:0,
                    official:0,
                    typhoon:0,
                    other:0,
                    total:0,
                    year:year
                };
                var second_half:dayoffinfo = {
                    id: user,
                    annual: 0,
                    personal: 0,
                    care: 0,
                    sick:0,
                    wedding:0,
                    funeral:0,
                    birth:0,
                    pcheckup:0,
                    miscarriage:0,
                    paternity:0,
                    maternity:0,
                    official:0,
                    typhoon:0,
                    other:0,
                    total:0,
                    year:year
                };
                const table = {
                    "特休假":"annual",
                    "事假":"personal",
                    "家庭照顧假":"care",
                    "病假":"sick",
                    "婚假":"wedding",
                    "喪假":"funeral",
                    "分娩假":"birth",
                    "產檢假":"pcheckup",
                    "流產假":"miscarriage",
                    "陪產假":"paternity",
                    "產假":"maternity",
                    "公假":"official",
                    "停班停課":"typhoon",
                    "其他":"other"
                };
                rq_all?.forEach((v:requestquery,i,a)=>{
                    const reqMonth = parseInt(v.month);
                    const reqYear = parseInt(v.start.split("-")[0]);
                    const joinYear = parseInt(userinfo.joinTime.split("-")[0]);
                    const monthDiff = (reqYear - joinYear) * 12 + (reqMonth - joinMonth);
                    console.log(`Month diff: ${monthDiff}`);
                    if (monthDiff < 6) {
                        (first_half[table[v.type as keyof dayofftype] as keyof dayoffinfo] as number) += v.totalTime;
                    } else if (monthDiff === 6) {
                        // Split totalTime between first_half and second_half based on day boundary.
                        (parseInt(v["start"].split("-")[2]) < joinDay) ? (first_half[table[v.type as keyof dayofftype] as keyof dayoffinfo] as number) += v.totalTime : (second_half[table[v.type as keyof dayofftype] as keyof dayoffinfo] as number) += v.totalTime;
                    } else {
                        (second_half[table[v.type as keyof dayofftype] as keyof dayoffinfo] as number) += v.totalTime;
                    }
                })
                // const dayoffData_LF = (this.login_db.prepare(`SELECT * FROM dayoffinfo WHERE id='${user}' AND year='${year}';`).all()[0] as dayoffinfo|undefined);
                return {"separate":true,"data":[first_half,second_half]};
            }else{
                // FIXME: This can be none, if it's none, add one record.
                const df = (this.login_db.prepare(`SELECT * FROM dayoffinfo WHERE id='${user}' AND year='${year}';`).all() as dayoffinfo[]);
                if(df.length==0){
                    this.login_db.prepare(`INSERT INTO dayoffinfo (id,year) VALUES ('${user}',${year});`).run();
                    return {"separate":false,"data":[(this.login_db.prepare(`SELECT * FROM dayoffinfo WHERE id='${user}' AND year='${year}';`).all()[0] as dayoffinfo)]};
                }else{
                    return {"separate":false,"data":[df[0]]};
                }
            }
            
        }catch{
            return null;
        }
    }

    register(user:string,password:string,mail:string,name:string,type:string,jointime:string,mgroup:digit,permit:digit):void{
        // id,pwd,type,email,name,type,mgroup
        this.login_db.prepare(`INSERT INTO userinfo (id,pwd,type,email,name,joinTime,mgroup,permit) VALUES ('${user}','${password}','${type}','${mail}','${name}',(strftime('%Y-%m-%d', '${jointime}')),${mgroup},${permit});`).run();
        return;
    }

    modify(user:string,year:digit,dayoff:string){
        const table = {
            "特休假":"annual",
            "事假":"personal",
            "家庭照顧假":"care",
            "病假":"sick",
            "婚假":"wedding",
            "喪假":"funeral",
            "分娩假":"birth",
            "產檢假":"pcheckup",
            "流產假":"miscarriage",
            "陪產假":"paternity",
            "產假":"maternity",
            "公假":"official",
            "颱風假":"typhoon",
            "其他":"other"
        };
        const entries:[string, string][] = Object.entries(dayoff)
        const query:string[] = entries.map((v,i,a)=>{
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
    checkHash(user:string,cookie:string):{msg:string,accountType:string,sessionKey:string}|null{
        if(user.match(/['"?><:;\\|)(*&^%$#@!~`]/)||cookie.match(/['"?><:;\\|)(*&^%$#@!~`]/)){
            return null;
        }
        const sqldata = (this.login_db.prepare(`SELECT * FROM userinfo WHERE id='${user}'`).all()[0] as userinfo);
        const loginHashData = (this.login_db.prepare(`SELECT * FROM logininfo WHERE id='${user}';`).all()[0] as logininfo);
        const current:Date = new Date();
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
            // log.logFormat(`${user} tried to login with cookie but it had expired.`,current);
            return null;
        }
    }

    init(user:string,year?:digit|undefined){
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
        //     "official":0,
        //     "typhoon":0,
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
    dayoff(user:string,year:digit):dayoffinfo|null{
        try{
            const sqldata = (this.login_db.prepare(`SELECT * FROM dayoffinfo WHERE id='${user}' AND year='${year}'`).all()[0] as dayoffinfo| undefined);
            // console.log(sqldata);
            if (sqldata===undefined) return null;
            return sqldata;
        }catch(e){
            console.warn(e);
            return null;
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
    newRequest(user:string,type:string,start:string,end:string,totalTime:digit,reason:string):{mgroup:digit,name:string,num:string}{
        const query:userinfo = (this.login_db.prepare(`SELECT * FROM userinfo WHERE id='${user}'`).all()[0] as userinfo);
        // const userinfo = this.login_db.prepare(`SELECT * FROM userinfo WHERE id='${query["id"]}'`).all()[0];
        const checkpoint:Date = new Date(`${end.split("-")[0]}-${query["joinTime"].substring(5)}`);
        const endDate:Date = new Date(end.split(" ")[0]);
        const year:string = checkpoint>endDate?(parseInt(end.split("-")[0])-1).toString():end.split("-")[0];
        // console.log(year)
        const currentYear:number = new Date().getFullYear();
        const month:number = parseInt(start.split("-")[1]);
        const serials:requestquery[]|[] = (this.login_db.prepare(`SELECT serialnum FROM requestquery WHERE serialnum LIKE '${currentYear}%' ORDER BY serialnum ASC`).all() as requestquery[]|[]);
        const count:string = serials[serials.length-1]?`${currentYear}${(parseInt(serials[serials.length-1]["serialnum"].substring(4))+1).toString().padStart(4,'0')}`:`${currentYear}0000`;
        const name:string = query["name"];
        const new_reason:string = reason.replace("<","").replace(">","").replace('"','');
        this.login_db.prepare(`INSERT INTO requestquery (serialnum,id,name,type,start,end,mgroup,totalTime,reason,month,year) VALUES ('${count}','${user}','${name}','${type}',(strftime('%Y-%m-%d %H:%M', '${start}')),(strftime('%Y-%m-%d %H:%M', '${end}')),${query["mgroup"]},${totalTime},'${new_reason}','${month}','${year}');`).run();
        log.logFormat(`${user} just request a new dayoff. Ticket id: #${count}.`,new Date())
        return {"mgroup":query["mgroup"],"name":name,"num":count};
    }

    showQuery(user:string,state:number=0,search_query:string="",limit_query:string=""):requestquery[]|[]{
        // const mgroup = this.login_db.prepare(`SELECT * FROM userinfo WHERE id='${user}'`).all()[0]["mgroup"];
        const query:requestquery[]|[] = (this.login_db.prepare(`SELECT serialnum,name,type,start,end,reason,totalTime FROM requestquery WHERE state=${state} ${search_query} ${limit_query};`).all() as requestquery[]|[]);
        // log.logFormat(`showquery executed with query: SELECT serialnum,name,type,start,end,reason,totalTime FROM requestquery WHERE state=${state} ${search_query} ${limit_query};`);
        return query;
    }

    setPermit(num:string,state:number):string{
        const query = (this.login_db.prepare(`SELECT * FROM requestquery WHERE serialnum='${num}'`).all()[0] as requestquery);
        const year:string = query["year"];
        const table = {
            "特休假":"annual",
            "事假":"personal",
            "家庭照顧假":"care",
            "病假":"sick",
            "婚假":"wedding",
            "喪假":"funeral",
            "分娩假":"birth",
            "產檢假":"pcheckup",
            "流產假":"miscarriage",
            "陪產假":"paternity",
            "產假":"maternity",
            "公假":"official",
            "停班停課":"typhoon",
            "其他":"other"
        };
        
        if(state==1) {
            if( this.login_db.prepare(`SELECT * FROM dayoffinfo WHERE id='${query["id"]}' AND year='${year}';`).all().length!=0){
                // log.logFormat(`Updating dayoffinfo with query: UPDATE dayoffinfo SET ${table[(query["type"] as keyof dayofftype)]}=${table[(query["type"] as keyof dayofftype)]}+${query["totalTime"]} WHERE id='${query["id"]}' AND year='${year}';`);
                this.login_db.prepare(`UPDATE dayoffinfo SET ${table[(query["type"] as keyof dayofftype)]}=${table[(query["type"] as keyof dayofftype)]}+${query["totalTime"]} WHERE id='${query["id"]}' AND year='${year}';`).run();
            }else{
                // log.logFormat("Initializing the data...");
                this.init(query["id"],year);
                // log.logFormat(`Updating dayoffinfo with query: UPDATE dayoffinfo SET ${table[(query["type"] as keyof dayofftype)]}=${table[(query["type"] as keyof dayofftype)]}+${query["totalTime"]} WHERE id='${query["id"]}' AND year='${year}';`);
                this.login_db.prepare(`UPDATE dayoffinfo SET ${table[(query["type"] as keyof dayofftype)]}=${table[(query["type"] as keyof dayofftype)]}+${query["totalTime"]} WHERE id='${query["id"]}' AND year='${year}';`).run();
            }
        }
        this.login_db.prepare(`UPDATE requestquery SET state=${state} WHERE serialnum='${num}';`).run();
        log.logFormat(`Dayoff ticket #${num} has been set to ${state?"accepted":"denied"}.`);
        return (this.login_db.prepare(`SELECT * FROM userinfo WHERE id='${query["id"]}'`).all()[0] as userinfo)["email"];
    }

    /**
     * The function check if the user requires the permission to have a dayoff
     * @param {*} user 
     * @returns {number|null} 1 means require a permission
     */
    getPermission(user:string):userinfo["permit"]|null{
        const query = (this.login_db.prepare(`SELECT permit FROM userinfo WHERE id='${user}'`).all()[0] as userinfo|undefined);
        if(query) return query["permit"];
        return null
    }

    clockinAction(user:string,type:number,now:Date):clockinrecord[]|{status:digit}|null{
        const year:number = now.getFullYear();
        const month:digit = now.getMonth()+1>9?(now.getMonth()+1):'0'+(now.getMonth()+1).toString();
        const date:digit = now.getDate()>9?(now.getDate()):'0'+(now.getDate()).toString();
        const hour:string = now.getHours()>9?(now.getHours().toString()):'0'+(now.getHours()).toString();
        const min:digit = now.getMinutes()>9?(now.getMinutes()):'0'+(now.getMinutes()).toString();
        var datetime:string;
        if(parseInt(hour)>=18){
            datetime = `${year}-${month}-${date} 18:00`;
        }else{
            datetime = `${year}-${month}-${date} ${hour}:${min}`;
        }
        const data:clockinrecord[] = (this.login_db.prepare(`SELECT * FROM clockinrecord WHERE date='${datetime.split(" ")[0]}' AND id='${user}';`).all() as clockinrecord[]);
        if(type==0){
            return data;
        }
        const name:string = (this.login_db.prepare(`SELECT name FROM userinfo WHERE id='${user}';`).all()[0] as userinfo)["name"];
        if(data.length!=0){
            // exists, use UPDATE
            // if(data[0][`clock${type==1?"in":"out"}`]) return null;
            let i:number = 0;
            for(i;i<data.length;i++){
                if(data[i][`clock${type==1?"in":"out"}`]) continue
                else break;
            }
            if(i<data.length){
                // UPDATE
                this.login_db.prepare(`UPDATE clockinrecord SET clock${type==1?"in":"out"}='${datetime.split(" ")[1]}' WHERE id='${user}' AND num=${i+1} AND date='${datetime.split(" ")[0]}';`).run();
                return {"status":200};                
            }
            this.login_db.prepare(`INSERT INTO clockinrecord (id,name,date,clock${type==1?"in":"out"},num) VALUES ('${user}','${name}','${datetime.split(" ")[0]}','${datetime.split(" ")[1]}',${i+1});`).run();
            // while() i++;
            // if(data[])
        }else{
            // use INSERT
            this.login_db.prepare(`INSERT INTO clockinrecord (id,name,date,clock${type==1?"in":"out"},num) VALUES ('${user}','${name}','${datetime.split(" ")[0]}','${datetime.split(" ")[1]}',1);`).run();
        }
        return {"status":200};
    }

    showPersonalQuery(user:string,year:string):requestquery[]|[]{
        const query = (this.login_db.prepare(`SELECT serialnum,name,type,start,end,reason,totalTime,state FROM requestquery WHERE id='${user}' AND year='${year}'`).all() as requestquery[]|[]);
        return query;
    }

    deleteAccount(user:string):void{
        this.login_db.prepare(`DELETE FROM userinfo WHERE id='${user}'`).run();
        return;
    }

    calculateAnnualQuota(user:string,year:digit):{separate:boolean,data:{quota:number,years:number,month:number,days:number,joinTime:string}[]} {
        const db_jt:string = (this.login_db.prepare(`SELECT * FROM userinfo WHERE id='${user}'`).all()[0] as userinfo)["joinTime"];
        const joinTime:Date = new Date(db_jt);
        const month:number = parseInt(db_jt.split("-")[1]);
        const endTime:Date = month==-1?new Date(`${year}-${db_jt.split("-")[1]}-${db_jt.split("-")[2]}`):new Date(`${year}-${month}-${db_jt.split("-")[2]}`);
        const elapse:{m:number,d:number} = calculate(joinTime,endTime);
        const months = elapse['m'], days = elapse['d'];
        const years = months/12;
        const realMonth:number = (months-(Math.floor(years)*12));
        var quota:number=0;
        console.log(`Calculating annual quota for ${user} in ${year}-${month}. Join time: ${db_jt}, Elapsed: ${years} years, ${realMonth} months, ${days} days.`);
        if(years<1){
            return {separate:true,data:[{"quota":0,"years":Math.floor(years)+(realMonth<6?0:0.5),"month":realMonth,"days":days,"joinTime":db_jt},{"quota":3*8,"years":Math.floor(years)+(realMonth<6?0:0.5),"month":6,"days":days,"joinTime":db_jt}]};
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
        // TODO: add separate
        return {separate:false,data:[{"quota":quota*8,"years":Math.floor(years)+(realMonth<6?0:0.5),"month":realMonth,"days":days,"joinTime":db_jt}]};

    }

    showQueryInMonth(year:number,month:number):requestquery[]|[]{
        const query = (this.login_db.prepare(`SELECT name,start,end,type FROM requestquery WHERE state=1 AND start LIKE '${year}-${month.toString().padStart(2,'0')}%'`).all() as requestquery[]|[]);
        return query;
    }

    /**
     * 
     * @param {string} year 
     * @param {string} month 
     */
    async clockinRecord(year:digit,month:digit):Promise<[] | clockinrecord[]>{
        const query = (this.login_db.prepare(`SELECT * FROM clockinrecord WHERE date LIKE '${year}-${month}-%';`).all() as clockinrecord[]|[]);
        return new Promise(res=>{res(query)});
    }

    syncTickets(user:string,year:digit):void{
        const tickets = (this.login_db.prepare(`SELECT * FROM requestquery WHERE id='${user}' AND year='${year}' AND state=1;`).all() as requestquery[]|[]);
        const table = {
            "特休假":"annual",
            "事假":"personal",
            "家庭照顧假":"care",
            "病假":"sick",
            "婚假":"wedding",
            "喪假":"funeral",
            "分娩假":"birth",
            "產檢假":"pcheckup",
            "流產假":"miscarriage",
            "陪產假":"paternity",
            "產假":"maternity",
            "公假":"official",
            "停班停課":"typhoon",
            "其他":"other"
        };
        const amount = {
            "annual":0,
            "personal":0,
            "care":0,
            "sick":0,
            "wedding":0,
            "funeral":0,
            "birth":0,
            "pcheckup":0,
            "miscarriage":0,
            "paternity":0,
            "maternity":0,
            "official":0,
            "typhoon":0,
            "other":0
        };
        type atp = {
            "annual":0,
            "personal":0,
            "care":0,
            "sick":0,
            "wedding":0,
            "funeral":0,
            "birth":0,
            "pcheckup":0,
            "miscarriage":0,
            "paternity":0,
            "maternity":0,
            "official":0,
            "typhoon":0,
            "other":0
        };
        for(let ticket of tickets){
            amount[(table[(ticket["type"] as keyof dayofftype)] as keyof atp)] += ticket["totalTime"];
        }
        this.init(user,year);
        var amount_array:string[] = [];
        for(let type of Object.keys(amount)){
            // console.log(type);
            if(type!="undefined")
                amount_array.push(`${type}=${amount[(type as keyof atp)]}`);
        }
        let queryString = amount_array.join(", ");
        log.logFormat(`Syncing ${user}'s data with query: ${queryString}`);
        this.login_db.prepare(`UPDATE dayoffinfo SET ${queryString} WHERE id='${user}' AND year='${year}';`).run();
        return;
    }

    modifyTicket(num:string,action:number,type:string,start:string,end:string,totalTime:number,state:digit,reason:string){
        const ticket = (this.login_db.prepare(`SELECT * FROM requestquery WHERE serialnum='${num}';`).all()[0] as requestquery);
        const user = ticket["id"];
        const query = (this.login_db.prepare(`SELECT * FROM userinfo WHERE id='${user}'`).all()[0] as userinfo);
        // const userinfo = this.login_db.prepare(`SELECT * FROM userinfo WHERE id='${query["id"]}'`).all()[0];
        const checkpoint = new Date(`${end.split("-")[0]}-${query["joinTime"].substring(5)}`);
        const endDate = new Date(end.split(" ")[0]);
        const year = checkpoint>endDate?(parseInt(end.split("-")[0])-1).toString():end.split("-")[0];
        if(action==0){
            // Delete
            this.login_db.prepare(`DELETE FROM requestquery WHERE serialnum='${num}';`).run();
            log.logFormat(`Ticket #${num} has been DELETED.`);
            this.syncTickets(user,ticket["year"]);
            return;
        }
        const new_reason:string = reason.replace("<","").replace(">","").replace('"','');
        this.login_db.prepare(`UPDATE requestquery SET type='${type}', start='${start}', end='${end}', totalTime=${totalTime}, state=${state}, year='${year}', reason='${new_reason}' WHERE serialnum='${num}';`).run();
        // log.logFormat(`Ticket #${num} from ${user} has been MODIFIED: type='${type}', start='${start}', end='${end}', totalTime=${totalTime}, state=${state}, year='${year}'`);
        this.syncTickets(user,ticket["year"]);
        return;
    }

}

function calculate(startDate:Date,endDate:Date):{m:number,d:number} {
    if (!(startDate instanceof Date) || isNaN(startDate.getTime())) {
        throw new Error("Invalid date. Please provide a valid startDate as a Date object.");
    }

    // const endDate = new Date();

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