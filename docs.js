var md = require("node-markdown").Markdown,
    fs = require('fs'),
    splitReg = new RegExp(/\n{1}#{1}[\s]{1}[^\n]{1,}/ig);

console.log('\033[2J\033[39m\x1b[1mCreating documentation:\n');

var DOCFILE = '\n' + fs.readFileSync('./text.md', 'utf8', function (err) {

    if (err) {
        throw err;
        return;
    }
});

var docsRow = DOCFILE.split(splitReg);
var docsHeaders = DOCFILE.match(splitReg);

for (var i_ in docsHeaders) {

    var i = parseFloat(i_),
        text = md(docsHeaders[i] + docsRow[i+1]),
        fileName = docsHeaders[i].replace('# ', '')
                                .replace(/[&\/\\,+()$~%.'":*?<>{}\s]/g, '_')
                                .replace('_', '').toLowerCase();

    fs.writeFile('./docs/' + fileName + '.html', text);
    console.log('\x1b[0m\033[32m* \033[39m\x1b[1mFile ./docs/' + fileName + '.html created');
}

console.log('\nDone!\n');

return;