var port = process.env.PORT || 5000;
var redisURL = process.env.REDIS_URL || 'foobar';

var debug = require('debug')('app');
var Redis = require('ioredis');
var redis = new Redis(redisURL,
  {
    retryStrategy: function(times) {
      var delay = times * 100;
      if (times > 30) {
        // console.error('Could not reconnect to redis. Exiting')
        throw new Error('Could not connect to Redis at ' + redisURL);
        // process.exit(1)
      }
      return delay;
    }
  });
var redisService = require('./src/redisService.js')(redis);

var express = require('express');
var app = express();

require('./src/app')(app, redisService);

app.listen(port, function() {
  debug('Server listening on port ' + this.address().port);
});
