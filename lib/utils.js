'use strict';
const path = require('path');
const mkdirp = require('mkdirp');
const mime = require('mime-types');
const regex = new RegExp(/(?:url\(|<(?:link|script|img)[^>]+(?:src|href)\s*=\s*)(?!['"]?(?:data|http))['"]?([^'"\)\s>]+)/g);

module.exports.parsePaths = (content, base, root) => {
    let matches = content.match(regex);
    const set = new Set();
    for (let i in matches) {
        let filePath = matches[i].match(/url\((.*)|src=(.*)|href=(.*)/).find((el, ix) => ix > 0 && el !== undefined).replace(/["']/g, '').split('?')[0];
        set.add(filePath);
    }
    return Array.from(set);
};

module.exports.mkdirAsync = filePath => {
    const dir = path.dirname(filePath);
    return new Promise((resolve, reject) => {
        mkdirp(dir, err => {
            if (err) return reject(err);
            resolve(dir);
        });
    });
};

module.exports.getMime = file => {
    let mimetype = mime.lookup(file);
    return mimetype ? mimetype : 'text/html';
};

module.exports.isParsable = mimetype => {
    switch (mimetype) {
        case 'text/css':
        case 'text/html':
        case 'application/javascript':
            return true;
        default:
            return false;
    }
};

module.exports.getDate = () => {
    var date = new Date();

    var hour = date.getHours();
    hour = (hour < 10 ? '0' : '') + hour;
    var min  = date.getMinutes();
    min = (min < 10 ? '0' : '') + min;
    var sec  = date.getSeconds();
    sec = (sec < 10 ? '0' : '') + sec;
    var month = date.getMonth() + 1;
    month = (month < 10 ? '0' : '') + month;
    var day  = date.getDate();
    day = (day < 10 ? '0' : '') + day;

    return date.getFullYear() + month + day + '.' + hour + min + sec;
};
