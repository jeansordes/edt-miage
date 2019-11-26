const fs = require('fs'),
    logerr = require('../logerr'),
    svgTxt2ics = require('./txt2ics'),
    { week2days, svgDatesX, svgDatesY, rangeX, rangeY } = require('./config/svgCoordinates');

// util
const isInRange = (el, range) => {
        el = parseFloat(el);
        range0 = parseFloat(range[0]);
        range1 = parseFloat(range[1]);
        return (el >= range0 && el <= range1) || (el <= range0 && el >= range1)
    },
    isInAllRanges = (x, y) => (
        isInRange(x, rangeX)
        && (
            isInRange(y, rangeY[0])
            || isInRange(y, rangeY[1])
            || isInRange(y, rangeY[2])
        )
    ),
    getClosestCoordinate = (el, axis) => {
        el = parseFloat(el);
        // vérification des arguments
        if (axis != 'x' && axis != 'y')
            return logerr("Wrong axis given, 'x' or 'y' expected");
        if (axis == 'x' && !isInRange(el, rangeX) || (axis == 'y' && !(
            isInRange(el, rangeY[0])
            || isInRange(el, rangeY[1])
            || isInRange(el, rangeY[2])
        ))) {
            return logerr(`'el' given is not in range (el == ${el},
                 axis == '${axis}', range == [${axis == 'x' ? rangeX.toString() : rangeY.toString()}]`);
        }
        // retourner le résultat
        const pts = Object.keys(axis == 'x' ? svgDatesX : svgDatesY).map(v => parseFloat(v));
        for (let i = 0; i < pts.length - 1; i++)
            if (el >= pts[i] && el <= pts[i + 1])
                return pts[i + 1];
    };

module.exports = async svgPath => {
    return new Promise(resolve => {
        fs.readFile(svgPath, { encoding: 'utf-8' }, (err, data) => {
            if (err) return logerr(err);
            // Récupérer chaque textes dans le SVG
            /** matches = [
             *     ...[
             *          $0 = ligne de texte où a eu lieu le match,
             *          $1 = X,
             *          $2 = Y,
             *          $3 = TXT
             *      ]
             *  ]
             */
            const matches = [...data
                .replace(/\n\s*([a-z])/g, ' $1')
                .matchAll(/<text.*,(.*),([\d\.]+).*>(.*)<\/tspan>/g)
            ];

            // supprimer les textes qui ne sont pas dans l'interval qui nous intéresse
            for (let i = 0; i < matches.length; i++) {
                if (!isInAllRanges(matches[i][1], matches[i][2])) {
                    matches.splice(i, 1);
                    i--;
                }
            }

            // remplacer les coordonnés par les coordonnées les plus proches (pour pouvoir indexer par la suite)
            for (let i = 0; i < matches.length; i++) {
                matches[i][1] = getClosestCoordinate(matches[i][1], 'x');
                matches[i][2] = getClosestCoordinate(matches[i][2], 'y');
            }

            // associer chaque texte à un événement en fonction des coordonnées du texte
            let events = {};
            for (let i = 0; i < matches.length; i++) {
                const match = matches[i];
                matches[i].date =
                    week2days[svgDatesX[match[1]]][svgDatesY[match[2]][0]].join('-') + ' '
                    + svgDatesY[match[2]].slice(1).map(e => ('0' + e).slice(-2)).join(':') + ' GMT+0200';
                if (events.hasOwnProperty(matches[i].date)) {
                    events[matches[i].date].push(matches[i][3]);
                } else {
                    events[matches[i].date] = [matches[i][3]];
                }
            }

            // passer les events (au format {date: []})
            resolve(events);
        });
    });
};
