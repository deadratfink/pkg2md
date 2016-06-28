'use strict';

var constants = require('./constants');
var LogAdapter = require('./log-adapter');
var pkgSchema = require('package.json-schema');
var stringify = require('json-stringify-safe');
var Ajv = require('ajv');
var Promise = require('bluebird');
var os = require('os');
var normalizePkg = require('normalize-package-data');
var fs = Promise.promisifyAll(require('fs'));

///////////////////////////////////////////////////////////////////////////////
// CONSTRUCTOR
///////////////////////////////////////////////////////////////////////////////

/**
 * Constructs the constants.
 * @returns {PkgReader} - The instance.
 * @constructor
 * @class Class which reads an validates (by JSON schema) a _package.json_ file.
 */
function PkgReader(logger) {
    // if (!(this instanceof PkgReader)) {
    //     return new PkgReader();
    // }
    this.logger = new LogAdapter(logger);
    const self = this;

    //function beatifyErrors(errors) {
    //    var errStr = '';
    //    errors.forEach(function(element, index, array) {
    //        errStr = errStr + (index + 1) + '. ' + stringify(element, null, 4) + os.EOL;
    //    });
    //}

    /**
     * If `pkg` is invalid it rejects with a proper validation error, else it
     * resolves with `pkg` object.
     *
     * @param {object} pkg     - The package object to validate.
     * @param {object} options - The validate/read options.
     * @return {Promise}       - Resolves with the `pkg` object.
     * @private
     */
    this.validate = function (pkg, options) {
        var ajv = Ajv({
            allErrors: true,
            verbose: options.verbose,
            beautify: true
        });

        var validate = ajv.compile(loadPackageSchema());
        return validate(pkg)
            .then(function (valid) {
                // "valid" is always true here
                self.logger.debug('validating file \'' + options.pkg + '\' successful.');
                return pkg;
            })
            .catch(function (err) {
                // data is invalid
                if (!(err instanceof Ajv.ValidationError)) {
                    return Promise.reject(err);
                }
                return Promise.reject(new Error('validating file issue(s)\'' + options.pkg + '\', validation errors: ' + stringify(err.errors, null, 4)));
            });
    };

    return this;
}

PkgReader.prototype = {};
PkgReader.prototype.constructor = PkgReader;

/**
 * Loads the schema for _package.json_.
 * @returns {object} - The JSON schema.
 * @private
 */
function loadPackageSchema() {
    var schema = pkgSchema.get();
    schema.$async = true; // needed for ajv to promisify
    schema.$ref = 'lib://package.json#/definitions/minimal';
    return schema;
}

/**
 *
 * @param options
 * @returns {Promise.<T>}
 */
PkgReader.prototype.read = function (options) {
    var self = this;
    return fs.readFileAsync(options.pkg, constants.UTF8)
        .then(function (data) {
            self.logger.debug('reading raw file \'' + options.pkg + '\' done');
            return JSON.parse(data);
        })
        .then(function (pkg) {
            if (options.validate) {
                return self.validate(pkg, options);
            }
            normalizePkg(pkg, true, function (msg) {
                self.logger.warn(msg);
            });
            //self.logger.info('NORMALIZED PKG::: ' + JSON.stringify(pkg, null, 4));
            return pkg;
        })
        .catch(function (err) {
            err.message = 'cannot load file \'' + options.pkg + '\': ' + err.message;
            return Promise.reject(err); // TODO: throw sufficient here?
        });
};

module.exports = PkgReader;
