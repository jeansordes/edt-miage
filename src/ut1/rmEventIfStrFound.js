const fs = require('fs'),
    logerr = require('../util/logerr');

module.exports = async (ics_filepath, str2find) => {
    await fs.readFile(ics_filepath, 'utf8', (err, data) => {
        if (err) return logerr(err);

        let lines = data.split(`\n`),
            currentEventStartIndex = 0,
            eventShouldBeRemoved = false;
        for (let i = 0; i < lines.length; i++) {
            let line = lines[i];
            if (line.indexOf('BEGIN:VEVENT') != -1) {
                currentEventStartIndex = i;
            } else if (line.indexOf(str2find) != -1) {
                eventShouldBeRemoved = true;
            } else if (line.indexOf('END:VEVENT') != -1 && eventShouldBeRemoved) {
                lines.splice(currentEventStartIndex, i - currentEventStartIndex + 1);
                i = currentEventStartIndex - 1;
                eventShouldBeRemoved = false;
            }
        }

        fs.writeFile(ics_filepath, lines.join("\n"), 'utf8', err => err ? logerr(err) : 0);
    });
}