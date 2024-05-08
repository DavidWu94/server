

class logger{
    constructor(fileName){
        this.loggingFile = `${fileName.split('.')[0]}.txt`;
    }
}

module.exports = logger;