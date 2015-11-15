# gulp-manifold

Provides a manifold for gulp object streams.

Splits a stream into ducts by applying filters, allowing ducts to specify their own piping into the Return. The Return from ducts are then
merged with the Bypass for further piping.

Filtered 

The Bypass is comprised of anything that wasn't filtered.

```plaintext
------------
|  Stream  |
------------
     ||       FILTERS
------------    ||    ------------
| Manifold |>===|>===>|   Duct   |===>|
------------    ||    ------------   ||
              B ||                   || R
              Y ||    ------------   || E
              P |>===>|   Duct   |===>| T
              A ||    ------------   || U
              S ||                   || R
              S ||    ------------   || N
                |>===>|   Duct   |===>| 
                ||    ------------   ||
------------    ||                   ||
|  Stream  |<=MERGE<=================<|
------------
```

This is useful for applying different processing to subsets of the build, then applying further processing on the
combined results as a whole. I.e., process js/css separately, then write them to disk simultaneously with a single call
to `gulp.dest(path)`.

Example 1:

```javascript
var gulp = require('gulp'),
    manifold = require('gulp-manifold'),
    uglify = require('gulp-uglify'),
    sass = require('gulp-sass');
    
    gulp.task('default', function () {
    
        return gulp.src('src/**/*')
            .pipe(manifold({
            
                '**/*.js': function (ductStream) {
                    
                    // Note: always return a stream to the Return
                    return ductStream
                        .pipe(uglify());
                    
                },
                
                '**/*.scss': function (ductStream) {

                    // Note: always return a stream to the Return
                    return ductStream
                        .pipe(sass())
                        
                }
                
            }))
            .pipe(gulp.dest('dist'));
            
    });
```

Example 2:

```javascript
var gulp = require('gulp'),
    manifold = require('gulp-manifold'),
    uglify = require('gulp-uglify'),
    sass = require('gulp-sass');
    
    gulp.task('default', function () {
    
        return gulp.src('src/**/*')
            .pipe(manifold([
            
                manifold.duct([
                    'src/**/*.js',
                    'lib/**/*.js'
                ], function (ductStream) {
                    
                    // Note: always return a stream to the Return
                    return ductStream
                        .pipe(uglify());
                    
                }),
                
                manifold.duct('**/*.scss', function (ductStream) {

                    // Note: always return a stream to the Return
                    return ductStream
                        .pipe(sass())
                        
                })
                
            ]))
            .pipe(gulp.dest('dist'));
            
    });
```