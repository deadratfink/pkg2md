'use strict';

var flatten = require('flat');
var Promise = require('bluebird');
var os = require('os');

/**
 *
 * @type {RegExp}
 */
var FORMAT_REG_EXP = /%s|%d|{\d?}/;

///////////////////////////////////////////////////////////////////////////////
// CONSTRUCTOR
///////////////////////////////////////////////////////////////////////////////

/**
 * Constructs the `LogAdapter`.
 * @param {(*|console)} [logger=console] - Logger object.
 * @returns {LogAdapter}                 - The instance.
 * @constructor
 * @example
 * var LogAdapter = require('log-adapter');
 *
 * // Constructor variants (for demo purposes):
 * // -------------------------------------------------------------------------
 * // 1. Foo constructor using 3rd party:
 * function Foo(logger) { // inject non-null
 *    this.logger = new LogAdapter(logger);
 *    this.logger.info('Foo constructed with given logger object!');
 * }
 * // -------------------------------------------------------------------------
 * // 2. Foo constructor using 'console' as fallback:
 * function Foo(logger) { // assume injection undefined!
 *    this.logger = new LogAdapter(logger);
 *    this.logger.info('Foo constructed with console!');
 * }
 * // -------------------------------------------------------------------------
 *
 * var Foo = require('foo');   // your object accepting the 3rd party logger
 *
 * // Instantiate a Foo object using the LogAdapter internally (see below):
 * var logger = ...; // some 3rd party logger != null or != undefined
 * var foo1 = new Foo(logger); // logs (with logger.info): 'Foo constructed with given logger object!'
 * // -------------------------------------------------------------------------
 * var logger = undefined;
 * var foo2 = new Foo();       // logs (with console.info): 'Foo constructed with console!'
 * @class Class which defines a `logger` adapter instance usable in other modules/classes.
 */
function LogAdapter(logger) {
    if (logger) {
        if (logger instanceof LogAdapter) {
            this.logger = logger.getLogger();
        } else {
            /**
             * The internal logger instance.
             * @member {(logger|console)}
             * @private
             */
            this.logger = logger;
        }
    } else {
        this.logger = console;
    }
    //console.log('LOGGER:: ' + JSON.stringify(this.logger, null, 4));
}

/**
 * If given it wraps a log function `logFunc` and logs the given message `args`
 * if these are given too. While `args[0]` is assumed to be the message string, any
 * subsequent items are handled as message format arguments, replacing the message
 * placeholders according to the following placeholder RegExp: `/%s|%d|{\d?}/`).
 * @param {function} [logFunc] - The log function to be wrapped.
 * @param {array} [args]       - The original log function `arguments`.
 * @returns {Function}         - The wrapping log function.
 * @private
 */
function logWrap(logFunc, args) {
    //console.log('ARGS::' + JSON.stringify(args));
    if (logFunc && (typeof logFunc === 'function')) {
        var message = undefined;
        if (args.length > 0) {
            message = args[0];
            //var args = Array.slice(arguments, 2);
            if (args.length > 1) {
                if (args.length > 2) {
                    // replace %s or %d in message with multiple arguments
                    for (var i = 2; i < args.length; i++) {
                        message = message.replace(FORMAT_REG_EXP, args[i]);
                    }
                } else {
                    if (message.search(FORMAT_REG_EXP) > -1) {
                        message.replace(FORMAT_REG_EXP, args[1]);
                    } else {
                        message += args[1];
                    }
                }
            }
        }
        // console.info('MSG: ' + message)
        logFunc(message);
    }
}

LogAdapter.prototype.constructor = LogAdapter;
LogAdapter.prototype = {
    /**
     * Get the underlying logger.
     * @returns {logger|console} - The logger.
     */
    getLogger: function () {
        return this.logger;
    },
    /**
     * Log the given message with `INFO` level.
     * @param {string} msg         - The message to log.
     * @param {...string} [arguments] - The arguments for string formatted message.
     * @example
     * var logger = ...;
     * var logAdapter = new LogAdapter(logger);
     * var msg = '...';
     * logAdapter.info(msg);
     * @public
     */
    info: function () {
        var args = Array.prototype.concat.apply([], arguments);
        logWrap(this.logger.info, args)
    }, /**
     * Log the the given message with `DEBUG` level (if logger supports it, else with INFO).
     * @param {string} msg - The message to log.
     * @param {...string} [arguments] - The arguments for string formatted message.
     * @example
     * var logger = ...;
     * var logAdapter = new LogAdapter(logger);
     * var msg = '...';
     * logAdapter.debug(msg);
     * @public
     */
    debug: function () {
        var args = Array.prototype.concat.apply([], arguments);
        var method;
        if (this.logger === console) {
            //method = this.logger.trace;
            console.warn('DEBUG: no \'console.debug\' available!');
            return;
        } else {
            method = this.logger.debug;
        }
        logWrap(method, args)
    },
    /**
     * Log the the given message with `TRACE` level (if logger supports it).
     * @param {string} msg - The message to log.
     * @param {...string} [arguments] - The arguments for string formatted message.
     * @example
     * var logger = ...;
     * var logAdapter = new LogAdapter(logger);
     * var msg = '...';
     * logAdapter.trace(msg);
     * @public
     * @see {@link #debug}
     */
    trace: function () {
        var args = Array.prototype.concat.apply([], arguments);
        logWrap(this.logger.trace, args)
    },
    /**
     * Log the the given message with WARN level.
     * @param {string} msg - The message to log.
     * @param {...string} [arguments] - The arguments for string formatted message.
     * @example
     * var logger = ...;
     * var logAdapter = new LogAdapter(logger);
     * var msg = '...';
     * logAdapter.warn(msg);
     * @public
     */
    warn: function () {
        var args = Array.prototype.concat.apply([], arguments);
        logWrap(this.logger.warn, args)
    },
    /**
     * Log the the given message with `ERROR` level.
     * @param {string} msg - The message to log.
     * @param {...string} [arguments] - The arguments for string formatted message.
     * @example
     * var logger = ...;
     * var logAdapter = new LogAdapter(logger);
     * var msg = '...';
     * logAdapter.error(msg);
     * @public
     */
    error: function () {
        var args = Array.prototype.concat.apply([], arguments);
        logWrap(this.logger.error, args)
    },
    /**
     * Log the the given message with `FATAL` level if available, else fallback to `ERROR`.
     * @param {string} msg - The message to log.
     * @param {...string} [arguments] - The arguments for string formatted message.
     * @example
     * var logger = ...;
     * var logAdapter = new LogAdapter(logger);
     * var msg = '...';
     * logAdapter.fatal(msg);
     * @public
     */
    fatal: function () {
        var args = Array.prototype.concat.apply([], arguments);
        var method;
        if (!this.logger.fatal) {
            console.debug('DEBUG: no \'console.fatal\' available, fallback to error!');
            method = this.logger.error;
        } else {
            method = this.logger.fatal;
        }
        logWrap(method, args)
    }
};


// /**
//  *
//  * Create a log wrapper around a request's or response's log object binding it to `cli`'s logging.
//  * @returns {{info: Function, debug: Function, trace: Function, warn: Function, error: Function}}
//  * @private
//  */
// function createCliLogWrapper() {
//     return {
//         info: logWrap(cli.info),
//         debug: logWrap(cli.debug),
//         trace: logWrap(cli.trace),
//         warn: logWrap(cli.warn),
//         error: logWrap(error)
//     };
// }

/**
 * Appends the given `toAppend` to the `appendee` string and adds newlines.
 * @param {string} appendee    - The origin which is appended.
 * @param {string} toAppend    - The content to append.
 * @param {number} [amount=1]  - The amount of newlines to add.
 * @returns {Promise.<string>} - This `appendee` for concatenated calls.
 * @private
 */
function append(appendee, toAppend, amount) {
    appendee += toAppend;
    return nl(appendee, amount);
}

/**
 * Adds newlines of the given `amount` to `appendee`.
 * @param {string} appendee    - The origin which is appended.
 * @param {number} [amount=1]  - The amount of newlines to add.
 * @returns {Promise.<string>} - This `appendee` for concatenated calls.
 * @private
 */
function nl(appendee, amount) {
    return new Promise(function (resolve) {
        amount = (amount === undefined)
            ? 2
            : amount;
        var newlines = '';
        for (var i = amount; i > 0; i--) {
            newlines += os.EOL;
        }
        appendee += newlines;
        resolve(appendee);
    });
}

///////////////////////////////////////////////////////////////////////////////
// PUBLIC LOGGER METHODS
///////////////////////////////////////////////////////////////////////////////


// /**
//  * Log the given message with INFO level.
//  * @param {string} msg - The message to log.
//  * @example
//  * var logger = ...;
//  * var logAdapter = new LogAdapter(logger);
//  * var msg = '...';
//  * logAdapter.info(msg);
//  * @public
//  */
// LogAdapter.prototype.info = function (msg) {
//     this.logInstance.info(msg);
// };

// /**
//  * Log the the given message with DEBUG level (if logger supports it, else with INFO).
//  * @param {string} msg - The message to log.
//  * @example
//  * var logger = ...;
//  * var logAdapter = new LogAdapter(logger);
//  * var msg = '...';
//  * logAdapter.debug(msg);
//  * @public
//  */
// LogAdapter.prototype.debug = function (msg) {
//     if (this.logInstance.debug && typeof this.logInstance.debug === 'function') {
//         this.logInstance.debug(msg);
//     } else {
//         this.info(msg);
//     }
// };

// /**
//  * Log the the given message with TRACE level (if logger supports it).
//  * @param {string} msg - The message to log.
//  * @example
//  * var logger = ...;
//  * var logAdapter = new LogAdapter(logger);
//  * var msg = '...';
//  * logAdapter.trace(msg);
//  * @public
//  * @see {@link #debug}
//  */
// LogAdapter.prototype.trace = function (msg) {
//     if (this.logInstance.trace && typeof this.logInstance.trace === 'function') {
//         this.logInstance.trace(msg);
//     }
//     // else {
//     //     this.error(msg);
//     // }
// };

// /**
//  * Log the the given message with ERROR level.
//  * @param {string} msg - The message to log.
//  * @example
//  * var logger = ...;
//  * var logAdapter = new LogAdapter(logger);
//  * var msg = '...';
//  * logAdapter.error(msg);
//  * @public
//  */
// LogAdapter.prototype.error = function (msg) {
//     this.logInstance.error(msg);
// };

/**
 * Log the given `options` with INFO level using a flatten style. The key-values are separated by a newline.
 * @param {object} options         - The properties to log with INFO.
 * @param {boolean} [keySort=true] - Whether to sort keys by natural order before logging.
 * @param {string} [level=INFO]    - The log level, one of: [ INFO | DEBUG | TRACE ].
 * @returns A Promise containing the passed `options` object.
 * @example
 * var logger = ...;
 * var logAdapter = new LogAdapter(logger);
 * var options = {
 *     ...
 * };
 * logAdapter.verboseOptions(options)
 *     .then(function (options) {
 *         ...
 *     });
 * @public
 */
LogAdapter.prototype.verboseOptions = function (options, keySort, level) {
    var self = this;

    if (typeof keySort === 'string') {
        level = keySort;
        keySort = true;
    } else {
        keySort = !!keySort;
    }

    level = level || 'INFO';
    options = options || {};

    var toLog = 'options: ' + os.EOL;
    var flattenedOptions = flatten(options);
    var keys = Object.keys(flattenedOptions);
    if (keySort) {
        keys = keys.sort();
    }
    return Promise.each(keys, function (key, index, length) {
        self.logger.info('options key::: ' + key);
        var entry = key + ' = ' + flattenedOptions[key];
        return append(toLog, entry, 1);
    })
        .then(function (result) {
            return nl(toLog);
        })
        .then(function (result) {
            switch (level) {
                case 'DEBUG':
                    self.logger.debug(result);
                    break;
                case 'TRACE':
                    self.logger.trace(result);
                    break;
                case 'INFO':
                default:
                    self.logger.info(result);
            }
            return options;
        });
};

module.exports = LogAdapter;
