const logerr = require('./logerr');

module.exports = fieldName => {
    let tmp = process.argv.find(e => e.indexOf(`--${fieldName}=`) != -1);
    return tmp ? tmp.split('=')[1] : tmp;
}