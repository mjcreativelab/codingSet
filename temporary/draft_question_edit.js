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
		arrRemovedQuestionProps = [],
		setPageInit = function() {
			subject = 0;
			bookID = 0;
			editingPageID = 0;
			pageID = 0;
			indexID = 0;
			quesID = 0;
			book = {};
			numBaseMouseX = 0;
			numBaseMouseY = 0;
			arrEditedRectHistory = [];
			checkedRectID = '';
			arrRemovedQuestionProps = [];
		},
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
						console.log('book props', book);
					}
				});
			}
		}
	;

//////////////////////////
// 章リスト (目次）設置
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
							var $index = $('<option />')
											.val(_data[i].editing_index_id)
											.attr('data-page-id', _data[i].editing_page_id)
											.attr('data-index-id', _data[i].index_id)
											.attr('data-index-level', _data[i].index_level)
											.attr('data-index-name', _data[i].index_name)
											.text(_data[i].index_name + ' ' + _data[i].index_id)
							;
							$('.panel-index .select_index').append($index);
						}
						console.log('index props (page id: ' + pageID + ')', _data);
					}
				}
			});
		}
	;

//////////////////////////
// 章リスト (目次）選択
//////////////////////////

	$(document)
		.on('change', '.select_index', function() {
			indexID = $(this).val();

			setQuestions(arrCurrentQuestionProps, indexID);
		})
	;

//////////////////////////
// 問題リスト設置
//////////////////////////

	var arrCurrentQuestionProps = [],
		getQuestionProps = function() {

			getParams();

			var obj = $.ajax({
					url: '/api/books/' + subject + '/' + bookID + '/questions',
					data: {},
					type: 'GET', dataType: 'json', cache: true, async: false, timeout: 10000,
					error: function (){},
					success: function (_data) {
						return _data;
					}
				})
			;
			return obj.responseJSON;
		},
		setQuestions = function(arrQuestionProps, indexID) {
			console.log('set questions (index id: ' + indexID + ')', arrQuestionProps);
			var $questionList = $('.panel-index .tbl_questions tbody'),
				_arrTempQuestionProps = arrQuestionProps,
				_objEachQuestionID = {}
			;

			if (!_arrTempQuestionProps || !_arrTempQuestionProps[0]) {
				console.log('no questions (index id: ' + indexID + ')');
				return;
			}

			$questionList.html('');
			$('#btnQuesAdd').addClass('disabled');
			$('#btnQuesDel').addClass('disabled');

			if (indexID && indexID != '' && indexID != 'all') {
				$questionList.append('<tr><th class="chapter-title">' + $('.panel-index .select_index option:selected').text() + '</th></tr>');
				$('#btnQuesAdd').removeClass('disabled');

				_arrTempQuestionProps = arrQuestionProps.filter(function(_v, _i) {
					return (_v.editing_index_id == indexID);
				});
			}

			$.each(_arrTempQuestionProps, function(_i, _val){
				console.log('question ' + _i + ' (index id: ' + indexID + ')', _val);

				if (!_objEachQuestionID[_val.editing_index_id]) {
					_objEachQuestionID[_val.editing_index_id] = [_val];
				} else {
					_objEachQuestionID[_val.editing_index_id].push(_val);
				}

				var _numQuestions = _objEachQuestionID[_val.editing_index_id].length - 1,
					_thisQuestionID = _val.editing_index.index_id + ('0000' + (_numQuestions + 1)).slice(-4);
				;

				$('<tr class="question-selector">')
					.attr('data-index-id', _val.editing_index.index_id)
					.attr('data-editing-question-id', _val.editing_question_id)
					.attr('data-origin-question-id', _val.question_id)
					.attr('data-question-id', _thisQuestionID)
					.append('<td>' + _thisQuestionID + '</td>')
					.appendTo($questionList)
				;
			});
		}
	;

//////////////////////////
// 問題追加
//////////////////////////

	var setNewQuestion = function(editingIndexID) {
		var $selectedIndex = $('.panel-index .select_index option[value="' + editingIndexID + '"]'),
				_objEditingIndex = {
					book_id: bookID,
					editing_index_id: $selectedIndex.val(),
					editing_page_id: $selectedIndex.attr('data-page-id'),
					index_id: $selectedIndex.attr('data-index-id'),
					index_level: $selectedIndex.attr('data-index-level'),
					index_name: $selectedIndex.attr('data-index-name')
				},
				_addQuestionProps = {
					book_id: bookID,
					editing_index: _objEditingIndex,
					editing_index_id: _objEditingIndex.editing_index_id
				},
				_arrSameIndexIdQuestions = [],
				_numQuestions = 0
			;

			if (arrCurrentQuestionProps) {
				_arrSameIndexIdQuestions = arrCurrentQuestionProps.filter(function(_v, _i) {
					return (_v.editing_index_id == _addQuestionProps.editing_index_id);
				});
				_numQuestions = _arrSameIndexIdQuestions.length;
			}

			_addQuestionProps.question_id = _objEditingIndex.index_id + ('0000' + (_numQuestions + 1)).slice(-4);

			arrCurrentQuestionProps.push(_addQuestionProps);

			setQuestions(arrCurrentQuestionProps, _objEditingIndex.editing_index_id);

			console.log('add question', _addQuestionProps);
	};

	$(document)
		.on('click', '#btnQuesAdd', function() {
			var _editingIndexID = $('.panel-index .select_index').val();

			setNewQuestion(_editingIndexID);
		})
	;

//////////////////////////
// 問題削除
//////////////////////////

	var setQuestionDeleted = function(originalQuestionID, indexID) {
		var $targetQuestion = $('.tbl_questions .question-selector[data-origin-question-id="' + originalQuestionID + '"]'),
			_origin_question_id = originalQuestionID,
			_editing_question_id = $targetQuestion.attr('data-editing-question-id'),
			_targetQuestionProps = $.grep(arrCurrentQuestionProps, function(_v, _i){
				return (_v.question_id == _origin_question_id);
			})
		;
		_targetQuestionProps = _targetQuestionProps[0];

		// 削除対象の問題以外を arrCurrentQuestionProps へ再設置（＝arrCurrentQuestionPropsより対象を削除）
		arrCurrentQuestionProps = $.grep(arrCurrentQuestionProps, function(_v, _i){
			return (_v.question_id == _origin_question_id);
		}, true);

		// 追加された問題を削除した場合は削除用配列に入れず
		if (_editing_question_id) {
			arrRemovedQuestionProps.push(_targetQuestionProps);
		}

		setQuestions(arrCurrentQuestionProps, indexID);

		console.log('delete question: ' + _targetQuestionProps.question_id, _targetQuestionProps);
		console.log('after delete question', arrCurrentQuestionProps);
		console.log('deleted questions', arrRemovedQuestionProps);
	};

	$(document)
		.on('click', '#btnQuesDel', function() {
			var _originalQuestionID = $('.tbl_questions .question-selector.active').attr('data-origin-question-id'),
				_indexID = $('.each_pages .select_index').val()
			;

			setQuestionDeleted(_originalQuestionID, _indexID);
		})
	;

//////////////////////////
// 問題選択
//////////////////////////

	$(document)
		.on('click', '.tbl_questions .question-selector', function() {
			var $question = $(this),
				$questionList = $question.parents('.tbl_questions'),
				strCurrentQuestionID = $question.attr('data-question-id'),
				strEditiongQuestionID = $question.attr('data-editing-question-id'),
				numQuestion = 0,
				numQuestionMask = 0,
				numAnswer = 0,
				numAnswerMask = 0
			;

			arrCurrentRectProps = [];
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
				var _numRectProps = _arrRectProps.length,
					i
				;

				for (i = 0; i < _numRectProps; i++) {
					_arrRectProps[i].question_id = strCurrentQuestionID;
					_arrRectProps[i].editing_quesiton_id = strEditiongQuestionID;
				}

				console.log('rects of selected question', _arrRectProps);

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
// ページ（画像）設置
//////////////////////////

	var setPageImage = function(editingPageID, pageID) {

			getParams();

			var $pagesList = $('#pagesList'),
				$page = $('#page_' + editingPageID, $pagesList)
			;

			if (!$page.length) {
				var $pageImage = $('<img class="page-image">').attr('src', '/api/books/' + subject + '/' + bookID + '/pages/' + pageID + '/image');
				$page = $('<li id="page_' + editingPageID + '" class="page" />')
						.appendTo($pagesList)
					;
				$pageImage.on('load', function(){
					$page.append($pageImage);
				});
			}
		}
	;

//////////////////////////
// ページ変更
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

			var obj = $.ajax({
					url: 'http://atls-api.paxcreation.com/question_rect.php?book_id=' + book.book_id + '&question_id=' + quesID + '&subject=' + subject,
					type: 'GET', dataType: 'json', cache: true, async: false, timeout: 10000,
					error: function (){},
					success: function (_data) {
						if (_data) {
							console.log('set rects (question id: ' + quesID + ')', _data);
							return _data;
						} else {
							console.log('no rects (question id: ' + quesID + ')');
							return false;
						}
					}
				})
			;
			return obj.responseJSON;
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
			console.log('after set rects', arrCurrentRectProps);
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
				setRectSelectedCanceled();
			}

			$rectContainer.addClass(strActive);
			$rect.addClass(strActive);
			$rectSelector.addClass(strActive);
			$('td', $rectSelector).addClass(strActive);
			$('.btn-rect-delete', $rectSelector).removeClass('disabled');

			setPositionToForm(_x, _y, _w, _h);

			if (_rectType == 1|| _rectType == 3) {
				$('.mask-rect' ,$rectContainer).addClass('disabled');
			} else {
				$('.mask-rect' ,$rectContainer).removeClass('disabled');
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

	var setRectSelectedCanceled = function() {
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
			$('.grid-setter .input-position').val('');
			$('.active', $rectContainer).removeClass('active');
			$rectContainer.removeClass('active');
			$('.rect-selector').removeClass('active');
			$('.rect-selector > *').removeClass('active');
			$('#rectEditSupportFunctions .grid-setter').removeClass('disabled');
			$('#btnRectQMask, #btnRectSubA').addClass('disabled');
		},
		setRectEditStarted = function(e) {
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
		},
		setRectEditEnded = function() {
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
			setRectSelectedCanceled();
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
				console.log('for undo', arrEditedRectHistory);
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

		.on('click', '[data-rect-edit-mode="click"]:not([data-rect-editing]) .rect.active .rect-handle', setRectEditStarted)
		.on('mousedown', '[data-rect-edit-mode="drag"]:not([data-rect-editing]) .rect.active .rect-handle', setRectEditStarted)

		// 矩形編集中

		.on('mousemove', '[data-rect-edit-mode][data-rect-editing]', function(e){
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
		})

		// 矩形編集終了

		.on('click', '[data-rect-edit-mode="click"][data-rect-editing]', setRectEditEnded)
		.on('mouseup', '[data-rect-edit-mode="drag"][data-rect-editing]', setRectEditEnded)

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
			setRectSelectedCanceled();
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
			_originRectSeq = $rectSelector.attr('data-origin-rect-seq'),
			strRectName = $('.rect-name', $rectSelector).text()
		;

		if(!confirm('選択された矩形' + strRectName + 'を削除します。よろしいですか？')) return;

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
				var numValLength = _val.length;
				if (numValLength) {
					var _cat = _i;
					$.each(_val, function(_i, _val){
						console.log('set grid', _cat + ': ' + _val);
						var $grid = $('<div class="grid" />'),
							$gridSelector = $('.select-grid[data-position="' + _cat + '"]')
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

						$grid
							.addClass(_cat)
							.attr('data-pos', _val)
							.attr('data-cat', _cat)
						;

						$gridContainer.append($grid);

						$gridSelector
							.prepend('<option value="' + _val + '" data-cat="' + _cat + '">' + _val + '</option>')
						;

						if (numValLength == (_i + 1)) {
							$gridSelector
								.val(_val)
								.trigger('change')
							;
						}
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
		console.log('add grid', cat + ': ' + val);
		console.log('before grid added', objGridProps);

		var _arrTargetGrid = objGridProps[cat],
			arrTheSameVal = _arrTargetGrid.filter(function(_val){
				return (_val == val);
			})
		;
		if (arrTheSameVal.length) {
			alert('同じ値のグリッドが設置されています[' + cat + ': ' + val + ']');
			return;
		}
		objGridProps[cat].push(val);
		setGrids(objGridProps);

		console.log('after grid added', objGridProps);
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

	var setGridPropRemoved = function(cat, val){
		console.log('remove grid', cat + ': ' + val);
		console.log('before grid removeed', objGridProps);

		if (!confirm(cat + ': ' + val + ' を削除します。よろしいですか？')) return;

		var _arrTempGridPos = objGridProps[cat].filter(function(_v, _i){
			return (_v != val)
		});
		objGridProps[cat] = _arrTempGridPos;
		setGrids(objGridProps);

		console.log('after grid removed', objGridProps);
	};

	$(document)
		.on('click', '.grid-setter .btn-delete-grid', function(){
			var $btn = $(this),
				$gridSetter = $btn.parents('.grid-setter'),
				numVal = $('.select-grid', $gridSetter).val(),
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
				setGridPropRemoved(strCat, numVal);
			}
		})
	;

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
			console.log('current rect props', arr);
			return arr;
		},
		setPropsSaved = function() {

			var questions = $('.question-selector');
			var eachQuestionID = 0;
			var eachQuestionOrgID = 0;
			var eachEditingQuestionID = 0;

			// 削除した問題 delete
			$.each(arrRemovedQuestionProps, function(_i, _val){
				var editing_question_id = _val.editing_question_id;
				$.ajax({
					url: '/api/books/' + subject + '/' + bookID + '/question_id/' + editing_question_id,
					data: {},
					type: 'DELETE', dataType: 'json', cache: true, async: false, timeout: 10000,
					error: function() {},
					success: function(_data) {
						if (_data != undefined) {

						}
					}
				});
			});

			// 問題ID update
			$.each(questions, function(_i, _val){
				eachQuestionID = $(this).attr('data-question-id');
				eachQuestionOrgID = $(this).attr('data-origin-question-id');
				eachEditingQuestionID = $(this).attr('data-editing-question-id');

				// 以前と変更のあったものだけ
				if (eachQuestionID != eachQuestionOrgID) {
					$.ajax({
						url: '/api/books/' + subject + '/' + bookID + '/question_id/' + eachEditingQuestionID,
						data: {
							question_id : eachQuestionID,
						},
						type: 'PUT', dataType: 'json', cache: true, async: false, timeout: 10000,
						error: function() {},
						success: function(_data) {
							if (_data != undefined) {

							}
						}
					});
				}
			});

			// 矩形 update
			var arrRectProps = getCurrentRectProps();

			if (arrRectProps.length) {
				$.each(arrRectProps, function(_i, _val){
					console.log('seve rect props', _val);
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

			// proccess update
			var status = {};
			status.process_status = '作業中';
			status.process_status = '作業完了';
			$.ajax({
				url: '/api/books/' + subject + '/' + bookID + '/processes/' + '4',
				data: JSON.stringify(status),
				type: 'POST', dataType: 'json', cache: true, async: true, timeout: 10000,
				error: function() {},
				success: function(_data) {
					if (_data != undefined) {

					}
				}
			});
		}
	;

	$(document)
		.on('click', '#btnSave', setPropsSaved)
	;

//////////////////////////
// 問題選択
//////////////////////////

	$(document)
		.on('click', '.question-control .qcb', function() {
			//var type = '';
			//
			//if ($(this).hasClass('f')) {
			//	// 問題 先頭
			//} else if ($(this).hasClass('p')) {
			//	// 問題 前
			//
			//} else if ($(this).hasClass('n')) {
			//	// 問題 後
			//
			//} else if ($(this).hasClass('l')) {
			//	// 問題 最後
			//
			//}

			numQuestion = 0,
			numQuestionMask = 0,
			numAnswer = 0,
			numAnswerMask = 0

			quesID = $('#qselector option:selected').text();
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

		})
	;




//////////////////////////
// ページ読み込み時
//////////////////////////

	var setWorkplaceElements = function() {

		if (!$('#workplace').length) return;

		setPageInit();
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

		arrCurrentQuestionProps = getQuestionProps();
		setQuestions(arrCurrentQuestionProps);

		$('#select_page').trigger('change');
	};

	$(document)
		.on('click', 'a.link_book[href*="drafts"]', setWorkplaceElements)
	;

	$(window)
		.on('load', setWorkplaceElements)
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