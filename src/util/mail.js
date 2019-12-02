const nodemailer = require('nodemailer'),
    logerr = require('./logerr'),
    { getArgvValue, printUsage } = require('./parseArgv');

// config
const gmailUserArg = "googleAdminEmailAdress", gmailPwdArg = "googlePassword";
const logerrAuth = () => {
    logerr(`Les mails ne peuvent êtres envoyés car les identifiants n'ont pas été renseignés`);
    printUsage();
};

// check si les identifiants ont été fournis
const setupArgsFound = getArgvValue(gmailUserArg).argFound && getArgvValue(gmailPwdArg).argFound;
var mailAuth, transporter, mailOptions;
if (setupArgsFound) {
    mailAuth = {
        user: getArgvValue(gmailUserArg).string,
        pass: getArgvValue(gmailPwdArg).string
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
    isSetupGood: () => setupArgsFound,
    logerrAuth: logerrAuth,
    warnAdmin: (subject, msg) => {
        if (!setupArgsFound) {
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