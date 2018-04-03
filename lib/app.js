'use strict';
const { URL } = require('url');
const path = require('path');
const utils = require('./utils');
const ProgressBar = require('./progress');
const Downloader = require('./downloader');
const FileWriter = require('./filewriter');
const Orchestrator = require('./orchestrator');

module.exports.main = (host, concurrency, dir='./data/') => {
    /* Setup logger */
    const logger = require('winston');
    logger.add(logger.transports.File, {filename: 'debug.log'});
    logger.remove(logger.transports.Console);

    /* Creates file writer worker */
    let wOpts = {
        logger: logger,
        progressbar: new ProgressBar({
            schema: '╢:bar╟ Concurrent file writes :current/:total :percent',
            total: concurrency.writer
        }),
        concurrency: concurrency.writer
    };
    const writer = new FileWriter(wOpts);

    /* Creates downloader worker */
    let dOpts = {
        logger: logger,
        progressbar: new ProgressBar({
            schema: '╢:bar╟ Concurrent downloads :current/:total :percent',
            total: concurrency.downloader
        }),
        concurrency: concurrency.downloader
    };
    const downloader = new Downloader(dOpts);

    /* Creates orchestrator worker */
    if (!path.isAbsolute(dir)) dir = path.resolve(dir);
    const rootDir = path.join(dir, new URL(host).hostname + '_' + utils.getDate());

    let opts = {
        logger: logger,
        progressbar: new ProgressBar(),
        rootDir: rootDir,
        concurrency: concurrency.orchestrator
    };
    const orchestrator = new Orchestrator(downloader, writer, opts);

    let msg1 = 'Scraping contents from ' + host + '...';
    let msg2 = 'Writing files to ' + rootDir;
    console.log(msg1, '\n' + msg2, '\n');
    logger.info(msg1);
    logger.info(msg2);

    /* Push the initial task(s) */
    const pathname = new URL(host).pathname.slice(-1) === '/' ? 'index.html' : new URL(host).pathname;
    const file = path.join(rootDir, pathname);
    const tasks = [{
        url: host,
        file: file,
        mime: utils.getMime(file)
    }];

    orchestrator.push(tasks);
};
