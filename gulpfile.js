var autoprefixer       = require('gulp-autoprefixer');
var beeper             = require('beeper');
var browserSync        = require('browser-sync');
var cache              = require('gulp-cache');
var cleanCSS           = require('gulp-clean-css');
var gconcat            = require('gulp-concat');
var gulp               = require('gulp');
var gutil              = require('gulp-util');
var imagemin           = require('gulp-imagemin');
var notify             = require('gulp-notify');
var plumber            = require('gulp-plumber');
var pug                = require('gulp-pug');
var rename             = require("gulp-rename");
var sass               = require('gulp-sass');
var sourcemaps         = require('gulp-sourcemaps');
var uglify             = require('gulp-uglify');

var onError            = function(err) { // Custom error msg with beep sound and text color
    notify.onError({
        title:    "Gulp error in " + err.plugin,
        message:  err.toString()
    })(err);
    beeper(3);
    this.emit('end');
    gutil.log(gutil.colors.red(err));
};

gulp.task('styles', function() {
    gulp.src('./src/sass/*.sass')
        .pipe(plumber({ errorHandler: onError }))
        .pipe(sourcemaps.init())
        .pipe(sass({indentedSyntax: true}))
        .pipe(autoprefixer({
            browsers: ['last 5 versions'],
            cascade: false}))
        .pipe(cleanCSS())
        .pipe(sourcemaps.write())
        .pipe(rename({ suffix: '.min'}))
        .pipe(gulp.dest('build/css/'));
});

gulp.task('templates', function() {
    gulp.src('./src/pug/*.pug')
        .pipe(plumber({ errorHandler: onError }))
        .pipe(pug())
        .pipe(gulp.dest('build'));
});
gulp.task('scripts', function() {
    return gulp.src('./src/js/*.js')
        .pipe(plumber({ errorHandler: onError }))
        .pipe(sourcemaps.init())
        .pipe(gconcat('bundle.js'))
        .pipe(uglify())
        .pipe(sourcemaps.write())
        .pipe(rename({ suffix: '.min'}))
        .pipe(gulp.dest('./build/js'));
});

gulp.task('images', function() {
    gulp.src('./src/img/**')
        .pipe(cache(imagemin({
            optimizationLevel: 3,
            progressive: true,
            interlaced: true})))
        .pipe(gulp.dest('build/img/'));
});

gulp.task('default', ['setup','watch']);


gulp.task('setup', function() {
    gulp.start('styles', 'templates', 'scripts', 'images');
});

gulp.task('watch', function() {
    gulp.watch('./src/sass/*.sass', ['styles']);
    gulp.watch(['./src/pug/**'], ['templates']);
    gulp.watch('./src/js/*.js', ['scripts']);
    gulp.watch('img/**/*', ['images']);


browserSync.init({
    server: {
        proxy: "local.build",
        baseDir: "build/"
    }
});

gulp.watch([',/build/**'], browserSync.reload);



});
