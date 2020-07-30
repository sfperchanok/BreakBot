// TimeKeeper - class to keep track of time between breaks


class TimeKeeper {
    constructor() {
        this.breakInterval = 5000;
        this.timeOfLastBreak = (new Date()).getTime();
    }
    
    getTimeTillNextBreak() {
        const currentTime = (new Date()).getTime();
        const timeDiff = Math.abs(this.timeOfLastBreak + this.breakInterval - currentTime)
        return timeDiff;
    }
}

module.exports.TimeKeeper = TimeKeeper;