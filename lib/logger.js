'use strict';

var winston = require('winston');
var Logger = winston.Logger;
//var LogLevelUpperCaseConsole = require('./log-level-upper-case-console.js');

/**
 * This function formats the log string by given options to log.
 *
 * @param {{level: string, [message: string], [meta: object]}} options - The formatter options.
 * @returns {string} - The log string.
 * @private
 */
var formatter = function formatter(options) {
    // Return string will be passed to logger.
    return options.level.toUpperCase() + ': ' + (undefined !== options.message ? options.message : '') +
        (options.meta && Object.keys(options.meta).length ? '\n\t' + JSON.stringify(options.meta) : '' );
};

/**
 * Usual levels for CLI logging.
 * @type {{error: number, warn: number, info: number, debug: number, trace: number}}
 * @private
 */
var LEVELS = {
    error: 0,
    warn: 1,
    info: 2,
    debug: 3,
    trace: 4
};

/**
 * The level colors.
 * @type {{error: string, warn: string, info: string, debug: string, trace: string}}
 * @private
 */
var COLORS = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    debug: 'cyan',
    trace: 'magenta'
};

/**
 * Options for winston console logging.
 * @param {string} [level=info] - A log level, one of [`info | debug | trace | warn | error | silent ]`. **NOTE:** `silent` is not a real log level but a flag which can suppress all output!
 * @param {string} [name] - A name for a Winston `Logger` instance.
 * @param {boolean} [colorize=true] - Whether to colorize the log output.
 * @returns {{level: string, silent: boolean, name: *, colorize: boolean, showLevel: boolean, stderrLevels: string[], humanReadableUnhandledException: boolean}}
 * @private
 */
function createConsoleOptions(level, name, colorize) {
    var isSilent = (level === 'silent');
    return {
        //formatter: formatter,
        level: (isSilent ? 'error' : level),
        silent: isSilent,
        name: name,
        colorize: (colorize === undefined ? true : colorize), // default: true
        showLevel: true,
        stderrLevels: ['error'],
        humanReadableUnhandledException: true
    }
}

/**
 * CLI configuration for Winston `Logger` instance.
 * @param {string} [level=info] - A log level, one of [`info | debug | trace | warn | error | silent ]`. **NOTE:** `silent` is not a real log level but a flag which can suppress all output!
 * @param {string} [name] - A name for a Winston `Logger` instance.
 * @param {boolean} [colorize=true] - Whether to colorize the log output.
 * @returns {{level: *, levels: {error: number, warn: number, info: number, debug: number, trace: number}, colors: {error: string, warn: string, info: string, debug: string, trace: string}, transports: *[], exitOnError: boolean}}
 * @public
 */
module.exports.createConfig = function createConfig(level, name, colorize) {

    // TODO check if colors reg needed!
    // Make winston aware of these colors
    winston.addColors(COLORS);

    return {
        level: level,
        levels: LEVELS,
        padLevels: true,
        colors: COLORS,
        transports: [
            //new LogLevelUpperCaseConsole(createConsoleOptions(level, name))
            new (winston.transports.Console)(createConsoleOptions(level, name, colorize))
        ],
        exitOnError: false
    }
};

/**
 * Exports the Winston logger prototype directly for instantiation with config.
 * @public
 * @see {@link #createConfig}
 */
module.exports.Logger = Logger;

module.exports.LEVELS = LEVELS;
