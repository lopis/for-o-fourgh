const chalk = require('chalk');
const concat = require('gulp-concat');
const concatCss = require('gulp-concat-css');
const cssmin = require('gulp-cssmin');
const fs = require('fs');
const gulp = require('gulp');
const htmlmin = require('gulp-htmlmin');
const imagemin = require('gulp-imagemin');
const inject = require('gulp-inject');
const mkdirp = require('mkdirp');
const ts = require('gulp-typescript');
const uglify = require('gulp-uglify-es').default;
const watch = require('gulp-watch');
const zip = require('gulp-zip');

//Chalk colors
var error = chalk.bold.red;
var success = chalk.green;
var regular = chalk.white;

gulp.task('watch', (done) => {
	gulp.watch('./src/ts/*.ts', gulp.series('build-dev'));
	gulp.watch('./src/server/*.js', gulp.series('build-server-js-dev'));
	gulp.watch('./src/html/**/*.html', gulp.series('build-dev'));
	gulp.watch('./src/css/**/*.css', gulp.series('build-dev'));
	gulp.watch('./src/assets/**/*', gulp.series('build-dev'));
});

gulp.task('init', (done) => {
	//Create our directory structure
	mkdirp('./src', function (err) {
		mkdirp('./src/ts', function (err) {
			mkdirp('./src/html', function (err) {
				mkdirp('./src/css', function (err) {
					mkdirp('./src/assets', function (err) {
						done();
					});
				});
			});
		});
	});
});

gulp.task('build-ts', function () {
  var tsProject = ts.createProject('tsconfig.json');

  return gulp.src('./src/ts/*.ts')
    .pipe(tsProject())
    .pipe(gulp.dest('tmp'));
});

gulp.task('build-js-dev', (done) => {
	return gulp.src('./tmp/*.js')
	.pipe(concat('client.js'))
	.pipe(gulp.dest('./public/'));
});

gulp.task('build-js', (done) => {
	return gulp.src('./tmp/*.js')
	.pipe(concat('client.js'))
	.pipe(uglify({
    mangle: {
      toplevel: true
    },
  }))
	.pipe(gulp.dest('./public/'));
});

gulp.task('build-server-js', (done) => {
  var tsProject = ts.createProject('tsconfig.json');

	return gulp.src('./src/server/*.js')
  .pipe(concat('server.js'))
  .pipe(tsProject())
	.pipe(uglify({
    mangle: {
      toplevel: true
    },
  }))
	.pipe(gulp.dest('./public/'));
});

gulp.task('build-server-js-dev', (done) => {
	return gulp.src('./src/server/*.js')
	.pipe(concat('server.js'))
	.pipe(gulp.dest('./public/'));
});

gulp.task('build-html', (done) => {
	return gulp.src('./src/html/**/*.html')
		.pipe(htmlmin({collapseWhitespace: true}))
		.pipe(gulp.dest('./public/'));
});

gulp.task('build-css', (done) => {
	return gulp.src('./src/css/**/*.css')
    .pipe(concatCss('style.css'))
    .pipe(cssmin())
		.pipe(gulp.dest('./public/'));
});
gulp.task('inject-css', (done) => {
  return gulp.src('./public/index.html')
    .pipe(inject(gulp.src(['./public/style.css']), {
      removeTags: true,
      starttag: '/* inject:css */',
      endtag: '/* endinject */',
      transform: function (filePath, file) {
        // return file contents as string
        return file.contents.toString('utf8')
      }
    }))
    .pipe(gulp.dest('./public'))
})


gulp.task('copy-img', (done) => {
	return gulp.src('./src/assets/**/*')
		.pipe(gulp.dest('./public/'));
});

gulp.task('zip', (done) => {
	return gulp.src([
    './public/*.html',
    './public/*.js',
    './public/*.png',
  ])
		.pipe(zip('entry.zip')) //gulp-zip performs compression by default
		.pipe(gulp.dest('dist'));
});

gulp.task('build-img', () => {
  return gulp.src('src/assets/**')
    .pipe(imagemin())
    .pipe(gulp.dest('public'));
});

gulp.task('check', gulp.series('zip', (done) => {
	var stats = fs.statSync("./dist/entry.zip")
	var fileSize = stats.size;
	if (fileSize > 13312) {
		console.log(error("Your game is larger than 13kb (13312 bytes)!"))
		console.log(regular("Zip compressed, it is " + fileSize + " bytes"));
	} else {
		console.log(success("Your zip compressed game is " + fileSize + " bytes."));
	}
	done();
}));

gulp.task('build-prod', gulp.series(
  gulp.parallel(
    'build-html',
    'build-ts',
    'build-css',
    'build-img',
  ),
  gulp.parallel(
    'build-js',
    'inject-css',
  ),
  'build-server-js',
	'check', //also zips,
	(done) => {done();}
));
gulp.task('build-dev', gulp.series(
	'build-html',
	'build-ts',
  'build-js-dev',
  'build-server-js-dev',
  'build-css',
  'inject-css',
	'copy-img',
	(done) => {done();}
));
