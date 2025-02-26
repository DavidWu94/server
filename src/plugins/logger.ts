// const fs = require("fs");
import fs from 'fs';

class logger{
    private loggingFile:string;

    public constructor(fileName:string){
        // this.format = "[%Y/%M/%D %H:%m:%s] %d"
        this.loggingFile = fileName;
    }

    /**
     * 
     * @param {String} data 
     * @param {Object|undefined} DATE Require `new Date()`
     */
    logFormat(data:string,DATE?:Date) {
        /**
         * @type {Date()}
         */
        var now;
        if(DATE && typeof(DATE) == Date())
            now = DATE;
        else
            now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth()+1>9?(now.getMonth()+1):'0'+(now.getMonth()+1).toString();
        const date = now.getDate()>9?(now.getDate()):'0'+(now.getDate()).toString();
        const hour = now.getHours()>9?(now.getHours()):'0'+(now.getHours()).toString();
        const min = now.getMinutes()>9?(now.getMinutes()):'0'+(now.getMinutes()).toString();
        const sec = now.getSeconds()>9?(now.getSeconds()):'0'+(now.getSeconds()).toString();

        const message = `[${year}-${month}-${date} ${hour}:${min}:${sec}] ${data}`
        console.log(message);
        fs.appendFile(this.loggingFile,`${message}\n`,(err)=>{
            if(err) console.log(err);
        })
    }

}

export = logger;