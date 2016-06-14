'use strict';

var constants = require('./constants');
var PkgReader = require('./pkg-reader');
var LogAdapter = require('./log-wrapper');
var Promise = require('bluebird');
var mkdirp = require('mkdirp-then');
var path = require('path');
var fs = Promise.promisifyAll(require('fs'));
var os = require('os');
var url = require('url');
var ghUrl = require('github-url-to-object');
var urlJoin = require('url-join');
var stringify = require('json-stringify-safe');
var flatten = require('flat');

///////////////////////////////////////////////////////////////////////////////
// CONSTRUCTOR
///////////////////////////////////////////////////////////////////////////////

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

    this.logger = new LogAdapter(logger);
    this.pkg = pkg;
    this.markdown = '';
    this.options = options;

    var self = this;

    ///////////////////////////////////////////////////////////////////////////////
    // PRIVILEGED FUNCTIONS
    ///////////////////////////////////////////////////////////////////////////////

    this.dependency = function dependency(name, options) {
   //     return new Promise (function (resolve, reject) {


            // find package's dependency path
            var depPkg = path.dirname(options.pkg) + '/node_modules/' + name + '/package.json';
            self.logger.debug('loading dependency entry: ' + depPkg);
            // load dependency's package
            var pkgReader = new PkgReader(self.logger);
            return pkgReader.read({pkg: depPkg})
                .then(function (pkg) {
                    var depEntry = '- ' + createDepLink(pkg) + (pkg.description
                            ? (': ' + pkg.description)
                            : '');
                    self.logger.debug(depEntry);
                    //self.logger.debug('MD: ' + self.markdown);
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
                return self.nl(1);
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

///////////////////////////////////////////////////////////////////////////////
// PRIVATE FUNCTIONS
///////////////////////////////////////////////////////////////////////////////

/**
 * Creates a headline prefix from given depth number.
 * @param {number} headlineDepth - The amount of hash-signs forprefix.
 * @returns {Promise.<string>} - A Promise resolving the created prefix.
 * @private
 */
function createHeadlinePrefix(headlineDepth) {
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

function createDepLink(pkg) {
    var url;
    if (pkg.repository && pkg.repository.url && ghUrl(pkg.repository.url)) {
        url = createLink(ghUrl(pkg.repository.url).https_url, pkg.name);
    } else if (pkg.homepage) {
        url = createLink(pkg.homepage, pkg.name);
    } else if (pkg.publishConfig && pkg.publishConfig.registry) {
        url = createLink(urlJoin(pkg.publishConfig.registry, pkg.name), pkg.name);
    } else {
        url = createLink('https://www.npmjs.com/package', pkg.name);
    }
    return url;
}

function createLink(url, name) {
    var value = name || parseHostFromUrl(url);
    return '[' + value + '](' + url + ')';
}

function parseHostFromUrl(urlValue) {
    var parsedUrl = url.parse(urlValue, true, true);
    return parsedUrl.hostname;
}

function getDepTypeName(depType, headline) {
    switch (depType) {
        case constants.DEPENDENCY_TYPE_PROD:
            return headline ? 'Dependencies' : 'dependencies';
        case constants.DEPENDENCY_TYPE_DEV:
            return headline ? 'Development Dependencies' : 'devDependencies';
        case constants.DEPENDENCY_TYPE_BUNDLE: // fallthrough
        case constants.DEPENDENCY_TYPE_BUNDLED:
            return headline ? 'Bundled Dependencies' : 'bundledDependencies';
        case constants.DEPENDENCY_TYPE_OPTIONAL:
            return headline ? 'Optional Dependencies' : 'optionalDependencies';
        case constants.DEPENDENCY_TYPE_PEER:
            return headline ? 'Peer Dependencies' : 'peerDependencies';
        default:
            throw new Error('invalid dependency type: \'' + depType + '\'');
    }
}

function createTableHeaderDivider(length) {
    var suffix = ' --- |';
    var divider = '|';
    for (var i = 0; i < length; i ++) {
        divider += suffix;
    }
    return divider;
}

function createTableHeader(entries) {
    var header = '';
    for (var i = 0; i < entries.length; i ++) {
        header += '| ' + entries[i] + ' ';
    }
    header += ' |' + os.EOL + createTableHeaderDivider(entries.length);
    return header;
}

function createPersonLine(role, name, url, email, subject) {
    return '| ' + role + ' | ' + (url ? '[' + name + '](' + url + ')' : name) + ' |' + (email ? ' [' + email + '](mailto:' + email + (subject ? '?subject=' + subject : '') + ') ' : ' - ') + '|';
}

/**
 * Does a lower case person name sort.
 * @param {object|string} person1 - The one person to sort against `person2`, if type is `Object` then `person1.name` is used for sorting!
 * @param {object|string} person2 - The one person to sort against `person1`, if type is `Object` then `person2.name` is used for sorting!
 * @returns {number}
 * @private
 */
function personSort(person1, person2) {
    var a;
    var b;
    if (typeof person1 === 'string') {
        a = person1;
    } else {
        a = person1.name;
    }

    if (typeof person2 === 'string') {
        b = person2;
    } else {
        b = person2.name;
    }

    a = a.toLowerCase();
    b = b.toLowerCase();
    if ( a == b) {
        return 0;
    }
    if ( a > b) {
        return 1;
    }
    return -1;
}

///////////////////////////////////////////////////////////////////////////////
// PUBLIC FUNCTIONS
///////////////////////////////////////////////////////////////////////////////

/**
 * Appends the given `content` to the Markdown string and adds newlines.
 * @param {string} content    - The content to append.
 * @param {number} [amount=2] - The amount of newlines to add.
 * @returns {Md}              - This instance for concatenated calls.
 * @public
 */
Md.prototype.append = function(content, amount) {
    this.markdown += content;
    return this.nl(amount);
};

/**
 * Appends the given `content` to the Markdown string as code block and adds newlines.
 * @param {string} content    - The content to append as code block.
 * @param {number} [amount=2] - The amount of newlines to add.
 * @param {string} [language] - The language of the code.
 * @returns {Promise.<Md>}    - This instance for concatenated calls.
 * @public
 */
Md.prototype.appendCodeBlock = function(content, amount, language) {
    if (!language && typeof amount === 'string') {
        language = amount;
        amount = undefined;
    }
    return this.append('```' + (language ? language : '') + os.EOL + content + os.EOL + '```', amount);
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
        self.markdown += newlines;
        //self.logger.debug('writing newlines: ' + amount); // TODO remove!
        resolve(self);
    });
};

Md.prototype.headline = function(content, headlineDepth) {
    var self = this;
    return createHeadlinePrefix(this.options.headline + (headlineDepth || 0))
        .then(function (prefix) {
            return self.append(prefix + ' ' + content);
        });
};

Md.prototype.title = function() {
    var self = this;
    return new Promise (function (resolve) {
        var title;
        if (self.options.title) {
            title = self.options.title;
        } else {
            title = self.pkg.name;
        }

        if (self.options.ver && self.pkg.version && self.pkg.version !== '') {
            title += ' (v' + self.pkg.version + ')';
        }

        if (self.pkg.homepage) {
            title = '[' + title + '](' + self.pkg.homepage + ')';
        }
        self.headline(title)
            .then(function (result) {
                resolve(result);
            });
    });
};

/**
 * Writes a description if `option.desc` is set to `true`.
 * @returns {Promise.<Md>} - The `Promise` resolving with `this`.
 * @public
 */
Md.prototype.description = function() {
    var self = this;
    return new Promise (function (resolve) {
        if (self.options.desc && self.pkg.description && self.pkg.description !== '') {
            self.logger.debug('writing description...');
            //this.logger.debug('writing description...end: ' + this.markdown);
            return self.append(self.pkg.description)
                .then(function(result){
                    return resolve(result);
                });
        }
        resolve(self);
    });
};

/**
 * Parses a stringified person info , e.g. which has such a pattern:
 * ```
 * Barney Rubble <b@rubble.com> (http://barnyrubble.tumblr.com/)
 * ```
 * @param {string} person - The person's string to parse.
 * @returns Promise.<{{[name]: string, [email]: string, [url]: string}}> - A Promise resolving the person object.
 * @public
 */
Md.prototype.parseStringifiedPerson = function(person) {
    var self = this;
    return new Promise(function (resolve) {
        //"Barney Rubble <b@rubble.com> (http://barnyrubble.tumblr.com/)"
        var nameRegExp = /(^.* <)|(^.+$)/;
        var emailRegExp = /<.+>/;
        var urlRegExp = /\(.+\)/;

        var object = {};

        var nameMatch = nameRegExp.exec(person);
        if (nameMatch) {
            object.name = nameMatch[0].substring(0, nameMatch[0].length - 2);
        }
        self.logger.debug('NAME: ' + object.name);

        var emailMatch = emailRegExp.exec(person);
        if (emailMatch) {
            object.email = emailMatch[0].substring(1, emailMatch[0].length - 1);
        }
        self.logger.debug('EMAIL: ' + object.mail);

        var urlMatch = urlRegExp.exec(person);
        if (urlMatch) {
            object.url = urlMatch[0].substring(1, urlMatch[0].length - 1);
        }
        self.logger.debug('URL: ' + object.url);

        resolve(object);
    });
};

Md.prototype.repository = function (headline) {
    var self = this;
    return new Promise(function (resolve) {
        headline = headline || 'Repository';
        return self.headline(headline, 1)
            .then(function (result) {
                var type;
                var url;
                if (self.pkg.repository && (typeof self.pkg.repository === 'string')) {
                    // For GitHub, GitHub gist, Bitbucket, or GitLab repositories you can use the same shortcut syntax you use for npm install:
                    //    "repository": "npm/npm"
                    //    "repository": "gist:11081aaa281"
                    //    "repository": "bitbucket:example/repo"
                    //    "repository": "gitlab:another/repo"
                    if (/^npm/.test(self.pkg.repository)) {
                        type = 'npm';
                    } else {
                        type = self.pkg.repository.split(':')[0];
                    }
                    url = self.pkg.repository;
                    var headerEntries = [ 'Type', 'Shortcut' ];
                    var header = createTableHeader(headerEntries);
                    return self.append(header, 1)
                        .then(function (result) {
                            return self.append('| ' + type + ' | ' + url + ' |', 1);
                        })
                        .then(function (result) {
                            return self.nl(1);
                        });
                } else {
                    if (self.pkg.repository.url) {
                        if (ghUrl(self.pkg.repository.url)) {
                            url = ghUrl(self.pkg.repository.url).https_url;
                        } else {
                            url = '[' + self.pkg.repository.url + '](' + self.pkg.repository.url + ')';
                        }
                        type = self.pkg.repository.type;
                        var headerEntries = [ 'Type', 'Link' ];
                        var header = createTableHeader(headerEntries);
                        return self.append(header, 1)
                            .then(function (result) {
                                return self.append('| ' + type + ' | ' + url + ' |', 1);
                            })
                            .then(function (result) {
                                return self.nl(1);
                            });
                    }
                }
            })
            .then(function (result) {
                return resolve(result);
            });
    });
};

Md.prototype.staff = function(headline) {
    var self = this;
    return new Promise(function (resolve) {
        if (self.options.staff && (self.pkg.author || (self.pkg.contributors && self.pkg.contributors.length > 0) || (self.pkg.maintainers && self.pkg.maintainers.length > 0))) {
            self.logger.debug('writing Collaborators...');
            headline = headline || 'Collaborators';
            var subject = self.pkg.name;
            return self.headline(headline, 1)
                .then(function (result) {
                    return self.append(createTableHeader([ 'Role', 'Name', 'Email' ]), 1);
                })
                .then(function (result) {
                    if (self.pkg.author) {
                        if (typeof self.pkg.author === 'string') {
                            return self.parseStringifiedPerson(self.pkg.author)
                                .then(function (object) {
                                    return self.append(createPersonLine('Author', object.name, object.url, object.email, subject), 1);
                                });
                        } else {
                            return self.append(createPersonLine('Author', self.pkg.author.name, self.pkg.author.url, self.pkg.author.email, subject), 1);
                        }
                    }
                    return result;
                })
                .then(function (result) {
                    return Promise.each(self.pkg.contributors.sort(personSort), function(contributor) {
                        if (typeof contributor === 'string') {
                            return self.parseStringifiedPerson(contributor)
                                .then(function (object) {
                                    return self.append(createPersonLine('Contributor', object.name, object.url, object.email, subject), 1);
                                });
                        } else {
                            return self.append(createPersonLine('Contributor', contributor.name, contributor.url, contributor.email, subject), 1);
                        }
                    });
                })
                .then(function (result) {
                    return Promise.each(self.pkg.maintainers.sort(personSort), function(maintainer) {
                        if (typeof maintainer === 'string') {
                            return self.parseStringifiedPerson(maintainer)
                                .then(function (object) {
                                    return self.append(createPersonLine('Maintainer', object.name, object.url, object.email, subject), 1);
                                });
                        } else {
                            return self.append(createPersonLine('Maintainer', maintainer.name, maintainer.url, maintainer.email, subject), 1);
                        }
                    });
                })
                .then(function () {
                    return resolve(self);
                });
        }
        return resolve(self);
    });
};

Md.prototype.installation = function(headline) {
    var self = this;
    return new Promise (function (resolve) {
        if (self.options.inst) {
            self.logger.debug('writing installation...');
            headline = headline || 'Installation';
            var registry;
            if (self.pkg.publishConfig) {
                registry = self.pkg.publishConfig.registry || constants.DEFAULT_REGISTRY;
            } else {
                registry = constants.DEFAULT_REGISTRY;
            }
            return self.headline(headline, 1)
                .then(function (result) {
                    return self.append('Download node.js at ' + createLink('https://nodejs.org') + ' and install it, if you haven\'t already.', 0);
                })
                .then(function (result) {
                    if (!!self.pkg.private) {
                        return self.append(' The module is _private_' + ((self.pkg.publishConfig && self.pkg.publishConfig.registry) ? ', but can be retrieved from registry [' + self.pkg.publishConfig.registry + '](' + self.pkg.publishConfig.registry + ').' : '.'), 0);
                    }
                })
                .then(function (result) {
                    return self.append(' Ensure the proper registry setting before `npm install`:', 2);
                })
                .then(function (result) {
                    return self.appendCodeBlock('$ npm config set registry ' + registry);
                })
                .then(function (result) {
                    if (self.pkg.preferGlobal) {
                        return self.headline('Global (Preferred)', 3)
                            .then(function (result) {
                                return self.appendCodeBlock('$ npm install ' + self.pkg.name + ' --global');
                            });
                    } else {
                        return result;
                    }
                })
                .then(function (result) {
                    return self.headline('Local', 3);
                })
                .then(function (result) {
                    return self.appendCodeBlock('$ npm install ' + self.pkg.name + ' --save');
                })
                .then(function (result) {
                    return self.append('or as `devDependency`:');
                })
                .then(function (result) {
                    return self.appendCodeBlock('$ npm install ' + self.pkg.name + ' --save-dev');
                })
                .then(function (result) {
                    return resolve(result);
                });
        }
        resolve(self);
    });
};

Md.prototype.tests = function(headline) {
    var self = this;
    return new Promise (function (resolve) {
        if (self.options.tests) {
            self.logger.debug('writing tests...');
            headline = headline || 'Test';
            return self.headline(headline, 1)
                .then(function (result) {
                    return self.append('Test execution:');
                })
                .then(function (result) {
                    return self.appendCodeBlock('$ npm install' + os.EOL + '$ npm test', 2);
                })
                .then(function (result) {
                    return resolve(result);
                });
        }
        resolve(self);
    });
};

/**
 * Writes the dependencies info for given dependency type if `option.deps` is set to `true`.
 * @param {string} depType - The type of dependencies.
 * @returns {Promise.<Md>}                - A `Promise` resolving with `this`.
 * @public
 */
Md.prototype.dependencies = function(depType) {
    var self = this;
    return new Promise (function (resolve) {
        var type = getDepTypeName(depType);
        if (self.options.deps && self.pkg[type]) {
            self.logger.debug('writing ' + depType + 'Dependencies...');

            return self.headline(getDepTypeName(depType, true), 1)
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

/**
 * Writes the binary mappings if `option.bin` is set to `true`.
 * @param {string} [headline=Binary Mappings] - A headline for the section.
 * @returns {Promise.<Md>}                    - A `Promise` resolving with `this`.
 * @public
 */
Md.prototype.bin = function(headline) {
    var self = this;
    return new Promise(function (resolve) {
        if (self.options.bin && self.pkg.bin && Object.keys(self.pkg.bin).length > 0) {
            self.logger.debug('writing binary mappings...');
            headline = headline || 'Binary Mappings';
            return self.headline(headline, 1)
                .then(function (result) {
                    return Promise.each(Object.keys(self.pkg.bin), function(key, index, length) {
                            return self.append('- `$ ' + key + '` ⇒ _' + self.pkg.bin[key] + '_');
                        })
                        .then(function (result) {
                            //self.logger.debug('RESULT::: ' + stringify(result));
                            return resolve(self);
                        });
                });
        }
        return resolve(self);
    });
};

/**
 * Writes the main executable if `option.main` is set to `true`.
 * @param {string} [headline=Main File] - A headline for the section.
 * @returns {Promise.<Md>}              - A `Promise` resolving with `this`.
 * @public
 */
Md.prototype.main = function(headline) {
    var self = this;
    return new Promise (function (resolve) {
        if (self.options.main && self.pkg.main && self.pkg.main !== '') {
            self.logger.debug('writing Main File...');
            headline = headline || 'Main File';
            return self.headline(headline, 1)
                .then(function (result) {
                    return self.append('- _' + self.pkg.main + '_');
                })
                .then(function (result) {
                    return resolve(result);
                });
        }
        resolve(self);
    });
};

/**
 * Writes the NPM configuration mappings if `option.config` is set to `true`.
 * @param {string} [headline=NPM Config] - A headline for the section.
 * @returns {Promise.<Md>}               - A `Promise` resolving with `this`.
 * @public
 */
Md.prototype.config = function(headline) {
    var self = this;
    return new Promise(function (resolve) {
        if (self.options.config && self.pkg.config && Object.keys(self.pkg.config).length > 0) {
            self.logger.debug('writing NPM Configuration...');
            headline = headline || 'NPM Configuration';
            var headerEntries = [ 'Property (flattened)', 'Value', 'Applicable in `scripts` Section' ];
            return self.headline(headline, 1)
                .then(function (result) {
                    return self.append(createTableHeader(headerEntries), 1);
                })
                .then(function (result) {
                    var config = flatten(self.pkg.config);

                    var sortedKeys = Object.keys(config).sort();
                    return Promise.each(sortedKeys, function(key, index, length) {
                            self.logger.debug('Config key::: ' + key);
                            var entry = '| `' + key + '` | ' + config[key] + ' | `$npm_package_config_' + key.replace(/\./g, '_') + '`|';
                            return self.append(entry, 1);
                        })
                        .then(function (result) {
                            return self.nl();
                        })
                        .then(function (result) {
                            return resolve(self);
                        });
                });
        }
        return resolve(self);
    });
};

/**
 * Writes the NPM scripts mappings if `option.scripts` is set to `true`.
 * @param {string} [headline=NPM Scripts] - A headline for the section.
 * @returns {Promise.<Md>}                - A `Promise` resolving with `this`.
 * @public
 */
Md.prototype.scripts = function(headline) {
    var self = this;
    return new Promise(function (resolve) {
        if (self.options.scripts && self.pkg.scripts && Object.keys(self.pkg.scripts).length > 0) {
            self.logger.debug('writing NPM Scripting...');
            headline = headline || 'NPM Scripting';
            var headerEntries = [ 'Run Command', 'Script Executed' ];
            return self.headline(headline, 1)
                .then(function (result) {
                    return self.append(createTableHeader(headerEntries), 1);
                })
                .then(function (result) {
                    var sortedCommands = Object.keys(self.pkg.scripts).sort();
                    return Promise.each(sortedCommands, function(cmd, index, length) {
                            self.logger.debug('Scripts cmd::: ' + cmd);
                            var entry = '| `$ npm run ' + cmd + '` | `' + self.pkg.scripts[cmd] + '` |'; // TODO check if native command?
                            return self.append(entry, 1);
                        })
                        .then(function (result) {
                            return self.nl();
                        })
                        .then(function (result) {
                            return resolve(self);
                        });
                });
        }
        return resolve(self);
    });
};

/**
 * Writes the engines info if `option.engines` is set to `true`.
 * @param {string} [headline=Engine Support] - A headline for the section.
 * @returns {Promise.<Md>}                - A `Promise` resolving with `this`.
 * @public
 */
Md.prototype.engines = function(headline) {
    var self = this;
    return new Promise(function (resolve) {
        if (self.options.engines && self.pkg.engines && Object.keys(self.pkg.engines).length > 0) {
            self.logger.debug('writing engine support...');
            headline = headline || 'Engine Support';

            var strictness = '**NOTE:** ';
            if (!!self.pkg.engineStrict) { // default is false
                strictness += ' strict!'
            } else {
                strictness += ' advisory only!'
            }
            var headerEntries = [ 'Engine', 'Version' ];
            return self.headline(headline, 1)
                .then(function (result) {
                    return self.append(strictness, 2);
                })
                .then(function (result) {
                    return self.append(createTableHeader(headerEntries), 1);
                })
                .then(function (result) {
                    var sortedEngines = Object.keys(self.pkg.engines).sort();
                    return Promise.each(sortedEngines, function(engine, index, length) {
                            self.logger.debug('Engine::: ' + engine);
                            var entry = '| ' + engine + ' | ' + self.pkg.engines[engine] + ' |';
                            return self.append(entry, 1);
                        })
                        .then(function (result) {
                            return self.nl();
                        })
                        .then(function (result) {
                            return resolve(self);
                        });
                });
        }
        return resolve(self);
    });
};

/**
 * Writes the keywords if `option.keywords` is set to `true`.
 * @param {string} [headline=Keywords] - A headline for the section.
 * @returns {Promise.<Md>}             - A `Promise` resolving with `this`.
 */
Md.prototype.keywords = function(headline) {
    var self = this;
    return new Promise(function (resolve) {
        if (self.options.keywords && self.pkg.keywords && self.pkg.keywords.length > 0) {
            self.logger.debug('writing Keywords...');
            headline = headline || 'Keywords';
            return self.headline(headline, 1)
                .then(function (result) {
                    return self.append(self.pkg.keywords.sort().toString().replace(/,/g, ', '));
                })
                .then(function (result) {
                    return resolve(self);
                });
        }
        return resolve(self);
    });
};

/**
 * Writes the OS support if `option.os` is set to `true`.
 * @param {string} [headline=OS Support] - A headline for the section.
 * @returns {Promise.<Md>}               - A `Promise` resolving with `this`.
 */
Md.prototype.os = function(headline) {
    var self = this;
    return new Promise(function (resolve) {
        if (self.options.os && self.pkg.os && self.pkg.os.length > 0) {
            self.logger.debug('writing OS support...');
            headline = headline || 'OS Support';
            var headerEntries = [ 'Supported', 'Not Supported' ];
            return self.headline(headline, 1)
                .then(function (result) {
                    return self.append(createTableHeader(headerEntries), 1);
                })
                .then(function (result) {
                    var notRegExp = /^!/;
                    return Promise.each(self.pkg.os, function(os, index, length) {
                            var entry;
                            self.logger.debug('OS::: ' + os);
                            if (notRegExp.test(os)) {
                                entry = '| - | ' + os.substring(1) + ' |';
                            } else {
                                entry = '| ' + os + ' | - |';
                            }
                            return self.append(entry, 1);
                        })
                        .then(function (result) {
                            return self.nl();
                        })
                        .then(function (result) {
                            return resolve(self);
                        });
                });
        }
        return resolve(self);
    });
};

/**
 * Writes the CPU support if `option.cpu` is set to `true`.
 * @param {string} [headline=CPU Support] - A headline for the section.
 * @returns {Promise.<Md>}                - A `Promise` resolving with `this`.
 */
Md.prototype.cpu = function(headline) {
    var self = this;
    return new Promise(function (resolve) {
        if (self.options.cpu && self.pkg.cpu && self.pkg.cpu.length > 0) {
            self.logger.debug('writing CPU support...');
            headline = headline || 'CPU Support';
            var headerEntries = [ 'Supported', 'Not Supported' ];
            return self.headline(headline, 1)
                .then(function (result) {
                    return self.append(createTableHeader(headerEntries), 1);
                })
                .then(function (result) {
                    var notRegExp = /^!/;
                    return Promise.each(self.pkg.cpu, function(cpu, index, length) {
                            var entry;
                            self.logger.debug('CPU::: ' + cpu);
                            if (notRegExp.test(cpu)) {
                                entry = '| - | ' + cpu.substring(1) + ' |';
                            } else {
                                entry = '| ' + cpu + ' | - |';
                            }
                            return self.append(entry, 1);
                        })
                        .then(function (result) {
                            return self.nl();
                        })
                        .then(function (result) {
                            return resolve(self);
                        });
                });
        }
        return resolve(self);
    });
};

/**
 * Writes the License(s) if `option.lic` is set to `true`.
 * @param {string} [headline=License|Licenses] - A headline for the section.
 * @returns {Promise.<Md>}                     - A `Promise` resolving with `this`.
 */
Md.prototype.license = function(headline) {
    var self = this;
    return new Promise (function (resolve) {
        if (self.options.lic) {
            self.logger.debug('writing license...');
            if (self.pkg.license && self.pkg.license !== '') {
                headline = headline || 'License';
                return self.headline(headline, 1)
                    .then(function (result) {
                        return self.append(self.pkg.license);
                    })
                    .then(function (result) {
                        return resolve(result);
                    });
            } else {
                if (self.pkg.licenses && self.pkg.licenses.length > 0) {
                    headline = headline || 'Licenses';
                    return self.headline(headline, 1)
                        .then(function (result) {
                            return Promise.each(self.pkg.licenses, function (license, index, length) {
                                self.logger.debug('License::: ' + license);
                                return self.append('- ' + license, 1);
                            })
                        })
                        .then(function () {
                            return self.nl();
                        })
                        .then(function (result) {
                            return resolve(self);
                        });
                }
            }
        }
        resolve(self);
    });
};

/**
 * Returns the Markdown string (optionally adds newlines), ususally after creation has finished.
 * @param {number} [amount] - The final amount of newlines.
 * @returns {string} - The Markdown created.
 */
Md.prototype.end = function(amount) {
    return this.nl(amount)
        .then(function (result) {
            return result.markdown;
        });
};

module.exports = Md;
