const nodemailer = require("nodemailer");
const dotenv = require('dotenv');
dotenv.config();

class mailer{

    constructor(){
        /**
         * @type {nodemailer.Transporter}
         */
        this.transporter = nodemailer.createTransport({
            host: "biz-mx2-6.hinet.net",
            port: 25,
            secure: false,
            auth: {
                user: process.env.USER_MAIL,
                pass: process.env.USER_PWD,
            },
            tls: {rejectUnauthorized: false}
        });
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

    async send(mail,title,text){
        var message = {
            from: process.env.USER_MAIL,
            to: mail,
            subject: title,
            text: text,
        };
        const ret = await this.transporter.sendMail(message);
        return ret
    }

}

module.exports = mailer;