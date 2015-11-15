var stream = require('readable-stream'),
    minimatch = require('minimatch');

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

    this.ductFn = ductFn;
    this.files = [];

}

/**
 * Test a file against a filter.
 *
 * @param file {Vinyl} File to test.
 * @param filter {String} Glob.
 *
 * @returns {Boolean} true if duct should accept the file.
 * @private
 */
Duct.prototype._filterTest = function (file, filter) {
    return minimatch(file.path, filter);
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

    var accept = false;

    for (var x = 0; x < this.filters.length; x++) {

        accept = accept || this._filterTest(file, this.filters[x]);

        if (accept) {
            this.files.push(file);
            break;
        }

    }

    return accept;

};

module.exports = Duct;