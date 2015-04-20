# usps

[![Current Version](https://img.shields.io/npm/v/usps.svg)](https://www.npmjs.org/package/usps)
[![Build Status via Travis CI](https://travis-ci.org/cjihrig/usps.svg?branch=master)](https://travis-ci.org/cjihrig/usps)
![Dependencies](http://img.shields.io/david/cjihrig/usps.svg)
![devDependencies](http://img.shields.io/david/dev/cjihrig/usps.svg)

JavaScript API wrapper for the United States Postal Service (USPS) APIs. The USPS APIs are
XML based. This module abstracts away the details of working with XML.

This module exports a constructor function used to interact with the various APIs. This
design decision was made because the USPS API requests require a user ID. Instead of
passing this ID to every request, it is simpler to construct an object that retains the ID.
If you need to make requests using multiple user IDs, simply construct another instance of
this module (in the future, it might be possible to override the user ID on a per call
basis).

## Basic Usage

```javascript
var Usps = require('usps');
var usps = new Usps({userId: 'your_usps_id'});
var options = {zip: '10001'};

usps.cityStateLookup(options, function(err, results) {
  // results = {zip: '10001', city: 'NEW YORK', state: 'NY'}
});
```

### Running the Tests

Run the following command:

```
USPS_USER_ID=YOUR_USPS_ID npm test
```

Where `YOUR_USPS_ID` is your USPS user ID.

## `Usps(options)` Constructor

  - Arguments
    - `options` (object) - An object containing the following configuration settings:
        - `userId` (string) - A USPS user ID.

Returns a new instance of the USPS API.

## Methods

### `cityStateLookup(options, callback)`

  - Arguments
    - `options` (object) - An object containing the following configuration settings:
        - `zip` (string or array) - A zip code string, or an array of zip code strings.
    - `callback` (function) - Callback function triggered after a response is received from the USPS services. This function takes the following arguments:
        - `err` (`Error` or `null`) - If an error is encountered while looking up any of the provided zip codes, it is reported here. If no error is encountered, this is `null`.
        - `results` (object or array) - If a string was passed in `zip`, this will be an object containing the zip code and corresponding city and state. If `zip` was an array, this will be an array of objects.
  - Returns
    - Nothing. See `callback` function argument.

Given one or more zip codes, this method returns the corresponding city and state(s).
