const sql = require("../plugins/sql")
const mail = require("../plugins/mailer")
const upload = require('../plugins/multer');

/**
 * 
 * @param {sql} sqlPlugin 
 * @param {*} log 
 * @param {mail} mailer 
 * @param {*} req 
 * @param {*} res 
 */
module.exports = (sqlPlugin,log,mailer,req,res)=>{
  // Handle the uploaded file
  upload(req,res,(err)=>{
    if (err) {
      console.error(err);
      return res.status(500).json({ error: err });
     }
    /**
     * @type {object}
     */
    const dataReceived = req.body;

    const account = dataReceived["account"];
    const cookie = dataReceived["cookie"];
    const type = dataReceived["type"];
    // data below requires front-end format time into 2024-01-01
    const start = dataReceived["start"];
    const end = dataReceived["end"];
    if(!(validTime(start) && validTime(end))){
      res.sendStatus(403);
      return;
    }
    const totalTime = caculateTime(start,end);  
    // TODO: Add permission check
    const permission = sqlPlugin.getPermission(account);
    if(permission===null){
      res.sendStatus(403);
      return;
    }

    let ret1 = sqlPlugin.checkHash(account,cookie);
    if (ret1==null){
      res.json({
        "status":403
      });
      return;
    }else{
      const ret = sqlPlugin.newRequest(account,type,start,end,totalTime);

      if (!ret){
        res.sendStatus(501);
        return;
      }
      if(permission==0){
        console.log(ret);
        sqlPlugin.setPermit(ret["num"],1);
      }else{
        var man = ["jeff@eucan.com.tw","catherine@eucan.com.tw"]
        mailer.send(man[ret["mgroup"]],"請假審核要求",`您好，\n員工 ${ret["name"]}於剛才發送請假要求。\n詳細內容請登入請假系統審核。\n\n<此信為系統自動發送，請勿回覆>`)
        res.send("已向主管提出請假申請，請點擊上一頁回到請假頁面")
      }
    }
    // console.log(req.body)
  })
}

function caculateTime(time1,time2){
	const date1 = new Date(Date.parse(time1));
	const date2 = new Date(Date.parse(time2));
	const spl = [date1.getHours()>12?1:0,date2.getHours()>12?1:0];
	console.log(spl)
	const n = date2.getDay()-date1.getDay();
	const sum = spl[0]+spl[1];
	var timeElapse = (date2.getTime()-date1.getTime())/1000/60/60;
	if(n==0){
		// same day
		switch(sum){
			case 0:
				return timeElapse>3?4:timeElapse;
				// break;
			case 1:
				if(date1.getHours()==8){
					timeElapse += 0.5
				}
				return (timeElapse-1.5);
				// break;
			case 2:
				return timeElapse;
		}
	}else{
		switch(sum){
			case 0:
				if(date2.getHours()==12)
					timeElapse+=0.5;
				if(date1.getHours()==8){
					return timeElapse-16*(n);
				}else{
					return timeElapse-16.5*(n);
				}
			case 1:
				if(spl[0]==0){
					return timeElapse-16*n-1.5+(date1.getHours()==8?0.5:0);
				}else{
					return timeElapse-15*n-1.5*(n-1)+(date2.getHours()==12?0.5:0);
				}
			case 2:
				return timeElapse-16*n;
		}
	}
}

function validTime(time){
	const T = time.split(" ")[1].split(":");
	// if(0<=date.getHours()<=8)
	if(8 <= parseInt(T[0]) &&  parseInt(T[0]) <= 17){
		if(T[0]=='08' && T[1]=="00"){
			return false;
		}
		if(T[1]!="00" && T[1]!="30"){
			return false;
		}else{
			return true;
		}
	}else{
		return false;
	}
}