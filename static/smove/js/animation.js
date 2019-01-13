Animation = function (options) {
    var ani = new Object();
    if (typeof (options) !== "object")
        options = {};
    ani.duration = Animation.defaultDuration;
    ani.delay = ~~options.delay;
    if (typeof (options.duration) === "number")
        ani.duration = options.duration;
    ani.startValue = 0;
    if (typeof (options.startValue) !== "undefined")
        ani.startValue = options.startValue;
    ani.keyFrames = options.keyFrames;
    ani.endValue = 1;
    if (typeof (options.endValue) !== "undefined")
        ani.endValue = options.endValue;
    ani.callback = options.callback;
    ani.onEnd = options.onEnd;
    ani.forever = options.forever || false;
    ani.curve = Animation.Linear;
    if (typeof (options.curve) === "function")
        ani.curve = options.curve;

    ani.start = function (selfTimer = true) {
        this.startTime = Date.now();
        if (selfTimer)
            this.timerId = setInterval(this.update.bind(this), 10);
    }

    ani.update = function () {
        if (Date.now() - this.startTime <= this.delay)
            return;
        var progress = (Date.now() - this.startTime - this.delay) / this.duration;
        if (this.forever)
            progress %= 1;
        if (progress >= 1)
            return this.end();
        this.callback(ani.startValue + (ani.endValue - ani.startValue) * this.curve(progress));
        return true;
    }

    ani.end = function () {
        this.callback(this.endValue);
        if (typeof (this.onEnd) === "function")
            this.onEnd();
        clearInterval(this.timerId);
        return false;
    }

    if (!options.startLater)
        ani.start();
    return ani;
}

Animation.Linear = x => x;
Animation.SquareOut = x => x * (2 - x);
Animation.defaultDuration = 40;
