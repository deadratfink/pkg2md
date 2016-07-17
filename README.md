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

## Repository

| Type | Link  |
| --- | --- |
| Github - Repo | https://github.com/deadratfink/pkg2md |
| Github - Clone | https://github.com/deadratfink/pkg2md |
| Github - Tarball | https://api.github.com/repos/deadratfink/pkg2md/tarball/master |
| Github - Zip | https://github.com/deadratfink/pkg2md/archive/master.zip |
| Github - API | https://api.github.com/repos/deadratfink/pkg2md |

## Main File

- _./index.js_

## Collaborators

| Role | Name | Email  |
| --- | --- | --- |
| Author | [Jens Krefeldt](https://github.com/deadratfink) | [j.krefeldt@gmail.com](mailto:j.krefeldt@gmail.com?subject=pkg2md) |
## NPM Scripting

| Run Command | Script Executed  |
| --- | --- |
| `$ npm run docs` | `cat docs/LOGO.md > README.md && cat docs/BADGES.md >> README.md && cat docs/TOC.md >> README.md && ./pkg2md --force --bin --cpu --os --config --keywords --inst --repo --main --staff --scripts -L trace -t --deps && cat docs/USAGE.md >> README.md && doctoc README.md --github --title '# TOC' --maxlevel 2` |
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
- [winston (^2.2.0)](https://github.com/winstonjs/winston): A multi-transport async logging library for Node.js

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

# Motivation

Why this module? Module [package-json-to-readme](https://github.com/zeke/package-json-to-readme)
is a nice tool to generate a README from scratch. Unfortunately, for me it lacks
some options and does not cover all of _package.json_ I needed. Therefore, I decided
to write my own module which is more flexible (in terms of options) and covers also other sections
in the _package.json_, concentrating on the standard package info only
(no badges, no example files).

# Usage

The module can be used on CLI or as API (the latter is fully [Promise](http://bluebirdjs.com/docs/api-reference.html)
based).

## Usage Types

Since the module can be used in two different ways, do an installation as follows:

- CLI: install globally via `-g` option
- API: install locally

Both usage types are described in more detail in the following sections.

## Use Case

The module can easily be used by API but a in most cases a usual scenario
could be the usage on CLI. You can simply refer to the [API Reference](#api-reference)
section for API access use case (these contains some examples how to use) it.

The following snippet gives an example how to
use it in `scripts` section of a _package.json_ of your particular project,
here as `docs` target generating the _README.md_:

```javascript
{
    ...
    "scripts" : {
        "docs": "pkg2md <OPTIONS...>"
    },
    ...
}
```

Simply run:

```
$ npm run docs
```

and `pkg2md` generates the _README.md_ (or any other MD file if specified
as _file_ argument) or just appends to an existing one (which is autodetected),
to overwrite simply use the `-f` (`--force`) option on command).

Of course, the `pkg2md` command can be pre- or appended by other commands
manipulating the _README.md_. Let's say after generation, we we want to
insert a a TOC in front of the generated content using the nice module
[doctoc](https://github.com/thlorenz/doctoc), this can be easily achieved
as follows:


```javascript
{
    ...
    "scripts" : {
        "docs": "cat docs/TOC.md > README.md && pkg2md <OPTIONS...> && doctoc README.md --github --title '# TOC' --maxlevel 2"
    },
    ...
}
```

**NOTE:** the file _./docs/TOC.md_ contains the comments used by `doctoc`
to locate the position where to insert the TOC:

```html
<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
# TOC

  - [Using Custom Logger](#using-custom-logger)
- [API Reference](#api-reference)
- [Contributing](#contributing)
- [Changelog](#changelog)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->


```

The two _newlines_ are there by intention to create some distance to the
follow-up section.

TODO!!!
<!--
So, what are the typical use cases for this module? In terms of _transformation_
these consists of different phases:

- Reading files (`Reader`)
- Transforming JSON objects (`Transformer`)
- Apply dedicated actions on the intermediate JSON objects (`Transformer` + `Middleware`)
- Writing files (`Writer`)

### Reading

Reading from:

- _*.yaml_ file
- _*.js_ file
- _*.json_ file

Additionally, on API level:

- `stream.Readable` (requires `options.origin` property set, reads as UTF-8)
- `buffer.Buffer` (requires `options.origin` property set, reads as UTF-8)
- any JS `object` (actually, this means the reading phase is skipped, because object is in-memory already)

### Transformation

The transformation can take place into several directions:

- YAML ⇒ JS
- YAML ⇒ JSON
- JS   ⇒ YAML
- JSON ⇒ YAML
- JS   ⇒ JSON
- JSON ⇒ JS
- YAML ⇒ YAML
- JSON ⇒ JSON
- JS   ⇒ JS

while:

- [YAML](http://http://yaml.org/) = _*.yaml_, _*.yml_
- [JS](https://developer.mozilla.org/en-US/docs/Web/JavaScript) = _*.js_   (JS object)
- [JSON](http://json.org) = _*.json_ (JS object serialized as JSON)

### Middleware

Apply actions on the intermediate JS object via injected [Promise](http://bluebirdjs.com/docs/api-reference.html)
functions. This is an optional part for [transformation](#transformation) phase.

### Writing

Writing to:

- _*.yaml_ file
- _*.js_ file
- _*.json_ file

Additionally, on API level:

- `stream.Writable` (requires `options.target` property set, writes UTF-8)
- `buffer.Buffer` (requires `options.target` property set, writes UTF-8)
- any JS `object`

-->

## Limitations

None known yet.

## CLI Usage

The CLI provides the `pkg2md` command (actually, this might require the use of options).
After the global installation you can access the command options
with the usual help command as follows:

```
$ pkg2md --help
```

### CLI Options

The `--help` option prints an overview about all available CLI properties:

```
$ pkg2md --help

TODO!!!
```

These are more formally defined in the following table:

TODO!!!

<!--| Option (short) | Option (long) | Type | Description | Default | Required |
| --- | --- | --- | --- | --- | --- |
| `-o` | `--origin` | [ _js_ &#124; _json_ &#124; _yaml_ ]</code> | The transformation origin type. | if not given, the type is tried to be inferred from the extension of source path, else it is _yaml_ | no |
| `-t` | `--target` | [ _js_ &#124; _json_ &#124; _yaml_ ]</code> | The transformation target type. | if not given, the type is tried to be inferred from the extension of destination path, else it is _js_ | no |
| `-s` | `--src` | URI | The source file path for transformation. | - | yes |
| `-d` | `--dest` | URI | The destination file path to transform to. | When this options is ommited then the output file is stored relative to the input file (same base name but with another extension if type differs). If input and output type are the same then the file overwriting is handled depending on the `--force` value! | no |
| `-i` | `--indent` | integer<br> - [ 1 - 8 ]<br> | The code indention used in destination files. | 4 | no |
| `-f` | `--force` | n/a | Force overwriting of existing output files on write phase. When files are not overwritten (which is default), then the next transformation with same output file name gets a consecutive number on the base file name, e.g. in case of foo.yaml it would be foo(1).yaml.  | _false_ | no |
| `-m` | `--imports` | string | Define a 'module.exports[.identifier] = ' identifier (to read from JS _source_ file only, must be a valid JS identifier!) | _undefined_ | no |
| `-x` | `--exports` | string | Define a 'module.exports[.identifier] = ' identifier (for usage in JS _destination_ file only, must be a valid JS identifier!) | _undefined_ | no |
| `-k` | `--no-color` | n/a | Omit color from output. | _color_ | no |
|  n/a | `--debug` | n/a | Show debug information. | _false_ | no |
| `-v` | `--version` | n/a | Display the current version. | n/a | no |
| `-h` | `--help` | n/a | Display help and usage details. | n/a | no |

### Examples

Now we know which properties we can apply on CLI, so let's assume we
have a YAML file located in _foo.yaml_ holding this data:

```yaml
foo: bar
```
#### Example: YAML ⇒ JSON

then we can transform it to a JSON file _foo.json_

```javascript
{
  "foo": "bar"
}
```

using this command:

```
$ jyt -s foo.yaml -t json -i 2
```

In this example we have overwritten the standard target type (which is `js`)
and applying an indent of _2_ instead of the default _4_. As default the output
file _foo.json_ is written relative to the input file (simply omitting the
`dest` option here).

**NOTE:** here you _have_ to provide the target with `-t json` or else the
default `js` would have been applied! If the source would have been a `js`
type like

```
$ jyt -s foo.js -t json -i 2
```

then the `js` value for `origin` is automatically inferred from file extension.
Accordingly, this is also true for the `target` option.

#### Example: JSON ⇒ JS

```
$ jyt -s foo.json -i 2
```
```javascript
module.exports = {
  foo: "bar"
}
```

#### Example: JS ⇒ YAML

```
$ jyt -s foo.js -t yaml
```
```yaml
foo: bar
```

#### Example: Transformation with Different Destination

Simply provide the `-d` with a different file name:

```
$ jyt -s foo.json -d results/foobar.yaml
```

#### Example: Transformation with Unsupported Source File Extension

As said, normally we infer from file extension to the type but assume the source
file has a file name which does not imply the type (here a JSON
type in a TEXT file), then you can simply provide the `-o` option with the
correct `origin` type (of course, the `-t` option works analogous):


```
$ jyt -s foo.txt -o json -d foobar.yaml
```

#### Example: Read from File with Exports Identifier

It could be that a JS source `exports` several objects and you want to read
from exactly the one you specify, then provide the `-m` (`--imports`) option.

In this this example we have a _foo.js_ file exporting _two_ objects:

```javascript
module.exports.foo = {
    foo: 'bar'
};

module.exports.bar = {
    bar: 'foo'
};
```

but you want to convert `bar` object, then call:

```
$ jyt -s foo.js -m bar -d bar.yaml
```

to get the YAML result:

```yaml
bar: foo
```

**NOTE:** the same applies on API level when using JS objects as `dest`:

```javascript
var fooBar = {
    foo: 'bar',
    bar: 'foo'
};

var options = {
    src: fooBar,
    dest: {},
    exports: 'bar'
};

//...transform
```

The transformation will result in this in-memory object:

```javascript
bar: {
    foo: 'bar',
    bar: 'foo'
}
```
as sub-node of `options.dest`.

#### Example: Write Exports Identifier for JS File

Assume you want to generate a JS file with an exports string which gets an
identifier. We reuse the YAML file from above

```yaml
foo: bar
```

using this command:

```
$ jyt -s foo.yaml -d foobar.js -x foobar
```

This generates the following output in JS file using `foobar` as identifier:

```javascript
module.exports.foobar = {
    foo: "bar"
}
```

**NOTE:** the identifier must be a valid JS identifier accoding to ECMAScript 6
(see also [Valid JavaScript variable names in ECMAScript 6](https://mathiasbynens.be/notes/javascript-identifiers-es6)
and [Generating a regular expression to match valid JavaScript identifiers](https://mathiasbynens.be/demo/javascript-identifier-regex)). -->

#### Example: Force Overwriting

**IMPORTANT NOTE:** when using this feature then any subsequent
execution which uses the same target/file name,
will overwrite the original source or target created beforehand!

By default this feature is not enabled to prevent you from accidentally
overwriting your input source.

```
$ pkg2md -f
```

Of course, leaving out the `-f` switch simply appends the generated content to the input file.

<!--
## API Usage

Since the usage on CLI is a 2-step process:

1. Read from source file to JS object ⇒ 2. Write out (maybe to other type)

the direct API calls additionally provide the usage of a _middleware_ function
where you can alter the input JS object before it is written and therefore, which turns
this into a 3-step process:

1. Read from source ⇒ 2. Alter the JS object ⇒ 3. Write out (maybe to other type)

For more details about this and all the functions provided by this module please refer to the
[API Reference](https://github.com/deadratfink/jy-transform/wiki/API-v1.0).

The `origin` and `target` type inference is also standard for the API level.

### API Properties

The `Transformer` exposes the following function which takes besides an (optional)
`middleware` function the necessary `options` for the transformation:

```javascript
function transform(options, middleware)
```

The `options` object has to follow this key-values table:

| Option | Type | Description | Default | Required |
| --- | --- | --- | --- | --- |
| origin | <code>string</code> | The origin type. | If not given, the type is tried to be inferred from the extension of source path, else it is _yaml_. | no |
| target | <code>string</code> | The target type. | If not given, the type is tried to be inferred from the extension of destination path, else it is _js_ | no |
| src | <code>string &#124; Readable &#124; object</code> | The source information object: `string` is used as file path, `Readable` stream provides a stringified source and `object` is used as direct JS source. | - | yes |
| dest | <code>string &#124; Writable &#124; object</code> | The destination information object: `string` is used as file path, `Writable` stream writes a stringified source and `object` is used as direct JS object for assignment. | The output file is stored relative to the input file (same base name but with another extension if type differs). If input and output type are the same then the file overwriting is handled depending on the 'force' value! | no |
| indent | <code>number</code> | The indention in files. | 4 | no |
| force | <code>boolean</code> | Force overwriting of existing output files on write phase. When files are not overwritten, then the next transformation with same output file name gets a consecutive number on the base file name, e.g. in case of _foo.yaml_ it would be _foo(1).yaml_. | _false_ | no |
| imports | <code>string</code> | Define a 'module.exports[.identifier] = ' identifier (to read from JS _source_ only, must be a valid JS identifier!) | _undefined_ | no |
| exports | <code>string</code> | Define a 'module.exports[.identifier] = ' identifier (for usage in JS _destination_ only, must be a valid JS identifier!) | _undefined_ | no |

**NOTE:** an invalid indention setting (1 > indent > 8) does not raise an error but a default of 4 SPACEs is applied instead.

#### Example

```javascript
var options = {
    origin: 'json',
    target: 'yaml',
    src: 'foo.json',
    dest: './foo/bar.yaml',
    indent: 2
}
```

### Using Middleware

The `middleware` is optional but if provided it must be of type `Function` and
a [Promise](http://bluebirdjs.com/docs/api-reference.html). One of the easiest
ones is the identity function

_f(data) → data_

which could be expressed as
[Promise](http://bluebirdjs.com/docs/api-reference.html) function as follows:

```javascript
var identity = function (data) {
    return Promise.resolve(data);
}
```

Of course, this would have no effect on the provided JS data. Actually, this one is
used internally when no middleware is provided to ensure the proper promised
control flow.

OK, lets go back to a more practical example, e.g. we want to alter the value of
JS property before it is written to a file. Assuming we have this piece of YAML
object as input:

```yaml
foo: old bar
```

Applying this [Promise](http://bluebirdjs.com/docs/api-reference.html) as middleware

```javascript
var middleware = function (data) {
    data.foo = 'new bar';
    return Promise.resolve(data);
}

transformer.transform(options, middleware)
    .then(function (msg){
        logger.info(msg);
    })
    .catch(function (err) {
        logger.error(err.stack);
    });
```

will result in such JSON file:

```javascript
{
    "foo": "new bar"
}
```

Of course, in real world scenarios you will have use cases which usually have a
higher complexity where one function might be insufficient or at least
inconvenient. but this does not raise a problem at all, because you can create
several functions to be applied in the whole transformation process by gathering
them in one function.

Let's assume we have some Promise functions to apply. For simplicity reasons we
simulate these for the moment by two functions, each adding a key-value to the
given (initially empty) JS object.

**NOTE:** each of them has to resolve with the `data` object!


```javascript
function key1(data) {
    objectPath.set(data, 'key1', 'value1');
    return Promise.resolve(data);
}

function key2(data) {
    objectPath.set(data, 'key2', 'value2');
    return Promise.resolve(data);
}

function key3(data) {
    objectPath.set(data, 'key3', 'value3');
    return Promise.resolve(data);
}
```

These can be collected by different aggregation or composition functions of the underlying
Promise framework, e.g. using the  [`Promise.all([...])`](http://bluebirdjs.com/docs/api/promise.all.html)
function. This one can collect all three functions above and ensure their proper subsequent execution:


```javascript
var middleware = function (data) {
    return Promise.all([key1(data), key2(data), key3(data)])
        .then(function(result) {
            return Promise.resolve(result[result.length - 1]);
        });
};

var transformer = new Transformer(logger);
var logger = ...;
var options = {
   src: {}
};

return transformer.transform(options, middleware)
    .then(function (msg){
        logger.info(msg);
    })
    .catch(function (err) {
        logger.error(err.stack);
    });
```

Then the result in the `middleware` function can be retrieved from the returned
array, i.e. in case of [`Promise.all([...])`](http://bluebirdjs.com/docs/api/promise.all.html)
you have to pick the _last_ element which contains the "final product".

From our example above it would be result in this object

```javascript
{
    key1: 'value1',
    key2: 'value2',
    key3: 'value3'
}
```

which then is passed back to the transformation chain. Following this pattern
you can do almost everything with the JS object, like

- deleting properties
- changing properties to other types
- validating and throwing error if not valid
- ...

Whatever you do during transformation, just keep it valid ;-)
-->

## Using Custom Logger

It is usual that you use an own `logger` in your application. This module
supports you by letting you inject your logger as constructor argument to the
following objects:
- `PkgReader`
- `Md`
- `PkgToMd`
- `MdWriter`

If you do not provide one, then the default logger is `console`.

```javascript
var logger = ...;

var reader = new PkgReader(logger);
var markdown = new Md(logger);
var controlFlow = new PkgToMd(logger);
var writer = new MdWriter(logger);
```

At least, the passed `logger` object _has_ to support the following functions:

```javascript
function info(msg)
function debug(msg)
function trace(msg)
function error(err|msg)
```
Anyway, there are some fallbacks if a level is not supported:

- DEBUG ⇒ INFO
- TRACE ⇒ DEBUG

# API Reference

For more details on how to use the API, please refer to the
[API Reference](https://github.com/deadratfink/pkg2md/wiki/API-v1)
wiki which describes the full API and provides more examples.

# Contributing

Pull requests and stars are always welcome. Anybody is invited to take part
into this project. For bugs and feature requests, please create an
[issue](https://github.com/deadratfink/pkg2md/issues).
See the wiki [Contributing](https://github.com/deadratfink/pkg2md/wiki/Changelog)
section for more details about conventions.

# Changelog

The complete changelog is listed in the wiki [Changelog](https://github.com/deadratfink/pkg2md/wiki/Changelog) section.

