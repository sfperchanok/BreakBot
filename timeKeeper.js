// TimeKeeper - class to keep track of time between breaks


class TimeKeeper {
    constructor() {
        const breakIntervalInMinutes = 7;
        this.breakInterval = breakIntervalInMinutes * 60 * 1000;
        this.timeOfLastBreak = (new Date()).getTime();
    }
    
    getTimeTillNextBreak() {
        const currentTime = (new Date()).getTime();
        const timeDiff = Math.abs(this.timeOfLastBreak + this.breakInterval - currentTime)
        return timeDiff;
    }
}

module.exports.TimeKeeper = TimeKeeper;