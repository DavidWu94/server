// import SMTPPool,{Options} from 'nodemailer/lib/smtp-pool';
import nodemailer,{Transporter} from 'nodemailer';
import dotenv from 'dotenv';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
// import SMTPConnection from 'nodemailer/lib/smtp-connection';
// const dotenv = require('dotenv');
dotenv.config();

export class mailer{
    private option:SMTPTransport.Options;
    private transporter:Transporter

    public constructor(){
        /**
         * @type {nodemailer.Transporter}
         */
        this.option = {
            // "biz-mx2-6.hinet.net"
            host: process.env.SMTP_SERVER,
            // pool: true,
            port: 25,
            secure: false,
            auth: {
                user: process.env.USER_MAIL,
                pass: process.env.USER_PWD,
            },
            tls: {rejectUnauthorized: false}
        }
        this.transporter = nodemailer.createTransport(this.option);
    }

    verify():boolean{
        var ret:boolean = false;
        this.transporter.verify(function (error, success) {
            if (error) {
                console.error(error);
                ret = false;
            } else {
                console.log("Server is ready to take our messages");
                ret = true;
            }
        });
        return ret;
    }

    relogin(){
        /**
         * @type {nodemailer.Transporter}
         */
        this.option = {
            host: process.env.SMTP_SERVER,
            port: 25,
            secure: false,
            auth: {
                user: process.env.USER_MAIL,
                pass: process.env.USER_PWD,
            },
            tls: {
                rejectUnauthorized: false
            }
        }
        this.transporter = nodemailer.createTransport(this.option);
    }

    async send(mail:string,title:string,text:string):Promise<any>{
        var message = {
            from: `"祐肯企業請假系統訊息" <${process.env.USER_MAIL}>`, // listed in rfc822 message header
            to: `${mail}`, // listed in rfc822 message header
            subject: title,
            text: text,
        };
        const ret = await this.transporter.sendMail(message);
        return new Promise(res=>{res(ret)});
    }

}