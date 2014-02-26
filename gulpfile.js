'use strict';

// Load plugins
var gulp = require('gulp');
var gutil = require('gulp-util');
var shell = require('gulp-shell');

gulp.task('copy', function() {
	return gulp.src('web_app/app/**/*')
			.pipe(gulp.dest('mobile_app/snapburst/www'));
});

gulp.task('watch', function() {
	gulp.watch('web_app/app/**/*', ['copy']);
});