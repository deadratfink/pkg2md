'use strict';

var constants = require('./constants');
var Promise = require('bluebird');
var mkdirp = require('mkdirp-then');
var path = require('path');
var fs = Promise.promisifyAll(require('fs'));
var os = require('os');
var stringify = require('json-stringify-safe');

///////////////////////////////////////////////////////////////////////////////
// CONSTRUCTOR
///////////////////////////////////////////////////////////////////////////////

/**
 * Constructs the writer.
 *
 * @returns {MdWriter} - The instance.
 * @constructor
 * @class Class which writes Markdown file.
 */
function MdWriter(logger) {

    if (logger) {
        this.logger = logger;
    } else {
        this.logger = console;
    }

    var self = this;

    /**
     * Writes a serialized object to file. Forces overwriting the destination file if `options.force` `true`.
     *
     * @param {Md} md            - The object holding markdown to write into file.
     * @param {Options} options  - The write options.
     * @param {function} resolve - The Promise `resolve` callback.
     * @param {function} reject  - The Promise `reject` callback.
     * @returns {Promise.<string>}        - Containing the write success message to handle by caller (e.g. for logging).
     * @throws {Error}           - If serialized JSON file could not be written due to any reason.
     * @private
     */
    this.writeToFile = function(md, options, resolve, reject) {

        function preserveExistingMd() {
            return new Promise(function (resolve, reject) {
                if (options.force) {
                    self.logger.info('setting was: do overwrite, overwriting ' + options.md + '.');
                    md.end(0)
                        .then(function(result) {
                            return resolve(result);
                        });
                } else {
                    try {
                        fs.statSync(options.md);
                        self.logger.info('setting was: do not overwrite, appending to ' + options.md + '.');
                    } catch (err) {
                        self.logger.info(options.md + ' does not exists, using empty Markdown string on init.'); // TODO check error codes from stats
                        md.end(0)
                            .then(function(result) {
                                return resolve(result);
                            });
                    }
                    // file exists
                    try {
                        //console.log('TEMP: ' + md.end(0));
                        md.end(0) // TODO 0 or better 2?
                            .then(function(result) {
                                resolve(fs.readFileSync(options.md) + result); // TODO read Async
                            });

                    } catch (err) {
                        self.logger.error('could not read ' + options.md + ', cause: ' + err);
                        reject(err);
                    }
                }
            });
        }

        /**
         * Ensures that all dirs exists for dest and writes the file.
         * @private
         */
        function mkdirAndWrite() {
            var destDir = path.dirname(options.md);
            self.logger.debug('destination dir: ' + destDir);
            mkdirp(destDir)
                .then(function () {
                    return preserveExistingMd();
                })
                .then(function (mdResult) {
                    return fs.writeFileAsync(options.md, mdResult, constants.UTF8);
                })
                .then(function () {
                    resolve('writing file \'' + options.md + '\' successful.');
                })
                .catch(function (err) {
                    err.message = 'could not write file \'' + options.md + '\', cause: ' + err.message;
                    reject(err);
                });
        }

        return fs.statAsync(options.md)
            .then(function (stats) {
                if (stats.isDirectory()) {
                    reject(new Error('destination file is a directory, pls specify a valid Markdown file resource!'));
                } else {
                    // file exists
                    mkdirAndWrite();
                }
            })
            .catch(function (err) {
                // ignore error (because file could possibly not exist at this point of time)
                mkdirAndWrite();
            });
    };

    return this;
}

MdWriter.prototype = {};
MdWriter.prototype.constructor = MdWriter;
module.exports = MdWriter;

/**
 *
 * @param md
 * @param options
 * @returns {Promise.<string>}
 * @public
 */
MdWriter.prototype.write = function(md, options) {
    //console.log('MD:: ' + stringify(md));
    var self = this;
    return new Promise(function (resolve, reject) {
        self.writeToFile(md, options, resolve, reject);
    });
};
