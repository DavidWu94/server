const fs = require("fs");

class logger{
    constructor(fileName){
        this.format = "[%Y/%M/%D %H:%m:%s] %d"
        fs.appendFile(fileName,"[2024/05/20]\n",(err)=>{
            if(err) console.log(err);
        })
        // this.loggingFile = `${fileName.split('.')[0]}.txt`;
    }
}

module.exports = logger;