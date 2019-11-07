const fs = require('fs'),
    logerr = require('./logerr')
ics = require('ics');

// util
const logEvt = (events, i) => console.log(Object.keys(events)[i], events[Object.keys(events)[i]]);

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
    530: [0, 10, 5],
    497: [0, 12, 5],
    491: [0, 13, 40],
    455: [0, 15, 50],
    420: [0, 18, 0],
    393: [0, 20, 0],

    374: [1, 7, 55],
    328: [1, 10, 5],
    287: [1, 12, 5],
    283: [1, 13, 40],
    255: [1, 15, 50],
    221: [1, 18, 0],
    191: [1, 20, 0],

    175: [2, 7, 55],
    141: [2, 10, 5],
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

module.exports = async (svgPath, icsPath, fileCreatedOn) => {
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
        const isInAllRanges = (x, y) => (
            isInRange(x, rangeX)
            && (
                isInRange(y, rangeY[0])
                || isInRange(y, rangeY[1])
                || isInRange(y, rangeY[2])
            )
        );
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
            if (
                axis == 'x' && !isInRange(el, rangeX)
                || (
                    axis == 'y'
                    && !(
                        isInRange(el, rangeY[0])
                        || isInRange(el, rangeY[1])
                        || isInRange(el, rangeY[2])
                    )
                )
            ) {
                return logerr(`'el' given is not in range (el == ${el},
                     axis == '${axis}', range == [${axis == 'x' ? rangeX.toString() : rangeY.toString()}]`);
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
        // console.log(new Date(1568016300000).toLocaleString('fr-FR', { timeZone: 'Europe/Paris' }), events['1568016300000'])
        // const int2date = d => new Date(parseInt(d)).toLocaleString('fr-FR', { timeZone: 'Europe/Paris' });
        let icsEvents = [];
        const array2icsJson = (title, desc, location, start, duration) => ({
            title,
            description: desc + `\n\nExporté le : ` + fileCreatedOn.toLocaleString('fr-FR', { timeZone: 'Europe/Paris' }),
            location,
            start,
            duration: (duration ? duration : ({ hours: 2 }))
        });
        for (let i = 0; i < Object.keys(events).length; i++) {
            const evt = events[Object.keys(events)[i]];
            let startDate = new Date(Object.keys(events)[i]);
            startDateAsArray = [
                startDate.getFullYear(),
                startDate.getMonth() + 1,
                startDate.getDate(),
                startDate.getHours() + 1,
                startDate.getMinutes()
            ];
            let nextEvt = events[Object.keys(events)[i + 1]];

            // check si c'est un TP, exclu le cas où c'est 1TP1 ou 3TP2
            // et 'false' sert à indiquer que dans le cas initial, 'prev' == 'false'
            if (evt.reduce((prev, curr) => (
                prev
                || (
                    typeof curr[2] == "string"
                    && curr[2].search(/TP/) != -1
                    && curr[2].search(/\dTP/) == -1
                )), false
            )) {
                evt[0][2] = 'TP ' + evt[0][2]; // et dans ce cas là on rajoute 'TP' au début du nom de l'évenement
                // Dans le cas où il y a plusieurs lignes
                if (evt.length == 6) evt[3][2] = 'TP ' + evt[3][2];
                if (evt.length == 7) evt[4][2] = 'TP ' + evt[4][2];
            }

            if (nextEvt && nextEvt[0][2] == 'U4-301') { // cas particulier
                icsEvents.push(array2icsJson(evt[0][2], evt[2][2], nextEvt[0][2], startDateAsArray, ({ hours: 1 })));

                icsEvents.push(array2icsJson(
                    "TP " + evt[0][2],
                    nextEvt[2][2],
                    nextEvt[3][2],
                    ([
                        startDate.getFullYear(),
                        startDate.getMonth() + 1,
                        startDate.getDate(),
                        14,
                        40
                    ]),
                    ({ hours: 3, minutes: 10 })
                ));
                i++;
            } else if (evt.length == 3 || evt.length == 6) {
                /**
                 * EVENEMENTS NORMAUX (3 ou 6 lignes)
                 */
                const traiterEvt = evt => {
                    // vérifier si c'est un cours avec plusieurs salles sur le même créneau
                    if (evt[1][2].search(/[- ]...?-...$/) != -1) {
                        // exemple -U4-300
                        icsEvents.push(array2icsJson(
                            evt[0][2],
                            evt[1][2] + '\n' + evt[2][2],
                            evt[1][2].match(/[- ](...?-...)$/)[1] + '/' + evt[2][2].match(/[- ](...?-...)$/)[1],
                            startDateAsArray
                        ));
                    } else if (evt[0][2].search(/CONTR.LE CONTINU/) != -1) {
                        //  Si c'est un contrôle continu
                        icsEvents.push(array2icsJson('CC ' + evt[1][2], evt[0][2] + ' de ' + evt[1][2], evt[2][2], startDateAsArray));
                    } else {
                        icsEvents.push(array2icsJson(evt[0][2], evt[1][2], evt[2][2], startDateAsArray));
                    }
                }

                // Dans le cas où c'est 3 ou 6 lignes, on considère les 3 premières lignes comme un événement
                traiterEvt(evt);
                // Dans le cas où il y a 6 lignes, on traite les 3 dernières lignes comme un autre événement
                if (evt.length == 6) traiterEvt(evt.slice(3));

            } else if (evt.length == 4 && evt[1][2] == 'Cours') { // cas particulier
                icsEvents.push(array2icsJson(evt[0][2], evt[1][2] + ' ' + evt[2][2], evt[3][2], startDateAsArray));
            } else if (evt.length == 5 && evt[0][2].search('P. Objet') != -1) { // cas particulier
                icsEvents.push(array2icsJson(
                    evt[0][2],
                    evt[1][2].match(/^([a-zA-Z0-9 ]*)-/)[1],
                    evt[1][2].match(/-(.*)/)[1],
                    startDateAsArray
                ));
                icsEvents.push(array2icsJson('TP ' + evt[2][2], evt[3][2], evt[4][2], startDateAsArray));
            } else if (evt.length == 7 && evt[3][2] == "Amener PC") {
                icsEvents.push(array2icsJson(evt[0][2], evt[1][2] + '\n' + evt[3][2], evt[2][2], startDateAsArray));
                icsEvents.push(array2icsJson(evt[4][2], evt[5][2], evt[6][2], startDateAsArray));
            } else if ((new Date(Object.keys(events)[i])).getTime() < (new Date()).getTime()) {
                // si l'évenement est déjà passé, ne pas traiter, not worth the time
            } else {
                // TODO : Prévenir john.sordes@gmail.com qu'il y a un soucis !

                logEvt(events, i);
            }
        }
        ics.createEvents(icsEvents, (err, value) => {
            if (err) return logerr(err);

            // Remove X-PUBLISHED-TTL:PT1H, sinon ça ne traduit pas correctement les \n dans les descriptions des evenements
            let lines = value.split(`\n`);
            for (let i = 0, keepGoing = true; i < lines.length && keepGoing; i++) {
                const l = lines[i];
                if (l.indexOf('X-PUBLISHED-TTL:PT1H') != -1) {
                    lines.splice(i, 1);
                    keepGoing = false;
                }
            }
            fs.writeFileSync(icsPath, lines.join(`\n`));
        });
    })
};
