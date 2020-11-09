// LIB
require('dotenv-placeholder').config();
const
    rPath = require('path').resolve,
    saveUT1file = require('./src/ut1/saveUT1File'),
    saveUT3file = require('./src/ut3/saveUT3File'),
    paths = require('./src/util/filesPath'),
    ut3svg2ics = require('./src/ut3/ut3svg2ics'),
    exec = require('util').promisify(require('child_process').exec),
    pdf2svg = async (inputPath, outputPath) => await exec(`inkscape -l "${outputPath}" "${inputPath}"`),
    fs = require('fs'),
    path = require('path'),
    mail = require('./src/util/mail'),
    env = process.env;

// Vérifier si l'utilisateur a lancé le programme en mode "offline"
const workOffline = process.argv.includes('--offline');

// Vérifie si l'utilitaire mail est correctement configuré, et on arrête tout si ce n'est pas le cas
// (sauf si on est offline, dans ce cas là, balek)
if (!workOffline && !mail.isSetupGood()) return mail.logerrAuth();

// UT1
const whenUT1Done = (filiere) => console.log(`✅  UT1 ${filiere} File is ready`);
if (workOffline) {
    whenUT1Done('FA');
    whenUT1Done('FI');
} else {
    saveUT1file(paths.ut1_fa.url, paths.ut1_fa.ics_tmp, paths.ut1_fa.ics).then(({ isNew, time }) => {
        // Pour éviter de casser l'ancien fonctionnement, on créé une copie de ut1_fa.ics, et on le renomme ut1.ics
        console.log(path.resolve(__dirname + '/assets/ut1.ics'));
        saveUT1file(paths.ut1_fa.url, paths.ut1_fa.ics_tmp, path.resolve(__dirname + '/assets/ut1.ics')).then(({ isNew, time }) => {
            whenUT1Done('FA');
            console.log(isNew ? "New file :" : "Already up-to-date :", time);
        });
    });
    saveUT1file(paths.ut1_fi.url, paths.ut1_fi.ics_tmp, paths.ut1_fi.ics).then(({ isNew, time }) => {
        whenUT1Done('FI');
        console.log(isNew ? "New file :" : "Already up-to-date :", time);
    });
}

// UT3 : todo