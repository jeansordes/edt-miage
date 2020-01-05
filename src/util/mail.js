const nodemailer = require('nodemailer'),
    { logerr, logwarn } = require('./logUtil'),
    { getArgvValue, printUsage } = require('./parseArgv');

// config
const personToContactArg = "personToContact",
    mailLoginArg = "emailLogin",
    mailPwdArg = "emailPassword",
    mailHostAdressArg = "mailHostAdress",
    mailHostPortArg = "mailHostPort";
const logerrAuth = () => {
    logerr(`Il manque des arguments (soit des identifiants mail, soit l'option --offline)`);
    printUsage();
};

// check si les identifiants ont été fournis
const mailSetupArgsFound = getArgvValue(personToContactArg).argFound
    && getArgvValue(mailLoginArg).argFound
    && getArgvValue(mailPwdArg).argFound
    && getArgvValue(mailHostAdressArg).argFound
    && getArgvValue(mailHostPortArg).argFound
    && getArgvValue();
var mailAuth, mailHost, transporter, mailOptions;
if (mailSetupArgsFound) {
    mailAuth = {
        user: getArgvValue(mailLoginArg).string,
        pass: getArgvValue(mailPwdArg).string
    };
    mailHost = {
        host: getArgvValue(mailHostAdressArg).string,
        port: getArgvValue(mailHostPortArg).string,
    }
    transporter = nodemailer.createTransport({
        ...mailHost,
        auth: mailAuth
    });
    mailOptions = {
        from: `edt.miage.online Script <${mailAuth.user}>`,
    };
}

module.exports = {
    isSetupGood: () => mailSetupArgsFound,
    logerrAuth: logerrAuth,
    warnAdmin: (subject, msg) => {
        if (getArgvValue('offline').argFound) {
            logwarn(`No email was sent because the argument "--offline" was found`);
            logerr(subject);
        } else if (!mailSetupArgsFound) {
            logerrAuth();
        } else {

            mailOptions = {
                ...mailOptions,
                to: `Person responsible for edt.miage.online <${getArgvValue(personToContactArg).string}>`,
                subject: `⚠ edt.miage.online : ${subject}`,
                text: msg
            }
            transporter.sendMail(mailOptions, (err, info) => {
                if (err) {
                    logerr(err, mailAuth, mailHost);
                } else {
                    console.log('Email sent: ' + info.response);
                }
            });
        }
    }
}