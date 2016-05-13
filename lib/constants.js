'use strict';

///////////////////////////////////////////////////////////////////////////////
// CONSTANTS
///////////////////////////////////////////////////////////////////////////////

/**
 * The 'utf8' constant.
 *
 * @type {string}
 * @constant
 * @public
 */
module.exports.UTF8 = 'utf8';

/**
 * The default Markdown file: 'README.md'.
 *
 * @type {string}
 * @public
 * @constant
 */
module.exports.DEFAULT_MD_FILE = 'README.md';

/**
 * The default package file: 'package.json'.
 *
 * @type {string}
 * @public
 * @constant
 */
module.exports.DEFAULT_PKG_FILE = 'package.json';

/**
 * The default registry: 'https://registry.npmjs.org/'.
 *
 * @type {string}
 * @public
 * @constant
 */
module.exports.DEFAULT_REGISTRY = 'https://registry.npmjs.org';

/**
 * The production dependency type: ''.
 *
 * @type {string}
 * @public
 * @constant
 */
module.exports.DEPENDENCY_TYPE_PROD = '';

/**
 * The development dependency type: 'dev'.
 *
 * @type {string}
 * @public
 * @constant
 */
module.exports.DEPENDENCY_TYPE_DEV = 'dev';

/**
 * The bundled dependency type: 'bundled'.
 *
 * @type {string}
 * @public
 * @constant
 */
module.exports.DEPENDENCY_TYPE_BUNDLED = 'bundled';

/**
 * The optional dependency type: 'optional'.
 *
 * @type {string}
 * @public
 * @constant
 */
module.exports.DEPENDENCY_TYPE_OPTIONAL = 'optional';

/**
 * The peer dependency type: 'peer'.
 *
 * @type {string}
 * @public
 * @constant
 */
module.exports.DEPENDENCY_TYPE_PEER = 'peer';

///**
// * The default options.
// *
// * @constant
// * @namespace
// * @property {string} origin=yaml                   - The default origin type.
// * @property {string} target=js                     - The default target type.
// * @property {string} dest=relative_to_input_file   - The default dest description.
// * @property {number} indent=4                      - The default indention for files.
// * @property {boolean} force=false                  - Whether to overwrite existing file on output.
// * @property {string} imports=undefined             - The exports name for reading from JS source file or objects only.
// * @property {string} exports=undefined             - The exports name for usage in JS file or object only.
// */
//Constants.prototype.DEFAULT_OPTIONS = {
//    origin:  constants.ORIGIN_DESCRIPTION,
//    target:  constants.TARGET_DESCRIPTION,
//    dest:    constants.DEST_DESCRIPTION,
//    indent:  constants.DEFAULT_INDENT,
//    force:   constants.DEFAULT_FORCE_FILE_OVERWRITE,
//    imports: constants.DEFAULT_JS_IMPORTS_IDENTIFIER,
//    exports: constants.DEFAULT_JS_EXPORTS_IDENTIFIER
//};
