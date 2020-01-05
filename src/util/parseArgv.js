const { logerr } = require('./logUtil');

module.exports = {
    printUsage: () => {
        console.log('\x1b[36m%s\x1b[0m', 'Usage:\n\t'
            + 'node index.js --offline (use only the files already downloaded, only for dev purposes)' + '\n\t'
            + 'node index.js --prodServerURL="https://edt.miage.online" --mailHostAdress="smtp.server.fr" --mailHostPort="587" --personToContact="john@doe.fr" --emailLogin="user.name" --emailPassword="password"\n\n'
            + 'Options : [--ut3pdf2svg : force le script a regénérer le fichier SVG à partir du fichier PDF de l\'UT3]');
    },
    getArgvValue: fieldName => {
        let tmp = process.argv.find(e => e.match(`--?${fieldName}(=.*)?$`));
        return {
            argFound: typeof tmp == 'string',
            string: (typeof tmp == 'string' ? tmp.split('=')[1] : '')
        };
    }
}