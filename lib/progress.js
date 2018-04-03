'use strict';
const pb = require('ascii-progress');

module.exports = class ProgressBar {
    constructor(opts={}) {
        this.bar = new pb({
            schema: opts.schema ? opts.schema : '╢:bar╟ Overall :current/:total :percent :elapseds :etas',
            total: opts.total
        });
        this.progress = {
            current: 0,
            pushed: 0,
            processed: 0,
            percentage: 0.0
        };
    }

    tick(delta) {
        this.bar.tick(delta);
    }

    push(numOfTasks=1) {
        this.progress.current += numOfTasks;
        this.progress.pushed += numOfTasks;
        this.bar.total = this.progress.pushed;
    }

    pop() {
        this.progress.current--;
        this.progress.processed++;
        this.bar.current = this.progress.processed;
        this.progress.percentage = this.progress.processed/this.progress.pushed > this.progress.percentage ? this.progress.processed/this.progress.pushed : this.progress.percentage;
        this.bar.update(this.progress.percentage);
    }
};
