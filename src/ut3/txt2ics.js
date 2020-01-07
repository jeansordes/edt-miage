const ics = require('ics'),
    dateformat = require('dateformat'),
    fs = require('fs'),
    { warnAdmin } = require('../util/mail'),
    { logerr, logwarn } = require('../util/logUtil');

// util
const logEvt = (events, i) => console.log(Object.keys(events)[i], events[Object.keys(events)[i]]);

module.exports = async (events, icsPath, fileCreatedOn) => {
    let icsEvents = [];
    const array2icsJson = (title, desc, location, start, duration) => ({
        title,
        description: desc + `\n\nExporté le : ` + dateformat(fileCreatedOn, "dd/mm/yyyy 'à' HH'h'MM"),
        location,
        start,
        duration: (duration ? duration : ({ hours: 2 }))
    });
    let nbEventsFailed = 0; // nombre d'events qui n'ont pas été traités correctement
    for (let i = 0; i < Object.keys(events).length; i++) {
        const evt = [...events[Object.keys(events)[i]]];
        let startDate = new Date(Object.keys(events)[i]);
        let startDateAsArray = [
            startDate.getFullYear(),
            startDate.getMonth() + 1, // because January == 0 in JS, and the framework set January == 1
            startDate.getDate(),
            startDate.getHours() + 1, // because of timezone
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

        const tpRegex = /^(TP\d).*(..-...)$/; // https://regex101.com/r/tPdeuo/1
        const traiterEvt = evt => {
            // vérifier si c'est un TP avec 2 salles différentes
            if (tpRegex.test(evt[1]) && tpRegex.test(evt[2])) {
                evt.slice(1).forEach(res => {
                    res = res.match(tpRegex);
                    icsEvents.push(array2icsJson(
                        `${evt[0]} (${res[1]})`,
                        res[0],
                        res[2],
                        startDateAsArray
                    ));
                })
            } else if (/TD[12]/.test(evt[1])) {
                // vérifier si c'est pour un groupe de TD en particulier
                icsEvents.push(array2icsJson(evt[0] + ' (' + evt[1] + ')', evt[1], evt[2], startDateAsArray));
            } else {
                icsEvents.push(array2icsJson(evt[0], evt[1], evt[2], startDateAsArray));
            }
        }
        /************************
         * SEANCES DE 4H DE BDD *
         ************************/
        if (evt[0] == "Base de données") {
            const roomRegex = /(..-...?)$/;
            icsEvents.push(array2icsJson(
                evt[0],
                evt[2],
                (roomRegex.test(evt[2]) ? evt[2].match(roomRegex)[1] : nextEvt[0]),
                startDateAsArray,
                ({ hours: 1 })
            ));

            icsEvents.push(array2icsJson(
                "TP " + evt[0],
                nextEvt[2], // à revoir
                nextEvt[nextEvt.length - 1], // à revoir
                ([
                    startDate.getFullYear(),
                    startDate.getMonth() + 1, // January == 0 in JS, but the Framework set January == 1
                    startDate.getDate(),
                    startDate.getHours() + 2, // timezone adjustment (+1) and we add 1 hours on the top of that (thus +2)
                    startDate.getMinutes()
                ]),
                ({ hours: 3, minutes: 10 })
            ));
            i++;
        } else if (evt.length == 3 || evt.length == 6) {
            // EVENEMENTS NORMAUX (3 ou 6 lignes)
            // Dans le cas où c'est 3 ou 6 lignes, on considère les 3 premières lignes comme un événement
            traiterEvt(evt.slice(0, 3));
            // Dans le cas où il y a 6 lignes, on traite les 3 dernières lignes comme un autre événement
            if (evt.length == 6) traiterEvt(evt.slice(3));

            /*************************************
             * ***********************************
             * DEBUT DES EVENEMENTS PARTICULIERS *
             * ***********************************
             *************************************/
        } else if (evt.length == 4 && evt[1] == 'Cours') {
            traiterEvt([evt[0], evt[1] + ' ' + evt[2], evt[3]]);
        } else if (evt.length == 4 && evt[0] == '09h00-12h00') {
            icsEvents.push(array2icsJson(
                `${evt[1]} (${evt[2]})`,
                nextEvt[2],
                nextEvt[3],
                [
                    startDate.getFullYear(),
                    startDate.getMonth() + 1, // January == 0 in JS, but the Framework set January == 1
                    startDate.getDate(),
                    9,
                    0
                ],
                { hours: 3 }
            ));
        } else if (evt.length == 4 && evt[2] == 'SOUTENANCE') {
            traiterEvt([`${evt[0]} (${evt[2]})`, evt[1], evt[3]]);
        } else if (evt.length == 4 && evt.every((val, i) => val === ['Projet', 'TD2 RDV', 'Outils stat.', 'TD1 -U4-300'][i])) {
            // Evenement qui va sans doute être mis à jour
            traiterEvt(['Projet (TD2)', '', '']);
            traiterEvt(['Outils stat. (TD1)', '', 'U4-300']);
        } else if (evt.length == 4 && evt[3] == 'bis') {
            traiterEvt(evt.slice(0, -1));
        } else if (evt[0] == '09h00-12h00' && nextEvt[1] == 'TD1 Client RDV') {
            icsEvents.push(array2icsJson(
                `${evt[1]} (TD1 Client RDV)`,
                '',
                evt[3],
                [
                    startDate.getFullYear(),
                    startDate.getMonth() + 1, // January == 0 in JS, but the Framework set January == 1
                    startDate.getDate(),
                    13,
                    30
                ],
                { hours: 3 }
            ));
        } else if (evt.includes("AOC Examen FI")) {
            traiterEvt(evt.slice(0, 3));
            traiterEvt([evt[3], '', evt[4]]);
        } else if (evt.length == 2) {
            traiterEvt([evt[0], '', evt[1]]);
        } else if (evt.length == 5) {
            traiterEvt(evt.slice(0, 3));
            traiterEvt(evt.slice(-2));
        } else if (evt[0] == 'AW Validation FA') {
            traiterEvt([evt[0], '', '']);
        } else if (evt[0] == '9h - 12h' && nextEvt[0] == 'Projet') {
            icsEvents.push(array2icsJson(
                `${nextEvt[0]} (${nextEvt[1].match(/^(TD[12])/)[1]})`,
                nextEvt[1],
                nextEvt[2],
                [
                    startDate.getFullYear(),
                    startDate.getMonth() + 1, // January == 0 in JS, but the Framework set January == 1
                    startDate.getDate(),
                    9,
                    0
                ],
                { hours: 3 }
            ));
            /***********************************
             * *********************************
             * FIN DES EVENEMENTS PARTICULIERS *
             * *********************************
             ***********************************/
        } else if ((new Date(Object.keys(events)[i])).getTime() < (new Date()).getTime()) {
            // si l'évenement est déjà passé, ne pas traiter, not worth the time
        } else {
            // Prévenir l'admin qu'il y a un soucis !
            nbEventsFailed++;
            logEvt(events, i);
        }
    }
    if (nbEventsFailed > 0) {
        warnAdmin(
            nbEventsFailed + (nbEventsFailed > 1 ? ` évenements ont échoué à êtres traités` : ` évenement a échoué à être traité`),
            'Bouge tes fesses, allez go go go'
        );
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
};