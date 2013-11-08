/*global describe, before, it, beforeEach */
'use strict';
var fs = require('fs');
var assert = require('assert');
var path = require('path');
var util = require('util');
var generators = require('yeoman-generator');
var helpers = require('yeoman-generator').test;
var _ = require('underscore.string');

describe('XF generator', function () {
  var xf;

  it('created libraries', function (done) {
    var expected = ['js/lib/backbone.js',
                    'js/lib/jquery.js',
                    'js/lib/underscore.js'
                    ];
    helpers.assertFiles(expected);
    done();
  });
  
  it('created xf scripts', function (done) {
    var expected = ['js/xf.js',
                    'js/xf.min.js'
                    ];
    helpers.assertFiles(expected);
    done();
  });
  
  it('created xf styles', function (done) {
    var expected = ['styles/xf.css','styles/xf.min.css'];
    helpers.assertFiles(expected);
    done();
  });
});