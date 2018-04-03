'use strict';
const app = require('./lib/app');
const argv = require('yargs').argv;
const host = argv.host ? argv.host : process.env.HOST;
if (!host) {
    console.log('No host found!');
    console.log('Usage: node . --host=<host> [--output=<directory>] [--networkconcurrency=<integer>]');
    return;
}

const concurrency = Object.freeze({
    /* HTTP1.1 golden standard for max connections per host? 6? */
    downloader: argv.networkconcurrency ? argv.networkconcurrency : 6,
    writer: 10,
    orchestrator: 100
});

app.main(host, concurrency, argv.output);
