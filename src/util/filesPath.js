const path = require('path'),
    assetsDirname = __dirname + "/../../assets/";

module.exports = {
    ut3: {
        url: "http://toulouse.miage.fr/tav/EDT%20L3%20S6%2019-20.pdf",
        pdf: path.resolve(assetsDirname + "ut3.pdf"),
        pdf_tmp: path.resolve(assetsDirname + "ut3.tmp.pdf"),
        svg: path.resolve(assetsDirname + "ut3.svg"),
        ics: path.resolve(assetsDirname + "ut3.ics"),
    },
    ut1: {
        url: "https://ade-production.ut-capitole.fr/jsp/custom/modules/plannings/anonymous_cal.jsp?data=8241fc3873200214d9a843253b85f468e0fa50826f0818afbbdd69e466d96ba2ec7f554d6ed7ba1b8a72a25d105159e8dee3e8a66a2957ae",
        ics: path.resolve(assetsDirname + "ut1.ics"),
        ics_tmp: path.resolve(assetsDirname + "ut1.tmp.ics"),
    },
    indexHtml: path.resolve(assetsDirname + "index.html")
}