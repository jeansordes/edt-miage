const fs = require('fs'),
    request = require('request'),
    pdfParse = require('pdf-parse'),
    logerr = require('./logerr');

// UTIL
const saveDistantFile = (distantUrl, saveAs) => {
    return new Promise((resolve, _) => {
        let fileStream = fs.createWriteStream(saveAs, { encoding: 'utf-8' });
        fileStream.on('finish', resolve);
        request(distantUrl).pipe(fileStream);
    })
},
    parseUT3time = str => new Date(str.replace(/D:(\d{4})(\d\d)(\d\d)(\d\d)(\d\d)(\d\d\+\d\d).*/g, "$1-$2-$3 $4:$5:$6")),
    getUT1IcsTime = str => new Date(str.match(/Exporté le:([\d\/\n\s:]*)\)/)[1].replace(/\r\n\s*/g, '').replace(/(\d\d)\/(\d\d)\/(\d{4})(.*)/, '$3-$2-$1$4')),
    logErrIfFound = err => err ? logerr(err) : 0;

module.exports = {
    saveUT3file: (distantUrl, pdfPath_tmp, pdfPath) => new Promise((resolve, _) => {
        saveDistantFile(distantUrl, pdfPath_tmp).then(() => {
            // save file as tmp
            // if there is an old file AND date !=
            //    delete old
            // if no old file
            //    rename tmp as old
            let newPDFData = fs.readFileSync(pdfPath_tmp);

            pdfParse(newPDFData).then(newData => {
                let newPDFtime = parseUT3time(newData.info.ModDate);
                let renameTmp2New = () => {
                    fs.rename(pdfPath_tmp, pdfPath, logErrIfFound);
                    resolve({ isNew: true, time: newPDFtime }); // there is a new file !
                }

                if (fs.existsSync(pdfPath)) {
                    let oldPDFData = fs.readFileSync(pdfPath);

                    pdfParse(oldPDFData).then(oldData => {
                        let oldPDFtime = parseUT3time(oldData.info.ModDate);

                        if (oldPDFtime.getTime() != newPDFtime.getTime()) {
                            fs.unlink(pdfPath, logErrIfFound);
                            renameTmp2New();
                        } else {
                            fs.unlink(pdfPath_tmp, logErrIfFound);
                            resolve({ isNew: false, time: oldPDFtime }); // nothing new
                        }
                    });
                } else {
                    renameTmp2New();
                }
            })
        })
    }),
    saveUT1file: (distantUrl, icsPath_tmp, icsPath) => new Promise((resolve, _) => {
        saveDistantFile(distantUrl, icsPath_tmp).then(() => {
            let newICStxt = fs.readFileSync(icsPath_tmp, { encoding: 'utf-8' }),
                newICStime = getUT1IcsTime(newICStxt);

            let renameTmp2New = () => {
                fs.renameSync(icsPath_tmp, icsPath, logErrIfFound);
                resolve({ isNew: true, time: newICStime });
                // console.log("test");

            }; // there is a new file !

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
    })
};