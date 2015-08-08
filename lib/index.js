'use strict';
var Querystring = require('querystring');
var Faketoe = require('faketoe');
var Hoek = require('hoek');
var Wreck = require('wreck');

var _defaults = {
  host: 'http://production.shippingapis.com/ShippingAPI.dll',
  secureHost: 'https://secure.shippingapis.com/ShippingAPI.dll'
};

function Usps (options) {
  if (!(this instanceof Usps)) {
    return new Usps(options);
  }

  Hoek.assert(options !== null && typeof options === 'object',
              'options must be an object');
  Hoek.assert(typeof options.userId === 'string', 'user ID must be a string');

  var settings = Hoek.applyToDefaults(_defaults, options);

  this._userId = settings.userId;
  this._host = settings.host;
  this._secureHost = settings.secureHost;
}

module.exports = Usps;

Usps.prototype.cityStateLookup = function (options, callback) {
  Hoek.assert(options !== null && typeof options === 'object',
              'options must be an object');
  Hoek.assert(typeof options.zip === 'string' ||
              (Array.isArray(options.zip) && options.zip.length > 0),
              'zips must be a string or array with at least one element');

  var zips = [].concat(options.zip);
  var xml = '<CityStateLookupRequest USERID="' + this._userId + '">';

  for (var i = 0, il = zips.length; i < il; ++i) {
    xml += '<ZipCode ID="' + i + '"><Zip5>' + zips[i] + '</Zip5></ZipCode>';
  }

  xml += '</CityStateLookupRequest>';

  _request('CityStateLookup', xml, this._host, function (err, result) {
    if (err) {
      return callback(err);
    }

    var lookups = result.CityStateLookupResponse.ZipCode;
    var serviceErr = null;
    var response;

    if (Array.isArray(lookups)) {
      response = [];

      for (var i = 0, il = lookups.length; i < il; ++i) {
        response[i] = _formatCityStateLookupResponse(lookups[i]);

        if (response[i] instanceof Error) {
          serviceErr = response[i];
        }
      }
    } else {
      response = _formatCityStateLookupResponse(lookups);

      if (response instanceof Error) {
        serviceErr = response;
      }
    }

    callback(serviceErr, response);
  });
};

function _formatCityStateLookupResponse (response) {

  if (response.Error) {
    return new Error(response.Error.Description);
  }

  return {
    zip: response.Zip5,
    city: response.City,
    state: response.State
  };
}

function _request (api, xml, host, callback) {
  var url = host + '?' + Querystring.stringify({
    API: api,
    XML: xml
  });

  Wreck.request('GET', url, null, function (err, response) {
    if (err) {
      return callback(err);
    }

    response.pipe(Faketoe.createParser(callback));
  });
}
