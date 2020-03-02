/**
 * TODO LIST pour quand le PDF change :
 * Ouvrir Inkscape, faire ctrl+maj+D puis tout en haut à droite mettre PT au lieux de PX
 * Ensuite, mettre des guides horizontaux et verticaux là où il faut
 * Puis, mettre à jour les valeurs de :
 * - week2days,
 * - svgDatesX,
 * - svgDatesY,
 * - Facultatif : rangeY (seulement si l'emploi du temps ne se fait plus du lundi au mercredi)
 * Et enfin, gérer les cas non standards dans le fichier "src/ut3/txt2ics.js"
 * TIPS : après un premier lancement "online", tu peux te contenter de lancer le server en mode "offline"
 * et ainsi éviter de faire tout le processus de conversion du PDF vers le SVG qui prend longtemps
 * (idéal pour développer rapidement tes fonctions qui gèrent les évenements non standards)
 */

const week2days = {
    // week numbers
    3: [
        [2020, 1, 13],
        [2020, 1, 14],
        [2020, 1, 15]
    ],
    4: [
        [2020, 1, 20],
        [2020, 1, 21],
        [2020, 1, 22]
    ],
    5: [
        [2020, 1, 27],
        [2020, 1, 28],
        [2020, 1, 29]
    ],
    6: [
        [2020, 2, 3],
        [2020, 2, 4],
        [2020, 2, 5]
    ],
    7: [
        [2020, 2, 10],
        [2020, 2, 11],
        [2020, 2, 12]
    ],
    9: [
        [2020, 2, 24],
        [2020, 2, 25],
        [2020, 2, 26]
    ],
    10: [
        [2020, 3, 2],
        [2020, 3, 3],
        [2020, 3, 4]
    ],
    11: [
        [2020, 3, 9],
        [2020, 3, 10],
        [2020, 3, 11]
    ],
    12: [
        [2020, 3, 16],
        [2020, 3, 17],
        [2020, 3, 18]
    ],
    13: [
        [2020, 3, 23],
        [2020, 3, 24],
        [2020, 3, 25]
    ],
    19: [
        [2020, 5, 4],
        [2020, 5, 5],
        [2020, 5, 6]
    ],
    20: [
        [2020, 5, 11],
        [2020, 5, 12],
        [2020, 5, 13]
    ],
    21: [
        [2020, 5, 18],
        [2020, 5, 19],
        [2020, 5, 20]
    ],
    23: [
        [2020, 6, 1],
        [2020, 6, 2],
        [2020, 6, 3]
    ],
}
const svgDatesX = {
    // week number that is ended on this line
    43: null,
    89: 3,
    135: 4,
    180: 5,
    226: 6,
    272: 7,
    336: 9,
    382: 10,
    427: 11,
    473: 12,
    519: 13,
    653: 19,
    699: 20,
    745: 21,
    808: 23,
};
const svgDatesY = {
    // weekday (0 monday, 1 tuesday, 2 wednesday), starting hour, starting minute
    524: [0, 7, 45],
    494: [0, 10, 0],
    468: [0, 12, 0],
    464: [0, 13, 30],
    433: [0, 15, 45],
    395: [0, 18, 0],
    369: [0, 20, 0],

    350: [1, 7, 45],
    323: [1, 10, 0],
    296: [1, 12, 0],
    292: [1, 13, 30],
    261: [1, 15, 45],
    230: [1, 18, 0],
    203: [1, 20, 0],

    185: [2, 7, 45],
    159: [2, 10, 0],
    131: [2, 12, 0],
};
/**
 * Range for each dates / hours
 */
// ⚠ Pour YKeys c'est parce que les clés sont triés par ordre croissant,
// c'est à dire les dernières clés jusqu'aux premières
let svgKeys = Object.keys(svgDatesY);
const rangeY = [
    [svgKeys[0], svgKeys[2]],
    [svgKeys[3], svgKeys[9]],
    [svgKeys[10], svgKeys[16]]
];
svgKeys = Object.keys(svgDatesX);
const rangeX = [svgKeys[0], svgKeys[svgKeys.length - 1]];

module.exports = {
    week2days,
    svgDatesX,
    svgDatesY,
    rangeX,
    rangeY
}