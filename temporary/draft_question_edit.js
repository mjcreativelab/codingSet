$(function(){

	var subject = 0,
		bookID = 0,
		editingPageID = 0,
		pageID = 0,
		indexID = 0,
		quesID = 0,
		book = {},
		numBaseMouseX = 0,
		numBaseMouseY = 0,
		arrEditedRectHistory = [],
		checkedRectID = '',
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

//////////////////////////
// 問題IDリスト (目次）設置
//////////////////////////

	var setIndexs = function() {

			getParams();

//			if ($('.panel-index.page_' + pageID + ' .select_index option:not(.all)').length > 0) return;

			$.ajax({
				url: '/api/books/' + subject + '/' + bookID + '/indexes',
				data: {
				},
				type: 'GET', dataType: 'json', cache: true, async: false, timeout: 10000,
				error: function (){},
				success: function (_data) {
					if (_data != undefined) {
						$('.panel-index .select_index option:not(.all)').remove();
						for (var i = 0; i < _data.length; i++) {
							$('.panel-index .select_index').append('<option value="' + _data[i].editing_index_id + '" data-page="' + _data[i].editing_page_id + '" data-index-id="' + _data[i].index_id + '">' + _data[i].index_name + '　' + _data[i].index_id + '</option>');
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

			$('#btnQuesAdd').removeClass('disabled').addClass('disabled');
			$('#btnQuesDel').removeClass('disabled').addClass('disabled');
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
					index_id : _index
				},
				type: 'GET', dataType: 'json', cache: true, async: false, timeout: 10000,
				error: function (){},
				success: function (_data) {
					$('tr', $questionList).remove();
					if (_data != undefined) {
						if (!(_index == 'all' || _index == '')) {
							$questionList.append('<tr><th class="chapter-title">' + $('.panel-index .select_index option:selected').text() + '</th></tr>');
						}
						for (var i = 0; i < _data.length; i++) {
							var $questionSelector = $('<tr class="question-selector">')
														.attr('data-index-id', _data[i].editing_index.index_id)
														.attr('data-origin-question-id', _data[i].question_id)
														.attr('data-question-id', _data[i].question_id)
														.append('<td>' + _data[i].question_id + '</td>')
														.appendTo($questionList)
							;
						}
						$('#btnRectQMask, #btnRectSubA, #btnUndo').addClass('disabled');
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

			arrEditedRectHistory = [];

			$('tr, td', $questionList).removeClass('active');

			$question.addClass('active');
			$('td', $question).addClass('active');

			if (!($('.panel-index .select_index').val() == '' || $('.panel-index .select_index').val() == 'all')) {
				$('#btnQuesAdd').removeClass('disabled');
				$('#btnQuesDel').removeClass('disabled');
			}

			quesID = $question.attr('data-origin-question-id');
			var _arrRectProps = getRectsParams();

			if (_arrRectProps != null) {
				$.each(_arrRectProps, function(_i, _val){
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
				setRects(_arrRectProps);
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
// 問題追加
//////////////////////////

	$(document)
		.on('click', '#btnQuesAdd', function() {

			var selectedIndexID	= $('.panel-index .select_index option:selected').attr('data-index-id');
			if (selectedIndexID == '' || selectedIndexID == 'all') return;

			var $questionIDs	= $('.tbl_questions tr.question-selector[data-index-id="' + selectedIndexID + '"]');
			var nextID			= selectedIndexID + ('0000' + ($questionIDs.length + 1)).slice(-4);

			var tr				= '<tr class="question-selector" data-question-id="' + nextID + '" data-index-id="' + selectedIndexID + '"><td>' + nextID + '</td></tr>';
			$('.tbl_questions tr.question-selector.active').after(tr);

		})
	;

//////////////////////////
// 問題削除
//////////////////////////

	$(document)
		.on('click', '#btnQuesDel', function() {

			var selectedIndexID = $('.panel-index .select_index option:selected').attr('data-index-id');
			if (selectedIndexID == '' || selectedIndexID == 'all') return;
			var $questionIDs = $('.tbl_questions tr.question-selector[data-index-id="' + selectedIndexID + '"]:not(.active)');

			$('.tbl_questions tr.question-selector').remove();
			$($questionIDs).each(function(i) {
				questionID = selectedIndexID + ('0000' + (i + 1)).slice(-4);
				tr = '<tr class="question-selector" data-question-id="' + questionID + '" data-index-id="' + selectedIndexID + '"><td>' + questionID + '</td></tr>';
				$('.tbl_questions').append(tr);

				// 矩形の紐付きを、、、



			});

		})
	;

//////////////////////////
// 問題画像設置
//////////////////////////

	var setPageImage = function(editingPageID, pageID) {

			getParams();

			var $pagesList = $('#pagesList'),
				$page = $('#page_' + editingPageID, $pagesList)
			;

			if (!$page.length) {
				var $pageImage = $('<img class="page-image">').attr('src', '/api/books/' + subject + '/' + bookID + '/pages/' + pageID + '/image');
				$page = $('<li id="page_' + editingPageID + '" class="page" />')
							.append($pageImage)
							.appendTo($pagesList)
						;
			}
		}
	;

//////////////////////////
// ページID変更時
//////////////////////////

	var setSelectedPage = function(editingPageID) {
			var $page = $('#pagesList #page_' + editingPageID),
				$pageImage = $('.page-image', $page),
				numImageWidth = $pageImage.width(),
				numImageHeight = $pageImage.height(),
				_setPagesListSized = function() {
					$('#pagesList')
						.width(numImageWidth)
						.height(numImageHeight)
					;
				}
			;
			$page
				.addClass('active')
				.siblings('.page').removeClass('active')
			;
			if (!numImageWidth) {
				$pageImage.on('load', function(){
					numImageWidth = $pageImage.width();
					numImageHeight = $pageImage.height();
					_setPagesListSized();
				});
			} else {
				_setPagesListSized();
			}
		}
	;

	$(document)
		.on('change', '#select_page', function(){
			var $page = $(this);
			pageID = $page.val();
			editingPageID = $(':selected', $page).attr('data-id');
			setSelectedPage(editingPageID);
		})
		.on('click', '#btnPrev, #btnNext', function(){
			var $btn = $(this),
				$pageSelector = $('#select_page'),
				$currentPage = $(':selected', $pageSelector),
				$newPage = $currentPage.next('option')
			;
			if ($btn.is('#btnPrev')) {
				$newPage = $currentPage.prev('option')
			}
			if ($newPage.length) {
				var _page = $newPage.val();
					$pageSelector
					.val(_page)
					.trigger('change')
				;
			}
		})
	;

//////////////////////////
// 矩形設置
//////////////////////////

	var objDefaultRectProps = {
			rectContainer: $('<div class="rect-container" />')
						.append(
							$('<dl class="rect-contents" />')
								.append('<dt class="rect-name" />')
								.append('<dd class="rect-area" />')
						),
			mainRectContainer: '<div class="main-rect" />',
			maskRectContainer: '<div class="mask-rect" />',
			rect: $('<div class="rect" />')
						.append('<div class="rect-border" />')
						.append(
							$('<div class="rect-inner" />')
								.append(
									$('<div class="rect-handle-list" />')
										.append('<div class="rect-handle" data-direction="top-left" />')
										.append('<div class="rect-handle" data-direction="top" />')
										.append('<div class="rect-handle" data-direction="top-right" />')
								)
								.append(
									$('<div class="rect-handle-list" />')
										.append('<div class="rect-handle" data-direction="left" />')
										.append('<div class="rect-handle" data-direction="move" />')
										.append('<div class="rect-handle" data-direction="right" />')
								)
								.append(
									$('<div class="rect-handle-list" />')
										.append('<div class="rect-handle" data-direction="bottom-left" />')
										.append('<div class="rect-handle" data-direction="bottom" />')
										.append('<div class="rect-handle" data-direction="bottom-right" />')
								)
						),
			questionRect: {
				posX: 100,
				posY: 100,
				width: 500,
				height: 100,
				maskRect: {
					posX: 0,
					posY: 0,
					width: 200,
					height: 50
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
					width: 200,
					height: 50
				}
			}
		},
		arrCurrentRectProps = [],
		getRectsParams = function() {

			if (!quesID) return;
			getParams();

			var arr = $.ajax({
				url: 'http://atls-api.paxcreation.com/question_rect.php?book_id=' + book.book_id + '&question_id=' + quesID + '&subject=' + subject,
				type: 'GET', dataType: 'json', cache: true, async: false, timeout: 10000,
				error: function (){},
				success: function (_data) {
					if (_data) {
						console.log(['rectProps_' + editingPageID + '_' + quesID, _data]);
						return _data;
					} else {
						console.log('noRectProps_' + editingPageID + '_' + quesID);
						return false;
					}
				}
			});
			return arr.responseJSON;
		},
		initRect = function() {
			$('#pagesList .rect-container').remove();
			$('.panel-rect .rect-list').html('');
			$('#btnUndo').addClass('disabled');
			$('#rectEditSupportFunctions .grid-setter .input-position').val('');
		},
		setRects = function(arrRectProps) {

			initRect();

			var $pagesList = $('#pagesList'),
				numQuestionRect = 0,
				numQuestionMask = 0,
				numAnswerRect = 0,
				numAnswerMask = 0,
				_arrTempRectProps = []
			;

			$.each(arrRectProps, function(_i, _val){
				var _objRectProps = _val,
					_bookID = _objRectProps.book_id,
					_questionID = _objRectProps.question_id,
					_pageID  = _objRectProps.page_id,
					_rectType = _objRectProps.rect_type,
					_originRectSeq = _objRectProps.origin_rect_seq,
					_rectSeq = _objRectProps.rect_seq,
					_originRectType = (_rectType == 1 || _rectType == 3) ? _rectType : (_rectType == 2) ? 1 : 3,
					strRectID = 'rect',
					strRectName = (_rectType == 1 || _rectType == 2) ? '問題' : '解答',
					$page = $('#page_' + _pageID, $pagesList),
					$pageImage = $('.page-image', $page),
					strImageURL = $pageImage.attr('src'),
					$rect = objDefaultRectProps.rect.clone(),
					$rectBorder = $('.rect-border', $rect),
					$rectSelector = $('<tr class="rect-selector" />'),
					$rectList = $('.panel-rect.rect-type-' + _originRectType + ' .rect-list')
				;

				if (_rectType == 1) {
					_objRectProps.rect_seq = numQuestionRect;
					_rectSeq = numQuestionRect;

					numQuestionRect++;
				} else if (_rectType == 2) {
					_objRectProps.rect_seq = numQuestionMask;
					_rectSeq = numQuestionMask;

					numQuestionMask++;
				} else if (_rectType == 3) {
					_objRectProps.rect_seq = numAnswerRect;
					_rectSeq = numAnswerRect;

					numAnswerRect++;
				} else if (_rectType == 4) {
					_objRectProps.rect_seq = numAnswerMask;
					_rectSeq = numAnswerMask;

					numAnswerMask++;
				}

				strRectName = '[' + strRectName + '/' + _questionID + '/' + _rectSeq + ']';
				strRectID = strRectID + '-' + _bookID + '-' + _pageID + '-' + _questionID + '-' + _rectType + '-' + _originRectSeq + '-' + _rectSeq;

				$rect
					.attr('data-rect-id', strRectID)
					.width(_objRectProps.w)
					.height(_objRectProps.h)
				;

				//矩形セレクタ
				$rectSelector
					.attr('data-book-id', _bookID)
					.attr('data-question-id', _questionID)
					.attr('data-page-id', _pageID)
					.attr('data-rect-type', _rectType)
					.attr('data-rect-seq', _rectSeq)
					.attr('data-origin-rect-seq', _originRectSeq)
					.attr('data-rect-id', strRectID)
					.append('<td class="rect-name">' + strRectName + '</td>')
					.append('<td class="page-selector" />')
					.append('<td class="delete-rect"><button type="button" class="btn btn-rect-delete btn-danger disabled"><i class="fa fa-trash-o"></i></button></td>')
				;

				// 矩形設置
				if (_rectType == 1 || _rectType == 3) {
					// 問題・解答矩形
					var $rectContainer = objDefaultRectProps.rectContainer.clone();

					$rectContainer
						.attr('id', strRectID)
						.css({
							top: _objRectProps.y + 'px',
							left: _objRectProps.x + 'px'
						})
						.attr('data-book-id', _bookID)
						.attr('data-question-id', _questionID)
						.attr('data-page-id', _pageID)
						.attr('data-rect-type', _rectType)
						.attr('data-rect-seq', _rectSeq)
						.attr('data-origin-rect-seq', _originRectSeq)
						.css({
							'background-image': 'url(' + strImageURL + ')',
							'background-position': -_objRectProps.x + 'px ' + -_objRectProps.y + 'px'
						})
					;

					$rect.addClass('main');

					$('.rect-name', $rectContainer).text(strRectName);
					$('.rect-area', $rectContainer).append(
						$(objDefaultRectProps.mainRectContainer).append($rect)
					);

					$page.append($rectContainer);

					$('.page-selector', $rectSelector).append(
						$('#select_page').clone()
							.removeAttr('id')
							.addClass('page-changer')
					);

					$('.page-selector option[data-id="' + _pageID + '"]', $rectSelector).attr('selected', true);

					$rectList.append($rectSelector);

					if (checkedRectID == strRectID) {
						setRectSelected(strRectID);
						$rectSelector.addClass('active');
						$('td', $rectSelector).addClass('active');
					}

				} else {
					// 白矩形
					var $parentsRect = $('#page_' + _pageID + ' .rect-container[data-rect-type="' + _originRectType + '"][data-origin-rect-seq="' + _originRectSeq + '"]'),
						$maskRectList = $('.mask-rect', $parentsRect),
						$parentsRectSelector = $('.rect-selector[data-rect-type="' + _originRectType + '"][data-origin-rect-seq="' + _originRectSeq + '"]')
					;

					if (!$maskRectList.length) {
						$maskRectList = $(objDefaultRectProps.maskRectContainer).appendTo($('.rect-area', $parentsRect));
					}

					$rect
						.addClass('mask')
						.css({
							top: _objRectProps.y + 'px',
							left: _objRectProps.x + 'px'
						})
					;

					$maskRectList.append($rect);

					$parentsRectSelector.after($rectSelector);
				}

				_objRectProps.w = $rect.outerWidth();
				_objRectProps.h = $rect.outerHeight();

				$rect
					.width(_objRectProps.w)
					.height(_objRectProps.h)
				;

				$rectSelector
					.attr('data-x', _objRectProps.x)
					.attr('data-y', _objRectProps.y)
					.attr('data-w', _objRectProps.w)
					.attr('data-h', _objRectProps.h)
				;

				$rectBorder
					.attr('data-x', _objRectProps.x)
					.attr('data-y', _objRectProps.y)
					.attr('data-w', _objRectProps.w)
					.attr('data-h', _objRectProps.h)
				;

				_arrTempRectProps.push(_objRectProps);
			});

			arrCurrentRectProps = _arrTempRectProps;
			console.log(arrCurrentRectProps);
		}
	;

//////////////////////////
// 矩形追加
//////////////////////////

	var addRect = function() {

			var $button = $(this),
				$questionList = $('.panel-index .tbl_questions'),
				$selectedQuestion = $('.question-selector.active', $questionList)
			;

			if ($selectedQuestion.length < 1) {
				alert('問題を選択してください');
				return;
			}

			checkedRectID = '';
			$questionList.addClass('disabled');

			var _rectType = $button.attr('data-rect-type'),
				$rectSelector = $('.panel-rect.rect-type-' + _rectType + ' .rect-list .rect-selector'),
				_rectSeq = $rectSelector.length,
				_objRectProps = (_rectType == 1) ? objDefaultRectProps.questionRect : objDefaultRectProps.answerRect,
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

			_objNewRect.origin_rect_seq = _rectSeq;
			_objNewRect.rect_seq = _rectSeq;
			_objNewRect.x = _objRectProps.posX;
			_objNewRect.y = _objRectProps.posY;
			_objNewRect.w = _objRectProps.width;
			_objNewRect.h = _objRectProps.height;

			arrCurrentRectProps.push(_objNewRect);

			$('#btnRectQMask, #btnRectSubA, #btnUndo').addClass('disabled');

			setRects(arrCurrentRectProps);
		},
		addMaskRect = function() {

			var $button = $(this),
				$questionList = $('.panel-index .tbl_questions'),
				_parentsRectType = $button.attr('data-rect-type'),
				_rectType = (_parentsRectType == 1) ? 2 : 4,
				$rectList = $('.panel-rect.rect-type-' + _parentsRectType),
				$selectedRect = $('.rect-selector.active', $rectList),
				_originRectSeq = $selectedRect.attr('data-origin-rect-seq'),
				$rectSelector = $('.rect-selector[data-origin-rect-seq="' + _originRectSeq + '"][data-rect-type="' + _rectType + '"]', $rectList),
				_rectSeq = $rectSelector.length,
				_objRectProps = (_rectType == 2) ? objDefaultRectProps.questionRect.maskRect : objDefaultRectProps.answerRect.maskRect,
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

			checkedRectID = $selectedRect.attr('data-rect-id');
			$questionList.addClass('disabled');

			_objNewRect.origin_rect_seq = _originRectSeq;
			_objNewRect.rect_seq = _rectSeq;
			_objNewRect.x = _objRectProps.posX;
			_objNewRect.y = _objRectProps.posY;
			_objNewRect.w = _objRectProps.width;
			_objNewRect.h = _objRectProps.height;

			arrCurrentRectProps.push(_objNewRect);

			setRects(arrCurrentRectProps);
		}
	;

	$(document)
		.on('click', '#btnRectQ, #btnRectA', addRect)
		.on('click', '#btnRectQMask, #btnRectSubA', addMaskRect)
	;

//////////////////////////
// 矩形選択
//////////////////////////

	var setRectSelected = function(strRectID) {

			var $rect = $('.rect[data-rect-id="' + strRectID + '"]'),
				$rectBorder = $('.rect-border', $rect),
				_x = parseInt($rectBorder.attr('data-x'), 10),
				_y = parseInt($rectBorder.attr('data-y'), 10),
				_w = parseInt($rectBorder.attr('data-w'), 10),
				_h = parseInt($rectBorder.attr('data-h'), 10),
				$rectContainer = $rect.parents('.rect-container'),
				$rectSelector = $('.rect-selector[data-rect-id="' + strRectID + '"]'),
				_rectType = $rectSelector.attr('data-rect-type'),
				$rectList = $('.panel-rect.rect-type-' + _rectType),
				$maskBtn = (_rectType == 1) ? $('#btnRectQMask') : $('#btnRectSubA')
				_rectType = $rectSelector.attr('data-rect-type'),
				$pageSelector = $('#select_page'),
				_pageID = $rectSelector.attr('data-page-id'),
				$page = $('[data-id="' + _pageID + '"]', $pageSelector),
				_page = $page.val(),
				$gridSetter = $('#rectEditSupportFunctions .grid-setter'),
				strActive = 'active',
				strEditing = 'editing'
			;

			if (!$rectSelector.length) return;

			$('.rect-container').removeClass(strActive);
			$('.rect').removeClass(strActive);
			$('.rect-selector, .rect-selector td').removeClass(strActive);
			$('.rect-selector .btn-rect-delete').addClass('disabled');
			if ($rect.is('.' + strEditing)) {
				$('.rect.editing, .rect-border.editing').removeClass(strEditing);
				$rect.addClass(strEditing);
				$('.rect-border', $rect).addClass(strEditing);
				$('> .rect-border', $rectContainer).addClass(strEditing);
			} else {
				setRectEditingCanceled();
			}

			$rectContainer.addClass(strActive);
			$rect.addClass(strActive);
			$rectSelector.addClass(strActive);
			$('td', $rectSelector).addClass(strActive);
			$('.btn-rect-delete', $rectSelector).removeClass('disabled');

			if (_rectType == 1|| _rectType == 3) {
				$('.mask-rect' ,$rectContainer).addClass('disabled');
				$gridSetter.removeClass('disabled');
				setPositionToForm(_x, _y, _w, _h);
			} else {
				$('.mask-rect' ,$rectContainer).removeClass('disabled');
				$gridSetter.addClass('disabled');
				$('.input-position', $gridSetter).val('');
			}

			$pageSelector
				.val(_page)
				.trigger('change')
			;

			$maskBtn.removeClass('disabled');
		}
	;

	$(document)
		.on('click', '#workplace:not([data-window-display="preview"]) #pagesList:not([data-rect-editing]) .rect[data-rect-id]:not(.active), #workplace:not([data-window-display="preview"]) .rect-selector[data-rect-id]', function(){
			var $rect = $(this),
				strRectID = $rect.attr('data-rect-id')
			;
			setRectSelected(strRectID);
		})
	;

//////////////////////////
// 矩形操作
//////////////////////////

	var setRectEditingCanceled = function() {
			var $rectContainer = $('.rect-container.active'),
				$rectEditing = $('.rect.editing', $rectContainer),
				$rectBorderEditing = $('.rect-border.editing', $rectContainer),
				$rectMain = $('.rect.main', $rectContainer),
				$rectBorder = $('.rect-border', $rectMain)
			;

			$rectBorderEditing.removeAttr('style');

			$('#pagesList').removeAttr('data-rect-editing');
			$('.editing', $rectContainer).removeClass('editing');
			$('.mask-rect' ,$rectContainer).removeClass('disabled');

			if (!$rectBorder.length) {
				$('> .rect-border', $rectContainer)
					.removeAttr('style')
					.prependTo($rectMain)
				;
			}
			$('.active', $rectContainer).removeClass('active');
			$rectContainer.removeClass('active');
			$('.rect-selector').removeClass('active');
			$('.rect-selector > *').removeClass('active');
			$('#rectEditSupportFunctions .grid-setter').removeClass('disabled');
			$('#btnRectQMask, #btnRectSubA').addClass('disabled');
		},
		setRectEdited = function(strRectID, numX, numY, numWidth, numHeight, strDirection, isUndo) {
			var $pagesList = $('#pagesList'),
				$rect = $('.rect[data-rect-id="' + strRectID + '"]'),
				$rectContainer = $rect.parents('.rect-container'),
				$rectBorder = $('.rect-border', $rect),
				$rectSelector = $('.rect-selector[data-rect-id="' + strRectID + '"]'),
				$maskRect = $('.rect.mask', $rectContainer),
				strRectEditing = $pagesList.attr('data-rect-editing')
			;

			$rect
				.width(numWidth)
				.height(numHeight)
			;

			if ($rect.is('.main')) {
				$rect = $rectContainer;
				if (!$rectBorder.length) {
					$rectBorder = $('.rect-border.editing', $rectContainer);
				}
				if (!strRectEditing && strDirection) {
					strRectEditing = strDirection;
				}
				if (strRectEditing.indexOf('top') != -1 || strRectEditing.indexOf('left') != -1) {
					if ($maskRect.length) {
						var numBaseX = parseInt($rectSelector.attr('data-x'), 10),
							numBaseY = parseInt($rectSelector.attr('data-y'), 10),
							numDifferentX = numBaseX - numX,
							numDifferentY = numBaseY - numY
						;
						$maskRect.each(function(){
							var $mask = $(this),
								strMaskRectID = $mask.attr('data-rect-id'),
								$maskSelector = $('.rect-selector[data-rect-id="' + strMaskRectID + '"]'),
								numOriginX = parseInt($mask.css('left')),
								numOriginY = parseInt($mask.css('top')),
								numEditedX = numOriginX + numDifferentX,
								numEditedY = numOriginY + numDifferentY
							;
							$mask.css({
								top: numEditedY + 'px',
								left: numEditedX + 'px'
							});
							$maskSelector
								.attr('data-x', numEditedX)
								.attr('data-y', numEditedY)
							;
						});
					}
				}
				$rectContainer
					.css({
						'background-position': -numX + 'px ' + -numY + 'px'
					})
				;
			}

			if (!isUndo) {
				arrEditedRectHistory.push({
					rectID: strRectID,
					x: parseInt($rectSelector.attr('data-x'), 10),
					y: parseInt($rectSelector.attr('data-y'), 10),
					w: parseInt($rectSelector.attr('data-w'), 10),
					h: parseInt($rectSelector.attr('data-h'), 10),
					direction: strRectEditing
				});
				if (arrEditedRectHistory.length > 3) {
					arrEditedRectHistory.shift();
				}
				console.log(arrEditedRectHistory);
			}

			$('#btnUndo').removeClass('disabled');

			$rectBorder
				.attr('data-x', numX)
				.attr('data-y', numY)
				.attr('data-w', numWidth)
				.attr('data-h', numHeight)
			;

			$rectSelector
				.attr('data-x', numX)
				.attr('data-y', numY)
				.attr('data-w', numWidth)
				.attr('data-h', numHeight)
			;

			$rect
				.css({
					top: numY + 'px',
					left: numX + 'px'
				})
				.width(numWidth)
				.height(numHeight)
			;

			setPositionToForm(numX, numY, numWidth, numHeight);

			arrCurrentRectProps = getCurrentRectProps();

			$('.panel-index .tbl_questions').addClass('disabled');
			$('#rectEditSupportFunctions').removeClass('disabled');
		},
		setPositionToForm = function(_x, _y, _w, _h) {
			var $gridSetter = $('#rectEditSupportFunctions .grid-setter');
			$('.input-position[name="direction-left"]', $gridSetter).val(_x);
			$('.input-position[name="direction-top"]', $gridSetter).val(_y);
			$('.input-position[name="direction-right"]', $gridSetter).val(_x + _w);
			$('.input-position[name="direction-bottom"]', $gridSetter).val(_y + _h);
		}
	;

	$(document)

		// 操作モード選択

		.on('change', '.rect-edit-mode :radio', function(){
			var $pagesList = $('#pagesList'),
				numVal = $(this).val(),
				strModeAttr = 'data-rect-edit-mode'
			;
			localStorage.setItem('rectEditMode', numVal);

			if (numVal == 0) {
				$pagesList.attr(strModeAttr, 'click');
			} else {
				$pagesList.attr(strModeAttr, 'drag');
			}
		})

		// 補助線表示モード選択

		.on('change', '.grid-display-mode :radio', function(){
			var $pagesList = $('#pagesList'),
				numVal = $(this).val(),
				strModeAttr = 'data-grid-display-mode'
			;
			localStorage.setItem('gridDisplayMode', numVal);

			if (numVal == 0) {
				$pagesList.attr(strModeAttr, 'selected');
			} else {
				$pagesList.attr(strModeAttr, 'all');
			}
		})

		// 矩形編集開始

		.on('click', '[data-rect-edit-mode="click"]:not([data-rect-editing]) .rect.active .rect-handle', function(e){
			var $pagesList = $('#pagesList'),
				$handle = $(this),
				$rect = $handle.parents('.rect.active'),
				$rectBorder = $('.rect-border', $rect),
				$rectContainer = $('.rect-container.active'),
				strRectID = $rect.attr('data-rect-id'),
				strDirection = $handle.attr('data-direction')
			;

			$rect.addClass('editing');
			$rectBorder.addClass('editing');
			if ($rect.is('.main')) {
				$rectBorder.prependTo($rectContainer);
			}

			$pagesList.attr('data-rect-editing', strDirection);
			numBaseMouseX = e.pageX;
			numBaseMouseY = e.pageY;

			$('#rectEditSupportFunctions').addClass('disabled');
		})
		.on({

			// 矩形編集

			'mousemove': function(e){
				var $pagesList = $('#pagesList'),
					$rectBorder = $('.rect-border.editing'),
					strRectEditing = $pagesList.attr('data-rect-editing'),
					numDistanceX = numBaseMouseX - e.pageX,
					numDistanceY = numBaseMouseY - e.pageY
				;

				switch (strRectEditing) {
					case 'move':
						$rectBorder.css({
							top: -numDistanceY,
							left: -numDistanceX
						});
						break;

					case 'top-left':
						$rectBorder.css({
							top: -numDistanceY + 'px',
							left: -numDistanceX + 'px',
							width: 'calc(100% + ' + numDistanceX + 'px)',
							height: 'calc(100% + ' + numDistanceY + 'px)'
						});
						break;

					case 'top':
						$rectBorder.css({
							top: -numDistanceY + 'px',
							height: 'calc(100% + ' + numDistanceY + 'px)'
						});
						break;

					case 'top-right':
						$rectBorder.css({
							top: -numDistanceY + 'px',
							width: 'calc(100% - ' + numDistanceX + 'px)',
							height: 'calc(100% + ' + numDistanceY + 'px)'
						});
						break;

					case 'left':
						$rectBorder.css({
							left: -numDistanceX + 'px',
							width: 'calc(100% + ' + numDistanceX + 'px)'
						});
						break;

					case 'right':
						$rectBorder.css({
							width: 'calc(100% - ' + numDistanceX + 'px)'
						});
						break;

					case 'bottom-left':
						$rectBorder.css({
							left: -numDistanceX + 'px',
							width: 'calc(100% + ' + numDistanceX + 'px)',
							height: 'calc(100% - ' + numDistanceY + 'px)'
						});
						break;

					case 'bottom':
						$rectBorder.css({
							height: 'calc(100% - ' + numDistanceY + 'px)'
						});
						break;

					case 'bottom-right':
						$rectBorder.css({
							width: 'calc(100% - ' + numDistanceX + 'px)',
							height: 'calc(100% - ' + numDistanceY + 'px)'
						});
						break;

				}
			},

			// 矩形編集終了

			'click': function(e){
				var $rectContainer = $('.rect-container.active'),
					$rectBorderEditing = $('.rect-border.editing', $rectContainer),
					$rect = $('.rect.editing', $rectContainer),
					strRectID = $rect.attr('data-rect-id'),
					$rectSelector = $('.rect-selector[data-rect-id="' + strRectID + '"]'),
					numBorderX = parseInt($rectBorderEditing.css('left'), 10),
					numBorderY = parseInt($rectBorderEditing.css('top'), 10),
					numBaseX = parseInt($rectSelector.attr('data-x'), 10),
					numBaseY = parseInt($rectSelector.attr('data-y'), 10),
					numX = numBaseX + numBorderX,
					numY = numBaseY + numBorderY,
					numWidth = $rectBorderEditing.outerWidth(),
					numHeight = $rectBorderEditing.outerHeight()
				;

				setRectEdited(strRectID, numX, numY, numWidth, numHeight);
				setRectEditingCanceled();
			}
		}, '[data-rect-edit-mode="click"][data-rect-editing]')

		// フォームによる矩形編集

		.on('change', '#rectEditSupportFunctions .grid-setter .input-position', function(){
			var $form = $(this),
				strDirection = $form.attr('name').split('-')[1],
				$rect = $('#pagesList .rect.active'),
				strRectID = $rect.attr('data-rect-id'),
				$gridSetter = $('#rectEditSupportFunctions .grid-setter'),
				_x1 = parseInt($('.input-position[name="direction-left"]', $gridSetter).val(), 10),
				_y1 = parseInt($('.input-position[name="direction-top"]', $gridSetter).val(), 10),
				_x2 = parseInt($('.input-position[name="direction-right"]', $gridSetter).val(), 10),
				_y2 = parseInt($('.input-position[name="direction-bottom"]', $gridSetter).val(), 10),
				numX = _x1,
				numY = _y1,
				numWidth = _x2 - _x1,
				numHeight = _y2 - _y1
			;
			setRectEdited(strRectID, numX, numY, numWidth, numHeight, strDirection)
		})

		// 矩形選択解除

		.on('click', function(e){
			if ($(e.target).closest('.rect-container.active').length) return;
			if ($(e.target).closest('.rect-selector.active').length) return;
			if ($(e.target).closest('#rectEditSupportFunctions').length) return;
			setRectEditingCanceled();
		})
	;

//////////////////////////
// 矩形操作（やり直し）
//////////////////////////

	$(document).on('click', '#btnUndo', function(){
		var numHistory = arrEditedRectHistory.length,
			objLastRectProps = arrEditedRectHistory[numHistory - 1],
			strRectID = objLastRectProps.rectID,
			numX = objLastRectProps.x,
			numY = objLastRectProps.y,
			numWidth = objLastRectProps.w,
			numHeight = objLastRectProps.h,
			strDirection = objLastRectProps.direction
		;

		setRectEdited(strRectID, numX, numY, numWidth, numHeight, strDirection, true);

		arrEditedRectHistory.pop();

		if (!arrEditedRectHistory.length) {
			$('#btnUndo').addClass('disabled');
			$('.panel-index .tbl_questions').removeClass('disabled');
		}
	});

//////////////////////////
// 矩形削除
//////////////////////////

	var setRectDeleted = function(strRectID) {
		var $rect =  $('.rect[data-rect-id="' + strRectID + '"]'),
			$rectContainer = $('.rect-container#' + strRectID),
			$rectSelector = $('.rect-selector[data-rect-id="' + strRectID + '"]'),
			_rectType = $rectSelector.attr('data-rect-type'),
			_originRectSeq = $rectSelector.attr('data-origin-rect-seq')
		;
		if (_rectType == 1 || _rectType == 3) {
			var $rectListContainer = $('.rect-list-container.rect-type-' + _rectType);
			$rectContainer.remove();
			$('.rect-selector[data-origin-rect-seq="' + _originRectSeq + '"]', $rectListContainer).remove();
		} else {
			$rect.remove();
			$rectSelector.remove();
		}

		arrCurrentRectProps = getCurrentRectProps();
	};

	$(document)
		.on('click', '.rect-selector .btn-rect-delete', function(){
			var $btn = $(this),
				$rectSelector = $btn.parents('.rect-selector.active')
				strRectID = $rectSelector.attr('data-rect-id')
			;
			setRectDeleted(strRectID);
		})
	;

//////////////////////////
// グリッド設置
//////////////////////////

	var objGridProps = {
			x1: [],
			y1: [],
			x2: [],
			y2: []
		},
		setGrids = function(objGridProps) {

			var $gridContainer = $('#pagesList .grid-container').html('');

			$('#rectEditSupportFunctions .select-grid').html('');

			$.each(objGridProps, function(_i, _val){
				if (_val.length) {
					var _cat = _i;
					$.each(_val, function(_i, _val){
						console.log([_cat, _i, _val]);
						var $grid = $('<div class="grid" />'),
							$gridSelector = $('.select-grid[data-position="' + _cat + '"]')
						;

						$grid
							.addClass(_cat)
							.attr('data-pos', _val)
						;

						$gridSelector
							.prepend('<option value="' + _val + '">' + _val + '</option>')
							.val(_val)
						;

						if (_cat.indexOf('x') != -1) {
							$grid
								.css({
									left: _val + 'px'
								})
								.attr('data-direction', 'x')
							;
						} else {
							$grid
								.css({
									top: _val + 'px'
								})
								.attr('data-direction', 'y')
							;
						}

						$gridContainer.append($grid);
						$gridSelector.trigger('change');
					});
				}
			})
		}
	;

	$(document)
		.on('change', '.grid-setter .select-grid', function(){

			var $gridSelector = $(this),
				_val = $gridSelector.val(),
				_cat = $gridSelector.attr('data-position'),
				$gridContainer = $('#pagesList .grid-container'),
				strSelected = 'selected'
			;

			$('.grid.' + _cat, $gridContainer).removeClass(strSelected);
			$('.grid.' + _cat + '[data-pos="' + _val + '"]', $gridContainer).addClass(strSelected);
		})
	;

//////////////////////////
// グリッド追加
//////////////////////////

	var setNewGrid = function(cat, val) {
		objGridProps[cat].push(val);
		setGrids(objGridProps);
		console.log(objGridProps);
	};

	$(document)
		.on('click', '.grid-setter .btn-add-grid', function(){
			var $btn = $(this),
				$gridSetter = $btn.parents('.grid-setter'),
				numVal = $('.input-position', $gridSetter).val(),
				strDirection = $gridSetter.attr('data-direction'),
				strCat = ''
			;
			if (numVal) {
				switch(strDirection) {
					case 'left':
						strCat = 'x1';
						break;
					case 'top':
						strCat = 'y1';
						break;
					case 'right':
						strCat = 'x2';
						break;
					case 'bottom':
						strCat = 'y2';
						break;
				}
				setNewGrid(strCat, numVal);
			}
		})
	;

//////////////////////////
// グリッド削除
//////////////////////////



//////////////////////////
// 作業ウィンドウ切り替え
//////////////////////////

	$(document)
		.on('click', '.window-selector .tab', function(){
			var $tab = $(this),
				strWindow =$tab.attr('href'),
				$workplace = $('#workplace'),
				strAttr = 'data-window-display'
			;
			if (strWindow.indexOf('preview') != -1) {
				$workplace.attr(strAttr, 'preview');
			} else {
				$workplace.removeAttr(strAttr);
			}
		})
	;

//////////////////////////
// データ保存
//////////////////////////

	var getCurrentRectProps = function() {
			var arr = [],
				$rects = $('[class*="rect-type-"] .rect-selector')
			;

			$.each($rects, function(){
				var $rect = $(this),
					editing_page_id = $rect.attr('data-page-id'),
					editing_question_id = $rect.attr('data-question-id'),
					rect_type = $rect.attr('data-rect-type'),
					rect_seq = $rect.attr('data-rect-seq'),
					origin_rect_seq = $rect.attr('data-origin-rect-seq'),
					x = $rect.attr('data-x'),
					y = $rect.attr('data-y'),
					w = $rect.attr('data-w'),
					h = $rect.attr('data-h'),
					obj = {
						book_id: bookID,
						page_id: editing_page_id,
						question_id: editing_question_id,
						rect_type: rect_type,
						rect_seq: rect_seq,
						origin_rect_seq: origin_rect_seq,
						x: x,
						y: y,
						w: w,
						h: h
					}
				;
				arr.push(obj);
			});
			console.log(arr);
			return arr;
		},
		setPropsSaved = function() {
			var arrRectProps = getCurrentRectProps();

			if (arrRectProps.length) {
				$.each(arrRectProps, function(_i, _val){
					console.log(_val);
					$.ajax({
						url: '/api/books/' + subject + '/' + bookID + '/questions/' + _val.question_id + '/rectangle',
						data: _val,
						type: 'POST', dataType: 'json', cache: true, async: false, timeout: 10000,
						error: function() {},
						success: function(_data) {
							if (_data != undefined) {
								$('.panel-index .tbl_questions').removeClass('disabled');
							}
						}
					});
				});
			}
		}
	;

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
				numRectEditMode = localStorage.getItem('rectEditMode'),
				numGridDisplayMode = localStorage.getItem('gridDisplayMode')
			;

			if (typeof objPages !== 'undefined') {
				$.each(objPages, function(_i, _val){
					var numEditingPageID = _val.editing_page_id,
						numPageID = _val.page_id,
						$option = $('<option value="' + numPageID + '" data-id="' + numEditingPageID + '">' + numPageID + '</option>')
						;
					$selectPage.append($option);
					setPageImage(numEditingPageID, numPageID);
				});
			}

			if ( numRectEditMode == null ) {
				numRectEditMode = 0;
			}

			$('.rect-edit-mode [value="' + numRectEditMode + '"]:radio')
				.attr('checked', true)
				.trigger('change')
			;

			if ( numGridDisplayMode == null ) {
				numGridDisplayMode = 0;
			}

			$('.grid-display-mode [value="' + numGridDisplayMode + '"]:radio')
				.attr('checked', true)
				.trigger('change')
			;

			setIndexs();
			setQuestions();

			$('#select_page').trigger('change');

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