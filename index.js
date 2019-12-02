// LIB
const
    rPath = require('path').resolve,
    saveUT1file = require('./src/ut1/saveUT1File'),
    saveUT3file = require('./src/ut3/saveUT3File'),
    paths = require('./src/util/filesPath'),
    ut3svg2ics = require('./src/ut3/ut3svg2ics'),
    exec = require('util').promisify(require('child_process').exec),
    pdf2svg = async (inputPath, outputPath) => await exec(`inkscape -l "${outputPath}" "${inputPath}"`),
    { getArgvValue, printUsage } = require('./src/util/parseArgv'),
    logerr = require('./src/util/logerr'),
    fs = require('fs'),
    mail = require('./src/util/mail');

// Vérifie si l'utilitaire mail est correctement configuré, et arrête tout si ce n'est pas le cas
if (!mail.isSetupGood()) return mail.logerrAuth();

// Vérifie si index.html existe
const serverUrlArg = getArgvValue('serverUrl');
if (!serverUrlArg.argFound) {
    logerr(`L'URL du serveur n'a pas été renseignée`);
    return printUsage();
}

let serverUrl = serverUrlArg.string;
// si l'URL du serveur ne termine pas par un / on en rajoute un
if (serverUrl.slice(-1) != '/') serverUrl += '/';

let htmlContent = `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta http-equiv="X-UA-Compatible" content="ie=edge"><title>Edt Miage</title><link href="https://fonts.googleapis.com/css?family=Roboto&display=swap" rel="stylesheet"><style>body{font-family: 'Roboto', sans-serif} iframe{background-color: lightgray} input {min-width: 50%}</style></head><body>
<h3>Liens vers les fichiers iCal (.ics)</h3>
<p><input onClick="this.select();" value="${serverUrl}ut1.ics" type="text"/></p>
<p><input onClick="this.select();" value="${serverUrl}ut3.ics" type="text"/></p>
<h3>Aperçu des emplois du temps</h3>
<p>Emploi du temps UT1 Capitole</p>
<iframe id='cv_if5' src='http://cdn.instantcal.com/cvir.html?id=cv_nav5&file=${encodeURIComponent(serverUrl)}ut1.ics&theme=RE&ccolor=%23ffffc0&dims=1&gtype=cv_monthgrid&gcloseable=0&gnavigable=1&gperiod=month&itype=cv_simpleevent' allowTransparency=true scrolling='no' frameborder=0 height=600 width=800></iframe>
<p>Emploi du temps UT3 Paul Sabatier</p>
<iframe id='cv_if5' src='http://cdn.instantcal.com/cvir.html?id=cv_nav5&file=${encodeURIComponent(serverUrl)}ut3.ics&theme=RE&ccolor=%23ffffc0&dims=1&gtype=cv_monthgrid&gcloseable=0&gnavigable=1&gperiod=month&itype=cv_simpleevent' allowTransparency=true scrolling='no' frameborder=0 height=600 width=800></iframe>
</body></html>`;
fs.writeFileSync(paths.indexHtml, htmlContent);

// Vérifier si l'utilisateur a lancé le programme en mode "forcé", et si oui, on forcera la génération des fichiers, même s'il n'y a pas de nouveaux fichiers
const forceOptionEnabled = getArgvValue('forceRefresh').argFound || getArgvValue('f').argFound;

// UT3
saveUT3file(paths.ut3.url, paths.ut3.pdf_tmp, paths.ut3.pdf).then(({ isNew, time }) => {
    let whenDone = () => {
        console.log("UT3 File is ready");
        console.log(isNew ? "New file :" : "Already up-to-date :", time);
    }

    if (isNew || forceOptionEnabled) {
        console.log('\tThe UT3 file is gonna be generated from scratch');
        pdf2svg(rPath(paths.ut3.pdf), rPath(paths.ut3.svg)).then(() => {
            ut3svg2ics(paths.ut3.svg, paths.ut3.ics, time).then(whenDone);
        });
    } else whenDone();
});

// UT1
saveUT1file(paths.ut1.url, paths.ut1.ics_tmp, paths.ut1.ics).then(({ isNew, time }) => {
    console.log("UT1 File is ready")
    console.log(isNew ? "New file :" : "Already up-to-date :", time);
});