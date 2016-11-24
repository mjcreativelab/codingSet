var gulp = require( 'gulp' ),
	browser = require( 'browser-sync' ),
	plumber = require( 'gulp-plumber' ),
	notify = require( 'gulp-notify' ),
	checkAndReload = function( strFile ) {
		gulp
			.src( strFile )
			.pipe( plumber({
				errorHandler: notify.onError( '<%= error.message %>' )
			}) )
			.pipe( browser.reload( {stream: true} ) )
		;
	}
;

gulp

	.task( 'server', function() {
		browser.init({
			server: {
				baseDir: './'
			},
			open: 'external',
			startPath: '/omakase/'
		});
	})

	.task( 'html', function() {
		checkAndReload( './**/*.html' );
	})

	.task( 'css', function() {
		checkAndReload( './**/*.css' );
	})

	.task( 'js', function() {
		checkAndReload( './**/*.js' );
	})

	.task( 'default', ['server'], function() {
		gulp.watch( './**/*.html', ['html'] );
		gulp.watch( './**/*.css', ['css'] );
		gulp.watch( './**/*.js', ['js'] );
	})

;