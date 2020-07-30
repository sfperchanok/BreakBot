// TimeKeeper - class to keep track of time between breaks


class TimeKeeper {
    constructor(callbackFunction) {
        const breakIntervalInMinutes = 7;
        this.breakInterval = breakIntervalInMinutes * 60 * 1000;
        this.timeOfLastBreak = (new Date()).getTime();
        this.callbackFunction = callbackFunction
        this.timerID = null;
    }
    
    getTimeTillNextBreak() {
        const currentTime = (new Date()).getTime();
        const timeDiff = this.breakInterval - Math.abs((this.timeOfLastBreak - currentTime))
        return timeDiff;
    }

    startBreakTimer() {
        this.timerID = setInterval(this.callbackFunction, this.breakInterval);
        this.timeOfLastBreak = (new Date()).getTime();
    }

    clearBreakTimer() {
        clearInterval(this.timerID);
    }
}

module.exports.TimeKeeper = TimeKeeper;