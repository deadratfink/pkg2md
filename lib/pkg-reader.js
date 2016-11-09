'use strict';

var constants = require('./constants');
var LogAdapter = require('./log-adapter');
// var pkgSchema = require('package.json-schema'); // TODO remove from deps!
var stringify = require('json-stringify-safe');
// var Ajv = require('ajv'); // TODO remove from deps!
var Promise = require('bluebird');
var os = require('os');
var normalizePkg = require('normalize-package-data');
var fs = Promise.promisifyAll(require('fs'));

///////////////////////////////////////////////////////////////////////////////
// CONSTRUCTOR
///////////////////////////////////////////////////////////////////////////////

/**
 * Constructs the package reader.
 * @returns {PkgReader} - The instance.
 * @constructor
 * @class Class which reads a _package.json_ file.
 */
function PkgReader(logger) {
    if (!(this instanceof PkgReader)) {
        return new PkgReader();
    }
    this.logger = new LogAdapter(logger);
    // const self = this;

    //function beatifyErrors(errors) {
    //    var errStr = '';
    //    errors.forEach(function(element, index, array) {
    //        errStr = errStr + (index + 1) + '. ' + stringify(element, null, 4) + os.EOL;
    //    });
    //}

    // /**
    //  * If `pkg` is invalid it rejects with a proper validation error, else it
    //  * resolves with `pkg` object.
    //  *
    //  * @param {object} pkg     - The package object to validate.
    //  * @param {object} options - The validate/read options.
    //  * @return {Promise}       - Resolves with the `pkg` object.
    //  * @private
    //  */
    // this.validate = function (pkg, options) {
    //     var ajv = Ajv({
    //         allErrors: true,
    //         verbose: options.level.toLowerCase() !== 'info' && options.level.toLowerCase() !== 'silent',
    //         beautify: true
    //     });
    //
    //     var validate = ajv.compile(loadPackageSchema());
    //     return validate(pkg)
    //         .then(function (valid) {
    //             // "valid" is always true here
    //             self.logger.debug('validating file \'' + options.pkg + '\' successful.');
    //             return pkg;
    //         })
    //         .catch(function (err) {
    //             // data is invalid
    //             if (!(err instanceof Ajv.ValidationError)) {
    //                 return Promise.reject(err);
    //             }
    //             return Promise.reject(new Error('validating file issue(s)\'' + options.pkg + '\', validation errors: ' + stringify(err.errors, null, 4)));
    //         });
    // };

    return this;
}

PkgReader.prototype = {};
PkgReader.prototype.constructor = PkgReader;

// /**
//  * Loads the schema for _package.json_.
//  * @returns {object} - The JSON schema.
//  * @private
//  */
// function loadPackageSchema() {
//     var schema = pkgSchema.get();
//     schema.$async = true; // needed for ajv to promisify
//     schema.$ref = 'lib://package.json#/definitions/minimal';
//     return schema;
// }

/**
 * Reads a _package.json_ file and if `normalize` is `true` it normalizes according to
 * [normalize-package-data](https://github.com/npm/normalize-package-data#what-normalization-currently-entails)
 * before it is resolved.
 * @param {string} pkg               - The package file to read.
 * @param {boolean} [normalize=true] - Whether to normalize the loaded package data.
 * @returns {Promise.<object>}       - The normalized package.json data object.
 */
PkgReader.prototype.read = function (pkg, normalize) {
    var self = this;
    normalize = normalize !== false;
    return fs.readFileAsync(pkg, constants.UTF8)
        .then(function (data) {
            self.logger.debug('reading raw file \'' + pkg + '\' done');
            return JSON.parse(data);
        })
        .then(function (pkg) {
            // if (options.validate) {
            //     return self.validate(pkg, options);// TODO correct schema provided by 3rd party
            // }


            if (normalize) {
                // synched exec!
                normalizePkg(pkg, function (msg) {
                    self.logger.warn(msg);
                }, true);
                self.logger.trace('NORMALIZED PKG: ' + JSON.stringify(pkg, null, 4));
            }
            return pkg;
        })
        .catch(function (err) {
            err.message = 'cannot load file \'' + pkg + '\': ' + err.message;
            throw err; // TODO: throw sufficient here?
        });
};

module.exports = PkgReader;
