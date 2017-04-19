var gulp = require('gulp'),
    less = require('gulp-less'),
    babel = require('gulp-babel'),
    rigger = require('gulp-rigger'),
    uglify = require('gulp-uglify'),
    obfuscate = require('gulp-obfuscate'),
    csso = require('gulp-csso'),
    concat = require('gulp-concat'),
    csscomb = require('gulp-csscomb'),
    autoprefixer = require('gulp-autoprefixer'),
    rename = require('gulp-rename'),
    clean = require('gulp-clean'),
    copy = require('gulp-copy'),
    runSequence = require('run-sequence'),
    jade = require('gulp-jade'),
    browserSync = require('browser-sync'),
    cmq = require('gulp-group-css-media-queries');

// watch tasks
gulp.task('less:watch', function() {
    return gulp.src('src/less/styles.less')
      .pipe(less())
      .pipe(autoprefixer({browsers: ['last 2 versions', 'ie 10']}))
      .pipe(gulp.dest('build/css'))
      .pipe(browserSync.reload({stream: true}))
});

gulp.task('jade', function() {
    return gulp.src('src/jade/pages/*.jade')
      .pipe(jade({pretty: true}))
      .pipe(gulp.dest('build'))
      .pipe(browserSync.reload({stream: true}))
});

gulp.task('copy-img', function() {
    return gulp.src('src/img/**/*.*', {base: 'src/img'})
      .pipe(gulp.dest('build/img'))
      .pipe(browserSync.reload({stream: true}))
});

gulp.task('copy-fonts', function() {
    return gulp.src('src/fonts/**/*.*', {base: 'src/fonts'})
      .pipe(gulp.dest('build/fonts'))
      .pipe(browserSync.reload({stream: true}))
});

gulp.task('copy-js', function() {
    return gulp.src('src/js/main.js', {base: 'src/js'})
      .pipe(rigger())
      .pipe(babel())
      .pipe(gulp.dest('build/js'))
      .pipe(rename({suffix: '--min'}))
      .pipe(uglify())
      .pipe(gulp.dest('build/js'))
      .pipe(browserSync.reload({stream: true}))
});

gulp.task('copy-css', function() {
    return gulp.src('src/css/**/*.*', {base: 'src/css'})
      .pipe(concat('vendor.css'))
      .pipe(csso())
      .pipe(gulp.dest('build/css'))
      .pipe(browserSync.reload({stream: true}))
});

gulp.task('watch', function() {
    gulp.watch('src/less/**/*.less', ['less:watch']);
    gulp.watch('src/jade/**/*.jade', ['jade']);
    gulp.watch('src/img/**/*', ['copy-img']);
    gulp.watch('src/fonts/**/*', ['copy-fonts']);
    gulp.watch('src/js/**/*', ['copy-js']);
    gulp.watch('src/css/**/*', ['copy-css']);
});

gulp.task('browserSync', function() {
  browserSync({
    server: {
      baseDir: 'build'
    },
  })
});

gulp.task('default', ['watch', 'browserSync']);

// build tasks
gulp.task('less-build', function() {
    return gulp.src('src/less/styles.less')
      .pipe(less())
      .pipe(autoprefixer({browsers: ['last 2 versions', 'ie 10']}))
      .pipe(cmq())
      .pipe(csscomb())
      .pipe(gulp.dest('build/css'))
      .pipe(rename({suffix: '--min'}))
      .pipe(csso())
      .pipe(gulp.dest('build/css'))
});

gulp.task('clean', function() {
    return gulp.src('build', {read: false})
      .pipe(clean())
});

gulp.task('build', function () {
    runSequence('clean',
    ['less-build', 'jade', 'copy-css', 'copy-fonts', 'copy-js', 'copy-img'])
});
