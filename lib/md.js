'use strict';

var constants = require('./constants');
var PkgReader = require('./pkg-reader');
var LogAdapter = require('./log-adapter');
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

/**
 * @typedef {object} Person
 * @property {string} [name=undefined]  - The name of the person.
 * @property {string} [email=undefined] - The email of the person.
 * @property {string} [url=undefined]   - The URL of the person's page.
 */

///////////////////////////////////////////////////////////////////////////////
// CONSTRUCTOR
///////////////////////////////////////////////////////////////////////////////

/**
 * Constructs the Markdown string from given package object.
 *
 * @param {object} pkg      - The _package.json_ representation as object.
 * @param {Options} options - The
 * @param {logger} logger   - The logger to use.
 * @returns {Md} - The instance.
 * @class Utility class which wraps a Markdown string and provides useful operations on this string.
 * @constructor
 */
function Md(pkg, options, logger) {
    this.logger = new LogAdapter(logger);
    this.pkg = pkg;
    this.markdown = '';
    this.options = options;
    this.baseHeadlineSize = options.headline;

    var self = this;

    ///////////////////////////////////////////////////////////////////////////////
    // PRIVILEGED FUNCTIONS
    ///////////////////////////////////////////////////////////////////////////////

    /**
     * Writes a dependency entry.
     * @param pkgPath
     * @param name
     * @param version
     * @returns {*}
     * @protected
     */
    this.dependency = function dependency(pkgPath, name, version) {
        //     return new Promise (function (resolve, reject) {

        // find package's dependency path
        var depPkg = path.dirname(pkgPath) + '/node_modules/' + name + '/package.json';
        self.logger.debug('loading dependency entry: ' + depPkg);
        // load dependency's package
        var pkgReader = new PkgReader(self.logger);
        return pkgReader.read(depPkg, false)
            .then(function (pkg) {
                var depEntry = '- ' + createDepLink(pkg, version) + (pkg.description
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

    /**
     *
     * @param pkgPath
     * @param pkg
     * @param type
     * @returns {Thenable<U>}
     * @protected
     */
    this.writeDependencyEntries = function (pkgPath, pkg, type) {
        var sortedPackageNames = Object.keys(pkg[type]).sort();
        self.logger.debug('sorted ' + type + ' package names: ' + JSON.stringify(sortedPackageNames));

        return Promise.each(sortedPackageNames, function (name) {
            return self.dependency(pkgPath, name, pkg[type][name]);
        })
            .then(function (result) {
                return self.nl(1);
            })
            .then(function (result) {
                return result;
            });
    };
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
    return new Promise(function (resolve) {
        var headlineDepthPrefix = '';
        if (headlineDepth !== undefined && typeof headlineDepth === 'number' && headlineDepth > 0) {
            for (var i = headlineDepth; i > 0; i--) {
                headlineDepthPrefix += '#';
            }
        }
        resolve(headlineDepthPrefix);
    });
}

/**
 * Creates a link URL for a dependency.
 * @param {object} pkg - The resolved package of the dependency used to create the URL.
 * @param version - The referenced and required dependency version from parent package (not the actually installed one!).
 * @returns {String} - The URL string of the link.
 * @private
 */
function createDepLink(pkg, version) {
    var url;
    var versionStr = ' (' + version + ')';
    if (pkg.repository && pkg.repository.url && ghUrl(pkg.repository.url)) {
        url = createLink(ghUrl(pkg.repository.url).https_url, pkg.name + versionStr);
    } else if (pkg.homepage) {
        url = createLink(pkg.homepage, pkg.name + versionStr);
    } else if (pkg.publishConfig && pkg.publishConfig.registry) {
        url = createLink(urlJoin(pkg.publishConfig.registry, pkg.name), pkg.name + versionStr);
    } else {
        url = createLink('https://www.npmjs.com/package', pkg.name + versionStr);
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
    for (var i = 0; i < length; i++) {
        divider += suffix;
    }
    return divider;
}

function createTableHeader(entries) {
    var header = '';
    for (var i = 0; i < entries.length; i++) {
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
 * @param {Person|string} person1 - The one person to sort against `person2`, if type is `Object` then `person1.name` is used for sorting!
 * @param {Person|string} person2 - The one person to sort against `person1`, if type is `Object` then `person2.name` is used for sorting!
 * @returns {number}
 * @private
 */
function personSort(person1, person2) {
    var p1;
    var p2;
    if (typeof person1 === 'string') {
        p1 = person1;
    } else {
        p1 = person1.name;
    }

    if (typeof person2 === 'string') {
        p2 = person2;
    } else {
        p2 = person2.name;
    }

    p1 = p1.toLowerCase();
    p2 = p2.toLowerCase();
    if (p1 == p2) {
        return 0;
    }
    if (p1 > p2) {
        return 1;
    }
    return -1;
}

///////////////////////////////////////////////////////////////////////////////
// PUBLIC FUNCTIONS
///////////////////////////////////////////////////////////////////////////////

/**
 * Appends the given `content` to the Markdown string and adds newlines.
 * @param {string} content      - The content to append.
 * @param {number} [newlines=2] - The amount of newlines to add.
 * @returns {Promise.<Md>}      - This instance for concatenated calls.
 * @public
 */
Md.prototype.append = function (content, newlines) {
    this.markdown += content;
    return this.nl(newlines);
};

/**
 * Appends the given `content` to the Markdown string as code block and adds newlines.
 * @param {string} content      - The content to append as code block.
 * @param {number} [newlines=2] - The amount of newlines to add.
 * @param {string} [language]   - The language of the code.
 * @returns {Promise.<Md>}      - This instance for concatenated calls.
 * @public
 */
Md.prototype.appendCodeBlock = function (content, newlines, language) {
    if (!language && typeof newlines === 'string') {
        language = newlines;
        newlines = undefined;
    }
    return this.append('```' + (language ? language : '') + os.EOL + content + os.EOL + '```', newlines);
};

/**
 * Adds newlines of the given `amount`.
 * @param {number} [amount=2] - The amount of newlines to add.
 * @returns {Promise.<Md>} - This instance for concatenated calls.
 * @public
 */
Md.prototype.nl = function (amount) {
    var self = this;
    return new Promise(function (resolve) {
        amount = (amount === undefined)
            ? 2
            : amount;
        var newlines = '';
        for (var i = amount; i > 0; i--) {
            newlines += os.EOL;
        }
        self.markdown += newlines;
        resolve(self);
    });
};

/**
 *
 * @param {string} content       - The content used as headline.
 * @param {number} headlineSize - The depth of the headline.
 * @returns {Promise.<Md>}       - This instance for concatenated calls.
 * @public
 */
Md.prototype.headline = function (content, headlineSize) {
    var self = this;
    return createHeadlinePrefix(this.baseHeadlineSize + (headlineSize || 0))
        .then(function (prefix) {
            return self.append(prefix + ' ' + content);
        });
};

/**
 * Creates a title for the target document. A title is either applied from:
 * 1. `options.title` (if exists) or
 * 2. `pkg.name` (from _package.json_)
 * If `pkg.homepage` is set, the title will be turned into a link to its URL
 * value automatically.
 * @param {boolean} [postFixVersion=true] - Whether to postfix the version.
 * @returns {Promise.<Md>} - This instance for concatenated calls.
 * @public
 */
Md.prototype.title = function (postFixVersion) {
    var self = this;
    postFixVersion = postFixVersion !== false;
    return new Promise(function (resolve) {
        var title;
        if (self.options.title) {
            title = self.options.title;
        } else {
            title = self.pkg.name;
        }

        if (postFixVersion && self.pkg.version && self.pkg.version !== '') {
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
 * Writes a description if `this.pkg.description` is set and not empty string.
 * @returns {Promise.<Md>} - The `Promise` resolving with `this`.
 * @public
 */
Md.prototype.description = function () {
    var self = this;
    return new Promise(function (resolve) {
        if (self.pkg.description && self.pkg.description !== '') {
            self.logger.debug('writing description...');
            return self.append(self.pkg.description)
                .then(function (result) {
                    return resolve(result);
                });
        }
        resolve(self);
    });
};

/**
 * Parses a "flat" person info string, e.g. which has such a pattern:
 * ```
 * Barney Rubble <b@rubble.com> (http://barnyrubble.tumblr.com/)
 * ```
 * @param {string} person - The person's string to parse.
 * @returns {Promise.<Person>} - A Promise resolving the person object.
 * @public
 */
Md.prototype.parseStringifiedPerson = function (person) {
    var self = this;
    return new Promise(function (resolve) {

        var p = {};

        var nameMatch = constants.NAME_REG_EXP.exec(person);
        if (nameMatch) {
            p.name = nameMatch[0].substring(0, nameMatch[0].length - 2);
        }
        self.logger.debug('NAME: ' + p.name);

        var emailMatch = constants.EMAIL_REG_EXP.exec(person);
        if (emailMatch) {
            p.email = emailMatch[0].substring(1, emailMatch[0].length - 1);
        }
        self.logger.debug('EMAIL: ' + p.mail);

        var urlMatch = constants.URL_REG_EXP.exec(person);
        if (urlMatch) {
            p.url = urlMatch[0].substring(1, urlMatch[0].length - 1);
        }
        self.logger.debug('URL: ' + p.url);

        resolve(p);
    });
};

/**
 * Writes the repository section (a table overview about configured repositories).
 * @param {string} [headline=Repository] - The headline for this section.
 * @returns {Promise.<Md>} - The `Promise` resolving with `this` for concatenated calls.
 * @public
 */
Md.prototype.repository = function (headline) {
    var self = this;
    return new Promise(function (resolve) {
        if (self.pkg.repository) {
            headline = headline || 'Repository';
            self.logger.debug('writing Repository...');
            return self.headline(headline, 1)
                .then(function (result) {
                    var type;
                    var header;
                    if (typeof self.pkg.repository === 'string') {
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
                        var url = self.pkg.repository;
                        header = createTableHeader(['Type', 'Shortcut']);
                        return self.append(header, 1)
                            .then(function (result) {
                                return self.append('| ' + type + ' | ' + url + ' |', 1);
                            })
                            .then(function (result) {
                                return self.nl(1);
                            });
                    } else {
                        if (self.pkg.repository.url) {
                            type = self.pkg.repository.type;
                            header = createTableHeader(['Type', 'Link']);
                            var githubUrl = ghUrl(self.pkg.repository.url);
                            if (githubUrl) { // TODO gitlab, etc?!
                                type = 'Github';
                                self.logger.trace('TARBALL URL: ' + githubUrl.tarball_url);
                                self.logger.trace('CLONE URL: ' + githubUrl.clone_url);
                                self.logger.trace('TRAVIS URL: ' + githubUrl.travis_url);
                                self.logger.trace('ZIP URL: ' + githubUrl.zip_url);
                                self.logger.trace('API URL: ' + githubUrl.api_url);
                                return self.append(header, 1)
                                    .then(function (result) {
                                        return self.append('| ' + type + ' - Repo | ' + githubUrl.https_url + ' |', 1)
                                    })
                                    .then(function (result) {
                                        return self.append('| ' + type + ' - Clone | ' + githubUrl.clone_url + ' |', 1)
                                    })
                                    .then(function (result) {
                                        return self.append('| ' + type + ' - Tarball | ' + githubUrl.tarball_url + ' |', 1)
                                    })
                                    .then(function (result) {
                                        return self.append('| ' + type + ' - Zip | ' + githubUrl.zip_url + ' |', 1)
                                    })
                                    .then(function (result) {
                                        return self.append('| ' + type + ' - API | ' + githubUrl.api_url + ' |', 1)
                                    })
                                    .then(function (result) {
                                        return self.nl(1);
                                    });
                            } else {
                                return self.append(header, 1)
                                    .then(function (result) {
                                        return self.append('| ' + type + ' | ' + self.pkg.repository.url + ' |', 1);
                                    })
                                    .then(function (result) {
                                        return self.nl(1);
                                    });
                            }
                        }
                    }
                })
                .then(function (result) {
                    return resolve(result);
                });
        }
        return resolve(self);
    });
};

/**
 * Writes the collaborators section (a table overview about configured persons)
 * including their roles:
 * 1. The author
 * 2. Contributors
 * 3. Maintainers
 * The first column is the role, the second the name linked by the URL and the last
 * contains the email link.
 * @param {string} [headline=Collaborators] - The headline for this section.
 * @returns {Promise.<Md>} - The `Promise` resolving with `this` for concatenated calls.
 * @public
 */
Md.prototype.staff = function (headline) {
    var self = this;
    return new Promise(function (resolve) {
        if (self.pkg.author || (self.pkg.contributors && self.pkg.contributors.length > 0) || (self.pkg.maintainers && self.pkg.maintainers.length > 0)) {
            self.logger.debug('writing Collaborators...');
            headline = headline || 'Collaborators';
            var subject = self.pkg.name;
            return self.headline(headline, 1)
                .then(function (result) {
                    return self.append(createTableHeader(['Role', 'Name', 'Email']), 1);
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
                    return Promise.each(self.pkg.contributors.sort(personSort), function (contributor) {
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
                    return Promise.each(self.pkg.maintainers.sort(personSort), function (maintainer) {
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

/**
 * Writes the installation section.
 * @param {string} [headline=Installation] - The headline for this section.
 * @returns {Promise.<Md>} - The `Promise` resolving with `this` for concatenated calls.
 * @public
 */
Md.prototype.installation = function (headline) {
    var self = this;
    return new Promise(function (resolve) {
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
                return self.append('Download ' + createLink('https://nodejs.org', 'node.js') + ' and install it, if you haven\'t already.', 0);
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
                return self.appendCodeBlock('$ npm config set registry ' + registry, 'sh');
            })
            .then(function (result) {
                if (self.pkg.preferGlobal) {
                    return self.headline('Global (Preferred)', 3)
                        .then(function (result) {
                            return self.append('Install as system library:');
                        })
                        .then(function (result) {
                            return self.appendCodeBlock('$ npm install ' + self.pkg.name + ' --global', 'sh');
                        });
                } else {
                    return result;
                }
            })
            .then(function (result) {
                return self.headline('Local', 3);
            })
            .then(function (result) {
                return self.append('As `dependency`:');
            })
            .then(function (result) {
                return self.appendCodeBlock('$ npm install ' + self.pkg.name + ' --save', 'sh');
            })
            .then(function (result) {
                return self.append('or as `devDependency`:');
            })
            .then(function (result) {
                return self.appendCodeBlock('$ npm install ' + self.pkg.name + ' --save-dev', 'sh');
            })
            .then(function (result) {
                resolve(result);
            });
    });
};

/**
 * Writes the tests section.
 * @param {string} [headline=Installation] - The headline for this section.
 * @returns {Promise.<Md>} - The `Promise` resolving with `this` for concatenated calls.
 * @public
 */
Md.prototype.tests = function (headline) {
    var self = this;
    return new Promise(function (resolve) {
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
                resolve(result);
            });
    });
};

/**
 * Writes the dependencies info for given dependency type if exists.
 * @param {string} depType - The type of dependencies.
 * @returns {Promise.<Md>} - A `Promise` resolving with `this`.
 * @public
 */
Md.prototype.dependencies = function (depType) {
    var self = this;
    return new Promise(function (resolve) {
        var type = getDepTypeName(depType);
        if (self.pkg[type]) {
            self.logger.debug('writing ' + depType + 'Dependencies...');

            return self.headline(getDepTypeName(depType, true), 1)
                .then(function (result) {
                    return self.writeDependencyEntries(self.options.pkg, self.pkg, type); // TODO replace options
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
 * Writes the binary mappings if `this.pkg.bin` is set and not empty string.
 * @param {string} [headline=Binary Mappings] - A headline for the section.
 * @returns {Promise.<Md>}                    - A `Promise` resolving with `this`.
 * @public
 */
Md.prototype.bin = function (headline) {
    var self = this;
    return new Promise(function (resolve) {
        if (self.pkg.bin && Object.keys(self.pkg.bin).length > 0) {
            self.logger.debug('writing binary mappings...');
            headline = headline || 'Binary Mappings';
            return self.headline(headline, 1)
                .then(function (result) {
                    return Promise.each(Object.keys(self.pkg.bin), function (key, index, length) {
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
 * Writes the main executable if `this.pkg.main` is set and not empty string.
 * @param {string} [headline=Main File] - A headline for the section.
 * @returns {Promise.<Md>}              - A `Promise` resolving with `this`.
 * @public
 */
Md.prototype.main = function (headline) {
    var self = this;
    return new Promise(function (resolve) {
        if (self.pkg.main && self.pkg.main !== '') {
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
 * Writes the NPM configuration mappings if `this.pkg.config` is set and not empty.
 * @param {string} [headline=NPM Configuration] - A headline for the section.
 * @returns {Promise.<Md>}                      - A `Promise` resolving with `this`.
 * @public
 */
Md.prototype.config = function (headline) {
    var self = this;
    return new Promise(function (resolve) {
        if (self.pkg.config && Object.keys(self.pkg.config).length > 0) {
            self.logger.debug('writing NPM Configuration...');
            headline = headline || 'NPM Configuration';
            var headerEntries = ['Property (flattened)', 'Value', 'Applicable in `scripts` Section'];
            return self.headline(headline, 1)
                .then(function (result) {
                    return self.append(createTableHeader(headerEntries), 1);
                })
                .then(function (result) {
                    var config = flatten(self.pkg.config);

                    var sortedKeys = Object.keys(config).sort();
                    return Promise.each(sortedKeys, function (key, index, length) {
                        self.logger.debug('Config key::: ' + key);
                        var entry = '| `' + key + '` | _' + config[key] + '_ | `$npm_package_config_' + key.replace(/\./g, '_') + '`|';
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
 * Writes the NPM scripts mappings if `this.pkg.scripts` is set and not empty string.
 * @param {string} [headline=NPM Scripts] - A headline for the section.
 * @returns {Promise.<Md>}                - A `Promise` resolving with `this`.
 * @public
 */
Md.prototype.scripts = function (headline) {
    var self = this;
    return new Promise(function (resolve) {
        if (self.pkg.scripts && Object.keys(self.pkg.scripts).length > 0) {
            self.logger.debug('writing NPM Scripting...');
            headline = headline || 'NPM Scripting';
            var headerEntries = ['Run Command', 'Script Executed'];
            return self.headline(headline, 1)
                .then(function (result) {
                    return self.append(createTableHeader(headerEntries), 1);
                })
                .then(function (result) {
                    var sortedCommands = Object.keys(self.pkg.scripts).sort();
                    return Promise.each(sortedCommands, function (cmd, index, length) {
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
 * Writes the engines info if `this.pkg.engines` is set and not empty string.
 * @param {string} [headline=Engine Support] - A headline for the section.
 * @returns {Promise.<Md>}                - A `Promise` resolving with `this`.
 * @public
 */
Md.prototype.engines = function (headline) {
    var self = this;
    return new Promise(function (resolve) {
        if (self.pkg.engines && Object.keys(self.pkg.engines).length > 0) {
            self.logger.debug('writing engine support...');
            headline = headline || 'Engine Support';

            var strictness = '**NOTE:** ';
            if (!!self.pkg.engineStrict) { // default is false
                strictness += ' strict!'
            } else {
                strictness += ' advisory only!'
            }
            var headerEntries = ['Engine', 'Version'];
            return self.headline(headline, 1)
                .then(function (result) {
                    return self.append(strictness, 2);
                })
                .then(function (result) {
                    return self.append(createTableHeader(headerEntries), 1);
                })
                .then(function (result) {
                    var sortedEngines = Object.keys(self.pkg.engines).sort();
                    return Promise.each(sortedEngines, function (engine, index, length) {
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
 * Writes the keywords if `this.pkg.keywords` is set and not empty.
 * @param {string} [headline=Keywords] - A headline for the section.
 * @returns {Promise.<Md>}             - A `Promise` resolving with `this`.
 */
Md.prototype.keywords = function (headline) {
    var self = this;
    return new Promise(function (resolve) {
        if (self.pkg.keywords && self.pkg.keywords.length > 0) {
            self.logger.debug('writing Keywords...');
            headline = headline || 'Keywords';
            return self.headline(headline, 1)
                .then(function (result) {
                    return self.append('_' + self.pkg.keywords.sort().toString().replace(/,/g, '_, _') + '_');
                })
                .then(function (result) {
                    return resolve(self);
                });
        }
        return resolve(self);
    });
};

/**
 * Writes the OS support if `this.pkg.os` is set and not empty .
 * @param {string} [headline=OS Support] - A headline for the section.
 * @returns {Promise.<Md>}               - A `Promise` resolving with `this`.
 */
Md.prototype.os = function (headline) {
    var self = this;
    return new Promise(function (resolve) {
        if (self.pkg.os && self.pkg.os.length > 0) {
            self.logger.debug('writing OS support...');
            headline = headline || 'OS Support';
            var headerEntries = ['Supported', 'Not Supported'];
            return self.headline(headline, 1)
                .then(function (result) {
                    return self.append(createTableHeader(headerEntries), 1);
                })
                .then(function (result) {
                    var notRegExp = /^!/;
                    return Promise.each(self.pkg.os, function (os, index, length) {
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
 * Writes the CPU support if `this.pkg.bin` is set and not empty.
 * @param {string} [headline=CPU Support] - A headline for the section.
 * @returns {Promise.<Md>}                - A `Promise` resolving with `this`.
 */
Md.prototype.cpu = function (headline) {
    var self = this;
    return new Promise(function (resolve) {
        if (self.pkg.cpu && self.pkg.cpu.length > 0) {
            self.logger.debug('writing CPU support...');
            headline = headline || 'CPU Support';
            var headerEntries = ['Supported', 'Not Supported'];
            return self.headline(headline, 1)
                .then(function (result) {
                    return self.append(createTableHeader(headerEntries), 1);
                })
                .then(function (result) {
                    var notRegExp = /^!/;
                    return Promise.each(self.pkg.cpu, function (cpu, index, length) {
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
 * Writes the License(s) if `this.pkg.license|licenses` is set and not empty.
 * @param {string} [headline=License|Licenses] - A headline for the section.
 * @returns {Promise.<Md>}                     - A `Promise` resolving with `this`.
 */
Md.prototype.license = function (headline) {
    var self = this;
    return new Promise(function (resolve) {
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
    });
};

/**
 * Returns the Markdown string (optionally adds newlines), ususally after creation has finished.
 * @param {number} [newlines] - The final amount of newlines.
 * @returns {string}          - The Markdown created.
 */
Md.prototype.end = function (newlines) {
    return this.nl(newlines)
        .then(function (result) {
            return result.markdown;
        });
};

module.exports = Md;
