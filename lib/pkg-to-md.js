'use strict';

var cwd = require('cwd')();
//var Promise = require('bluebird');
var fs = require('fs');
var os = require('os');
var PkgReader = require('./pkg-reader');
var Md = require('./md');
var MdWriter = require('./md-writer');
var constants = require('./constants');

//Promise.promisifyAll(fs);

/**
 * @typedef {object} Options
 * @property {string} [origin=yaml]            - The origin type.
 * @property {string} [target=js]              - The target type.
 * @property {(string|Readable|object)} src    - The source.
 * @property {(string|Writable|object)} [dest] - The destination.
 * @property {number} [indent=4]               - The indention in files.
 * @property {string} [imports=undefined]      - The exports name for reading from JS source file or objects only.
 * @property {string} [exports=undefined]      - The exports name for usage in JS destination files only.
 */

///////////////////////////////////////////////////////////////////////////////
// CONSTRUCTOR
///////////////////////////////////////////////////////////////////////////////

/**
 * Constructs the ....
 *
 * @returns {PkgToMd}        - The instance.
 * @constructor
 * @class Class which converts a _package.json_ to a MD file.
 */
function PkgToMd(logger) {

    if (logger) {
        this.logger = logger;
    } else {
        this.logger = console;
    }

    return this;
}

PkgToMd.prototype = {};
PkgToMd.prototype.constructor = PkgToMd;

/**
 *
 * @param options
 * @returns {Promise} -
 */
PkgToMd.prototype.writeMarkdown = function (options) {
    var self = this;
    var pkgReader = new PkgReader(this.logger);
    return pkgReader.read(options)
        .then(function (pkg) {
            return new Md(pkg, options, self.logger);
        })
        .then(function (md) {
            return md.title();
        })
        .then(function (md) {
            return md.description();
        })
        .then(function (md) {
            return md.installation();
        })
        .then(function (md) {
            return md.repository();
        })
        .then(function (md) {
            return md.dependencies(constants.DEPENDENCY_TYPE_PROD);
        })
        .then(function (md) {
            return md.dependencies(constants.DEPENDENCY_TYPE_DEV);
        })
        .then(function (md) {
            return md.dependencies(constants.DEPENDENCY_TYPE_BUNDLED);
        })
        .then(function (md) {
            return md.dependencies(constants.DEPENDENCY_TYPE_OPTIONAL);
        })
        .then(function (md) {
            return md.dependencies(constants.DEPENDENCY_TYPE_PEER);
        })
        .then(function (md) {
            return md.tests();
        })
        .then(function (md) {
            return md.staff();
        })
        .then(function (md) {
            return md.keywords();
        })
        .then(function (md) {
            return md.config();
        })
        .then(function (md) {
            return md.scripts();
        })
        .then(function (md) {
            return md.main();
        })
        .then(function (md) {
            return md.bin();
        })
        .then(function (md) {
            return md.engines();
        })
        .then(function (md) {
            return md.os();
        })
        .then(function (md) {
            return md.cpu();
        })
        //// TODO!
        .then(function (md) {
            return md.license();
        })
        .then(function (md) {
            var mdWriter = new MdWriter(self.logger);
            //console.log('TEMP: ' + md.end(0));
            return mdWriter.write(md, options);
        })
        .catch(function (err) {
            self.logger.error('found error: ' + err);
            throw err;
        });
};

module.exports = PkgToMd;
