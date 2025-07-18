import express,{Express,Request,Response} from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { sql } from './plugins/sql';
import logger from './plugins/logger';
import { mailer} from './plugins/mailer';
import { sqli_detect } from './plugins/anti_SQLI';

const log = new logger(`./logs/${new Date().toISOString().split('T')[0]}.log`);
const sqlPlugin:sql = new sql();
const mailers = new mailer();
const app:Express = express();
const PORT:number = 3000;

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json());

app.use(cors({
    "origin": "*",
    "methods": "GET,POST",
    "preflightContinue": false,
    "optionsSuccessStatus": 204
}));

app.all('/',(req:Request,res:Response)=>{
    res.send("System online.");
});

const posts: Array<string> = ['login','users','session',"register",'dayoff','request','query','permit','init','approved','empquery','delete',"modify","quota","clockin","sync","calendar","clrecord","tmodify"];
posts.forEach(v=>{
    const utils = require(`./system/${v}.js`).bind(null,sqlPlugin,log,mailers);
    app.post(`/${v}`,(req:Request,res:Response)=>{
        if(sqli_detect(req.body)){ 
            res.sendStatus(400);
            return;
        }
        try{
            utils(req,res);
        }catch(e){
            log.logFormat((e as string),new Date());
            res.sendStatus(500);
        }
    });
})

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
    log.logFormat("Server online.");
    const mailerStatus = mailers.verify();
    if(!mailerStatus){
      console.error("Mailer Verify Failed!");
    }
});