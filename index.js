// LIB
const
    rPath = require('path').resolve,
    fs = require('fs'),
    rmEventIfStrFound = require('./src/rmEventIfStrFound'),
    { saveUT3file, saveUT1file } = require('./src/saveFiles'),
    paths = require('./src/filesPath'),
    ut3svg2ics = require('./src/ut3svg2ics'),
    exec = require('util').promisify(require('child_process').exec),
    pdf2svg = async (inputPath, outputPath) => await exec(`inkscape -l "${outputPath}" "${inputPath}"`);

// UT3
ut3svg2ics(paths.ut3.svg, paths.ut3.ics);

// saveUT3file(paths.ut3.url, paths.ut3.pdf_tmp, paths.ut3.pdf).then(({ isNew, time }) => {
//     let whenDone = () => {
//         console.log("UT3 File is ready");
//         console.log(isNew ? "New file :" : "Already up-to-date :", time);
//     }

//     if (isNew) {
//         pdf2svg(rPath(paths.ut3.pdf), rPath(paths.ut3.svg)).then(() => {
//             ut3svg2ics(paths.ut3.svg, paths.ut3.ics).then(whenDone);
//         });
//     } else whenDone();
// });

// UT1
saveUT1file(paths.ut1.url, paths.ut1.ics_tmp, paths.ut1.ics).then(({ isNew, time }) => {
    rmEventIfStrFound(paths.ut1.ics, 'Voir Planning site MIAGE Toulouse').then(() => {
        console.log("UT1 File is ready")
        console.log(isNew ? "New file :" : "Already up-to-date :", time);
    })
});