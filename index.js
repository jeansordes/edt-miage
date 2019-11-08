// LIB
const
    rPath = require('path').resolve,
    fs = require('fs'),
    rmEventIfStrFound = require('./src/ut1/rmEventIfStrFound'),
    saveUT1file = require('./src/ut1/saveUT1File'),
    saveUT3file = require('./src/ut3/saveUT3File'),
    paths = require('./src/filesPath'),
    ut3svg2ics = require('./src/ut3/ut3svg2ics'),
    exec = require('util').promisify(require('child_process').exec),
    pdf2svg = async (inputPath, outputPath) => await exec(`inkscape -l "${outputPath}" "${inputPath}"`);

// UT3
saveUT3file(paths.ut3.url, paths.ut3.pdf_tmp, paths.ut3.pdf).then(({ isNew, time }) => {
    let whenDone = () => {
        console.log("UT3 File is ready");
        console.log(isNew ? "New file :" : "Already up-to-date :", time);
    }

    if (isNew) {
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