'use strict';

var Q = require('q');

module.exports = function (request) {
  request.Request.prototype.q = function () {
    var promise = Q.ninvoke(this, 'end');
    if (arguments.length) return promise.then.apply(promise, arguments);
    else return promise;
  }

  return request;
};

if ('undefined' != typeof superagent) {
  module.exports(superagent);
}
