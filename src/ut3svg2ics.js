const fs = require('fs'),
    logerr = require('./logerr');

const week2days = {
    36: [[2019, 9, 2], [2019, 9, 3], [2019, 9, 4]],
    37: [[2019, 9, 9], [2019, 9, 10], [2019, 9, 11]],
    38: [[2019, 9, 16], [2019, 9, 17], [2019, 9, 18]],
    39: [[2019, 9, 23], [2019, 9, 24], [2019, 9, 25]],
    40: [[2019, 9, 30], [2019, 10, 1], [2019, 10, 2]],
    41: [[2019, 10, 7], [2019, 10, 8], [2019, 10, 9]],
    42: [[2019, 10, 14], [2019, 10, 15], [2019, 10, 16]],
    43: [[2019, 10, 21], [2019, 10, 22], [2019, 10, 23]],
    44: [[2019, 10, 28], [2019, 10, 29], [2019, 10, 30]],
    45: [[2019, 11, 4], [2019, 11, 5], [2019, 11, 6]],
    46: [[2019, 11, 11], [2019, 11, 12], [2019, 11, 13]],
    47: [[2019, 11, 18], [2019, 11, 19], [2019, 11, 20]],
    48: [[2019, 11, 25], [2019, 11, 26], [2019, 11, 27]],
    49: [[2019, 12, 2], [2019, 12, 3], [2019, 12, 4]],
    50: [[2019, 12, 9], [2019, 12, 10], [2019, 12, 11]],
    51: [[2019, 12, 16], [2019, 12, 17], [2019, 12, 18]],
}
const svgDatesX = {
    65: null,
    110: 36,
    155: 37,
    201: 38,
    246: 39,
    300: 40,
    345: 41,
    406: 42,
    441: 43,
    487: 45,
    545: 46,
    590: 47,
    649: 48,
    709: 49,
    766: 50,
    812: 51,
};
const svgDatesY = {
    // weekday (0 monday, 1 tuesday, 2 wednesday), starting hour, starting minute
    557: [0, 7, 55],
    530: [0, 9, 55],
    497: [0, 12, 5],
    491: [0, 13, 40],
    455: [0, 15, 40],
    420: [0, 17, 50],
    393: [0, 20, 0],

    374: [1, 7, 55],
    328: [1, 9, 55],
    287: [1, 12, 5],
    283: [1, 13, 40],
    255: [1, 15, 40],
    221: [1, 17, 50],
    191: [1, 20, 0],

    175: [2, 7, 55],
    141: [2, 9, 55],
    93: [2, 12, 5],
};
// Create range of each dates
let svgKeys = Object.keys(svgDatesX);
const rangeX = [svgKeys[0], svgKeys[15]];
svgKeys = Object.keys(svgDatesY);
const rangeY = [
    [svgKeys[0], svgKeys[2]],
    [svgKeys[3], svgKeys[9]],
    [svgKeys[10], svgKeys[16]]
];

module.exports = async (svgPath, icsPath) => {
    fs.readFile(svgPath, { encoding: 'utf-8' }, (err, data) => {
        if (err) return logerr(err);
        // SVG FILE == DATA
        data = data.replace(/\n\s*([a-z])/g, ' $1');
        // get all text
        const matches = [...data.matchAll(/<text.*,(.*),([\d\.]+).*>(.*)<\/tspan>/g)];

        // $1 = X, $2 = Y, $3 = TXT
        // filter range
        const isInRange = (el, range) => {
            el = parseFloat(el);
            range0 = parseFloat(range[0]);
            range1 = parseFloat(range[1]);
            return (el >= range0 && el <= range1) || (el <= range0 && el >= range1)
        };
        const isInAllRanges = (x, y) => (isInRange(x, rangeX) && (isInRange(y, rangeY[0]) || isInRange(y, rangeY[1]) || isInRange(y, rangeY[2])));
        for (let i = 0; i < matches.length; i++) {
            if (!isInAllRanges(matches[i][1], matches[i][2])) {
                matches.splice(i, 1);
                i--;
            }
        }



        // simplify XY coordinates
        const getClosestCoordinate = (el, axis) => {
            el = parseFloat(el);
            if (axis != 'x' && axis != 'y')
                return logerr("Wrong axis given, 'x' or 'y' expected");
            if ((axis == 'x' && !isInRange(el, rangeX)) || (axis == 'y' && !(isInRange(el, rangeY[0]) || isInRange(el, rangeY[1]) || isInRange(el, rangeY[2])))) {
                return logerr(`'el' given is not in range (el == ${el}, axis == '${axis}', range == [${axis == 'x' ? rangeX.toString() : rangeY.toString()}]`);
            }
            // for each axis
            const pts = Object.keys(axis == 'x' ? svgDatesX : svgDatesY).map(v => parseFloat(v));
            for (let i = 0; i < pts.length - 1; i++)
                if (el >= pts[i] && el <= pts[i + 1])
                    return pts[i + 1];
        };

        for (let i = 0; i < matches.length; i++) {
            matches[i][1] = getClosestCoordinate(matches[i][1], 'x');
            matches[i][2] = getClosestCoordinate(matches[i][2], 'y');
        }

        // assign each text to an event with its coordinates
        let events = {};
        for (let i = 0; i < matches.length; i++) {
            const match = matches[i];
            matches[i].date =
                week2days[svgDatesX[match[1]]][svgDatesY[match[2]][0]].join('-') + ' '
                + svgDatesY[match[2]].slice(1).map(e => ('0' + e).slice(-2)).join(':') + ' GMT+0200';
            if (events.hasOwnProperty(matches[i].date)) {
                events[matches[i].date].push(matches[i].slice(1));
            } else {
                events[matches[i].date] = [matches[i].slice(1)];
            }
        }
        // console.log(Object.keys(events).map(k => new Date(parseInt(k)).toLocaleString('fr-FR', { timeZone: 'Europe/Paris' })));
        // const str2date = d => new Date(parseInt(d)).toLocaleString('fr-FR', { timeZone: 'Europe/Paris' });
        for (let i = 0; i < Object.keys(events).length; i++) {
            const evt = events[Object.keys(events)[i]];
            if (evt.length != 3 && evt.length != 6) {
                console.log(Object.keys(events)[i], evt);
            }
        }
        // console.log(new Date(1568016300000).toLocaleString('fr-FR', { timeZone: 'Europe/Paris' }), events['1568016300000'])
    })
};
