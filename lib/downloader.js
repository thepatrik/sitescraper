'use strict';
const async = require('async');
const axios = require('axios');

module.exports = class Downloader {
    constructor(opts={}) {
        this.progressbar = opts.progressbar;
        this.logger = opts.logger;
        this.queue = async.priorityQueue(this._worker.bind(this), opts.concurrency);
    }

    push(tasks, prio, callback) {
        this.queue.push(tasks, prio, callback);
    }

    _worker(task, done) {
        this.progressbar.tick(1);
        this.logger.info('Downloading url', task.url + '...');
        const responseType = task.mime.split('/')[0] === 'image' ? 'arraybuffer' : 'text';
        axios.get(task.url, {responseType: responseType}).then(res => {
            this.logger.info('Downloaded url', task.url);
            this.progressbar.tick(-1);
            done(false, {data: responseType === 'text' && typeof res.data === 'object' ? JSON.stringify(res.data) : res.data});
        }).catch(err => {
            this.progressbar.tick(-1);
            done(err);
        });
    }
};
