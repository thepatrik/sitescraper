'use strict';
let bluebird = require('bluebird');
const fs = bluebird.promisifyAll(require('fs'));
const async = require('async');
const path = require('path');
const { URL } = require('url');
const utils = require('./utils');

module.exports = class Orchestrator {
    constructor(downloader, filewriter, opts={}) {
        this.downloader = downloader;
        this.writer = filewriter;
        this.logger = opts.logger;
        this.progressbar = opts.progressbar;
        this.rootDir = opts.rootDir;
        this.queue = async.queue(this._worker.bind(this), opts.concurrency);
    }

    push(tasks) {
        this.progressbar.push(tasks.length);
        this.queue.push((tasks), err => {
            this.progressbar.pop();
            if (err) {
                let msg = err.message ? err.message : '';
                msg += err.config ? err.config.url : '';
                this.logger.error(msg);
            }
        });
    }

    _worker(task, done) {
        fs.statAsync(task.file)
            /* This guards for multiple references to the same path */
            .then(() => done())
            .catch(() => {
            /* Pushes a new download task to the priority queue */
            this.downloader.push(task, task.prio, (err, res) => {
                if (err) return done(err);

                if (utils.isParsable(task.mime)) {
                    /* The file is parsable. Try to extract file paths (links) from it, and
                    create new tasks */
                    const tasks = [];
                    const filePaths = utils.parsePaths(res.data, task.url, this.rootDir);
                    filePaths.forEach(filePath => {
                        let mimetype = utils.getMime(filePath);
                        let file = path.join(this.rootDir, filePath);
                        if (new URL(task.url).pathname !== '/') file = path.join(this.rootDir, new URL(filePath, task.url).pathname);

                        tasks.push({
                            mime: mimetype,
                            prio: utils.isParsable(mimetype) ? 1 : 2,
                            url: new URL(filePath, task.url).href,
                            file: file
                        });
                    });
                    this.push(tasks);
                }

                /* Push write task to queue */
                this.writer.push({file: task.file, content: res.data}, err => done(err));
            });
        });
    }
};
