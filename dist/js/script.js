$.getScreenSize = function(){
	return {
		width: window.innerWidth ? window.innerWidth: $(window).width(),
		height: window.innerHeight ? window.innerHeight: $(window).height()
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

$.getUA = (function( strUA ){
	return {
		Tablet: strUA.indexOf("ipad") != -1 || (strUA.indexOf("android") != -1 && strUA.indexOf("mobile") == -1) || (strUA.indexOf("firefox") != -1 && strUA.indexOf("tablet") != -1) || strUA.indexOf("kindle") != -1 || strUA.indexOf("silk") != -1 || strUA.indexOf("playbook") != -1,
		Mobile: (strUA.indexOf("windows") != -1 && strUA.indexOf("phone") != -1) || strUA.indexOf("iphone") != -1 || strUA.indexOf("ipod") != -1 || (strUA.indexOf("android") != -1 && strUA.indexOf("mobile") != -1) || (strUA.indexOf("firefox") != -1 && strUA.indexOf("mobile") != -1) || strUA.indexOf("blackberry") != -1,
		IE: strUA.indexOf('msie') != -1 || strUA.indexOf('trident') != -1
	}
})(window.navigator.userAgent.toLowerCase());

$.getVersionIE = (function( strApp ){
	return {
		lteIE8:
			strApp.indexOf("msie 6.") !=  -1 ||
			strApp.indexOf("msie 7.") !=  -1 ||
			strApp.indexOf("msie 8.") !=  -1
	}
})(window.navigator.appVersion.toLowerCase());

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
				$accordionHeader.attr( 'data-opened', 'opened' );
				$accordionBody.slideDown();
			}
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