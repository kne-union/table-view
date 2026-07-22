import React from 'react';
import { Checkbox, Radio } from 'antd';
import classnames from 'classnames';
import get from 'lodash/get';
import computeColumnsValue, { computeDisplay } from '../computeColumnsValue';
import { isOptionsColumn } from '../columnRenderType';
import { renderCellContent } from '../renderCellContent';
import { getTreeBreadcrumbItems } from '../treeData';
import TreeExpandContent from './TreeExpandContent';
import style from './style.module.scss';

const getTreeTitle = (item, treeTitleKey) => {
  if (!item) {
    return '';
  }
  if (typeof treeTitleKey === 'function') {
    return treeTitleKey(item);
  }
  const value = get(item, treeTitleKey || 'name');
  return value == null ? '' : String(value);
};

const MobileCardList = ({
  dataSource,
  columns,
  rowKey,
  rowSelection,
  valueIsEmpty,
  emptyIsPlaceholder,
  placeholder,
  context,
  onRowSelect,
  onSelectionChange,
  toolbar,
  isTree,
  indentSize,
  rowMetaMap,
  onToggleExpand,
  getCheckState,
  loadingKeys,
  treeKeyMaps,
  treeTitleKey = 'name'
}) => {
  const getRowKey = item => get(item, typeof rowKey === 'function' ? rowKey(item) : rowKey);
  const fieldColumns = columns.filter(column => !isOptionsColumn(column));
  const actionColumns = columns.filter(column => isOptionsColumn(column));

  return (
    <div className={classnames(style['mobile-card-list'], 'info-page-table-mobile-card-list')}>
      {toolbar}
      {dataSource.map(item => {
        const id = getRowKey(item);
        const meta = rowMetaMap?.get(id);
        const checkState = typeof getCheckState === 'function' ? getCheckState(id) : { checked: !!(rowSelection?.selectedRowKeys && rowSelection.selectedRowKeys.indexOf(id) > -1), indeterminate: false };
        const isChecked = checkState.checked;
        const indeterminate = checkState.indeterminate;
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

        const selectionControl =
          rowSelection?.type === 'checkbox' ? (
            <Checkbox
              disabled={item.disabled || rowSelection.isSelectedAll}
              checked={(rowSelection.isSelectedAll && !item.disabled) || isChecked}
              indeterminate={!rowSelection.isSelectedAll && !!indeterminate}
              onChange={handleSelectionChange}
            />
          ) : rowSelection?.type === 'radio' ? (
            <Radio disabled={item.disabled} checked={isChecked} onChange={handleSelectionChange} />
          ) : null;

        const breadcrumbItems = isTree ? getTreeBreadcrumbItems(id, treeKeyMaps) : [];
        const breadcrumbText = breadcrumbItems
          .map(node => getTreeTitle(node, treeTitleKey))
          .filter(Boolean)
          .join(' / ');

        return (
          <div
            key={id}
            className={classnames(style['mobile-card'], 'info-page-table-mobile-card', {
              [style['is-tree-card']]: isTree,
              [style['is-selected-all']]: rowSelection?.isSelectedAll,
              [style['is-selected']]: isChecked,
              [style['is-disabled']]: item.disabled,
              [style['is-tree-child']]: isTree && meta && meta.level > 0,
              'is-mobile-card-selected': isChecked,
              'is-mobile-card-selected-all': rowSelection?.isSelectedAll
            })}
            onClick={handleCardClick}
          >
            {isTree ? (
              <div
                className={style['mobile-card-tree-bar']}
                onClick={event => {
                  event.stopPropagation();
                }}
              >
                <TreeExpandContent level={0} indentSize={0} hasChildren={!!meta?.hasChildren} expanded={!!meta?.expanded} loading={loadingKeys?.has?.(id)} onExpand={() => onToggleExpand?.(id)} selection={selectionControl} />
                {breadcrumbText ? <div className={style['mobile-card-breadcrumb']}>{breadcrumbText}</div> : null}
              </div>
            ) : selectionControl ? (
              <div
                className={style['mobile-card-selection']}
                onClick={event => {
                  event.stopPropagation();
                }}
              >
                {selectionControl}
              </div>
            ) : null}
            <div className={style['mobile-card-main']}>
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
          </div>
        );
      })}
    </div>
  );
};

export default MobileCardList;
