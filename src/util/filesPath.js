const path = require('path'),
    assetsDirname = __dirname + "/../../assets/";

module.exports = {
    ut3: {
        url: "http://toulouse.miage.fr/tav/EDT%20M1%20S7%2020-21.pdf",
        pdf: path.resolve(assetsDirname + "ut3.pdf"),
        pdf_tmp: path.resolve(assetsDirname + "ut3.tmp.pdf"),
        svg: path.resolve(assetsDirname + "ut3.svg"),
        ics: path.resolve(assetsDirname + "ut3.ics"),
    },
    // Pour trouver ces URL, il faut aller à l'adresse suivante :
    // https://ade-production.ut-capitole.fr/direct/index.jsp?showTree=true&showPianoDays=true&showPianoWeeks=true&showOptions=true&days=0,1,2,3,4,5&displayConfName=Web&projectId=17&login=visu&password=visu&top=top.IFRechercherPlanningconnecte
    // c'est le showOptions=true qui est important pour pouvoir afficher le bouton "Exporter" en bas à gauche
    ut1_fa: {
        url: "https://ade-production.ut-capitole.fr/jsp/custom/modules/plannings/anonymous_cal.jsp?data=8241fc38732002144d480adf1160df25e0fa50826f0818af695b0a09b8713700ec7f554d6ed7ba1b8a72a25d105159e8dee3e8a66a2957ae",
        ics: path.resolve(assetsDirname + "ut1_fa.ics"),
        ics_tmp: path.resolve(assetsDirname + "ut1_fa.tmp.ics"),
    },
    ut1_fi: {
        url: "https://ade-production.ut-capitole.fr/jsp/custom/modules/plannings/anonymous_cal.jsp?data=8241fc3873200214d33b231ffbb6e552e0fa50826f0818af695b0a09b8713700ec7f554d6ed7ba1b8a72a25d105159e8dee3e8a66a2957ae",
        ics: path.resolve(assetsDirname + "ut1_fi.ics"),
        ics_tmp: path.resolve(assetsDirname + "ut1_fi.tmp.ics"),
    },
    indexHtml: path.resolve(assetsDirname + "index.html")
}