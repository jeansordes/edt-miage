const path = require('path');

module.exports = {
    ut3: {
        url: "http://toulouse.miage.fr/tav/EDT%20L3%20S5%2019-20.pdf",
        pdf: path.resolve(__dirname + "/../assets/ut3.pdf"),
        pdf_tmp: path.resolve(__dirname + "/../assets/ut3.tmp.pdf"),
        svg: path.resolve(__dirname + "/../assets/ut3.svg"),
        ics: path.resolve(__dirname + "/../assets/ut3.ics"),
    },
    ut1: {
        url: "https://ade-production.ut-capitole.fr/jsp/custom/modules/plannings/anonymous_cal.jsp?data=8241fc3873200214d9a843253b85f468e0fa50826f0818afbbdd69e466d96ba2ec7f554d6ed7ba1b8a72a25d105159e8dee3e8a66a2957ae",
        ics: path.resolve(__dirname + "/../assets/ut1.ics"),
        ics_tmp: path.resolve(__dirname + "/../assets/ut1.tmp.ics"),
    }
}