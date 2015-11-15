// Manifold, Duct

var manifold = require('../lib/manifold'),

    File = require('vinyl'),
    through2 = require('through2'),
    stream = require('readable-stream');

describe('StreamChannelApi', function () {

    beforeEach(function () {

        this.stream = new stream.Readable({

            objectMode: true,
            read: function () {

                [
                    new File({
                        base: '/www/js',
                        path: '/www/js/main.js'
                    }),
                    new File({
                        base: '/www/sass',
                        path: '/www/sass/main.scss'
                    }),
                    new File({
                        base: '/www/img',
                        path: '/www/img/image.png'
                    }),
                    new File({
                        base: '/www',
                        path: '/www/index.html'
                    }),
                    null // signals end of stream
                ].forEach(function (file) {
                    this.push(file);
                }, this);

            }

        });

    });

    describe('.duct(filter, ductFn)', function () {

        it('if filter is String, should send only files that match the given filter to ductFn', function (done) {

            // when
            this.stream
                .pipe(manifold([

                    manifold.duct([
                        '**/*.js',
                        '**'
                    ], function (stream) {

                        return stream.pipe(through2.obj(function (file, enc, cb) {

                            // then
                            expect(file.path).toBe('/www/js/main.js');
                            file.path = '/www/js/main.bundle.js';

                            this.push(file);
                            cb();

                        }));

                    }),

                    manifold.duct('**/*.html', function (stream) {

                        return stream.pipe(through2.obj(function (file, enc, cb) {

                            // then
                            expect(file.path).toBe('/www/index.html');
                            file.path = '/www/index.bundle.html';

                            this.push(file);
                            cb();

                        }));

                    })
                ]))
                .pipe(through2.obj(function (file, enc, flush) {
                    this.push(file);
                    flush();
                }, function (flush) {
                    flush();
                    done();
                }));

        });

        xit('if filter is Array, should send only files that match ANY given filter to ductFn', function (done) {

            // given
            var manifold = new GulpManifoldApi(),

                filter = ['**/*.js', '**/*.scss'];

            // when
            this.stream
                .pipe(manifold.duct(filter, function (filteredStream) {

                    var files = [];

                    return filteredStream.pipe(through2.obj(function (file, enc, cb) {

                        files.push(file);

                        cb();

                    }, function (cb) {

                        expect(files[0].path).toBe('/www/js/main.js');
                        expect(files[1].path).toBe('/www/sass/main.scss');

                        cb();
                        done();

                    }));


                }));

        });

    });

});