var path = require('path'),
    stream = require('readable-stream'),
    multimatch = require('multimatch');

/**
 * Represents a duct for a manifold.
 *
 * @param filters {Array|String} glob filters.
 * @param ductFn {Function} provides access to filtered stream. should return a stream.
 *
 * @constructor
 */
function Duct(filters, ductFn) {

    if (Array.isArray(filters)) {
        this.filters = filters;
    } else {
        this.filters = [filters];
    }

    this.ductFn = ductFn || function (stream) { return stream };
    this.files = [];

}

/**
 * Test a file against a filter.
 *
 * @param file {Vinyl} File to test.
 * @param filters {Array<String>} Glob Array.
 *
 * @returns {Boolean} true if duct should accept the file.
 * @private
 */
Duct._filterTest = function (file, filters) {
    return multimatch([path.relative(file.cwd, file.path)], filters).length > 0
};

/**
 * Creates the stream for the Duct.
 *
 * @returns {Stream}
 */
Duct.prototype.createStream = function () {

    var that = this;

    // pass stream to ductFn, return resulting stream
    return that.ductFn(new stream.Readable({

        objectMode: true,

        read: function () {

            that.files.forEach(function (file) {
                this.push(file);
            }, this);

            this.push(null); // signal end of stream.

        }

    }));

};

/**
 * Push a file into the duct, provided it passes the filter test.
 *
 * @param file {Vinyl} File to push.
 *
 * @returns {Boolean} True if push accepted.
 */
Duct.prototype.push = function (file) {

    var accept = Duct._filterTest(file, this.filters);

    if (accept) {
        this.files.push(file);
    }

    return accept;

};

module.exports = Duct;