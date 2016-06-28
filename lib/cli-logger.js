'use strict';

function CliLogger(options) {

    options = options || {};

    this.level = options.level || 'info';
    this.noColor = !!options.noColor;
    this.silent = !!options.silent;

    var typeToPrefix = {
        info: this.noColor ? 'INFO:' : '\x1B[33mINFO\x1B[0m:',
        debug: this.noColor ? 'DEBUG:' : '\x1B[36mDEBUG\x1B[0m:',
        trace: this.noColor ? 'TRACE:' : '\x1B[32mTRACE\x1B[0m:',
        warn: this.noColor ? 'ERROR:' : '\x1B[30mWARN\x1B[0m:',
        error: this.noColor ? 'ERROR:' : '\x1B[31mERROR\x1B[0m:',
        fatal: this.noColor ? 'FATAL:' : '\x1B[30mFATAL\x1B[0m:'
    };

    var self = this;

    /**
     * Adds methods to output styled status messages to stdout (INFO, DEBUG,
     * TRACE) or stderr (WARN, ERROR, FATAL).
     *
     * Added methods are:
     * - `info(msg)`
     * - `debug(msg)`
     * - `trace(msg)`
     * - `warn(msg)`
     * - `error(msg)`
     * - `fatal(msg)`
     *
     * To control status messages, use the 'status' plugin
     *    1) debug() messages are hidden by default. Display them with
     *       the --debug opt.
     *    2) to hide all status messages, use the -s or --silent opt.
     *
     * @private
     */
    function status(msg, type) {
        var level = self.level.toLowerCase();
        switch (level) {
            case 'info':
                if (type === 'info') {
                    console.info(typeToPrefix[type] + ' ' + msg);
                }
                break;
            case 'debug':
                if (type === 'debug' || type === 'info') {
                    console.info(typeToPrefix[type] + ' ' + msg);
                }
                break;
            case 'trace':
                if (type === 'trace' || type === 'debug' || type === 'info') {
                    console.info(typeToPrefix[type] + ' ' + msg);
                }
                break;
            case 'warn':
                if (type === 'warn' || type === 'error' || type === 'fatal') {
                    console.error(typeToPrefix[type] + ' ' + msg);
                }
                break;
            case 'error':
                if (type === 'error' || type === 'fatal') {
                    console.error(typeToPrefix[type] + ' ' + msg);
                }
                break;
            case 'fatal':
                if (type === 'fatal') {
                    console.fatal(typeToPrefix[type] + ' ' + msg);
                    return process.exit(1);
                }
        }

        // if (type === self.level.toLowerCase())
        //
        //     msg = pre + ' ' + msg;
        // if (type === 'fatal') {
        //     console.fatal(msg);
        //     return process.exit(1); // TODO
        // }
        // // if (enable.status && !show_debug && type === 'debug') {
        // //     return;
        // // }
        // console.error(msg);
    }

    ['info', 'debug', 'trace', 'warn', 'error', 'fatal'].forEach(function (type) {
        self[type] = function (msg) {
            status(msg, type);
        };
    });
}

CliLogger.prototype = {};
CliLogger.prototype.constructor = CliLogger;

module.exports = CliLogger;
