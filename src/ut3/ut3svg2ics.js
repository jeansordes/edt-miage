const fs = require('fs'),
    logerr = require('../logerr'),
    ics = require('ics'),
    { week2days, svgDatesX, svgDatesY, rangeX, rangeY } = require('./svgCoordinates');

// util
const logEvt = (events, i) => console.log(Object.keys(events)[i], events[Object.keys(events)[i]]),
    isInRange = (el, range) => {
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

module.exports = async (svgPath, icsPath, fileCreatedOn) => {
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
                    typeof curr == "string"
                    && curr.search(/TP/) != -1
                    && curr.search(/\dTP/) == -1
                )), false
            )) {
                evt[0] = 'TP ' + evt[0]; // et dans ce cas là on rajoute 'TP' au début du nom de l'évenement
                // Dans le cas où il y a plusieurs lignes
                if (evt.length == 6) evt[3] = 'TP ' + evt[3];
                if (evt.length == 7) evt[4] = 'TP ' + evt[4];
            }

            if (nextEvt && nextEvt[0] == 'U4-301') { // cas particulier
                icsEvents.push(array2icsJson(evt[0], evt[2], nextEvt[0], startDateAsArray, ({ hours: 1 })));

                icsEvents.push(array2icsJson(
                    "TP " + evt[0],
                    nextEvt[2],
                    nextEvt[3],
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
                    if (evt[1].search(/[- ]...?-...$/) != -1) {
                        // exemple -U4-300
                        icsEvents.push(array2icsJson(
                            evt[0],
                            evt[1] + '\n' + evt[2],
                            evt[1].match(/[- ](...?-...)$/)[1] + '/' + evt[2].match(/[- ](...?-...)$/)[1],
                            startDateAsArray
                        ));
                    } else if (evt[0].search(/CONTR.LE CONTINU/) != -1) {
                        //  Si c'est un contrôle continu
                        icsEvents.push(array2icsJson('CC ' + evt[1], evt[0] + ' de ' + evt[1], evt[2], startDateAsArray));
                    } else {
                        icsEvents.push(array2icsJson(evt[0], evt[1], evt[2], startDateAsArray));
                    }
                }

                // Dans le cas où c'est 3 ou 6 lignes, on considère les 3 premières lignes comme un événement
                traiterEvt(evt);
                // Dans le cas où il y a 6 lignes, on traite les 3 dernières lignes comme un autre événement
                if (evt.length == 6) traiterEvt(evt.slice(3));

            } else if (evt.length == 4 && evt[1] == 'Cours') { // cas particulier
                icsEvents.push(array2icsJson(evt[0], evt[1] + ' ' + evt[2], evt[3], startDateAsArray));
            } else if (evt.length == 5 && evt[0].search('P. Objet') != -1) { // cas particulier
                icsEvents.push(array2icsJson(
                    evt[0],
                    evt[1].match(/^([a-zA-Z0-9 ]*)-/)[1],
                    evt[1].match(/-(.*)/)[1],
                    startDateAsArray
                ));
                icsEvents.push(array2icsJson('TP ' + evt[2], evt[3], evt[4], startDateAsArray));
            } else if (evt.length == 7 && evt[3] == "Amener PC") {
                icsEvents.push(array2icsJson(evt[0], evt[1] + '\n' + evt[3], evt[2], startDateAsArray));
                icsEvents.push(array2icsJson(evt[4], evt[5], evt[6], startDateAsArray));
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
