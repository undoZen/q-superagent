var assert = require('assert');

var request = require('superagent');
require('../')(request);
var express = require('express');

var Q = require('q');

describe('q-superagent', function (done) {
  var addr, prefix;
  before(function (done) {
    app = express();
    app.get('/ok', function (req, res) {
      res.type('text')
      res.status(200).end('OK');
    });
    app.get('/404', function (req, res) {
      res.type('text')
      res.status(404).end('NOT FOUND');
    });
    addr = app.listen(null, done).address();
    prefix = 'http://' + addr.address + ':' + addr.port;
  });

  it('request.q() should be a promise', function () {
    assert(Q.isPromise(request.get(prefix + '/ok').q()));
  });

  it('should be resolved when ok', function (done) {
    request.get(prefix+'/ok').q().then(function (res) {
      assert(res.statusCode == 200);
      assert(res.text == 'OK');
      done();
    });
  });

  it('should also be resolved when 404', function (done) {
    request.get(prefix+'/404').q().then(function (res) {
      assert(res.statusCode == 404);
      assert(res.text == 'NOT FOUND');
      done();
    });
  });

  it('should be rejected when error occured', function (done) {
    request.get('/erraddr').q().fail(function (err) {
      assert(err instanceof Error);
      assert(err.code == 'ECONNREFUSED');
      done();
    });
  });

  it('should pass arguments to then method', function (done) {
    var n = 2;
    request.get(prefix+'/ok').q(function (res) {
      assert(res.statusCode == 200);
      assert(res.text == 'OK');
      (--n) || done();
    });
    request.get('/erraddr').q(null, function (err) {
      assert(err instanceof Error);
      assert(err.code == 'ECONNREFUSED');
      (--n) || done();
    });
  });

  it('should pass error to returned promise', function (done) {
    request.get('/erraddr').q(function (res) {
      assert(res.statusCode == 200);
      assert(res.text == 'OK');
      done();
    }).fail(function (err) {
      assert(err instanceof Error);
      assert(err.code == 'ECONNREFUSED');
      done();
    }).done();
  });

});
