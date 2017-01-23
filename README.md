# metricsjs

Examples
  var log = function (x) { console.log(JSON.stringify(x)); };

  /* counter */
  var counter1 = metrics.create({ histogram: false });
  counter1.increment();
  counter1.increment(3);
  counter1.decrement(7);
  log(counter1.read());               // {"value":-3,"min":-3,"max":4}

  /* histogram */
  var histogram = metrics.create();
  histogram.set(100, "test");
  histogram.set(75, "ewhjgsdfg");
  histogram.set(125);
  log(histogram.read());              // {"value":125,"mean":100,"median":100,"p75":100,"p90":125,"p95":125,"p99":125}

  histogram.clear();
  log(histogram.read());              // {"value":null,"min":null,"max":null,"mean":null,"p75":null,"p90":null,"p95":null,"p99":null}

  /* timers */
  var timer = metrics.create();
  for (var r = 0; r < 100; r++) {
    var t1 = timer.start();
    for (var i = 0; i < 1000000; i++)
      var x = Math.sqrt(i);
    t1.stop();
  }
  log(timer.read());                  // {"value":54,"mean":60.49,"median":57,"p75":60,"p90":67,"p95":90,"p99":106}
