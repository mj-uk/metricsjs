metrics = {
};

metrics.create = function (options) {
    var defaultOptions = {
        parent: null,
        histogram: true,
        percentiles: [75, 90, 95, 99, 99],
        minMax: true,
    }
    for (var o in options) {
        defaultOptions[o] = options[o];
    }
    return new metrics._metric(defaultOptions);
}

metrics._metric = function (options) {
    this.value = null;
    this.values = [];
    this.max = null;
    this.min = null;
    this.parent = options.parent;
    this.options = options;
}
metrics._metric.prototype.set = function (v) {
    this._set(v);
    if (this.parent)
        this.parent.set(v);
};
metrics._metric.prototype._set = function (v) {
    this.dirty = true;
    this.value = v;
    this.values.push(v);

    if (this.options.minMax) {
        if (this.max == null)
            this.max = v;

        if (this.min == null)
            this.min = v;

        this.max = Math.max(this.max, v);
        this.min = Math.min(this.min, v);
    }
};
metrics._metric.prototype.increment = function (amount) {
    if (this.value == null)
        this.value = 0;
    if (typeof (amount) === "undefined")
        amount = 1;
    this._set(this.value += amount, false);
    if (this.parent) {
        this.parent.increment(amount);
    }
};
metrics._metric.prototype.decrement = function (amount) {
    if (typeof (amount) === "undefined")
        amount = 1;
    this.increment(amount * -1, false);
};
metrics._metric.prototype.start = function () {
    return new metrics._timerHandle(this);
};
metrics._metric.prototype.read = function () {
    var sum = 0;
    for (var i = 0; i < this.values.length; i++)
        sum += this.values[i];

    var result = { value: this.value };

    if (this.options.minMax) {
        result.min = this.min;
        result.max = this.max;
    }

    if (this.options.histogram) {
        var sorted = this.values.sort(function (a, b) { return a - b });
        result.mean = sum / this.values.length,
        result.median = sorted[Math.round(sorted.length * 0.5) - 1];
        for (var p in this.options.percentiles) {
            var percentile = this.options.percentiles[p];
            var name = "p" + ("" + percentile).replace(".", "");

            if (sorted.length == 0)
                result[name] = null;
            else
                result[name] = sorted[Math.round(sorted.length * (percentile / 100)) - 1];
        }
    }
    return result;
};
metrics._metric.prototype.clear = function () {
    this.value = null;
    this.values = [];
    this.max = null;
    this.min = null;
};

metrics._timerHandle = function (metric) {
    this.metric = metric;
    this.started = Date.now();
};
metrics._timerHandle.prototype.stop = function () {
    this.metric.set(Date.now() - this.started);
};
