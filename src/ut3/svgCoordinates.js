const dateformat = require('dateformat');
/**
 * TODO LIST pour quand le PDF change :
 * Ouvrir Inkscape, faire ctrl+maj+D puis tout en haut à droite mettre PT au lieux de PX
 * Ensuite, mettre des guides horizontaux et verticaux là où il faut
 * Puis, mettre à jour les valeurs de :
 * - firstDayOfCalendar,
 * - lastDayOfCalendar,
 * - daysOfTheWeek,
 * - svgDatesX,
 * - svgDatesY, ATTENTION POUR CELUI LA :
 *          il se peut qu'il y ait une manipulation supplémentaire à faire
 *          (je ne sais pas pourquoi) il se peut que l'axe soit inversé,
 *          et dans ce cas il faudra mettre reverseYAxis = true
 * Et enfin, gérer les cas non standards dans le fichier "src/ut3/txt2ics.js"
 * TIPS : après un premier lancement "online", tu peux te contenter de lancer le server en mode "offline"
 * et ainsi éviter de faire tout le processus de conversion du PDF vers le SVG qui prend longtemps
 * (idéal pour développer rapidement tes fonctions qui gèrent les évenements non standards)
 */

const firstDayOfCalendar = new Date("2020-09-09");
const lastDayOfCalendar = new Date("2021-01-11");
const daysOfTheWeek = [2, 3, 4]; // 0 lundi, 1 mardi, 2 mercredi, 3 jeudi, 4 vendredi, 5 samedi, 7 dimanche

const svgDatesX = {
    // week number that is ended on this line
    45: null,
    103: 37,
    160: 38,
    217: 39,
    275: 40,
    332: 41,
    394: 42,
    419: 43,
    444: 44,
    487: 45,
    542: 46,
    600: 47,
    657: 48,
    714: 49,
    772: 50,
    830: 51,
    854: 52,
    880: 53,
    930: 1,
};
const svgDatesY = {
    // weekday (0 lundi, 1 mardi, 2 mercredi, 3 jeudi, 4 vendredi), starting hour, starting minute
    720: [2, 7, 45],
    685: [2, 10, 0],
    631: [2, 12, 0],
    623: [2, 13, 45],
    579: [2, 16, 0],
    538: [2, 18, 15],
    512: [2, 20, 15],

    496: [3, 7, 45],
    453: [3, 10, 0],
    417: [3, 12, 0],
    409: [3, 13, 45],
    315: [3, 16, 0],
    246: [3, 18, 15],
    216: [3, 20, 15],

    200: [4, 13, 45],
    143: [4, 16, 0],
    86: [4, 18, 15],
    68: [4, 20, 15],
};
const reverseYAxis = false;

// week2days
let tmpDate = firstDayOfCalendar;
let week2days = {},
    lastWeek = parseInt(dateformat(lastDayOfCalendar, "W"));
for (let i = parseInt(dateformat(tmpDate, "W")); i != lastWeek; i = parseInt(dateformat(tmpDate, "W"))) {
    week2days[i] = [];
    for (let j = parseInt(dateformat(tmpDate, 'N')) - 1; j < 7; j++) {
        if (daysOfTheWeek.includes(j)) {
            week2days[i].push([
                tmpDate.getFullYear(),
                tmpDate.getMonth() + 1, // because January == 0 in JS, and the framework set January == 1
                tmpDate.getDate()
            ]);
        }
        tmpDate.setDate(tmpDate.getDate() + 1);
    }
}

module.exports = {
    week2days,
    svgDatesX,
    svgDatesY,
    reverseYAxis,
    daysOfTheWeek,
}