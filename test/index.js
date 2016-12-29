'use strict';
var Code = require('code');
var Lab = require('lab');
var Usps = require('../');

var lab = exports.lab = Lab.script();
var expect = Code.expect;
var describe = lab.describe;
var it = lab.it;

Code.settings.truncateMessages = false;

var userId = process.env.USPS_USER_ID;

describe('USPS API', function () {
  describe('Usps()', function () {
    it('can construct with the new keyword', function (done) {
      var usps = new Usps({userId: userId});

      expect(usps._userId).to.equal(userId);
      expect(usps._host).to.exist();
      expect(usps._secureHost).to.exist();
      done();
    });

    it('can construct without the new keyword', function (done) {
      var usps = Usps({userId: userId});

      expect(usps._userId).to.equal(userId);
      expect(usps._host).to.exist();
      expect(usps._secureHost).to.exist();
      done();
    });

    it('rejects invalid options', function (done) {
      function fail (arg) {
        return function () {
          Usps(arg);
        };
      }

      expect(fail(null)).to.throw(Error, 'options must be an object');
      expect(fail(undefined)).to.throw(Error, 'options must be an object');
      expect(fail(1)).to.throw(Error, 'options must be an object');
      expect(fail(true)).to.throw(Error, 'options must be an object');
      expect(fail(false)).to.throw(Error, 'options must be an object');
      expect(fail('foo')).to.throw(Error, 'options must be an object');
      expect(fail({})).to.throw(Error, 'user ID must be a string');
      done();
    });
  });

  describe('cityStateLookup()', function () {
    it('successfully looks up a zip code', function (done) {
      var usps = new Usps({userId: userId});
      var options = {zip: '10001'};

      usps.cityStateLookup(options, function (err, results) {
        expect(err).to.not.exist();
        expect(results).to.equal({
          zip: '10001',
          city: 'NEW YORK',
          state: 'NY'
        });
        done();
      });
    });

    it('handles error responses', function (done) {
      var usps = new Usps({userId: userId});
      var options = {zip: '?'};

      usps.cityStateLookup(options, function (err, results) {
        expect(err).to.exist();
        expect(err.message).to.equal('ZIPCode must be 5 characters');
        expect(results).to.shallow.equal(err);
        done();
      });
    });

    it('looks up multiple zip codes at once', function (done) {
      var usps = new Usps({userId: userId});
      var options = {zip: ['90210', '10001']};

      usps.cityStateLookup(options, function (err, results) {
        expect(err).to.not.exist();
        expect(results).to.equal([
          {zip: '90210', city: 'BEVERLY HILLS', state: 'CA'},
          {zip: '10001', city: 'NEW YORK', state: 'NY'}
        ]);
        done();
      });
    });

    it('handles error responses in multi zip code lookup', function (done) {
      var usps = new Usps({userId: userId});
      var options = {zip: ['?', '10001']};

      usps.cityStateLookup(options, function (err, results) {
        expect(err).to.exist();
        expect(err.message).to.equal('ZIPCode must be 5 characters');
        expect(results).to.be.an.array();
        expect(results.length).to.equal(2);
        expect(results[0]).to.shallow.equal(err);
        expect(results[1]).to.equal({
          zip: '10001',
          city: 'NEW YORK',
          state: 'NY'
        });
        done();
      });
    });

    it('rejects invalid options', function (done) {
      function fail (options) {
        return function () {
          var usps = new Usps({userId: userId});

          usps.cityStateLookup(options, function () {});
        };
      }

      expect(fail(null)).to.throw(Error, 'options must be an object');
      expect(fail(undefined)).to.throw(Error, 'options must be an object');
      expect(fail(1)).to.throw(Error, 'options must be an object');
      expect(fail(true)).to.throw(Error, 'options must be an object');
      expect(fail(false)).to.throw(Error, 'options must be an object');
      expect(fail('foo')).to.throw(Error, 'options must be an object');
      expect(fail({zip: 1})).to.throw(Error, 'zips must be a string or array with at least one element');
      expect(fail({zip: []})).to.throw(Error, 'zips must be a string or array with at least one element');
      done();
    });

    it('handles unreachable USPS server', function (done) {
      var usps = new Usps({userId: userId, host: 'foo'});
      var options = {zip: '10001'};

      usps.cityStateLookup(options, function (err, results) {
        expect(err).to.exist();
        expect(err.code).to.equal('ECONNREFUSED');
        expect(err.errno).to.equal('ECONNREFUSED');
        expect(err.syscall).to.equal('connect');
        expect(results).to.not.exist();
        done();
      });
    });
  });
});
