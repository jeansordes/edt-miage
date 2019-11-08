/**
 * TODO LIST pour quand le PDF change :
 * Ouvrir Inkscape, faire ctrl+maj+D puis tout en haut à droite mettre PT au lieux de PX
 * Ensuite, mettre des guides horizontaux et verticaux là où il faut
 * Et enfin, vérifier les valeurs de :
 * - week2days,
 * - svgDatesX,
 * - svgDatesY
 * - rangeY
 */

const week2days = {
    45: [[2019, 11, 4], [2019, 11, 5], [2019, 11, 6]],
    46: [[2019, 11, 11], [2019, 11, 12], [2019, 11, 13]],
    47: [[2019, 11, 18], [2019, 11, 19], [2019, 11, 20]],
    48: [[2019, 11, 25], [2019, 11, 26], [2019, 11, 27]],
    49: [[2019, 12, 2], [2019, 12, 3], [2019, 12, 4]],
    50: [[2019, 12, 9], [2019, 12, 10], [2019, 12, 11]],
    51: [[2019, 12, 16], [2019, 12, 17], [2019, 12, 18]],
}
const svgDatesX = {
    47: null,
    109: 45,
    188: 46,
    259: 47,
    339: 48,
    424: 49,
    506: 50,
    572: 51,
};
const svgDatesY = {
    // weekday (0 monday, 1 tuesday, 2 wednesday), starting hour, starting minute
    795: [0, 7, 55],
    756: [0, 10, 5],
    711: [0, 12, 5],
    703: [0, 13, 40],
    653: [0, 15, 50],
    605: [0, 18, 0],
    565: [0, 20, 0],

    540: [1, 7, 55],
    478: [1, 10, 5],
    419: [1, 12, 5],
    413: [1, 13, 40],
    376: [1, 15, 50],
    326: [1, 18, 0],
    288: [1, 20, 0],

    262: [2, 7, 55],
    217: [2, 10, 5],
    150: [2, 12, 5],
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