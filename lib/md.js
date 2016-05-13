'use strict';

var constants = require('./constants');
var PkgReader = require('./pkg-reader');
var Promise = require('bluebird');
var mkdirp = require('mkdirp-then');
var path = require('path');
var fs = Promise.promisifyAll(require('fs'));
var os = require('os');
var url = require('url');
var ghUrl = require('github-url-to-object')
var urlJoin = require('url-join');

/**
 * Constructs the Markdown string from given package object.
 *
 * @param {object} pkg     -
 * @param {object} options -
 * @param {logger} logger  -
 * @returns {Md} - The instance.
 * @class Utility class which wraps a Markdown string and provides useful operations on this string.
 * @constructor
 */
function Md(pkg, options, logger) {

    if (logger) {
        this.logger = logger;
    } else {
        this.logger = console;
    }
    this.pkg = pkg;
    this.md = '';
    this.options = options;

    const self = this;

    this.dependency = function (name, options) {
   //     return new Promise (function (resolve, reject) {


            // find package's dependency path
            var depPkg = path.dirname(options.pkg) + '/node_modules/' + name + '/package.json';
            self.logger.debug('loading dependency entry: ' + depPkg);
            // load dependency's package
            var pkgReader = new PkgReader(self.logger);
            return pkgReader.read({pkg: depPkg})
                .then(function (pkg) {
                    var depEntry = '- ' + createDepUrl(pkg) + (pkg.description
                            ? (': ' + pkg.description)
                            : '');
                    self.logger.debug(depEntry);
                    //self.logger.debug('MD: ' + self.md);
                    return self.append(depEntry, 1)
                })
                .then(function (result) {
                    return result;
                    //return resolve(result);
                })
                .catch(function (err) {
                    self.logger.error('found error while reading dependencies, pls ensure that \'npm install\' is called before using pkg2md: ' + err);
                    throw err;
                    //return reject(err);
                });
    //    });
    };

    this.writeDependencyEntries = function (pkg, type, options) {
        var sortedPackageNames = Object.keys(pkg[type]).sort();
        self.logger.debug('sorted ' + type + ' package names: ' + JSON.stringify(sortedPackageNames));

        return Promise.each(sortedPackageNames, function(name, index, length) {
                return self.dependency(name, options);
            })
            .then(function (result) {
                return self.nl(2);
            })
            .then(function (result) {
                return result;
            });


        //return new Promise (function (resolve, reject) {
        //    for (var name in sortedPackageNames) {
        //        self.dependency(sortedPackageNames[name], options)
        //            .then(function (result) {
        //                self.logger.debug('written dependency ' + sortedPackageNames[name]);
        //                return result;
        //            })
        //            .catch(function (err) {
        //                reject(err);
        //            });
        //    }
            //sortedPackageNames.forEach(function (name, index) {
            //    self.dependency(name, options)
            //        .then(function (result) {
            //            self.logger.debug('written dependency ' + name);
            //            return result;
            //        })
            //        .catch(function (err) {
            //            reject(err);
            //        });
            //});
            //self.logger.debug('FINSIHED ALL DEP ENTRIES!!!!!');
        //    resolve(self);
        //});
    };

    return this;
}

Md.prototype = {};
Md.prototype.constructor = Md;

function headlinePrefix(headlineDepth) {
    return new Promise (function (resolve) {
        var headlineDepthPrefix = '';
        if (headlineDepth !== undefined && typeof headlineDepth === 'number' && headlineDepth > 0) {
            for (var i = headlineDepth; i > 0; i--) {
                headlineDepthPrefix += '#';
            }
        }
        resolve(headlineDepthPrefix);
    });
}

function createDepUrl(pkg) {
    var url;
    if (pkg.repository && pkg.repository.url && ghUrl(pkg.repository.url)) {
        url = createUrl(ghUrl(pkg.repository.url).https_url, pkg.name);
    } else if (pkg.homepage) {
        url = createUrl(pkg.homepage, pkg.name);
    } else if (pkg.publishConfig && pkg.publishConfig.registry) {
        url = createUrl(urlJoin(pkg.publishConfig.registry, pkg.name), pkg.name);
    } else {
        url = createUrl('https://www.npmjs.com/package', pkg.name);
    }
    return url;
}

function createUrl(url, name) {
    var value = name || parseHostFromUrl(url);
    return '[' + value + '](' + url + ')';
}

function parseHostFromUrl(urlValue) {
    var parsedUrl = url.parse(urlValue, true, true);
    return parsedUrl.hostname;
}

/**
 * Appends the given `content` to the Markdown string and adds newlines.
 *
 * @param {string} content    - The content to append.
 * @param {number} [amount=2] - The amount of newlines to add.
 * @returns {Md}              - This instance for concatenated calls.
 * @public
 */
Md.prototype.append = function(content, amount) {
    this.md += content;
    return this.nl(amount)
        .then(function(result){
            return result;
        });
};

/**
 * Adds newlines of the given `amount`.
 *
 * @param {number} [amount=2] - The amount of newlines to add.
 * @returns {Md} - This instance for concatenated calls.
 * @public
 */
Md.prototype.nl = function(amount) {
    var self = this;
    return new Promise (function (resolve) {
        amount = (amount === undefined)
            ? 2
            : amount;
        var newlines = '';
        for (var i = amount; i > 0; i--) {
            newlines += os.EOL;
        }
        self.md += newlines;
        self.logger.debug('writing newlines: ' + amount);
        resolve(self);
    });
};

Md.prototype.headline = function(content, headlineDepth) {
    var self = this;
    return headlinePrefix(this.options.headline + (headlineDepth || 0))
        .then(function (prefix) {
            return self.append(prefix + ' ' + content);
        });
};

Md.prototype.title = function() {
    var title;
    if (this.options.title) {
        title = this.options.title;
    } else {
        title = this.pkg.name;
    }

    if (this.options.ver && this.pkg.version && this.pkg.version !== '') {
        title += ' (v' + this.pkg.version + ')';
    }
    return this.headline(title)
        .then(function(result){
            return result;
        });

    //var self = this;
    //return new Promise (function (resolve, reject) {
    //    self.logger.debug('writing title...');
    //    if (self.options.title) {
    //        return resolve(self.headline(self.options.title, 0));
    //    } else {
    //        var name = self.pkg.name;
    //        if (self.options.version && self.pkg.version && self.pkg.version !== '') {
    //            name += ' (v' + self.pkg.version + ')';
    //        }
    //        return resolve(self.headline(name));
    //    }
    //});
};

Md.prototype.description = function() {
    var self = this;
    return new Promise (function (resolve) {
        if (self.options.desc && self.pkg.description && self.pkg.description !== '') {
            self.logger.debug('writing description...');
            //this.logger.debug('writing description...end: ' + this.md);
            self.append(self.pkg.description)
                .then(function(result){
                    return resolve(result);
                });
        }
        resolve(self);
    });
};

Md.prototype.installation = function() {
    var self = this;
    return new Promise (function (resolve) {
        if (self.options.inst) {
            self.logger.debug('writing installation...');
            var registry = self.pkg.publishConfig.registry || constants.DEFAULT_REGISTRY;
            return self.headline('Installation', 1)
                .then(function (result) {
                    return self.append('Download node.js at ' + createUrl('https://nodejs.org') + ' and install it, if you haven\'t already.');
                })
                .then(function (result) {
                    if (self.pkg.preferGlobal) {
                        return self.headline('Global (Preferred)', 3)
                            .then(function (result) {
                                return self.append('```' + os.EOL + '$ npm install ' + self.pkg.name + ' --global registry ' + registry + os.EOL + '```');
                            });
                    } else {
                        return result;
                    }
                })
                .then(function (result) {
                    return self.headline('Local', 3);
                })
                .then(function (result) {
                    return self.append('```' + os.EOL + '$ npm install ' + self.pkg.name + ' --save registry ' + registry + os.EOL + '```');
                })
                .then(function (result) {
                    return resolve(result);
                });

            //var registry = self.pkg.publishConfig.registry || constants.DEFAULT_REGISTRY;
            //self.append('Download node.js at ' + createUrl('https://nodejs.org') + ' and install it, if you haven\'t already.');
            //
            //if (self.pkg.preferGlobal) {
            //    self.headline('Global (Preferred)', 3);
            //    self.append('```' + os.EOL + '$ npm install ' + self.pkg.name + ' --global registry ' + registry + os.EOL + '```');
            //}
            //
            //self.headline('Local', 3);
            //self.append('```' + os.EOL + '$ npm install ' + self.pkg.name + ' --save registry ' + registry + os.EOL + '```');
        }
        resolve(self);
    });
};

Md.prototype.tests = function() {
    var self = this;
    return new Promise (function (resolve) {
        if (self.options.tests) {
            self.logger.debug('writing tests...');
            return self.headline('Test', 1)
                .then(function (result) {
                    return self.append('Test execution:');
                })
                .then(function (result) {
                    return self.append('```' + os.EOL + '$ npm install' + os.EOL + '$ npm test' + os.EOL + '```', 2);
                })
                .then(function (result) {
                    return resolve(result);
                });
        }
        resolve(self);
    });
};

function getPackageType(depType) {
    switch (depType) {
        case constants.DEPENDENCY_TYPE_PROD:
            return 'dependencies';
        case constants.DEPENDENCY_TYPE_DEV:
            return 'devDependencies';
        case constants.DEPENDENCY_TYPE_BUNDLED:
            return 'bundledDependencies';
        case constants.DEPENDENCY_TYPE_OPTIONAL:
            return 'optionalDependencies';
        case constants.DEPENDENCY_TYPE_PEER:
            return 'peerDependencies';
        default:
            throw new Error('invalid dependency type: \'' + depType + '\'');
    }
}

Md.prototype.dependencies = function(depType) {
    var self = this;
    return new Promise (function (resolve) {
        var type = getPackageType(depType);
        if (self.options[depType + (depType === '' ? 'deps' : 'Deps')] && self.pkg[type]) {
            self.logger.debug('writing ' + depType + 'Dependencies...');

            return self.headline(type, 1)
                .then(function (result) {
                    return self.writeDependencyEntries(self.pkg , type, self.options);
                })
                .then(function (result) {
                    self.logger.debug('writing ' + depType + 'Dependencies...END');
                    return resolve(result);
                });
        }
        self.logger.debug('writing ' + depType + 'Dependencies (none)...END');
        return resolve(self);
    });
};


Md.prototype.license = function() {
    var self = this;
    return new Promise (function (resolve) {
        if (self.options.lic && self.pkg.license && self.pkg.license !== '') {
            self.logger.debug('writing license...');
            return self.headline('License', 1)
                .then(function (result) {
                    return self.append(self.pkg.license);
                })
                .then(function (result) {
                    return resolve(result);
                });
        }
        resolve(this);
    });
};

/**
 * Returns the Markdown string (optionally adds newlines).
 *
 * @param {number} [amount] - The final amount of newlines.
 * @returns {*}
 */
Md.prototype.end = function(amount) {
    return this.nl(amount)
        .then(function (result) {
            return result.md;
        });
};

module.exports = Md;
