// !! required jquery !!

// 'use strict'

var objWinNav = window.navigator,
	strUA = objWinNav.userAgent.toLowerCase(),
	objMobileUA = (function(){
		var objInst = {
			mobile: false,
			tablet: false
		};

		// mobile

		if ( strUA.indexOf( 'iphone' ) != -1 ) {
			objInst.mobile = 'iphone'
		} else if ( strUA.indexOf( 'ipod' ) != -1 ) {
			objInst.mobile = 'ipod'
		} else if ( strUA.indexOf( 'android' ) != -1 && strUA.indexOf( 'mobile' ) != -1 ) {
			objInst.mobile = 'android'
		} else if ( strUA.indexOf( 'android' ) != -1 && strUA.indexOf( 'mobile' ) != -1 ) {
			objInst.mobile = 'android'
		} else if ( strUA.indexOf( 'firefox' ) != -1 && strUA.indexOf( 'mobile' ) != -1 ) {
			objInst.mobile = 'firefox'
		} else if ( strUA.indexOf( 'windows' ) != -1 && strUA.indexOf( 'phone' ) != -1 ) {
			objInst.mobile = 'windowsPhone'
		} else if ( strUA.indexOf( 'bb10' ) != -1 && strUA.indexOf( 'mobile' ) != -1 ) {
			objInst.mobile = 'blackberry'
		}

		// tablet

		if ( strUA.indexOf( 'ipad' ) != -1 ) {
			objInst.tablet = 'ipad';
		} else if ( strUA.indexOf( 'android' ) != -1 && strUA.indexOf( 'mobile' ) == -1 ) {
			objInst.tablet = 'android';
		} else if ( strUA.indexOf( 'firefox' ) != -1 && strUA.indexOf( 'tablet' ) != -1 ) {
			objInst.tablet = 'firefox';
		} else if ( strUA.indexOf( 'kindle' ) != -1 ) {
			objInst.tablet = 'kindle';
		} else if ( strUA.indexOf( 'silk' ) != -1 ) {
			objInst.tablet = 'silk';
		} else if ( strUA.indexOf( 'playbook' ) != -1 ) {
			objInst.tablet = 'playbook';
		}

		return objInst;
	})(),
	strBrowser = (function(){
		var strInst = 'unknown',
			strAppVer = objWinNav.appVersion.toLowerCase()
		;

		if ( strUA.indexOf( 'chrome' ) != -1){
			strInst = 'chrome';
		} else if ( strUA.indexOf( 'safari' ) != -1){
			strInst = 'safari';
		} else if ( strUA.indexOf( 'opera' ) != -1){
			strInst = 'opera';
		} else if ( strUA.indexOf( 'firefox' ) != -1){
			strInst = 'firefox';
		} else if( strUA.indexOf( 'trident/7' ) != -1){
			strInst = 'ie11';
		} else if ( strUA.indexOf( 'msie' ) != -1 ){
			if ( strUA.indexOf( 'msie 10.' ) != -1 ){
				strInst = 'ie10';
			} else if ( strUA.indexOf( 'msie 9.' ) != -1 ){
				strInst = 'ie9';
			} else if ( strUA.indexOf( 'msie 8.' ) != -1 ){
				strInst = 'ie8';
			} else if ( strUA.indexOf( 'msie 7.' ) != -1 ){
				strInst = 'ie7';
			} else if ( strUA.indexOf( 'msie 6.' ) != -1 ){
				strInst = 'ie6';
			} else {
				strInst = 'ie';
			}
		}
		return strInst;
	})()
;

$.getScreenSize = function(){
	return {
		width: window.innerWidth ? window.innerWidth : $(window).width(),
		height: window.innerHeight ? window.innerHeight : $(window).height()
	};
};

$.smoothScroll = function( numPos ){
	var $page = $( 'html, body' ),
		objProp = { scrollTop: numPos }
	;
	$page
		.stop()
		.animate( objProp, 1000, 'easeOutQuart' )
	;
};

$.fn.checkForm = function(){
	var $form = this,
		$btnSubmit = $( '.btn-submit', $form ),
		strRequired = '.input-required input, .input-required select, .input-required textarea'
	;
	$form.on( 'change', strRequired, function(){
		var $required = $( strRequired, $form ),
			numRequired = $required.length,
			numCount = 0
		;
		$required.each(function(){
			var $input = $(this);
			if ( !$input.is( '[type="checkbox"], [type="radio"]' ) ) {
				if ( $input.val() ) {
					numCount++;
				}
			} else {
				var strName = $input.attr( 'name' );
				$input = $( '[name="' + strName + '"]:checked', $form );
				if ( $input.length ) {
					numCount++;
				}
			}
		});
		if ( numRequired === numCount ) {
			$btnSubmit.removeClass( 'disabled' );
		} else {
			$btnSubmit.addClass( 'disabled' );
		}
	})
};

$(function(){

	var blnTimer = false;

/////////////////////////
// events
/////////////////////////

	$( document )

//
//----------------------

		.on( '', '', function(){

		})

// click
//----------------------

		.on( 'click', 'form .btn-submit', function(){
			var $form = $(this).parents( 'form' );
			$form.submit();
		})

		.on( 'click', '.accordion-toggle', function(){
			var $accordionHeader = $(this).parent( '[data-accordion]' ),
				$accordionBody = $accordionHeader.next( '.accordion-body' )
			;
			if ( $accordionHeader.is( '[data-accordion="opened"]' ) ) {
				$accordionHeader.attr( 'data-accordion', 'closed' );
				$accordionBody.slideUp();
			} else {
				$accordionHeader.attr( 'data-accordion', 'opened' );
				$accordionBody.slideDown();
			}
		})

		.on( 'click', '.modal-launcher', function(){
			var $modal = $( '#modal' ),
				$modalContents = $( '.modal-contents', $modal ),
				strContents = $(this).attr( 'data-modal' )
			;
			$modal.addClass( 'showed' ).removeClass( 'init' );
			$modalContents.hide();
			if ( strContents ) {
				$( '#' + strContents ).show();
			}
		})

		.on( 'click', '#modal .btn-close-modal', function(){
			var $modal = $(this).parents( '#modal' );
			$modal.removeClass( 'showed' );
		})

// change
//----------------------

		.on( 'change', '.select-file [type="file"]', function(){
			var $input = $(this),
				$form = $input.parents( '.select-file' ),
				$fileName = $( '.file-name', $form ),
				strFileName = $input.val()
			;
			strFileName = strFileName.split( '\\' ).pop();
			$form.addClass( 'selected' );
			$fileName.text( strFileName );
		})

	;

	$( window )

// scroll
//----------------------

		.on( 'scroll', function(){

		})

// resize
//----------------------

		.on( 'resize', function(){
			if ( $.getScreenSize().width > 640 ) {
				var numScroll = $(this).scrollTop()
				;
				if (　blnTimer !== false　) {
					clearTimeout( blnTimer );
				}
				blnTimer = setTimeout(function(){
					if ( numScroll > 0 ) {

					} else {

					}
				}, 100);
			}
		})

	;

// end of jquery
});