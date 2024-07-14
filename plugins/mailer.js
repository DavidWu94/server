const nodemailer = require("nodemailer");
const dotenv = require('dotenv');
dotenv.config();

class mailer{

    constructor(){
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

    verify(){
        this.transporter.verify(function (error, success) {
            if (error) {
                console.error(error);
                return null;
            } else {
                console.log("Server is ready to take our messages");
                return true;
            }
        });
    }

    relogin(){
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
            tls: {
                rejectUnauthorized: false
            }
        }
        this.transporter = nodemailer.createTransport(this.option);
    }

    async send(mail,title,text){
        var message = {
            from: `"祐肯企業請假系統訊息" <${process.env.USER_MAIL}>`, // listed in rfc822 message header
            to: `${mail}`, // listed in rfc822 message header
            subject: title,
            text: text,
        };
        const ret = await this.transporter.sendMail(message);
        // console.log(ret)
        return ret
    }

}

module.exports = mailer;