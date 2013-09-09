var md = require("node-markdown").Markdown,
    fs = require('fs'),
    splitReg = new RegExp(/\n{1}#{1}[\s]{1}[^\n]{1,}/ig)
    splitReg_ = new RegExp(/\n{1}#{1}#{1}[\s]{1}[^\n]{1,}/ig);

console.log('\033[2J\033[39m\x1b[1mCreating documentation:\n');

var DOCFILE = '\n' + fs.readFileSync('./README.md', 'utf8', function (err) {

    if (err) {
        throw err;
        return;
    }
});

var docsDivRow = DOCFILE.split(splitReg);
var docsDividers = DOCFILE.match(splitReg);

fs.writeFileSync('./mocks/menu.json', '{\n');

for (var i_ in docsDividers) {

    var i = parseFloat(i_);

    var docsRow = docsDivRow[i].split(splitReg_);
    var docsHeaders = docsDivRow[i].match(splitReg_);

    for (var x_ in docsHeaders) {

        var x = parseFloat(x_);

        var text = md(docsHeaders[x] + docsRow[x+1]),
            fileName = docsHeaders[x].replace('## ', '')
                                    .replace(/[&\/\\,+()$~%.'":*?<>{}\s]/g, '_')
                                    .replace('_', '').toLowerCase();

        if (x === 0) {
            var divName_ = docsDividers[i].replace('# ', '')
                        .replace(/[&\/\\,+()$~%.'":*?<>{}\s]/g, '_')
                        .replace('_', '').toLowerCase(),
                divName = docsDividers[i].replace('\n# ', '');

            fs.appendFileSync('./mocks/menu.json', '"'+divName_+'": {\n\
                "title": 	"'+divName+'",\n\
                "url":		"'+fileName+'",\n\
                "isHeader":	true\n\
            },\n');
        }

        var docName = docsHeaders[x].replace('\n## ', '');

        fs.appendFileSync('./mocks/menu.json', '"'+fileName+'": {\n\
            "title": 	"'+docName+'",\n\
            "url":		"'+fileName+'"\n\
        }');

//        if (x < docsHeaders.length - 1 && i < docsDividers.length - 1) {
            fs.appendFileSync('./mocks/menu.json', ',\n');
//        } else {
//            fs.appendFileSync('./mocks/menu.json', '\n');
//        }

        fs.writeFile('./docs/' + fileName + '.html', text);
        console.log('\x1b[0m\033[32m* \033[39m\x1b[1mFile ./docs/' + fileName + '.html created');
    }
}

fs.appendFileSync('./mocks/menu.json', '\n}');

console.log('\nDone!\n');

return;