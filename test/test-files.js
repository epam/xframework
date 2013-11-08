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

  beforeEach(function (done) {
    var deps = [
      '../../app',
      '../../common',
      '../../controller',
      '../../main'
    ];
    helpers.testDirectory(path.join(__dirname, 'temp'), function (err) {
      if (err) {
        done(err);
      }
      xf = helpers.createGenerator('xf:update js');
      done();
    });
  });

  it('should generate lib files', function (done) {
    xf.run({}, function () {
      done();
    });
  });

  it('creates expected files', function (done) {
    var expected = ['js/lib/backbone.js',
                    'js/lib/jquery.js',
                    'js/lib/underscore.js',
                    'Gruntfile.js',
                    'package.json',
                    'js/xf.js',
                    'js/xf.min.js'
                    ];

    xf.run({}, function() {
      helpers.assertFiles(expected);
      done();
    });
  });
});