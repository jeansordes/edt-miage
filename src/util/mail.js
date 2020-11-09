require("dotenv-placeholder").config();
const nodemailer = require('nodemailer'),
    { logerr, logwarn } = require('./logUtil'),
    env = process.env;

// config
const logerrAuth = () => {
    logerr(`Il manque des arguments (soit des identifiants mail, soit l'option --offline)`);
    console.log('\x1b[36m%s\x1b[0m', 'Usage:\n\t'
            + 'node index.js --offline (use only the files already downloaded, only for dev purposes)');
};

// check si les identifiants ont été fournis
var mailAuth, mailHost, transporter, mailOptions;
const mailSetupArgsFound = env.personToContact && env.mailHostAdress
    && env.mailHostPort && env.emailLogin && env.emailPassword;
if (mailSetupArgsFound) {
    mailAuth = {
        user: env.emailLogin,
        pass: env.emailPassword,
    };
    mailHost = {
        host: env.mailHostAdress,
        port: env.mailHostPort,
    };
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
        if (process.argv.includes('--offline')) {
            logwarn(`No email was sent because the argument "--offline" was found`);
            logerr(subject);
        } else if (!mailSetupArgsFound) {
            logerrAuth();
        } else {
            mailOptions = {
                ...mailOptions,
                to: `Person responsible for edt.miage.online <${env.personToContactArg}>`,
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