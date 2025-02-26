import express,{Express,Request,Response} from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import multer from 'multer';

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
    // const utils = require(`./system/${v}.js`).bind(null,sqlPlugin,log,mailer);
    app.post(`/${v}`,(req:Request,res:Response)=>{
    try{
        // utils(req,res);
    }catch(e){
        // log.logFormat(e,new Date());
        res.sendStatus(500);
    }
    });
})

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
    // log.logFormat("Server online.");
    // const mailerStatus = mailer.verify();
    // if(!mailerStatus){
    //   // console.error("Mailer Verify Failed!");
    // }
});