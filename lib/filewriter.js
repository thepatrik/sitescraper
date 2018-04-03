'use strict';
const async = require('async');
let bluebird = require('bluebird');
const fs = bluebird.promisifyAll(require('fs'));
const utils = require('./utils');

module.exports = class FileWriter {
    constructor(opts={}) {
        this.progressbar = opts.progressbar;
        this.logger = opts.logger;
        this.queue = async.queue(this._worker.bind(this), opts.concurrency);
    }

    push(tasks, callback) {
        this.queue.push(tasks, callback);
    }

    _worker(task, done) {
        utils.mkdirAsync(task.file).then(() => {
            this.logger.info('Writing file', task.file + '...');
            this.progressbar.tick();
            fs.writeFileAsync(task.file, task.content).then(() => {
                this.progressbar.tick(-1);
                this.logger.info('Wrote file', task.file, 'to disk');
                done();
            }).catch(err => {
                this.progressbar.tick(-1);
                done(err);
            });
        }).catch(err => done(err));
    }
};
