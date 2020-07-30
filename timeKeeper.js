// TimeKeeper - class to keep track of time between breaks


class TimeKeeper {
    constructor(callbackFunction) {
        const breakIntervalInMinutes = 7;
        this.breakInterval = breakIntervalInMinutes * 60 * 1000;
        this.timeOfLastBreak = (new Date()).getTime();
        this.callbackFunction = callbackFunction
    }
    
    getTimeTillNextBreak() {
        const currentTime = (new Date()).getTime();
        const timeDiff = Math.abs(this.timeOfLastBreak + this.breakInterval - currentTime)
        return timeDiff;
    }

    startBreakTimer() {
        setInterval(this.callbackFunction, this.breakInterval);
    }

    clearBreakTimer() {
        clearInterval();
    }
}

module.exports.TimeKeeper = TimeKeeper;