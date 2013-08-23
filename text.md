# X-Framework Generator


## Getting started
- Make sure you have [yeoman](https://github.com/yeoman/yo) installed:
    `npm install -g yo`
- Install the generator: `npm install -g generator-xf`
- Run: `yo xf`. It will download last versions of X-Framework, jQuery, Backbone and Underscore and run [Build](#build).

## Subgenerators
XF generator has some subgenerators.

### Update
Allows you to update sources and run [Build](#build). Can use parameters:

- `yo xf:update [all]` — update less and js files of X-Framework, check latest versions of jQuery, Backbone, Underscore
- `yo xf:update js` — update js files (inluding thirdparty libraries) of X-Framework, check latest versions of jQuery, Backbone, Underscore
- `yo xf:update css` — update less files of X-Framework

### Build
Allows you to build xf.js and xf.min js. Can use parameters:

- `yo xf:build` — create build with all [UI](https://github.com/epam/x-framework/tree/master/xf/ui) elements
- `yo xf:build button:fieldset` — create build 'button' and 'fieldset' elements.

Full list of available elements can be found at [xf/ui](https://github.com/epam/x-framework/tree/master/xf/ui) directory of X-Framework.

## License
[MIT License](http://en.wikipedia.org/wiki/MIT_License)

# DEPRECATION NOTICE!

This project is deprecated in favor of [chjj/marked](https://github.com/chjj/marked). I never created the parser myself, the module was created in the early days of node as a wrapper for an existing browser based parser [Showdown](http://attacklab.net/showdown/) so if you are using this module and have problems with the parsing logic, I can't help you much as I'm not familiar with the inner details.

Pull requests are still welcomed - if you find a bug and fix it, then I'll pull the change in but I won't be fixing the bugs myself. Sorry for that.

node-markdown
=============

**node-markdown** is based on [Showdown](http://attacklab.net/showdown/) parser and is meant to parse [Markdown](http://daringfireball.net/projects/markdown/) syntax into HTML code.

Installation
------------

Use `npm` package manager

    npm install node-markdown

Usage
-----

Include Markdown parser

    var md = require("node-markdown").Markdown;

Parse Markdown syntax into HTML

    var html = md("**markdown** string");

Allow only [default set](http://github.com/andris9/node-markdown/blob/master/lib/markdown.js#L38) of HTML tags to be used

    var html = md("**markdown** string", true);

Allow only specified HTML tags to be used (default set of allowed attributes is used)

    var html = md("**markdown** string", true, "p|strong|span");

Allow specified HTML tags and specified attributes

    var html = md("**markdown** string", true, "p|strong|span", {
        "a":"href",        // 'href' for links
        "*":"title|style"  // 'title' and 'style' for all
    });

Complete example

    var md_text = "**bold** *italic* [link](http://www.neti.ee) `code block`",
        md_parser = require("node-markdown").Markdown;

    // simple
    console.log(md_parser(md_text));

    // limit HTML tags and attributes
    console.log(md_parser(md_text, true, 'h1|p|span'));

    // limit HTML tags and keep attributes for allowed tags
    var allowedTags = 'a|img';
        allowedAttributes = {
            'a':'href|style',
            'img': 'src',
            '*': 'title'
        }
    console.log(md_parser(md_text, true, allowedTags, allowedAttributes));