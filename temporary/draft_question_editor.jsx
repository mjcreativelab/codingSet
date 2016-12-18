import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import Draggable from 'react-draggable';

import { editorExpandOrMinimizeAction } from 'reducers/question_reducer';

const editor_class = (is_editor_expanded) => {
	if (is_editor_expanded) {
		return 'item-2301 show-this';
	} else return 'item-2301 hide-this';
};

const toggle_class = (is_editor_expanded) => {
	if (is_editor_expanded) {
		return 'toggle-btn fa fa-minus-square';
	} else return 'toggle-btn fa fa-plus-square';
};

const DraftQuestionEditor = ({ is_editor_shown, is_editor_expanded, expandOrMinimizeEditor }) => (
	<Draggable>
		<div id='rectEditSupportFunctions' className={editor_class(is_editor_expanded)} style={is_editor_shown ? {} : { display: 'none' }}>
			<section className='panel'>
				<div className='panel-body'>
					<div className='title-bar item-4500'>
						<span className='title'>矩形選択補助</span>
						<i className={toggle_class(is_editor_expanded)} onClick={expandOrMinimizeEditor}></i>
					</div>

					<table className='table table-striped table-advance table-hover'>
						<tbody>
							<tr className='rect-edit-mode'>
								<td>モード</td>
								<td><label><input type='radio' name='radio1122' value="0" /> クリック式</label></td>
								<td><label><input type='radio' name='radio1122' value="1" /> ドラッグ式</label></td>
							</tr>

							<tr className='grid-display-mode'>
								<td>表示候補線</td>
								<td><label><input type='radio' name='radio0919' value="0" /> 選択中のみ</label></td>
								<td><label><input type='radio' name='radio0919' value="1" /> 全て</label></td>
							</tr>

							<tr className="grid-setter" data-direction='left'>
								<td colSpan='4'>
									<div className='grid-functions'>
										<dl className='set-position'>
											<dt className='position-name'>X1</dt>
											<dd className='position-value'>
												<input type='number' className='input-position' name='direction-left' data-position="x1" maxLength='4' min='0'/>
											</dd>
											<dd className='grid-btn'>
												<button type='button' className='btn btn-add-grid btn-success btn-xs'><i className='fa fa-plus'></i> 候補に追加</button>
											</dd>
										</dl>
										<dl className='set-position'>
											<dt className='position-name'>X1候補</dt>
											<dd className='position-value'>
												<select className='select-grid' name='direction-left-list' data-position="x1">
												</select>
											</dd>
											<dd className='grid-btn'>
												<button type='button' className='btn btn-delete-grid btn-danger btn-xs'><i className='fa fa-trash-o'></i> 候補から除外</button>
											</dd>
										</dl>
									</div>
								</td>
							</tr>
							<tr className="grid-setter" data-direction='top'>
								<td colSpan='4'>
									<div className='grid-functions'>
										<dl className='set-position'>
											<dt className='position-name'>Y1</dt>
											<dd className='position-value'>
												<input type='number' className='input-position' name='direction-top' data-position="y1" maxLength='4' min='0'/>
											</dd>
											<dd className='grid-btn'>
												<button type='button' className='btn btn-add-grid btn-success btn-xs'><i className='fa fa-plus'></i> 候補に追加</button>
											</dd>
										</dl>
										<dl className='set-position'>
											<dt className='position-name'>Y1候補</dt>
											<dd className='position-value'>
												<select className='select-grid' name='direction-top-list' data-position="y1">
												</select>
											</dd>
											<dd className='grid-btn'>
												<button type='button' className='btn btn-delete-grid btn-danger btn-xs'><i className='fa fa-trash-o'></i> 候補から除外</button>
											</dd>
										</dl>
									</div>
								</td>
							</tr>
							<tr className="grid-setter" data-direction='right'>
								<td colSpan='4'>
									<div className='grid-functions'>
										<dl className='set-position'>
											<dt className='position-name'>X2</dt>
											<dd className='position-value'>
												<input type='number' className='input-position' name='direction-right' data-position="x2" maxLength='4' min='0'/>
											</dd>
											<dd className='grid-btn'>
												<button type='button' className='btn btn-add-grid btn-success btn-xs'><i className='fa fa-plus'></i> 候補に追加</button>
											</dd>
										</dl>
										<dl className='set-position'>
											<dt className='position-name'>X2候補</dt>
											<dd className='position-value'>
												<select className='select-grid' name='direction-right-list' data-position="x2">
												</select>
											</dd>
											<dd className='grid-btn'>
												<button type='button' className='btn btn-delete-grid btn-danger btn-xs'><i className='fa fa-trash-o'></i> 候補から除外</button>
											</dd>
										</dl>
									</div>
								</td>
							</tr>
							<tr className="grid-setter" data-direction='bottom'>
								<td colSpan='4'>
									<div className='grid-functions'>
										<dl className='set-position'>
											<dt className='position-name'>Y2</dt>
											<dd className='position-value'>
												<input type='number' className='input-position' name='direction-bottom' data-position="y2" maxLength='4' min='0'/>
											</dd>
											<dd className='grid-btn'>
												<button type='button' className='btn btn-add-grid btn-success btn-xs'><i className='fa fa-plus'></i> 候補に追加</button>
											</dd>
										</dl>
										<dl className='set-position'>
											<dt className='position-name'>Y2候補</dt>
											<dd className='position-value'>
												<select className='select-grid' name='direction-bottom-list' data-position="y2">
												</select>
											</dd>
											<dd className='grid-btn'>
												<button type='button' className='btn btn-delete-grid btn-danger btn-xs'><i className='fa fa-trash-o'></i> 候補から除外</button>
											</dd>
										</dl>
									</div>
								</td>
							</tr>

						</tbody>
					</table>
				</div>
			</section>
		</div>
	</Draggable>
);

DraftQuestionEditor.propTypes = {
	is_editor_expanded: PropTypes.bool,
	is_editor_shown: PropTypes.bool,
	expandOrMinimizeEditor: PropTypes.func
};

const mapStateToProps = (state, ownProps) => ({
	is_editor_expanded: state.questionReducer.is_editor_expanded,
	is_editor_shown: state.questionReducer.is_editor_shown
});

export default connect(
	mapStateToProps,
	{
		expandOrMinimizeEditor: editorExpandOrMinimizeAction
	}
)(DraftQuestionEditor);
