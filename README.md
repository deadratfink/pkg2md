# [pkg2md](https://github.com/deadratfink/pkg2md)

This modules creates a Markdown presentation from a package.json on CLI.

## Installation

Download node.js at [nodejs.org](https://nodejs.org) and install it, if you haven't already. Ensure the proper registry setting before `npm install`:

```
$ npm config set registry https://registry.npmjs.org/
```

#### Local

```
$ npm install pkg2md --save
```

## Repository

| Type | Link  |
| --- | --- |
| git | https://github.com/deadratfink/pkg2md |

## Dependencies

- [ajv](https://github.com/epoberezkin/ajv): Another JSON Schema Validator
- [bluebird](https://github.com/petkaantonov/bluebird): Full featured Promises/A+ implementation with exceptionally good performance
- [cli](https://github.com/node-js-libs/cli): A tool for rapidly building command line apps
- [cwd](https://github.com/jonschlinkert/cwd): Easily get the CWD (current working directory) of a project based on package.json, optionally starting from a given path. (Node.js/javascript util)
- [flat](https://github.com/hughsk/flat): Take a nested Javascript object and flatten it, or unflatten an object with delimited keys
- [github-url-to-object](https://github.com/zeke/github-url-to-object): Extract user, repo, and other interesting properties from GitHub URLs
- [is-stream](https://github.com/sindresorhus/is-stream): Check if something is a Node.js stream
- [json-stringify-safe](https://github.com/isaacs/json-stringify-safe): Like JSON.stringify, but doesn't blow up on circular refs.
- [mkdirp-then](https://github.com/fs-utils/mkdirp-then): mkdirp as promised
- [package.json-schema](https://github.com/Bartvds/package.json-schema): JSON Schema for node/npm package.json
- [url-join](https://github.com/jfromaniello/url-join): Join urls and normalize as in path.join.

## Development Dependencies

- [codeclimate-test-reporter](https://github.com/codeclimate/javascript-test-reporter): Code Climate test reporter client for javascript projects
- [codecov](https://github.com/codecov/codecov-node): Uploading report to Codecov: https://codecov.io
- [coveralls](https://github.com/nickmerwin/node-coveralls): takes json-cov output into stdin and POSTs to coveralls.io
- [doctoc](https://github.com/thlorenz/doctoc): Generates TOC for markdown files of local git repo.
- [fs-extra](https://github.com/jprichardson/node-fs-extra): fs-extra contains methods that aren't included in the vanilla Node.js fs package. Such as mkdir -p, cp -r, and rm -rf.
- [istanbul](https://github.com/gotwarlost/istanbul): Yet another JS code coverage tool that computes statement, line, function and branch coverage with module loader hooks to transparently add coverage when running tests. Supports all JS coverage use cases including unit tests, server side functional tests 
- [jsdoc-parse](https://github.com/jsdoc2md/jsdoc-parse): Jsdoc-annotated source code in, JSON format documentation out.
- [jsdoc-to-markdown](https://github.com/jsdoc2md/jsdoc-to-markdown): jsdoc-annotated source in, markdown API docs out.
- [mocha](https://github.com/mochajs/mocha): simple, flexible, fun test framework
- [mocha-lcov-reporter](https://github.com/StevenLooman/mocha-lcov-reporter): LCOV reporter for Mocha
- [object-path](https://github.com/mariocasciaro/object-path): Access deep properties using a path
- [package-json-to-readme](https://github.com/zeke/package-json-to-readme): Generate a README.md from package.json contents
- [winston](https://github.com/winstonjs/winston): A multi-transport async logging library for Node.js

## Test

Test execution:

```
$ npm install
$ npm test
```

## Who-Is-Who

| Role | Name | Email  |
| --- | --- | --- |
| Author | [Jens Krefeldt](https://github.com/deadratfink) | [j.krefeldt@gmail.com](mailto:j.krefeldt@gmail.com?subject=pkg2md) |
| Contributor | [Barney Rubble](http://barnyrubble.tumblr.com/) | [b@rubble.com](mailto:b@rubble.com?subject=pkg2md) |
| Contributor | [Carney Rubble](http://barnyrubble.tumblr.com/) | [b@rubble.com](mailto:b@rubble.com?subject=pkg2md) |
| Contributor | [xJens Krefeldt](https://github.com/deadratfink) | [j.krefeldt@gmail.com](mailto:j.krefeldt@gmail.com?subject=pkg2md) |
| Maintainer | [aJens Krefeldt](https://github.com/deadratfink) | [j.krefeldt@gmail.com](mailto:j.krefeldt@gmail.com?subject=pkg2md) |
| Maintainer | [Jens Krefeldt](https://github.com/deadratfink) | [j.krefeldt@gmail.com](mailto:j.krefeldt@gmail.com?subject=pkg2md) |
| Maintainer | [Jens Krefeldt](https://github.com/deadratfink) | [j.krefeldt@gmail.com](mailto:j.krefeldt@gmail.com?subject=pkg2md) |
## NPM Config

| Property (flattened) | Value | Applicable in `scripts` Section  |
| --- | --- | --- |
| `test.istanbul.report` | lcovonly | `$npm_package_config_test_istanbul_report`|
| `test.mocha.reporter` | spec | `$npm_package_config_test_mocha_reporter`|


## Engine Support

**NOTE:**  advisory only!

| Engine | Version  |
| --- | --- |
| node | >=0.10.0 |


## OS Support

| Supported | Not Supported  |
| --- | --- |
| darwin | - |
| linux | - |
| - | win32 |


## License

SEE LICENSE IN [LICENSE.md](https://github.com/deadratfink/pkg2md/blob/master/LICENSE.md)

