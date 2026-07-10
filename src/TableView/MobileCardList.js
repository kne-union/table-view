import React from 'react';
import { Checkbox, Radio } from 'antd';
import classnames from 'classnames';
import get from 'lodash/get';
import computeColumnsValue, { computeDisplay } from '../computeColumnsValue';
import { isOptionsColumn } from '../columnRenderType';
import { renderCellContent } from '../renderCellContent';
import style from './style.module.scss';

const MobileCardList = ({ dataSource, columns, rowKey, rowSelection, valueIsEmpty, emptyIsPlaceholder, placeholder, context, onRowSelect, onSelectionChange }) => {
  const getId = item => get(item, typeof rowKey === 'function' ? rowKey(item) : rowKey);
  const fieldColumns = columns.filter(column => !isOptionsColumn(column));
  const actionColumns = columns.filter(column => isOptionsColumn(column));
  const showSelectAll = rowSelection?.type === 'checkbox' && rowSelection.allowSelectedAll;
  const checkedAll = showSelectAll && (rowSelection.isSelectedAll || (dataSource && dataSource.every(item => rowSelection.selectedRowKeys && rowSelection.selectedRowKeys.indexOf(getId(item)) > -1)));
  const indeterminate = showSelectAll && rowSelection.selectedRowKeys && rowSelection.selectedRowKeys.length > 0 && !checkedAll;

  const handleSelectAllChange = e => {
    const checked = e.target.checked;
    if (!checked) {
      typeof rowSelection.onIsSelectAllChange === 'function' ? rowSelection.onIsSelectAllChange(false) : rowSelection.onChange([]);
      return;
    }
    if (typeof rowSelection.onIsSelectAllChange === 'function') {
      rowSelection.onIsSelectAllChange(true);
      return;
    }
    if (dataSource && dataSource.length > 0) {
      rowSelection.onChange(dataSource.map(getId));
    }
  };

  return (
    <div className={classnames(style['mobile-card-list'], 'info-page-table-mobile-card-list')}>
      {showSelectAll ? (
        <div className={style['mobile-card-select-all']}>
          <Checkbox checked={!!checkedAll} indeterminate={!!indeterminate} onChange={handleSelectAllChange} />
          <span>全选</span>
        </div>
      ) : null}
      {dataSource.map(item => {
        const id = getId(item);
        const isChecked = rowSelection?.selectedRowKeys && rowSelection.selectedRowKeys.indexOf(id) > -1;
        const columnsValue = computeColumnsValue({
          columns,
          emptyIsPlaceholder,
          valueIsEmpty,
          removeEmpty: true,
          dataSource: item,
          placeholder,
          context
        });
        const columnMap = columnsValue.reduce((result, column) => Object.assign(result, { [column.name]: column }), {});
        const handleSelectionChange = () => onSelectionChange?.(item, { dataSource, context, id, isChecked });
        const handleCardClick = () => {
          if (item.disabled) {
            return;
          }
          onRowSelect?.(item, { columns, dataSource });
        };

        const actions = actionColumns
          .map(column => {
            const columnValue = columnMap[column.name];
            if (!columnValue) {
              return null;
            }
            // 移动端操作区：紧凑展示，仅保留「⋯」入口，避免列宽撑开与按钮截断
            const actionColumn = Object.assign({}, columnValue, {
              width: undefined,
              min: undefined,
              max: undefined,
              mobileOptions: true,
              buttonGroup: Object.assign({}, columnValue.buttonGroup, { showLength: 0 })
            });
            return (
              <div key={column.name} className={style['mobile-card-action']}>
                {renderCellContent(computeDisplay({ column: actionColumn, placeholder, dataSource: item, context }), actionColumn, style['mobile-card-action-content'])}
              </div>
            );
          })
          .filter(Boolean);

        return (
          <div
            key={id}
            className={classnames(style['mobile-card'], 'info-page-table-mobile-card', {
              [style['is-selected-all']]: rowSelection?.isSelectedAll,
              [style['is-selected']]: isChecked,
              [style['is-disabled']]: item.disabled
            })}
            onClick={handleCardClick}
          >
            {rowSelection?.type === 'checkbox' ? (
              <div
                className={style['mobile-card-selection']}
                onClick={event => {
                  event.stopPropagation();
                }}
              >
                <Checkbox disabled={item.disabled || rowSelection.isSelectedAll} checked={(rowSelection.isSelectedAll && !item.disabled) || isChecked} onChange={handleSelectionChange} />
              </div>
            ) : null}
            {rowSelection?.type === 'radio' ? (
              <div
                className={style['mobile-card-selection']}
                onClick={event => {
                  event.stopPropagation();
                }}
              >
                <Radio disabled={item.disabled} checked={isChecked} onChange={handleSelectionChange} />
              </div>
            ) : null}
            <div className={style['mobile-card-body']}>
              {fieldColumns.map(column => {
                const columnValue = columnMap[column.name];
                if (!columnValue) {
                  return null;
                }
                return (
                  <div key={column.name} className={classnames(style['mobile-card-field'], 'info-page-table-mobile-card-field')}>
                    <div className={style['mobile-card-label']}>{column.title}</div>
                    <div className={style['mobile-card-value']}>{renderCellContent(computeDisplay({ column: columnValue, placeholder, dataSource: item, context }), columnValue, style['mobile-card-value-content'])}</div>
                  </div>
                );
              })}
            </div>
            {actions.length > 0 ? (
              <div
                className={style['mobile-card-actions']}
                onClick={event => {
                  event.stopPropagation();
                }}
              >
                {actions}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
};

export default MobileCardList;
