'use strict';

// Generated on 2014-02-18 using generator-gulp-webapp 0.0.1

// Load plugins
var gulp = require('gulp');
var autoprefixer = require('gulp-autoprefixer');
var csso = require('gulp-csso');
var jshint = require('gulp-jshint');
var uglify = require('gulp-uglify');
var imagemin = require('gulp-imagemin');
var sass = require('gulp-ruby-sass');
var clean = require('gulp-clean');
var concat = require('gulp-concat');
var cache = require('gulp-cache');
var size = require('gulp-size');
var livereload = require('gulp-livereload');
var lr = require('tiny-lr');
var react = require('gulp-react');
var server = lr();

// use express as a server, alternatively, i can use vagrant
var gutil = require('gulp-util');
var express = require('express');
var path = require('path');

var createServers = function(port, lrport) {
  server.listen(lrport, function() {
    gutil.log('LR Listening on', lrport);
  });
 
  var app = express();
  app.use(express.static(path.resolve('./dist')));
  app.listen(port, function() {
    gutil.log('Listening on', port);
  });
 
  return {
    lr: server,
    app: app
  };
};
 
var servers = createServers(8080, 35729);

// Styles
gulp.task('styles', function () {
    return gulp.src('app/styles/main.scss')
        .pipe(sass({
          style: 'expanded',
          loadPath: ['app/bower_components']
        }))
        .pipe(autoprefixer('last 1 version'))
        .pipe(csso())
        .pipe(size())
        .pipe(gulp.dest('app/styles'))
        .pipe(gulp.dest('dist/styles'))
        .pipe(livereload(server));
});

// Scripts
gulp.task('scripts', function () {
    return gulp.src('app/scripts/**/*.js')
        .pipe(jshint('.jshintrc'))
        .pipe(jshint.reporter('default'))
        .pipe(gulp.dest('dist/scripts'))
        .pipe(livereload(server));
});

gulp.task('data', function() {
    return gulp.src('app/data/**/*.*')
        .pipe(gulp.dest('dist/data'));
});

gulp.task('bower', function () {
    return gulp.src(['app/bower_components/**','app/bower_components/*.*'])
        .pipe(gulp.dest('dist/bower_components'))
        .pipe(livereload(server));
});

gulp.task('zepto', function() {
    return gulp.src('app/bower_components/zeptojs/src/*.js')
        .pipe(concat('zepto.js'))
        .pipe(gulp.dest('app/bower_components/zeptojs/dist'))
        .pipe(gulp.dest('dist/bower_components/zeptojs/dist'));
});

// HTML
gulp.task('html', function () {
     return gulp.src('app/*.html')
        .pipe(size())
        .pipe(gulp.dest('dist'))
        .pipe(livereload(server));
});

// Images
gulp.task('images', function () {
    return gulp.src('app/images/**/*')
        .pipe(cache(imagemin({
            optimizationLevel: 3,
            progressive: true,
            interlaced: true
        })))
        .pipe(livereload(server))
        .pipe(size())
        .pipe(gulp.dest('dist/images'));
});

gulp.task('react', function() {
     return gulp.src('app/scripts/app.js')
        .pipe(react())
        .pipe(gulp.dest('dist/scripts'));
});

// Clean
gulp.task('clean', function () {
    return gulp.src(['dist/styles', 'dist/scripts', 'dist/images'], {read: false}).pipe(clean());
});

// Build
gulp.task('build', ['html', 'styles', 'scripts', 'bower', 'images', 'zepto', 'react']);

// Default task
gulp.task('default', ['clean'], function () {
    gulp.start('build');
});

// Watch
gulp.task('watch', function () {

    gulp.start('build');
    
    // Listen on port 35729
    server.listen(35729, function (err) {
        if (err) {
            return console.error(err);
        };
        
        gulp.run('zepto', 'bower');

        gulp.watch('app/data/*', ['data']);

        // Watch .html files
        gulp.watch('app/*.html', ['html']);

        // Watch .scss files
        gulp.watch('app/styles/**/*.scss', ['styles']);

        // Watch .js files
        gulp.watch('app/scripts/**/*.js', ['scripts']);

        gulp.watch('app/bower/*', ['bower']);

        // Watch image files
        gulp.watch('app/images/**/*', ['images']);
    });
});
