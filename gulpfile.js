'use strict';
 
var gulp = require('gulp');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var autoprefixer = require('gulp-autoprefixer');

// css outputstyle
var dev = 'expanded';
var prod = 'compressed';
 
gulp.task('scss', function () {
  gulp.src('dev/scss/style.scss')
  	.pipe(sourcemaps.init())
    .pipe(sass.sync().on('error', sass.logError))
    .pipe(sass({
    	outputStyle: dev
    }))
	  .pipe(sourcemaps.write())
	  .pipe(autoprefixer({
      browsers: ['last 2 versions'],
      cascade: false
    }))
  	.pipe(gulp.dest('./public/css'));
});
 
gulp.task('default', ['scss'], function () {
  gulp.watch('dev/scss/style.scss', ['scss']);
  gulp.watch('dev/scss/reset.scss', ['scss']);
});