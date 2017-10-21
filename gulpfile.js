'use strict';

var gulp = require('gulp'),
    browserSync = require('browser-sync'),
    autoprefixer = require('gulp-autoprefixer'),
    sass = require('gulp-sass'),
    pug = require('gulp-pug2'),
    runSequence = require('run-sequence'),
    replace = require('gulp-replace'),
    clean = require('gulp-clean'),
    inlineCss = require('gulp-inline-css');

//on error

function log(error) {
  console.log([
    '',
    "----------ERROR MESSAGE START----------".bold.red.underline,
    ("[" + error.name + " in " + error.plugin + "]").red.bold.inverse,
    error.message,
    "----------ERROR MESSAGE END----------".bold.red.underline,
    ''
  ].join('\n'));
}

//browser-sync

gulp.task('browsersync', function() {
  browserSync({
    server: {
        baseDir: 'public'
    },
    notify: false
  })
});

//cleaner

gulp.task('cleaner', function() {
  return gulp.src('public')
      .pipe(clean({force: true}))
});

//sass

gulp.task('sass', function (done) {
  return gulp.src('src/scss/**/*.scss')
    .pipe(sass()).on('error', function(error) {
      log(error);
      done();
    })
    .pipe(autoprefixer({
      browsers: ['last 2 version', 'safari >= 5', 'firefox >= 20', 'ie >= 9', 'opera >= 12', 'ios >= 6', 'android >= 4'],
      cascade: false
    })).on('error', log)
    .pipe(gulp.dest('public/style'))
});

//build-html

gulp.task('build-html', function(done) {
  return gulp.src('src/pug/*.pug')
    .pipe(pug({
      pretty: true
    })).on('error', function(error) {
      log(error);
      done();
    })
    .pipe(gulp.dest('public'))
})

//inline-css
gulp.task('inline-css', function(done) {
  return gulp.src('public/*.html')
    .pipe(inlineCss())
    .on('error', function(error) {
      log(error);
      done();
    })
    .pipe(gulp.dest('public'))
})

// watch -----------------------------

//watch-sass

gulp.task('watch-sass', function () {
  gulp.watch('src/scss/**/*.scss', function (event, cb) {
    runSequence('sass', 'inline-css', function() {
      browserSync.reload();
    })
  });
});

//watch-html

gulp.task('watch-html', function () {
  gulp.watch('src/pug/**/*.pug', function (event, cb) {
    runSequence('build-html', 'sass', 'inline-css', function() {
        browserSync.reload();
    })
  });
});

//common build

gulp.task('build', function(callback) {
  runSequence(
    'cleaner',
    'sass',
    'build-html',
    'inline-css',
    'watch-sass',
    'watch-html',
    'browsersync'
  )
});

//default

gulp.task('default', ['build']);
