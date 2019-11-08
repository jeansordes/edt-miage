const fs = require('fs'),
    request = require('request'),
    logerr = require('../logerr'),
    rmEventIfStrFound = require('./rmEventIfStrFound');

// UTIL
const saveDistantFile = (distantUrl, saveAs) => {
    return new Promise((resolve, _) => {
        let fileStream = fs.createWriteStream(saveAs, { encoding: 'utf-8' });
        fileStream.on('finish', resolve);
        request(distantUrl).pipe(fileStream);
    })
},
    getUT1IcsTime = str => new Date(str.match(/Exporté le:([\d\/\n\s:]*)\)/)[1].replace(/\r\n\s*/g, '').replace(/(\d\d)\/(\d\d)\/(\d{4})(.*)/, '$3-$2-$1$4')),
    logErrIfFound = err => err ? logerr(err) : 0;

module.exports = (distantUrl, icsPath_tmp, icsPath) => new Promise((resolve, _) => {
    saveDistantFile(distantUrl, icsPath_tmp).then(() => {
        let newICStxt = fs.readFileSync(icsPath_tmp, { encoding: 'utf-8' }),
            newICStime = getUT1IcsTime(newICStxt);

        let renameTmp2New = () => { // there is a new file !
            fs.renameSync(icsPath_tmp, icsPath, logErrIfFound);

            // supprimer les événements inutiles
            rmEventIfStrFound(icsPath, 'Voir Planning site MIAGE Toulouse').then(() => {
                resolve({ isNew: true, time: newICStime });
            })
        };

        if (fs.existsSync(icsPath)) {
            let oldICStxt = fs.readFileSync(icsPath, { encoding: 'utf-8' }),
                oldICStime = getUT1IcsTime(oldICStxt);

            if (oldICStime.getTime() != newICStime.getTime()) {
                fs.unlinkSync(icsPath, logErrIfFound);
                renameTmp2New();
            } else {
                fs.unlinkSync(icsPath_tmp, logErrIfFound);
                resolve({ isNew: false, time: oldICStime }); // nothing new
            }
        } else {
            renameTmp2New();
        }
    })
});