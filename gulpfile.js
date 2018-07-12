//-----------------------------------------------------------------------------
// Imports
//-----------------------------------------------------------------------------

gulp          = require('gulp');
nodemon       = require('gulp-nodemon');
webpack       = require('webpack');
webpackStream = require('webpack-stream');
livereload    = require('gulp-livereload');
webpackConfig = require('./webpack.config');

//-----------------------------------------------------------------------------
// Tasks
//-----------------------------------------------------------------------------

gulp.task('reload', function() {
    livereload.reload();
});

gulp.task('build', function(cb) {

    reload = function(){
        livereload.reload();
        cb();
    };

    gulp.src('src/index.js')
        .pipe(webpackStream({
            config: webpackConfig
        }))
        .pipe(gulp.dest('static/')).on('end', reload);
});

gulp.task('run', function () {

    nodemon({
        script: 'server.js',
        ext:    'js html',
        watch:  ['server.js'],
        env:  { 'NODE_ENV': 'development' }
    });

    // Start listening with livereload.

    livereload({ start: true });
})

// Default task. Run command: "gulp"

gulp.task('default', ['build', 'run'])

//-----------------------------------------------------------------------------
// Watch changes
//-----------------------------------------------------------------------------

gulp.watch('src/**', ['build']);
gulp.watch('static/css/**', ['build']);


//-----------------------------------------------------------------------------