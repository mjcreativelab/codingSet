import React, { PropTypes } from 'react';
import { connect } from 'react-redux';

import DraftQuestionEditor from 'components/drafts/questions/draft_question_editor';
import ChapterSelectWidget from 'components/widgets/chapter_select_widget';
import FinishButton from 'components/drafts/questions/finish_button';

import { pageSelectAction, pageNextAction, pagePreviousAction } from 'reducers/draft_reducer';
import { editorShowOrHideAction } from 'reducers/question_reducer';

//const ImageArea = ({ image_path }) => {
//	if (image_path) {
//		return <img src={image_path} width='100%' id='img_page' />;
//	} else {
//		return <p>image_idなし。画像入力機能で画像を入力してください</p>;
//	}
//};
//
//ImageArea.propTypes = { image_path: PropTypes.string };

const questionsView = (selected_draft, selected_index, questions) => {
	let filtered_questions = [];
	if (Object.keys(selected_index).length === 0) {
		filtered_questions = questions;
	} else {
		// この手順は出現順に基づくから出現順は予想外なら問題は正しく表示されないのでご注意！
		// NOTE: DBには目次がparent_indexという参照があったらいい
		const indexes = selected_draft.editing_index;
		const selected_index_id = indexes.findIndex(index => index.editing_index_id == selected_index.editing_index_id);
		const subindexes = [];
		for (let i = selected_index_id + 1; indexes[i].index_level == 3 && i < indexes.length; i++) {
			subindexes.push(indexes[i]);
		}
		filtered_questions = questions.filter(question => subindexes.find(index => index.editing_index_id == question.editing_index_id));
	}
	return filtered_questions.map(question => (
		<tr key={question.question_id}>
			<td></td>
			<td>{question.question_id}</td>
			<td></td>
		</tr>
	));
};

const DraftQuestionEdit = ({
	image_path,
	selected_draft,
	selected_index,
	selected_page,
	questions,
	nextPage,
	previousPage,
	selectPage,
	showOrHideEditor
}) => (
	<div>
		<div id="workplace" className='row'>
			<div className='col-lg-8'>
				<section className='panel'>
					<header className='panel-heading tab-bg-dark-navy-blue'>
						<ul className='nav nav-tabs item-4611'>
							<li className='item-1238 active window-selector'>
								{/* TODO */}
								<a className='tab' data-toggle='tab' href='#mainWorkplace'>作業メイン</a>
							</li>
							<li className='item-2312 window-selector'>
								{/* TODO */}
								<a className='tab' data-toggle='tab' href='#subWorkplace'>作業サブ</a>
							</li>
							<li className='item-0378 window-selector'>
								{/* TODO */}
								<a className='tab' data-toggle='tab' href='#preview'>プレビュー</a>
							</li>
						</ul>
					</header>
					<div className='panel-body panel-canvas'>
						<div className='tab-content'>
							<div className='tab-pane active'>
								<div className='col-lg-10'>
									<div id='pageContainer'>
										<ul id='pagesList'>
											<li className='grid-container'></li>
										</ul>
									</div>
								</div>

								{/* <div className='col-lg-10 canvases_area'>
									{ selected_draft.editing_page.map(page => (
										<div id={`canvases_${page.page_id}`} className='canvases active' data-id={page.editing_page_id}>
											<div id={`canvas_${page.page_id}`}></div>
										</div>
									)) }
								</div> */}

								<div className='col-lg-2'>
									<div id='spinner1'>
										<div className='input-group input-small'>
											<select id='select_page' className='form-control'>
												{/* selected_draft.editing_page.map(page => (
													<option key={page.editing_page_id} value={page.page_id} data-id={page.editing_page_id}>{page.page_id}</option>
												)) */}
											</select>
											{/* <input type='text' className='spinner-input form-control' maxLength='3' readOnly />
											<div className='spinner-buttons input-group-btn btn-group-vertical'>
												<button type='button' className='btn spinner-up btn-xs btn-default'>
													<i className='fa fa-angle-up'></i>
												</button>
												<button type='button' className='btn spinner-down btn-xs btn-default'>
													<i className='fa fa-angle-down'></i>
												</button>
											</div> */}
										</div>
									</div>

									<button onClick={previousPage} type='button' id='btnPrev' className='btn btn-success item-2390'><i className='fa fa-long-arrow-left'></i> Prev</button>
									<button onClick={nextPage} type='button' id='btnNext' className='btn btn-success item-3999'><i className='fa fa-long-arrow-right'></i> Next</button>
									<button onClick={showOrHideEditor} type='button' className='btn btn-default item-5400'><i className='fa fa-crop'></i></button>
								</div>
							</div>

							{/* <div id='about-2' className='tab-pane'>

								<div className='col-lg-10'>
									<ImageArea image_path={image_path}/>
								</div>

								<div className='col-lg-2'>
									<div id='spinner1'>
										<div className='input-group input-small'>
											<input type='text' className='spinner-input form-control' maxLength='3' readOnly />
											<div className='spinner-buttons input-group-btn btn-group-vertical'>
												<button type='button' className='btn spinner-up btn-xs btn-default'>
													<i className='fa fa-angle-up'></i>
												</button>
												<button type='button' className='btn spinner-down btn-xs btn-default'>
													<i className='fa fa-angle-down'></i>
												</button>
											</div>
										</div>
									</div>

									<button type='button' className='btn btn-success item-2390'><i className='fa fa-long-arrow-left'></i> Prev</button>
									<button type='button' className='btn btn-success item-3999'><i className='fa fa-long-arrow-right'></i> Next</button>
									<button type='button' className='btn btn-default item-5400'><i className='fa fa-crop'></i></button>
								</div>
							</div> */}

							{/* <div id='contact-2' className='tab-pane'>

								<div className='col-lg-10'>
									<img className='item-2912' src='images/item-2300.jpg' />
								</div>

								<div className='col-lg-2'>
									<div id='spinner1'>
										<div className='input-group input-small'>
											<input type='text' className='spinner-input form-control' maxLength='3' readOnly />
											<div className='spinner-buttons input-group-btn btn-group-vertical'>
												<button type='button' className='btn spinner-up btn-xs btn-default'>
													<i className='fa fa-angle-up'></i>
												</button>
												<button type='button' className='btn spinner-down btn-xs btn-default'>
													<i className='fa fa-angle-down'></i>
												</button>
											</div>
										</div>
									</div>

									<button type='button' className='btn btn-success item-2390'><i className='fa fa-long-arrow-left'></i> Prev</button>
									<button type='button' className='btn btn-success item-3999'><i className='fa fa-long-arrow-right'></i> Next</button>
								</div>

							</div> */}
						</div>
					</div>
				</section>
			</div>

			<div className='col-lg-4'>
				<section className='panel panel-index each_pages'>
					<div className='panel-body'>
						<form action='#' className='form-horizontal tasi-form'>
							<div className='form-group'>
								<div className='col-lg-12 item-2039'>
									<div className='row'>
										<div className='col-lg-8'>
											<select className='select_index form-control'>
												<option value='all' className='all'>全て</option>
											</select>
										</div>
									</div>
								</div>

								<div className='col-lg-8'>
									<table className='table table-striped table-advance table-hover tbl_questions' id=''>
										<tbody>
											{questionsView(selected_draft, selected_index, questions)}
										</tbody>
									</table>
								</div>

								<div className='col-lg-4'>
									<button type='button' className='btn btn-success item-9393 disabled' id='btnQuesAdd'><i className='fa fa-plus'></i> 問題追加</button>
									<button type='button' className='btn btn-danger item-2382 disabled' id='btnQuesDel'><i className='fa fa-trash-o'></i> 問題削除</button>
								</div>
							</div>
						</form>
					</div>
				</section>

				<section className='rect-list-container panel panel-rect rect-type-1 each_pages'>
					<div className='panel-body'>
						<form action='#' className='form-horizontal tasi-form'>
							<div className='form-group'>
								<div className='col-md-12'>
									<table className='table table-striped table-advance table-hover'>
										<thead>
											<tr>
												<th colSpan='3' className='item-9399'>
													問題矩形
													<div className='item-2378'>
														<button type='button' className='btn btn-success' id='btnRectQ' data-rect-type='1'><i className='fa fa-plus'></i> 矩形追加</button>
														<button type='button' className='btn btn-success disabled' id='btnRectQMask' data-rect-type='1'><i className='fa fa-plus'></i> 白矩形追加</button>
													</div>
												</th>
											</tr>
										</thead>
										<tbody className='rect-list item-1232'>
											{/* <tr>
												<td style={{ width: '40%' }}>
													【問題/30002/0】
												</td>
												<td style={{ textAlign: 'right', width: '30%' }}>
													<div className='input-group input-small input-group-shorter'>
														<input type='text' className='spinner-input form-control' maxLength='3' readOnly />
														<div className='spinner-buttons input-group-btn btn-group-vertical'>
															<button type='button' className='btn spinner-up btn-xs btn-default'>
																<i className='fa fa-angle-up'></i>
															</button>
															<button type='button' className='btn spinner-down btn-xs btn-default'>
																<i className='fa fa-angle-down'></i>
															</button>
														</div>
													</div>
												</td>
												<td style={{ textAlign: 'right' }}>
													<button type='button' className='btn btn-danger'><i className='fa fa-trash-o'></i></button>
												</td>
											</tr>
											<tr>
												<td style={{ width: '40%' }}>問題/30002/0】</td>
												<td style={{ textAlign: 'right', width: '30%' }}>
													<div className='input-group input-small input-group-shorter'>
														<input type='text' className='spinner-input form-control' maxLength='3' readOnly />
														<div className='spinner-buttons input-group-btn btn-group-vertical'>
															<button type='button' className='btn spinner-up btn-xs btn-default'>
																<i className='fa fa-angle-up'></i>
															</button>
															<button type='button' className='btn spinner-down btn-xs btn-default'>
																<i className='fa fa-angle-down'></i>
															</button>
														</div>
													</div>
												</td>
												<td style={{ textAlign: 'right' }}>
													<button type='button' className='btn btn-danger'><i className='fa fa-trash-o'></i></button>
												</td>
											</tr>
											<tr>
												<td style={{ width: '40%' }}>【問題/30002/0】</td>
												<td style={{ textAlign: 'right', width: '30%' }}>
													<div className='input-group input-small input-group-shorter'>
														<input type='text' className='spinner-input form-control' maxLength='3' readOnly />
														<div className='spinner-buttons input-group-btn btn-group-vertical'>
															<button type='button' className='btn spinner-up btn-xs btn-default'>
																<i className='fa fa-angle-up'></i>
															</button>
															<button type='button' className='btn spinner-down btn-xs btn-default'>
																<i className='fa fa-angle-down'></i>
															</button>
														</div>
													</div>
												</td>
												<td style={{ textAlign: 'right' }}>
													<button type='button' className='btn btn-danger'><i className='fa fa-trash-o'></i></button>
												</td>
											</tr>*/}
										</tbody>
									</table>
								</div>
							</div>
						</form>
					</div>
				</section>

				<section className='rect-list-container panel panel-rect rect-type-3 each_pages'>
					<div className='panel-body'>
						<form action='#' className='form-horizontal tasi-form'>
							<div className='form-group'>
								<div className='col-md-12'>
									<table className='table table-striped table-advance table-hover'>
										<thead>
											<tr>
												<th colSpan='3' className='item-9399'>
													解答矩形
													<div className='item-2378'>
														<button type='button' className='btn btn-success' id='btnRectA' data-rect-type='3'><i className='fa fa-plus'></i> 矩形追加</button>
														<button type='button' className='btn btn-success disabled' id='btnRectSubA' data-rect-type='3'><i className='fa fa-plus'></i> 白矩形追加</button>
													</div>
												</th>
											</tr>
										</thead>
										<tbody className='rect-list item-1232'>
											{/* <tr>
												<td style={{ width: '40%' }}>【問題/30002/0】</td>
												<td style={{ textAlign: 'right', width: '30%' }}>
													<div className='input-group input-small input-group-shorter'>
														<input type='text' className='spinner-input form-control' maxLength='3' readOnly />
														<div className='spinner-buttons input-group-btn btn-group-vertical'>
															<button type='button' className='btn spinner-up btn-xs btn-default'>
																<i className='fa fa-angle-up'></i>
															</button>
															<button type='button' className='btn spinner-down btn-xs btn-default'>
																<i className='fa fa-angle-down'></i>
															</button>
														</div>
													</div>
												</td>
												<td style={{ textAlign: 'right' }}>
													<button type='button' className='btn btn-danger'><i className='fa fa-trash-o'></i></button>
												</td>
											</tr>
											<tr>
												<td style={{ width: '40%' }}>【問題/30002/0】</td>
												<td style={{ textAlign: 'right', width: '30%' }}>
													<div className='input-group input-small input-group-shorter'>
														<input type='text' className='spinner-input form-control' maxLength='3' readOnly />
														<div className='spinner-buttons input-group-btn btn-group-vertical'>
															<button type='button' className='btn spinner-up btn-xs btn-default'>
																<i className='fa fa-angle-up'></i>
															</button>
															<button type='button' className='btn spinner-down btn-xs btn-default'>
																<i className='fa fa-angle-down'></i>
															</button>
														</div>
													</div>
												</td>
												<td style={{ textAlign: 'right' }}>
													<button type='button' className='btn btn-danger'><i className='fa fa-trash-o'></i></button>
												</td>
											</tr>
											<tr>
												<td style={{ width: '40%' }}>【問題/30002/0】</td>
												<td style={{ textAlign: 'right', width: '30%' }}>
													<div className='input-group input-small input-group-shorter'>
														<input type='text' className='spinner-input form-control' maxLength='3' readOnly />
														<div className='spinner-buttons input-group-btn btn-group-vertical'>
															<button type='button' className='btn spinner-up btn-xs btn-default'>
																<i className='fa fa-angle-up'></i>
															</button>
															<button type='button' className='btn spinner-down btn-xs btn-default'>
																<i className='fa fa-angle-down'></i>
															</button>
														</div>
													</div>
												</td>
												<td style={{ textAlign: 'right' }}>
													<button type='button' className='btn btn-danger'><i className='fa fa-trash-o'></i></button>
												</td>
											</tr> */}
										</tbody>
									</table>
								</div>
							</div>
						</form>
					</div>
				</section>

				<section className='panel'>
					<div className='panel-body'>
						<form action='#' className='form-horizontal tasi-form'>
							<div className='form-group'>
								<div className='col-md-12'>
									<button type='button' id='btnUndo' className='btn btn-default item-9023 disabled'>やり直し</button>
									<button type='button' id='btnSave' className='btn btn-warning item-9023 item-1911'>保存</button>
									{/* NOTE: 作業者として、process_id: 4 => 5、確認者として、process_id: 5 => 6 */}
									<FinishButton nextStage={5}/>
								</div>
							</div>
						</form>
					</div>
				</section>
			</div>
		</div>
		<DraftQuestionEditor/>
	</div>

);

DraftQuestionEdit.propTypes = {
	image_path: PropTypes.string,
	selected_draft: PropTypes.object,
	selected_index: PropTypes.object,
	selected_page: PropTypes.object,
	questions: PropTypes.array,
	nextPage: PropTypes.func,
	previousPage: PropTypes.func,
	selectPage: PropTypes.func,
	showOrHideEditor: PropTypes.func
};

const mapStateToProps = (state, ownProps) => ({
	image_path: state.imageReducer.selected_page_image_path,
	selected_draft: state.draftReducer.selected_draft,
	selected_index: state.questionReducer.selected_index,
	selected_page: state.draftReducer.selected_page,
	questions: state.questionReducer.questions
});

export default connect(
	mapStateToProps,
	{
		nextPage: pageNextAction,
		previousPage: pagePreviousAction,
		selectPage: pageSelectAction,
		showOrHideEditor: editorShowOrHideAction
	}
)(DraftQuestionEdit);
