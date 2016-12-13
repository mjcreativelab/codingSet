var subject = 0;
var bookID = 0;
var pageID = 1;
var indexID = 0;
var quesID = 0;
var book = {};
var isLoadingCanvas  = false;

// 矩形
var rect			= {};
rect.color			= [];
rect.default		= {};

rect.color[1]		= '#fe1';	// 薄い黄色
rect.color[2]		= '#999';	// 薄い灰色
rect.color[3]		= '#f00';	// 薄い紅色
rect.color[4]		= '#999';	// 薄い灰色

rect.default.x		= 100;
rect.default.y		= 100;
rect.default.w		= 500;
rect.default.h		= 100;

rect.opacity		= 0.3;

// 問題IDリスト (目次)
function setIndexs() {

//		if ($('.panel-index.page_' + pageID + ' .select_index option:not(.all)').length > 0) return;

	$.ajax({
		url: '/api/books/' + subject + '/' + bookID + '/indexes',
		data: {
			page_id : pageID
		},
		type: 'GET', dataType: 'json', cache: true, async: false, timeout: 10000,
		error: function (){},
		success: function (_data) {
			if (_data != undefined) {
				$('.panel-index .select_index option:not(.all)').remove();
				for (var i = 0; i < _data.length; i++) {
					$('.panel-index .select_index').append('<option value="' + _data[i].editing_index_id + '" data-page="' + _data[i].editing_page_id + '">' + _data[i].index_name + '</option>');
				}
			}
		}
	});
}

// 問題リスト
function setQuestions(_index) {

	var index = ''
	if (_index === undefined) {
		_index = '';
	}
	if (_index) index = _index;
	if (_index == 'all') _index = '';	// 全て対応

	$.ajax({
		url: '/api/books/' + subject + '/' + bookID + '/questions',
		data: {
			page_id : pageID,
			index_id : _index
		},
		type: 'GET', dataType: 'json', cache: true, async: false, timeout: 10000,
		error: function (){},
		success: function (_data) {
			$('.panel-index .tbl_questions tbody tr').remove();
			if (_data != undefined) {
				for (var i = 0; i < _data.length; i++) {
					var tr = '<tr data-id="' + _data[i].question_id + '"><td></td><td>' + _data[i].question_id + '</td><td></td></tr>';
					$('.panel-index .tbl_questions tbody').append(tr);
				}
			}
		}
	});
}

function setCanvasInit(_pid) {
	if (isLoadingCanvas) return;

	isLoadingCanvas = true;

	// canvasあり
	if ($('#canvas_' + _pid).hasClass('loaded')) {
		isLoadingCanvas = false;
		return;
	}

	//背景画像size
	$.ajax({
		url: '/api/books/' + subject + '/' + bookID + '/pages/' + _pid + '/image_size',
		type: 'GET', dataType: 'json', cache: true, async: false, timeout: 10000, error: function () {
		},
		success: function (_data) {
			if (_data != undefined) {
				$('#canvas_' + $('#select_page').val()).attr('width', _data.w);
				$('#canvas_' + $('#select_page').val()).attr('height', _data.h);
			}
		}
	});
	// 背景画像set
	setCanvasRect(_pid);
	isLoadingCanvas = false;
}

function setCanvasRect(_pid){

	$('#canvas_' + _pid)
		.drawImage({
			source: '/api/books/' + subject + '/' + bookID + '/pages/' + _pid + '/image',
			x: 0, y: 0,
			layer: true,
			fromCenter: false
		})
////		.drawLine({
////			strokeStyle: '#000',
////			strokeWidth: 1,
////			x1: 100, y1: 0,
////			x2: 100, y2: 150,
////			layer: true,
////			draggable: true,
////			restrictDragToAxis: 'x',
//////			dragstart: function() {
//////				// code to run when dragging starts
//////			},
//////			drag: function(layer) {
//////				// code to run as layer is being dragged
//////			},
//////			dragstop: function(layer) {
//////				var distX, distY, dist;
//////				distX = layer.eventX - layer.x;
//////				distY = layer.eventY - layer.y;
//////				if (distX < 10) {
//////					layer.x = 50;
//////				}
//////			},
//////			cursors: {
//////				// Show pointer on hover
//////				mouseover: 'pointer',
//////				// Show 'move' cursor on mousedown
//////				mousedown: 'move',
//////				// Revert cursor on mouseup
//////				mouseup: 'pointer'
//////			}
////		})
	;
	$('#canvas_' + _pid).addClass('loaded');
}

$(document).on('click', '.tbl_questions tbody td', function() {
	$('.panel-index .tbl_questions tbody tr').removeClass('active');
	$('.panel-index .tbl_questions tbody tr td').removeClass('active');
	$(this).parent().addClass('active');
	$('td', $(this).parent()).addClass('active');

	quesID = $('.panel-index .tbl_questions tbody tr').attr('data-id');
});

$(document).on('click', '.panel-rect.rect-type-1 tbody td', function() {
	$('.panel-rect.rect-type-1 table tbody tr').removeClass('active');
	$('.panel-rect.rect-type-1 table tbody tr td').removeClass('active');
	$(this).parent().addClass('active');
	$('td', $(this).parent()).addClass('active');

	var rect_name = $(this).parent().attr('data-rect');
	$('#canvas_' + $('#select_page').val()).triggerLayerEvent(rect_name, 'click');
	$('#canvas_' + $('#select_page').val()).drawLayers();
});
$(document).on('click', '.panel-rect.rect-type-3 tbody td', function() {
	$('.panel-rect.rect-type-3 table tbody tr').removeClass('active');
	$('.panel-rect.rect-type-3 table tbody tr td').removeClass('active');
	$(this).parent().addClass('active');
	$('td', $(this).parent()).addClass('active');

	var rect_name = $(this).parent().attr('data-rect');
	$('#canvas_' + $('#select_page').val()).triggerLayerEvent(rect_name, 'click');
	$('#canvas_' + $('#select_page').val()).drawLayers();
});



$(document).on('click', '#btnRectQ, #btnRectA', function() {

	if ($('.panel-index .tbl_questions tbody tr.active').length < 1) {
		alert('問題を選択してください');
		return;
	}

	var rectType	= $(this).attr('data-rect-type');
	var layers		= $('#canvas_' + $('#select_page').val()).getLayers();
	var type_index	= $('.panel-rect.rect-type-' + rectType + ' tbody tr').length + 1;
	var index		= $('.panel-rect tbody tr').length + 1;
	var base_name	= rectType + '_' + bookID + '_' + pageID + '_' + indexID + '_' + quesID + '_' + quesID + '_' + type_index;
	var group_name	= 'grp_' + base_name;
	var rect_name	= 'rect_' + base_name;
	var txt_name	= 'txt_' + base_name;

	$('#canvas_' + $('#select_page').val()).drawRect({
		name:				rect_name,
		groups:				[group_name],
		dragGroups:			[group_name],
		layer:				true,
		draggable:			true,
		fillStyle:			rect.color[rectType],
		strokeStyle:		'#ffffff',
		strokeWidth:		5,
		width:				rect.default.w,
		height:				rect.default.h,
		x:					rect.default.x,
		y:					rect.default.y,
		opacity:			rect.opacity,
		fromCenter:			false,
		handlePlacement:	'both',
		resizeFromCenter:	false,
		data: {
			page: $('#select_page').val(),
			editing_page_id: $('#select_page option:selected').attr('data-id'),
			editing_question_id: quesID,
			type: $(this).attr('data-rect-type'),
			type_index: type_index,
			index: index,
		},
		// Define handle properties
		handle: {
			type: 'arc',
			fillStyle: '#fff',
			strokeStyle: '#c33',
			strokeWidth: 1,
			radius: 3
		},
		handlestart: function(layer) {
			// code to run when resizing starts
			var rect_name = layer.name;
			var txt_name = rect_name.replace('rect_', 'txt_');
		},
		handlemove: function(layer) {
			// code to run while resizing
		},
		handlestop: function(layer) {
			// code to run while resizing stops
			var rect_name = layer.name;
			var txt_name = rect_name.replace('rect_', 'txt_');
			$('#canvas_' + $('#select_page').val()).getLayer(txt_name).x = layer.x + 10;
			$('#canvas_' + $('#select_page').val()).getLayer(txt_name).y = layer.y + 10;
		},
		dragstart: function() {
			// code to run when dragging starts
		},
		drag: function(layer) {
			// code to run as layer is being dragged
		},
		dragstop: function(layer) {
//				var distX, distY, dist;
//				distX = layer.eventX - layer.x;
//				distY = layer.eventY - layer.y;
//				if (distX < 10) {
//					layer.x = 50;
//				}
		},
		click: function(layer) {

			jQuery.each(layers, function() {
				if (this.data.index) {
					if (this.data.type == '2') this.data.type = '1';
					if (this.data.type == '4') this.data.type = '3';
					this.fillStyle = rect.color[this.data.type];
				}
			});
			if (layer.data.type == '1') layer.data.type = '2';
			if (layer.data.type == '3') layer.data.type = '4';
			layer.fillStyle = rect.color[layer.data.type];
			$('#canvas_' + $('#select_page').val()).drawLayers();
		},
		cursors: {
			// Show pointer on hover
			mouseover: 'move',
			// Show 'move' cursor on mousedown
			mousedown: 'move',
			// Revert cursor on mouseup
			mouseup: 'move'
		}
	})
	.drawText({
		name:			txt_name,
		groups:			[group_name],
		dragGroups:		[group_name],
		layer:			true,
		draggable:		true,
		fromCenter:		false,
		fillStyle:		'#000',
		shadowColor:	'#666',
		shadowBlur:		2,
		shadowX:		1,
		shadowY:		1,
		x:				rect.default.x + 10,
		y:				rect.default.y + 10,
		fontFamily:		'Verdana, sans-serif',
		fontSize:		18,
		text:			'問題 / 0000'
	});

	var parent = $('.panel-rect.rect-type-' + $(this).attr('data-rect-type') + ' tbody');

	var title = '問題';
	if ($(this).attr('data-rect-type') == '3' || $(this).attr('data-rect-type') == '4') title = '解答';
	title = '【' + title + '/' + $('.panel-index .tbl_questions tbody tr.active').attr('data-id') + '/' + ($('tr', parent).length + 1) + '】';

	var tr = '<tr data-rect="' + rect_name + '">\
	<td style="width: 40%;">' + title + '</td>\
	<td style="text-align: right; width: 30%;">\
		<div class="input-group input-small input-group-shorter">\
			<input type="text" class="spinner-input form-control" maxlength="3" readonly="">\
			<div class="spinner-buttons input-group-btn btn-group-vertical">\
				<button type="button" class="btn spinner-up btn-xs btn-default">\
				<i class="fa fa-angle-up"></i></button>\
				<button type="button" class="btn spinner-down btn-xs btn-default btnRectDel" data-rect="' + rect_name + '"><i class="fa fa-angle-down"></i></button>\
			</div>\
		</div>\
	</td>\
	<td style="text-align: right;"><button type="button" class="btn btn-danger"><i class="fa fa-trash-o"></i></button></td>\
	</tr>';
	$(parent).append(tr);
});


// book_id for jquery
$(document).on('click', 'a.link_book', function() {
	bookID = $(this).attr('data-id');
});

$(document).on('change', '#select_page', function() {
	pageID = $(this).val();

	$('.canvases.active').hide();
	$('.canvases.active').removeClass('active');

	if (!$('#canvases_' + pageID).length) {
		var c = '<div id="canvases_' + pageID + '" class="canvases active" data-id="' + pageID + '"><canvas id="canvas_' + pageID + '"></canvas></div>';
		$('.canvases_area').append(c);
	} else {
		$('#canvases_' + pageID).addClass('active')
	}
	$('#canvases_' + pageID).show();

	setPanelItem(pageID);

	setCanvasReady();
});

$(document).on('change', '.select_index', function() {
	indexID = $(this).val();

	setQuestions(indexID);
//		$.ajax({
//			url: '/api/books/' + subject + '/' + bookID + '/questions',
//			data: {index_id : indexID},
//			type: 'GET', dataType: 'json', cache: true, async: false, timeout: 10000,
//			error: function (){},
//			success: function (_data) {
//				$('.panel-index.page_' + pageID + ' .tbl_questions tbody tr').remove();
//				if (_data != undefined) {
//					for (var i = 0; i < _data.length; i++) {
//						var tr = '<tr data-id="' + _data[i].question_id + '"><td></td><td>' + _data[i].question_id + '</td><td></td></tr>';
//						$('.panel-index.page_' + pageID + ' .tbl_questions tbody').append(tr);
//					}
//				}
//			}
//		});
});

$(document).on('click', '#btnQuesAdd', function() {
	var index_id = $('.panel-index .select_index').val();
	if (index_id == 'all') return;

	$.ajax({
		url: '/api/books/' + subject + '/' + bookID + '/questions/0',
		data: {index_id: index_id},
		type: 'PUT', dataType: 'json', cache: true, async: false, timeout: 10000,
		error: function (){},
		success: function (_data) {
			if (_data != undefined) {
				var tr = '<tr>\
				<td></td>\
				<td>' + _data.question_id + '</td>\
				<td></td>\
				</tr>';
				$('.panel-index .tbl_questions tbody').append(tr);
			}
		}
	});
});

$(document).on('click', '.btnRectDel', function() {

	var rect_name = $(this).attr('data-rect');
	$('#canvases_' + pageID).removeLayer(rect_name).drawLayers();
	$(this).parents('tr').remove();

});


$(document).on('click', '#btnSave', function() {

	var pages = $('#select_page option');
	var page = 1;
	var editing_page_id		= 0;
	var editing_question_id	= 0;
	var origin_rect_seq		= 0;
	var rect_type			= 0;
	var rect_seq			= 0;
	var origin_rect_seq		= 0;
	var x = 0;
	var y = 0;
	var w = 0;
	var h = 0;

	jQuery.each(pages, function() {
		page = $(this).val();
		var layers = $('#canvas_' + page).getLayers();
		jQuery.each(layers, function() {
			if (this.data.index) {
				editing_page_id		= this.data.editing_page_id;
				editing_question_id	= this.data.editing_question_id;
				rect_type			= this.data.type;
				rect_seq			= this.data.index;
				origin_rect_seq		= this.data.type_index;
				x					= this.x;
				y					= this.y;
				w					= this.width;
				h					= this.height;
				$.ajax({
					url: '/api/books/' + subject + '/' + bookID + '/questions/' + editing_question_id + '/rectangle',
					data: {
						editing_page_id: editing_page_id,
						rect_type: rect_type,
						rect_seq: rect_seq,
						origin_rect_seq: origin_rect_seq,
						x: x,
						y: y,
						w: w,
						h: h,
					},
					type: 'POST', dataType: 'json', cache: true, async: false, timeout: 10000,
					error: function (){},
					success: function (_data) {
						if (_data != undefined) {

						}
					}
				});

			}
		});
	});
});



// jquery レンダリング用
$(document).on('inview', '.canvases', function() {
	setCanvasReady();
});
// jquery リロード用
if ($('.canvases').length) {
	setCanvasReady();
}
function setCanvasReady() {

	if (!subject) {
		subject = getUrlFromSubject();
	}
	if (!bookID) {
		bookID = getUrlFromBookID();
	}

	$.ajax({
		url: '/api/books/' + subject + '/' + bookID,
		type: 'GET', dataType: 'json', cache: true, async: false, timeout: 10000, error: function () {
		},
		success: function (_data) {
			if (_data != undefined) {
				book = _data;
			}
		}
	});

	// ここ無理くり react と jqueryの整合性を合わせるために
	// jquery ready発火まで10 sec 待つ
	if (book) {
		var count = 0;
		var chkCanvasReady = function(){
			count++;
			var tid = setTimeout(chkCanvasReady, 1000);
			if (count > 10) {
				clearTimeout(tid);
			}
		}
		chkCanvasReady();

	}
	var chkCanvasReady = function() {
		if (!book) return;
		if (book.editing_page.length == $("#select_page option").length) {
			setCanvasInit($('#select_page').val());
		}
		setPanelItem($('#select_page').val());
	}
}

function setPanelItem(_pid) {
	setIndexs();
	setQuestions();

//		// 目次BOX
//		if (!$('.panel-index.each_pages.page_' + _pid).length) {
//			$('.panel-index.each_pages.page_0').after('<section class="panel panel-index each_pages page_' + _pid + '" />');
//			$('.panel-index.each_pages.page_' + _pid).append($('.panel-index.each_pages.page_0').children().clone());
//		}
//		$('.panel-index.each_pages').hide();
//		$('.panel-index.each_pages.page_' + _pid).show();
//
//		// 矩形BOX 問題
//		if (!$('.panel-rect.q.each_pages.page_' + _pid).length) {
//			$('.panel-rect.q.each_pages.page_0').after('<section class="panel panel-rect q each_pages page_' + _pid + '" />');
//			$('.panel-rect.q.each_pages.page_' + _pid).append($('.panel-rect.q.each_pages.page_0').children().clone());
//		}
//		$('.panel-rect.q.each_pages').hide();
//		$('.panel-rect.q.each_pages.page_' + _pid).show();
//
//		// 矩形BOX 解答
//		if (!$('.panel-rect.a.each_pages.page_' + _pid).length) {
//			$('.panel-rect.a.each_pages.page_0').after('<section class="panel panel-rect a each_pages page_' + _pid + '" />');
//			$('.panel-rect.a.each_pages.page_' + _pid).append($('.panel-rect.a.each_pages.page_0').children().clone());
//		}
//		$('.panel-rect.a.each_pages').hide();
//		$('.panel-rect.a.each_pages.page_' + _pid).show();
}

// ページ遷移制御
$(window).on("beforeunload", function () {
	return "ページ移動すると未保存データは失われます。";
});

function getUrlFromBookID() {
	var url = $.url();
	var path = url.attr('path');
	var bookID = path.split('/')[3];
	return bookID;
}
function getUrlFromSubject() {
	var url = $.url();
	var path = url.attr('path');
	var bookID = path.split('/')[2];
	return bookID;
}
