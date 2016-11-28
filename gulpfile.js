// npm i -D

'use strict'

const gulp = require( 'gulp' );
const browser = require( 'browser-sync' );
const ejs = require( 'gulp-ejs' );
const gif = require( 'gulp-if' );
const notify = require( 'gulp-notify' );
const plumber = require( 'gulp-plumber' );
const sass = require( 'gulp-sass' );
const sourcemaps = require( 'gulp-sourcemaps' );
const uglify = require( 'gulp-uglify' )
const objSrcPaths = {
		ejs: 'src/ejs/',
		js: 'src/js/',
		sass: 'src/scss/'
	};

gulp.observeFile = ( arrFiles, strPath, func, blnFunc ) => {
		gulp
			.src( arrFiles )
			.pipe( plumber({
				errorHandler: notify.onError( '<%= error.message %>' )
			}))
			.pipe( gif( blnFunc, func() ) )
			.pipe( gulp.dest( 'dist' + strPath ) )
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
		gulp.observeFile([
			objSrcPaths.ejs + '**/*.ejs',
			'!' + objSrcPaths.ejs + '**/_*.ejs'
		], '/', ejs, true);
	})

	.task( 'js', () => {
		gulp.observeFile([
			objSrcPaths.js + '**/*.js',
			'!' + objSrcPaths.js + '**/_*.js'
		], '/js/', uglify, false);
	})

	.task( 'sass', () => {
		gulp
			.src([
				objSrcPaths.sass + '**/*.scss',
				'!' + objSrcPaths.sass + '**/_*.scss'
			])
			.pipe( plumber({
				errorHandler: notify.onError( '<%= error.message %>' )
			}))
			.pipe( sourcemaps.init() )
			.pipe( sass( {outputStyle: 'expanded'} ) )
			.pipe( sourcemaps.write( '../_maps' ) )
			.pipe( gulp.dest( 'dist/css/' ) )
			.pipe( browser.reload( {stream: true} ) )
		;
	})

	.task( 'default', ['server'], () => {
		gulp.watch( objSrcPaths.ejs + '**/*.ejs', ['ejs'] );
		gulp.watch( objSrcPaths.js + '**/*.js', ['js'] );
		gulp.watch( objSrcPaths.sass + '**/*.scss', ['sass'] );
	})

;