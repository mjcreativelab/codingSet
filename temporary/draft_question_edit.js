$(function(){

	var subject = 0,
		bookID = 0,
		editingPageID = 0,
		pageID = 0,
		indexID = 0,
		quesID = 0,
		book = {},
		arrRectProps = [],
		getUrlFromBookID = function() {
			var url = $.url(),
				path = url.attr('path')
			;
			return path.split('/')[3];
		},
		getUrlFromSubject = function() {
			var url = $.url(),
				path = url.attr('path')
			;
			return path.split('/')[2];
		},
		getParams = function() {
			if (!subject) {
				subject = getUrlFromSubject();
			}
			if (!bookID) {
				bookID = getUrlFromBookID();
			}
			if (!book.book_id) {
				$.ajax({
					url: '/api/books/' + subject + '/' + bookID,
					type: 'GET', dataType: 'json', cache: true, async: false, timeout: 10000, error: function () {
					},
					success: function (_data) {
						if (_data != undefined) {
							book = _data;
						}
						console.log(['book', book]);
					}
				});
			}
		}
	;


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

//////////////////////////
// 問題IDリスト (目次）設置
//////////////////////////

	var setIndexs = function() {

			getParams();

//			if ($('.panel-index.page_' + pageID + ' .select_index option:not(.all)').length > 0) return;

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
						console.log(['index', pageID, _data]);
					}
				}
			});
		}
	;

//////////////////////////
// 問題ID (目次）選択
//////////////////////////

	$(document)
		.on('change', '.select_index', function() {
			indexID = $(this).val();
			setQuestions(indexID);
		})
	;

//////////////////////////
// 問題リスト設置
//////////////////////////

	var setQuestions = function(_index) {

			var $questionList = $('.panel-index .tbl_questions tbody'),
				index = ''
			;
			if (_index === undefined) {
				_index = '';
			}
			if (_index) index = _index;
			if (_index == 'all') _index = '';	// 全て対応

			getParams();

			$.ajax({
				url: '/api/books/' + subject + '/' + bookID + '/questions',
				data: {
					page_id : pageID,
					index_id : _index
				},
				type: 'GET', dataType: 'json', cache: true, async: false, timeout: 10000,
				error: function (){},
				success: function (_data) {
					$('tr', $questionList).remove();
					if (_data != undefined) {
						for (var i = 0; i < _data.length; i++) {
							var tr = '<tr class="question-selector" data-question-id="' + _data[i].question_id + '"><td>' + _data[i].question_id + '</td></tr>';
							$questionList.append(tr);
						}
						console.log(['question', pageID, _index, _data]);
					}
				}
			});
		}
	;

//////////////////////////
// 問題選択
//////////////////////////

	$(document)
		.on('click', '.tbl_questions .question-selector', function() {
			var $question = $(this),
				$questionList = $question.parents('.tbl_questions'),
				numQuestion = 0,
				numQuestionMask = 0,
				numAnswer = 0,
				numAnswerMask = 0
			;

			$('tr, td', $questionList).removeClass('active');

			$question.addClass('active');
			$('td', $question).addClass('active');

			quesID = $question.attr('data-question-id');

			getRectsParams();

			if (arrRectProps.length) {
				$.each(arrRectProps, function(_i, _val){
					var numRectType = _val.rect_type;
					if (numRectType == 1) {
						numQuestion++;
					} else if (numRectType == 2) {
						numQuestionMask++;
					} else if (numRectType == 3) {
						numAnswer++;
					} else if (numRectType == 4) {
						numAnswerMask++;
					}
				});
				setRects(arrRectProps);
			} else {
				initRect();
			}
			$question.attr('question-rect', numQuestion);
			$question.attr('question-mask-rect', numQuestionMask);
			$question.attr('answer-rect', numAnswer);
			$question.attr('answer-mask-rect', numAnswerMask);
		})
	;

//////////////////////////
// 問題画像表示
//////////////////////////

	var setPageImage = function(editingPageID, pageID) {

			getParams();

			var $pagesList = $('#pagesList'),
				$page = $('#page_' + editingPageID, $pagesList)
			;

			if (!$page.length) {
				var $pageImage = $('<img>').attr('src', '/api/books/' + subject + '/' + bookID + '/pages/' + pageID + '/image');
				$page = $('<li id="page_' + editingPageID + '" class="page" />')
							.append($pageImage)
							.appendTo($pagesList)
						;
			}
		}
	;

//////////////////////////
// 矩形設置
//////////////////////////

	var objDefaultRectProps = {
			rect: $('<div class="rect" />')
						.append(
							$('<div class="rect-handle-list" />')
								.append('<div class="rect-handle" data-direction="top-left">')
								.append('<div class="rect-handle" data-direction="top">')
								.append('<div class="rect-handle" data-direction="top-right">')
						)
						.append(
							$('<div class="rect-handle-list" />')
								.append('<div class="rect-handle" data-direction="left">')
								.append('<div class="rect-handle" data-direction="move">')
								.append('<div class="rect-handle" data-direction="right">')
						)
						.append(
							$('<div class="rect-handle-list" />')
								.append('<div class="rect-handle" data-direction="bottom-left">')
								.append('<div class="rect-handle" data-direction="bottom">')
								.append('<div class="rect-handle" data-direction="bottom-right">')
						),
			rectContainer: $('<div class="rect-container" />')
						.append(
							$('<dl class="rect-contents" />')
								.append('<dt class="rect-name" />')
								.append('<dd class="rect-area" />')
						),
			maskRectContainer: $('<div class="rect-mask-list" />'),
			questionRect: {
				posX: 100,
				posY: 100,
				width: 500,
				height: 100,
				maskRect: {
					posX: 0,
					posY: 0,
					width: 0,
					height: 0
				}
			},
			answerRect: {
				posX: 100,
				posY: 100,
				width: 500,
				height: 100,
				maskRect: {
					posX: 0,
					posY: 0,
					width: 0,
					height: 0
				}
			}
		},
		arrHistoryRectProps = [],
		getRectsParams = function() {
			if (!quesID) return;
			getParams();

			$.ajax({
				url: 'http://atls-api.paxcreation.com/question_rect.php?book_id=' + book.book_id + '&question_id=' + quesID + '&subject=' + subject,
				type: 'GET', dataType: 'json', cache: true, async: false, timeout: 10000,
				error: function (){},
				success: function (_data) {
					if (_data) {
						console.log(['rectProps_' + editingPageID + '_' + quesID, _data]);
						arrRectProps = _data;
					} else {
						console.log('noRectProps_' + editingPageID + '_' + quesID);
						arrRectProps = [];
					}
				}
			});
		},
		initRect = function() {
			$('#pagesList .rect-container').remove();
			$('#btnRectQMask, #btnRectSubA, #btn').addClass('disabled');
			arrHistoryRectProps = [];
		},
		setRects = function(arrRectProps) {
			initRect();

			var $pagesList = $('#pagesList');

			$.each(arrRectProps, function(_i, _val){
				console.log(_val);
				var _bookID = _val.book_id,
					_editingPageID = _val.page_id,
					_questionID = _val.question_id,
					_pageID  = _val.page_id,
					_rectType = _val.rect_type,
					_rectSeq = _val.rect_seq,
					_originRectSeq = _val.origin_rect_seq,
					$page = $('#page_' + _editingPageID, $pagesList)
				;
				if (_rectType == 1 || _rectType == 3) {
					var $rectContainer = objDefaultRectProps.rectContainer.clone(),
						strTitle = (_rectType == 1) ? '問題' : '解答'
					;

					$rectContainer
						.css({
							top: _val.y + 'px',
							left: _val.x + 'px',
							width: _val.w + 'px',
							height: _val.h + 'px'
						})
						.attr('data-book-id', _bookID)
						.attr('data-question-id', _questionID)
						.attr('data-page-id', _pageID)
						.attr('data-rect-type', _rectType)
						.attr('data-rect-seq', _rectSeq)
						.attr('data-origin-rect-seq', _originRectSeq)
					;

					$('.rect-name', $rectContainer).text(strTitle);
					$('.rect-area', $rectContainer)
						.append(
							objDefaultRectProps.rect.clone()
						)
					;

					$page.append($rectContainer);
				}
			});

			arrHistoryRectProps.push(arrRectProps);
			arrRectProps = [];
		}
	;

//////////////////////////
// 矩形追加
//////////////////////////

	var addRect = function() {
			var $button = $(this),
				$selectedQuestion = $('.panel-index .tbl_questions .question-selector.active')
			;

			if ($selectedQuestion.length < 1) {
				alert('問題を選択してください');
				return;
			}

			var _rectType = $button.attr('data-rect-type'),
				_rectSeq = parseInt($selectedQuestion.attr('question-rect'), 10),
				_objRectProps = objDefaultRectProps.questionRect,
				_objNewRect = {
					book_id: bookID,
					question_id: quesID,
					page_id: editingPageID,
					rect_type: _rectType,
					origin_rect_seq: 0,
					rect_seq: 0,
					x: 0,
					y: 0,
					w: 0,
					h: 0
				}
			;

			if (_rectType == 3) {
				_rectSeq = parseInt($selectedQuestion.attr('answer-rect'), 10);
				_objRectProps = objDefaultRectProps.answerRect;
			}

			if (_rectSeq > 0) {
				_rectSeq++;
			}

			_objNewRect.origin_rect_seq = _rectSeq;
			_objNewRect.rect_seq = _rectSeq;
			_objNewRect.x = _objRectProps.posX;
			_objNewRect.y = _objRectProps.posY;
			_objNewRect.w = _objRectProps.width;
			_objNewRect.h = _objRectProps.height;

			getRectsParams();

			arrRectProps.push(_objNewRect);

			setRects(arrRectProps);



			var parent = $('.panel-rect.rect-type-' + _rectType + ' tbody'),
				base_name	= _rectType + '_' + bookID + '_' + pageID + '_' + indexID + '_' + quesID + '_' + quesID + '_' + _rectSeq,
				rect_name	= 'rect_' + base_name,
				title = '問題'
			;
			if (_rectType == '3' || _rectType == '4') title = '解答';
			title = '【' + title + '/' + quesID + '/' + ($('tr', parent).length + 1) + '】';

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
		},
		addMaskRect = function() {

			setRects();
		}
	;

	$(document)
		.on('click', '#btnRectQ, #btnRectA', addRect)
		.on('click', '#btnRectQMask, #btnRectSubA', addMaskRect)
	;

//////////////////////////
// 矩形削除
//////////////////////////



//////////////////////////
// データ保存
//////////////////////////

	var setPropsSaved = function() {
		var pages = $('#select_page option'),
			editing_page_id		= 0,
			editing_question_id	= 0,
			origin_rect_seq		= 0,
			rect_type			= 0,
			rect_seq			= 0,
			origin_rect_seq		= 0,
			x = 0,
			y = 0,
			w = 0,
			h = 0
		;

		jQuery.each(pages, function() {
			var page = $(this).val(),
				layers = $('#canvas_' + page).getLayers()
			;
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
						error: function() {},
						success: function(_data) {
							if (_data != undefined) {}
						}
					});

				}
			});
		});
	};

	$(document)
		.on('click', '#btnSave', setPropsSaved)
	;

//////////////////////////
// ページ読み込み時
//////////////////////////

	$(window)
		.on('load', function() {

			getParams();

			var $selectPage = $('#select_page'),
				objPages = book.editing_page,
				numPages = objPages.length
			;

			$.each(objPages, function(_i, _val){
				var numEditingPageID = _val.editing_page_id,
					numPageID = _val.page_id,
					$option = $('<option value="' + numPageID + '" data-id="' + numEditingPageID + '">' + numPageID + '</option>')
				;
				$selectPage.append($option);
				setPageImage(numEditingPageID, numPageID);
			});

			setIndexs();
			setQuestions();

			$('#select_page').trigger('change');

		})
	;

//////////////////////////
// ページID変更時
//////////////////////////

	var setSelectedPage = function(editingPageID) {
			$('#pagesList #page_' + editingPageID)
				.addClass('active')
				.siblings('.page').removeClass('active')
			;
		}
	;

	$(document)
		.on('change', '#select_page', function(){
			var $page = $(this);
			pageID = $page.val();
			editingPageID = $(':selected', $page).attr('data-id');
			setSelectedPage(editingPageID);
		})
	;

//////////////////////////
// ページ遷移制御
//////////////////////////

	$(window)
		.on('beforeunload', function() {
			return 'ページ移動すると未保存データは失われます。';
		})
	;

// end of jquery
});