'use strict';
/* jshint -W030 */
let bluebird = require("bluebird");
const fs = bluebird.promisifyAll(require("fs"));
const expect = require('chai').expect;
const utils = require('../lib/utils');
const path = require('path');

describe('Parse tests', () => {
    it('Tests to parse filepaths from html file', done => {
        let htmlPath = path.resolve(__dirname, "data/news.ycombinator.com/index.html");
        fs.readFileAsync(htmlPath, 'utf8').then(data => {
            let paths = utils.parsePaths(data);
            expect(new Set(paths).size).to.equal(6);
            done();
        });
    });
    it('Tests to parse filepaths from css file', done => {
        let cssPath = path.resolve(__dirname, "data/news.ycombinator.com/news.css");
        fs.readFileAsync(cssPath, 'utf8').then(data => {
            let paths = utils.parsePaths(data);
            expect(new Set(paths).size).to.equal(2);
            done();
        });
    });
});
