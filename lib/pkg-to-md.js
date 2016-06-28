'use strict';

var cwd = require('cwd')();
var Promise = require('bluebird');
var fs = require('fs');
var os = require('os');
var PkgReader = require('./pkg-reader');
var LogAdapter = require('./log-adapter');
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
 * @returns {PkgToMd} - The instance.
 * @constructor
 * @class Class which converts a _package.json_ to a MD file.
 */
function PkgToMd(logger) {
    this.logger = new LogAdapter(logger);
}

PkgToMd.prototype = {};
PkgToMd.prototype.constructor = PkgToMd;

var optionToEvent = {
    tests: 'tests',
    inst: 'installation',
    staff: 'staff',
    lic: 'license',
    main: 'main',
    deps: 'dependencies',
    keywords: 'keywords',
    bin: 'bin',
    os: 'os',
    cpu: 'cpu',
    config: 'config',
    scripts: 'scripts',
    engines: 'engines'
};

var depTypes = [
    constants.DEPENDENCY_TYPE_PROD,
    constants.DEPENDENCY_TYPE_DEV,
    constants.DEPENDENCY_TYPE_BUNDLED,
    constants.DEPENDENCY_TYPE_OPTIONAL,
    constants.DEPENDENCY_TYPE_PEER
];

function runOrderedOptions(md, orderedOptions) {

    return Promise.each(orderedOptions, function (option, index) {
        console.log(index + '. ' + option);
        if (option === 'deps') {
            return Promise.each(depTypes, function (depType) {
                return md.dependencies(depType);
            });
        } else {
            return md[optionToEvent[option]]();
        }
    })
        .then(function () {
            return md;
        });
}

/**
 *
 * @param options
 * @returns {Promise} -
 */
PkgToMd.prototype.writeMarkdown = function (options, orderedOptions) {
    var self = this;
    var pkgReader = new PkgReader(self.logger);
    return pkgReader.read(options)
        .then(function (pkg) {
            //self.logger.debug('PACKAGE::: ' + JSON.stringify(pkg, null, 4));
            return new Md(pkg, options, self.logger);
        })
        .then(function (md) {
            return md.title();
        })
        .then(function (md) {
            return md.description();
        })
        .then(function (md) {
            return runOrderedOptions(md, orderedOptions)
        })

        // .then(function (md) {
        //     return md[optionToEvent.inst]();//md.installation();
        // })
        // .then(function (md) {
        //     return md.repository();
        // })
        // .then(function (md) {
        //     return md.dependencies(constants.DEPENDENCY_TYPE_PROD);
        // })
        // .then(function (md) {
        //     return md.dependencies(constants.DEPENDENCY_TYPE_DEV);
        // })
        // .then(function (md) {
        //     return md.dependencies(constants.DEPENDENCY_TYPE_BUNDLED);
        // })
        // .then(function (md) {
        //     return md.dependencies(constants.DEPENDENCY_TYPE_OPTIONAL);
        // })
        // .then(function (md) {
        //     return md.dependencies(constants.DEPENDENCY_TYPE_PEER);
        // })
        // .then(function (md) {
        //     return md.tests();
        // })
        // .then(function (md) {
        //     return md.staff();
        // })
        // .then(function (md) {
        //     return md.keywords();
        // })
        // .then(function (md) {
        //     return md.config();
        // })
        // .then(function (md) {
        //     return md.scripts();
        // })
        // .then(function (md) {
        //     return md.main();
        // })
        // .then(function (md) {
        //     return md.bin();
        // })
        // .then(function (md) {
        //     return md.engines();
        // })
        // .then(function (md) {
        //     return md.os();
        // })
        // .then(function (md) {
        //     return md.cpu();
        // })
        // //// TODO!
        // .then(function (md) {
        //     return md.license();
        // })
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
