const
    svg2txt = require('./svg2txt'),
    txt2ics = require('./txt2ics');

module.exports = async (svgPath, icsPath, fileCreatedOn) => {
    svg2txt(svgPath).then(evts => {
        txt2ics(evts, icsPath, fileCreatedOn);
    });
}