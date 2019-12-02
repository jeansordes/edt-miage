const logerr = require('./logerr');

module.exports = {
    printUsage: () => {
        console.log('\x1b[36m%s\x1b[0m', `Usage: node index.js
    --serverUrl="https://exemple.com"
    --googleAdminEmailAdress="john.doe@google.com"
    --googlePassword="mot de passe"
    [-f | --forceRefresh]`);
    },
    getArgvValue: fieldName => {
        let tmp = process.argv.find(e => e.match(`--?${fieldName}(=.*)?$`));
        return {
            argFound: typeof tmp == 'string',
            string: (typeof tmp == 'string' ? tmp.split('=')[1] : '')
        };
    }
}