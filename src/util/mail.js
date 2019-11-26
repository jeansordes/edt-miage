const nodemailer = require('nodemailer'),
    logerr = require('./logerr'),
    getArgvValue = require('./parseArgv');

// config
const gmailUserArg = "googleAdminEmailAdress", gmailPwdArg = "googlePassword";
const logerrAuth = () => logerr(`Un mail n'a pas pu être envoyé car il manque les arguments --${gmailUserArg}=... (ex: john.sordes@gmail.com) et --${gmailPwdArg}=...`);

// check si les identifiants ont été fournis
const
    missingArgs = !getArgvValue(gmailUserArg) || !getArgvValue(gmailPwdArg);
var mailAuth, transporter, mailOptions;
if (!missingArgs) {
    mailAuth = {
        user: getArgvValue(gmailUserArg),
        pass: getArgvValue(gmailPwdArg)
    };
    transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: mailAuth
    });
    mailOptions = {
        from: `edt.miage.online Script <${mailAuth.user}>`,
    };
}

module.exports = {
    warnAdmin: (subject, msg) => {
        if (missingArgs) {
            logerrAuth();
        } else {
            mailOptions = {
                ...mailOptions,
                to: `Admin adress <${mailAuth.user}>`,
                subject: `⚠ edt.miage.online : ${subject}`,
                text: msg
            }
            transporter.sendMail(mailOptions, (err, info) => {
                if (err) {
                    logerr(err, mailAuth);
                } else {
                    console.log('Email sent: ' + info.response);
                }
            });
        }
    }
}