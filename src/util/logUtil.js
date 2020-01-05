const logUtil = (colorCode, args) => {
    console.log(colorCode, args)
}

module.exports = {
    // colorCode = https://stackoverflow.com/a/41407246/5736301
    logerr: (...args) => {
        // red
        logUtil('\x1b[31m%s\x1b[0m', ['Error: ' + args, ['',...new Error().stack.split('at').splice(2)].join('at')].join('\n    '));
    },
    logwarn: (...args) => {
        // yellow
        logUtil('\x1b[33m%s\x1b[0m', args.join(' '));
    }
};