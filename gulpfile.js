
var sass = require('gulp-sass');
var minifycss = require('gulp-minify-css');
var uglify = require('gulp-uglify');
var concatcss = require('gulp-concat-css');
var concat = require('gulp-concat');
var ngannotate = require('gulp-ng-annotate');
var rename = require('gulp-rename');
var minifyhtml = require('gulp-minify-html');
var jshint = require('gulp-jshint');

var connect = require('gulp-connect');

var gulp = require('gulp');

gulp.task('sass', function () {
	return gulp.src('sass/*.scss')
		.pipe(sass())
		.pipe(gulp.dest('css'));
});

gulp.task('css', function () {
	return gulp.src('css/main.css')
		.pipe(minifycss())
		.pipe(rename({
			extname: '.min.css'
		}))
		.pipe(gulp.dest('public/css'))
		.pipe(connect.reload());
});

gulp.task('js-main', function() {
	return gulp.src(['js/app.js', 'js/controller.js', 'js/directives.js'])
		.pipe(ngannotate())
		.pipe(uglify())
		.pipe(concat('main.min.js'))
		.pipe(gulp.dest('public/js'))
		.pipe(connect.reload());
});
gulp.task('js-libs', function() {
	return gulp.src('js/libs/*.js')
		.pipe(uglify())
		.pipe(rename({
			extname: '.min.js'
		}))
		.pipe(gulp.dest('public/js/libs'))
		.pipe(connect.reload());
});
gulp.task('lint', function () {
	return gulp.src('js/*.js')
		.pipe(jshint({ sub: true }))
		.pipe(jshint.reporter('default'));
});

// gulp.task('html', function() {
// 	return gulp.src('index.html')
// 		.pipe(minifyhtml())
// 		.pipe(gulp.dest('public'));
// });
// gulp.task('html-partials', function() {
// 	return gulp.src('partials/*.html')
// 		.pipe(minifyhtml())
// 		.pipe(gulp.dest('public/partials'));
// });
gulp.task('webserver', function() {
	connect.server({
		livereload: true
	});
});

gulp.task('watch', function () {
	gulp.watch('js/*.js', ['lint', 'js-main', 'js-libs']);
	gulp.watch('sass/*.scss', ['sass']);
	gulp.watch('css/main.css', ['css']);
})

gulp.task('default', ['lint', 'css', 'js-main', 'js-libs', 'webserver', 'watch']);
