'use strict';

var constants = require('./constants');
var LogAdapter = require('./log-adapter');
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
    if (!(this instanceof MdWriter)) {
        return new MdWriter();
    }
    this.logger = new LogAdapter(logger);

    var self = this;

    /**
     * Writes a serialized object to file. Forces overwriting the destination file if `overwrite` is `true`.
     * @param {Md} md                     - The object holding markdown to write into `file`.
     * @param {string} file               - The file to write.
     * @param {function} resolve          - The Promise `resolve` callback.
     * @param {function} reject           - The Promise `reject` callback.
     * @param {boolean} [overwrite=false] - Whether to overwrite an existing `file`.
     * @returns {Promise.<string>}        - Containing the write success message to handle by caller (e.g. for logging).
     * @throws {Error}                    - If serialized JSON file could not be written due to any reason.
     * @protected
     */
    this.writeToFile = function (md, file, resolve, reject, overwrite) {

        function preserveExistingMd() {
            return new Promise(function (resolve, reject) {
                if (overwrite) {
                    self.logger.info('setting was: --force (overwrite), ...overwriting ' + file + '.');
                    md.end(0).then(resolve);
                } else {
                    try {
                        fs.statSync(file);
                        self.logger.info('setting was: do not overwrite, appending to ' + file + '.');
                    } catch (err) {
                        self.logger.info(file + ' does not exists, using empty Markdown string on init.'); // TODO check error codes from stats
                        return md.end(0).then(resolve);
                    }
                    // file exists
                    try {
                        //console.log('TEMP: ' + md.end(0));
                        md.end(0) // TODO 0 or better 2?
                            .then(function (result) {
                                resolve(fs.readFileSync(file) + result); // TODO read Async
                            });

                    } catch (err) {
                        self.logger.error('could not read ' + file + ', cause: ' + err);
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
            var destDir = path.dirname(file);
            self.logger.debug('destination dir: ' + destDir);
            mkdirp(destDir)
                .then(function () {
                    return preserveExistingMd();
                })
                .then(function (mdResult) {
                    return fs.writeFileAsync(file, mdResult, constants.UTF8);
                })
                .then(function () {
                    resolve('writing file \'' + file + '\' successful.');
                })
                .catch(function (err) {
                    err.message = 'could not write file \'' + file + '\', cause: ' + err.message;
                    reject(err);
                });
        }

        return fs.statAsync(file)
            .then(function (stats) {
                if (stats.isDirectory()) {
                    reject(new Error('destination file is a directory, pls specify a valid Markdown file resource!'));
                } else {
                    // file exists
                    mkdirAndWrite();
                }
            })
            .catch(function (err) { // TODO check stats?
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
 * Writes a serialized object to file. Forces overwriting the destination file if `overwrite` is `true`.
 * @param {Md} md                     - The object holding markdown to write into `file`.
 * @param {string} file               - The file to write.
 * @param {boolean} [overwrite=false] - Whether to overwrite an existing `file`.
 * @returns {Promise.<string>}
 * @public
 */
MdWriter.prototype.write = function (md, file, overwrite) {
    //console.log('MD:: ' + stringify(md));
    var self = this;
    return new Promise(function (resolve, reject) {
        self.writeToFile(md, file, resolve, reject, overwrite);
    });
};
