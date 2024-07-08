const nodemailer = require("nodemailer");

class mailer{

    constructor(){
        /**
         * @type {nodemailer.Transporter}
         */
        this.transporter = nodemailer.createTransport({
            host: "eucan.com.tw",
            port: 465,
            secure: true,
            auth: {
                user: "username",
                pass: "password",
            },
        });
    }

    verify(){
        transporter.verify(function (error, success) {
            if (error) {
                console.warn(error);
                return null;
            } else {
                console.log("Server is ready to take our messages");
                return true;
            }
        });
    }

}



module.exports = mailer;