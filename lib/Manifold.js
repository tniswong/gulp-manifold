var through2 = require('through2'),
    merge = require('merge-stream'),

    StreamValidator = require('./StreamValidator'),
    Duct = require('./Duct');

/**
 * Manifold for stream piping.
 *
 * @param streamValidator {StreamValidator}
 *
 * @constructor
 */
function Manifold(streamValidator) {
    this.streamValidator = streamValidator || new StreamValidator();
}

/**
 * Attach the Manifold into pipe fitting. Ex: stream.pipe(manifold.install(ducts))
 *
 * @param ducts {Array<Duct>} Ducts to install.
 * @param bypassFn {Function} DuctFn for bypass
 *
 * @return {Stream}
 */
Manifold.prototype.attach = function (ducts, bypassFn) {

    var bypassDuct = new Duct('**/*', bypassFn || function (bypass) {
        return bypass;
    });

    return this.streamValidator.withObjectStream(function (file, enc, flush) {

        var accepted = false;

        // for each duct
        for (var x = 0; x < ducts.length; x++) {

            // attempt to push file through duct
            accepted = ducts[x].push(file);

            if (accepted) { // if attempt successful
                break; // skip remaining ducts. file can't be pushed through more than one duct at a time.
            }

        }

        if (!accepted) { // if not accepted to duct
            bypassDuct.push(file); // push to bypass
        }

        flush();

    }, function (flush) {

        var that = this,
            ductStreams = [];

        // populate ductStreams array
        ducts.forEach(function (duct) {
            ductStreams.push(duct.createStream());
        });

        // merge bypass with duct returns
        merge.apply(null, [bypassDuct.createStream()].concat(ductStreams))
            .pipe(through2.obj(function (file, enc, flush) {
                that.push(file); // push everything to parent stream
                flush();
            }, function (flushMerged) {
                flushMerged();
                flush();
            }));

    });

};

module.exports = Manifold;