// npm i -D

'use strict'

const gulp = require( 'gulp' );
const browser = require( 'browser-sync' );
const ejs = require( 'gulp-ejs' );
const gif = require( 'gulp-if' );
const imgMin = require( 'gulp-imagemin' );
const notify = require( 'gulp-notify' );
const plumber = require( 'gulp-plumber' );
const runSequence = require('run-sequence');
const sass = require( 'gulp-sass' );
const sourcemaps = require( 'gulp-sourcemaps' );
const uglify = require( 'gulp-uglify' )
const objSrcPaths = {
		ejs: 'src/ejs/',
		img: 'src/img/',
		js: 'src/js/',
		sass: 'src/scss/'
	};

gulp.observeFile = ( strSrcPath, strDistPath, func, blnFunc ) => {
		gulp
			.src([
				strSrcPath + '**/*',
				'!' + strSrcPath + '**/_*'
			])
			.pipe( plumber({
				errorHandler: notify.onError( '<%= error.message %>' )
			}))
			.pipe( gif( blnFunc, func() ) )
			.pipe( gulp.dest( 'dist' + strDistPath ) )
			.pipe( browser.reload( {stream: true} ) )
		;
	}
;

gulp

	.task( 'server', () => {
		browser.init({
			server: {
				baseDir: './dist/'
			},
			open: 'external',
			startPath: '/'
		});
	})

	.task( 'ejs', () => {
		gulp.observeFile(objSrcPaths.ejs, '/', ejs, true);
	})

	.task( 'img', () => {
		gulp.observeFile(objSrcPaths.img, '/img/', imgMin, true);
	})

	.task( 'js', () => {
		gulp.observeFile(objSrcPaths.js, '/js/', uglify, false);
	})

	.task( 'sass', () => {
		gulp
			.src([
				objSrcPaths.sass + '**/*',
				'!' + objSrcPaths.sass + '**/_*'
			])
			.pipe( plumber({
				errorHandler: notify.onError( '<%= error.message %>' )
			}))
			.pipe( sourcemaps.init() )
			.pipe( sass( {outputStyle: 'expanded'} ) )
			.pipe( sourcemaps.write( '../_map' ) )
			.pipe( gulp.dest( 'dist/css/' ) )
			.pipe( browser.reload( {stream: true} ) )
		;
	})

	.task( 'default', ['server'], () => {
		gulp.watch( objSrcPaths.ejs + '**/*', ['ejs'] );
		gulp.watch( objSrcPaths.img + '**/*', ['img'] );
		gulp.watch( objSrcPaths.js + '**/*', ['js'] );
		gulp.watch( objSrcPaths.sass + '**/*', ['sass'] );
		return runSequence( ['ejs', 'img', 'js', 'sass'] );
	})

;