const sql = require("../plugins/sql");
const valid = require("../plugins/checkvalid");
const express = require('express');

/**
 * 
 * @param {sql} sqlPlugin 
 * @param {*} log 
 * @param {express.Request} req 
 * @param {express.Response} res 
 */
module.exports = (sqlPlugin,log,mailer,req,res)=>{
    /**
     * @type {object}
     */
    const dataReceived = req.body;


    const account = dataReceived["account"];
    const cookie = dataReceived["cookie"];
    const day = dataReceived["day"];

    /*
        Type can be these values:
        0: no specfic, enter searching mode
        1: clock in
        -1: clock out
    */
    const type = dataReceived["type"];

    if(!valid(dataReceived,["account","cookie","type"])){
        res.sendStatus(400);
        return;
    }
    
    let ret = sqlPlugin.checkHash(account,cookie);
    if (ret==null){
        res.sendStatus(403);
    }else{
        var date = day?new Date(day):new Date();
        // date.setDate(date.getHours() + 8);
        const returns = sqlPlugin.clockinAction(account,type,date);
        res.json(returns);
    }
}