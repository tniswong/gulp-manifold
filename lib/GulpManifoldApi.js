var Manifold = require('./Manifold'),
    Duct = require('./Duct');

/**
 * GulpManifoldApi
 *
 * @constructor
 */
function GulpManifoldApi() {}

/**
 * Static Unit test helper.
 *
 * @returns {GulpManifoldApi} New Manifold instance.
 * @private
 */
GulpManifoldApi._createManifold = function () {
    return new Manifold();
};

/**
 * Attach a manifold to a pipe fitting.
 *
 * @param ductDefs {Array<Duct>|Object<String,Function>} Duct definitions. Either an array of Ducts, or an Object keyed
 * by filter, valued by ductFn. Ex: { '*.js': function (stream) { return stream; } }
 *
 * @return {Stream} Merged from duct returns and bypass.
 */
GulpManifoldApi.prototype.manifold = function (ductDefs) {

    var manifold = GulpManifoldApi._createManifold(),
        ducts;

    if (Array.isArray(ductDefs)) {
        ducts = ductDefs; // Array<Duct>
    } else {

        // Object<filter,ductFn>
        Object.keys(ductDefs).forEach(function (filter) {
            ducts.push(new Duct(filter, ductDefs[filter]));
        });

    }

    // attach the manifold
    return manifold.attach(ducts);

};

/**
 * Create a duct.
 *
 * @param filters {String|Array<String>} Filter glob, or Array of filter globs.
 * @param ductFn {Function} Takes filtered stream as parameter, returns stream.
 *
 * @returns {Duct} New Duct.
 */
GulpManifoldApi.prototype.manifold.duct = function (filters, ductFn) {
    return new Duct(filters, ductFn);
};

module.exports = GulpManifoldApi;