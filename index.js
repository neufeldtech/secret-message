var port = process.env.PORT || 5000;

var redisURL = process.env.REDIS_URL || 'foobar';
var Redis = require('ioredis');
var redis = new Redis(redisURL,
  {
    retryStrategy: function (times) {
      var delay = Math.min(times * 2, 2000);
      return delay;
    }
  });
var redisService = require('./src/redisService.js')(redis)

var express = require('express');
var app = express();

require('./src/app')(app, redisService);

app.listen(port, function () {
  console.log('Server listening on port ' + this.address().port);
});
