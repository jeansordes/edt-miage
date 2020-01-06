// LIB
const
    rPath = require('path').resolve,
    saveUT1file = require('./src/ut1/saveUT1File'),
    saveUT3file = require('./src/ut3/saveUT3File'),
    paths = require('./src/util/filesPath'),
    ut3svg2ics = require('./src/ut3/ut3svg2ics'),
    exec = require('util').promisify(require('child_process').exec),
    pdf2svg = async (inputPath, outputPath) => await exec(`inkscape -l "${outputPath}" "${inputPath}"`),
    { getArgvValue } = require('./src/util/parseArgv'),
    fs = require('fs'),
    mail = require('./src/util/mail');

// Vérifier si l'utilisateur a lancé le programme en mode "offline"
const workOffline = getArgvValue('offline').argFound;

if (!workOffline) {
    // Vérifie si l'utilitaire mail est correctement configuré, et on arrête tout si ce n'est pas le cas
    if (!mail.isSetupGood()) return mail.logerrAuth();

    // Vérifie si on a de quoi générer le fichier index.html
    const prodServerURLArg = getArgvValue('prodServerURL');
    if (prodServerURLArg.argFound) {
        let prodServerURL = prodServerURLArg.string;
        // si l'URL du serveur ne termine pas par un / on en rajoute un
        if (prodServerURL.slice(-1) != '/') prodServerURL += '/';

        let htmlContent = `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta http-equiv="X-UA-Compatible" content="ie=edge"><title>Edt Miage</title><link href="https://fonts.googleapis.com/css?family=Roboto&display=swap" rel="stylesheet"><style>body{font-family: 'Roboto', sans-serif} iframe{background-color: lightgray} input {min-width: 50%}</style><script async src="https://www.googletagmanager.com/gtag/js?id=UA-155402665-1"></script><script>function gtag(){dataLayer.push(arguments)}window.dataLayer=window.dataLayer||[],gtag("js",new Date),gtag("config","UA-155402665-1");</script></head><body>
    <h3>Liens vers les fichiers iCal (.ics)</h3>
    <p><input onClick="this.select();" value="${prodServerURL}ut1.ics" type="text"/></p>
    <p><input onClick="this.select();" value="${prodServerURL}ut3.ics" type="text"/></p>
    <h3>Aperçu des emplois du temps</h3>
    <p>Emploi du temps UT3 Paul Sabatier</p>
    <iframe id='cv_if5' src='http://cdn.instantcal.com/cvir.html?id=cv_nav5&file=${encodeURIComponent(prodServerURL)}ut3.ics&theme=RE&ccolor=%23ffffc0&dims=1&gtype=cv_monthgrid&gcloseable=0&gnavigable=1&gperiod=month&itype=cv_simpleevent' allowTransparency=true scrolling='no' frameborder=0 height=600 width=800></iframe>
    <p>Emploi du temps UT1 Capitole</p>
    <iframe id='cv_if5' src='http://cdn.instantcal.com/cvir.html?id=cv_nav5&file=${encodeURIComponent(prodServerURL)}ut1.ics&theme=RE&ccolor=%23ffffc0&dims=1&gtype=cv_monthgrid&gcloseable=0&gnavigable=1&gperiod=month&itype=cv_simpleevent' allowTransparency=true scrolling='no' frameborder=0 height=600 width=800></iframe>
    </body></html>`;
        fs.writeFileSync(paths.indexHtml, htmlContent);
    }
}

// UT1
const whenUT1Done = () => console.log("✅  UT1 File is ready");
if (workOffline) {
    whenUT1Done();
} else {
    saveUT1file(paths.ut1.url, paths.ut1.ics_tmp, paths.ut1.ics).then(({ isNew, time }) => {
        whenUT1Done();
        console.log(isNew ? "New file :" : "Already up-to-date :", time);
    });
}

// UT3
const whenUT3Done = () => console.log("✅  UT3 File is ready");
if (workOffline) {
    if (getArgvValue('ut3pdf2svg').argFound) {
        console.log('UT3 SVG file is being generated ...');
        pdf2svg(rPath(paths.ut3.pdf), rPath(paths.ut3.svg)).then(() => {
            ut3svg2ics(paths.ut3.svg, paths.ut3.ics, new Date()).then(whenUT3Done);
        });
    } else {
        ut3svg2ics(paths.ut3.svg, paths.ut3.ics, new Date()).then(whenUT3Done);
    }
} else {
    saveUT3file(paths.ut3.url, paths.ut3.pdf_tmp, paths.ut3.pdf).then(({ isNew, time }) => {
        const whenUT3Done_online = () => {
            whenUT3Done();
            console.log(isNew ? "New file :" : "Already up-to-date :", time);
        }
        if (isNew) {
            pdf2svg(rPath(paths.ut3.pdf), rPath(paths.ut3.svg)).then(() => {
                ut3svg2ics(paths.ut3.svg, paths.ut3.ics, time).then(whenUT3Done_online);
            });
        } else {
            whenUT3Done_online();
        };
    });
}