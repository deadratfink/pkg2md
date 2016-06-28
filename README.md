# [pkg2md (v0.9.0)](https://github.com/deadratfink/pkg2md)

This modules creates a Markdown presentation from a package.json on CLI or API.

## Binary Mappings

- `$ pkg2md` ⇒ _./pkg2md_

## NPM Configuration

| Property (flattened) | Value | Applicable in `scripts` Section  |
| --- | --- | --- |
| `test.istanbul.report` | _lcovonly_ | `$npm_package_config_test_istanbul_report`|
| `test.mocha.reporter` | _spec_ | `$npm_package_config_test_mocha_reporter`|


## Keywords

_api_, _cli_, _convert_, _markdown_, _md_, _package_, _package.json_, _pkg_, _pkg-to-md_, _pkg2md_, _pkgtomd_, _promise_, _readme_, _readme.md_, _transform_

## Installation

Download [node.js](https://nodejs.org) and install it, if you haven't already. Ensure the proper registry setting before `npm install`:

```sh
$ npm config set registry https://registry.npmjs.org/
```

#### Global (Preferred)

Install as system library:

```sh
$ npm install pkg2md --global
```

#### Local

As `dependency`:

```sh
$ npm install pkg2md --save
```

or as `devDependency`:

```sh
$ npm install pkg2md --save-dev
```

## Main File

- _./index.js_

## Collaborators

| Role | Name | Email  |
| --- | --- | --- |
| Author | [Jens Krefeldt](https://github.com/deadratfink) | [j.krefeldt@gmail.com](mailto:j.krefeldt@gmail.com?subject=pkg2md) |
## NPM Scripting

| Run Command | Script Executed  |
| --- | --- |
| `$ npm run docs` | `cat docs/LOGO.md > README.md && cat docs/BADGES.md >> README.md && cat docs/TOC.md >> README.md && ./pkg2md -b -c -o -k -s -r -m -i && cat docs/USAGE.md >> README.md && doctoc README.md --github --title '# TOC' --maxlevel 2` |
| `$ npm run test` | `istanbul cover _mocha --report $npm_package_config_test_istanbul_report -- -R $npm_package_config_test_mocha_reporter ./test/test-*.js` |
| `$ npm run test:html` | `istanbul cover _mocha --report html -- -R $npm_package_config_test_mocha_reporter ./test/test-*.js` |
| `$ npm run wiki` | `jsdoc2md -P lib/*.js index.js > docs/API.md && doctoc docs/API.md --github --title '### TOC' --maxlevel 2 && cat docs/API.md > '../pkg2md.wiki/API-v1.md'&& cat docs/CONTRIBUTING.md > ../pkg2md.wiki/Contributing.md  && cat docs/CHANGELOG.md > ../pkg2md.wiki/Changelog.md && doctoc ../pkg2md.wiki/Changelog.md --github --title '### TOC' --maxlevel 3` |


## Test

Test execution:

```
$ npm install
$ npm test
```

## Dependencies

- [ajv (^4.0.5)](https://github.com/epoberezkin/ajv): Another JSON Schema Validator
- [bluebird (^3.3.3)](https://github.com/petkaantonov/bluebird): Full featured Promises/A+ implementation with exceptionally good performance
- [commander (^2.9.0)](https://github.com/tj/commander.js): the complete solution for node.js command-line programs
- [cwd (^0.10.0)](https://github.com/jonschlinkert/cwd): Easily get the CWD (current working directory) of a project based on package.json, optionally starting from a given path. (node.js/javascript util)
- [flat (^2.0.0)](https://github.com/hughsk/flat): Take a nested Javascript object and flatten it, or unflatten an object with delimited keys
- [github-url-to-object (^2.2.1)](https://github.com/zeke/github-url-to-object): Extract user, repo, and other interesting properties from GitHub URLs
- [is-stream (^1.0.1)](https://github.com/sindresorhus/is-stream): Check if something is a Node.js stream
- [json-stringify-safe (^5.0.1)](https://github.com/isaacs/json-stringify-safe): Like JSON.stringify, but doesn't blow up on circular refs.
- [mkdirp-then (^1.2.0)](https://github.com/fs-utils/mkdirp-then): mkdirp as promised
- [normalize-package-data (^2.3.5)](https://github.com/npm/normalize-package-data): Normalizes data that can be found in package.json files.
- [package.json-schema (^0.2.0)](https://github.com/Bartvds/package.json-schema): JSON Schema for node/npm package.json
- [url-join (^1.1.0)](https://github.com/jfromaniello/url-join): Join urls and normalize as in path.join.

## Development Dependencies

- [codeclimate-test-reporter (^0.3.1)](https://github.com/codeclimate/javascript-test-reporter): Code Climate test reporter client for javascript projects
- [codecov (^1.0.1)](https://github.com/codecov/codecov-node): Uploading report to Codecov: https://codecov.io
- [coveralls (^2.11.9)](https://github.com/nickmerwin/node-coveralls): takes json-cov output into stdin and POSTs to coveralls.io
- [doctoc (^1.0.0)](https://github.com/thlorenz/doctoc): Generates TOC for markdown files of local git repo.
- [fs-extra (^0.30.0)](https://github.com/jprichardson/node-fs-extra): fs-extra contains methods that aren't included in the vanilla Node.js fs package. Such as mkdir -p, cp -r, and rm -rf.
- [istanbul (^0.4.2)](https://github.com/gotwarlost/istanbul): Yet another JS code coverage tool that computes statement, line, function and branch coverage with module loader hooks to transparently add coverage when running tests. Supports all JS coverage use cases including unit tests, server side functional tests 
- [jsdoc-parse (^1.2.7)](https://github.com/jsdoc2md/jsdoc-parse): Jsdoc-annotated source code in, JSON format documentation out.
- [jsdoc-to-markdown (^1.3.3)](https://github.com/jsdoc2md/jsdoc-to-markdown): jsdoc-annotated source in, markdown API docs out.
- [mocha (^2.3.4)](https://github.com/mochajs/mocha): simple, flexible, fun test framework
- [mocha-lcov-reporter (^1.2.0)](https://github.com/StevenLooman/mocha-lcov-reporter): LCOV reporter for Mocha
- [object-path (^0.9.2)](https://github.com/mariocasciaro/object-path): Access deep properties using a path
- [package-json-to-readme (^1.5.0)](https://github.com/zeke/package-json-to-readme): Generate a README.md from package.json contents
- [winston (^2.2.0)](https://github.com/winstonjs/winston): A multi-transport async logging library for Node.js

