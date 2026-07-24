import React from 'react';
import { Checkbox } from 'antd';
import classnames from 'classnames';
import get from 'lodash/get';
import Label from '../Label';
import { renderColumnTitle } from '../useSort';
import { getColumnLayout, parseColumnWidth } from './columnWidth';
import { resolveColumnDimensions } from '../columnRenderType';
import TreeExpandContent from './TreeExpandContent';
import { buildClearSelectAllKeys, buildSelectAllKeys, hasAnyTreeSelected, isAllTreeSelected } from '../treeCheck';
import style from './style.module.scss';

const renderHeaderCellContent = (column, { sortRender, widthBased, setColsSize, defaultSpan, colsSize }) => {
  const titleNode = renderColumnTitle(column.title, column, sortRender);
  const contentClassName = style['col-content'];

  if (widthBased) {
    return <span className={contentClassName}>{titleNode}</span>;
  }

  return (
    <Label
      className={contentClassName}
      onChange={size => {
        setColsSize(value =>
          Object.assign({}, value, {
            [column.name]: Math.max(size.width, parseColumnWidth(resolveColumnDimensions(column).width))
          })
        );
      }}
    >
      {titleNode}
    </Label>
  );
};

const renderSelectAllCheckbox = ({ dataSource, rowKey, rowSelection, checkRelation, treeKeyMaps, isTree }) => {
  if (!rowSelection?.allowSelectedAll) {
    return <Checkbox style={{ visibility: 'hidden' }} />;
  }

  const getRowKey = item => get(item, typeof rowKey === 'function' ? rowKey(item) : rowKey);
  const useTreeSelectAll = isTree && treeKeyMaps && rowSelection.type === 'checkbox';
  const selectableDataSource = (dataSource || []).filter(item => !item.disabled);
  const pageKeys = selectableDataSource.map(getRowKey);

  const checkedAll =
    rowSelection.isSelectedAll ||
    (useTreeSelectAll
      ? isAllTreeSelected({ mode: checkRelation, maps: treeKeyMaps, selectedKeys: rowSelection.selectedRowKeys })
      : pageKeys.length > 0 && pageKeys.every(key => rowSelection.selectedRowKeys && rowSelection.selectedRowKeys.indexOf(key) > -1));

  const indeterminate = useTreeSelectAll
    ? !checkedAll && hasAnyTreeSelected({ mode: checkRelation, maps: treeKeyMaps, selectedKeys: rowSelection.selectedRowKeys })
    : rowSelection.selectedRowKeys && rowSelection.selectedRowKeys.length > 0 && !checkedAll;

  return (
    <Checkbox
      checked={checkedAll}
      indeterminate={!!indeterminate}
      onChange={e => {
        const checked = e.target.checked;
        if (typeof rowSelection.onIsSelectAllChange === 'function') {
          rowSelection.onIsSelectAllChange(checked);
          return;
        }
        const existing = rowSelection.selectedRowKeys || [];
        if (useTreeSelectAll) {
          if (!checked) {
            rowSelection.onChange(buildClearSelectAllKeys({ maps: treeKeyMaps, existingKeys: existing }));
            return;
          }
          rowSelection.onChange(buildSelectAllKeys({ mode: checkRelation, maps: treeKeyMaps, existingKeys: existing }));
          return;
        }
        if (!checked) {
          rowSelection.onChange(existing.filter(key => pageKeys.indexOf(key) === -1));
          return;
        }
        if (pageKeys.length === 0) {
          return;
        }
        const merged = existing.slice();
        pageKeys.forEach(key => {
          if (merged.indexOf(key) === -1) {
            merged.push(key);
          }
        });
        rowSelection.onChange(merged);
      }}
    />
  );
};

export const renderHeaderGridCells = ({ dataSource, columns, rowKey, rowSelection, colsSize, setColsSize, sortRender, defaultSpan, isTree, indentSize, selectionColumnWidth, checkRelation, treeKeyMaps }) => {
  const cells = [];
  const showSelectionColumn = isTree || rowSelection?.type === 'checkbox' || rowSelection?.type === 'radio';
  const selectionStyle = selectionColumnWidth
    ? {
        '--selection-col-width': `${selectionColumnWidth}px`
      }
    : undefined;

  if (showSelectionColumn) {
    const selectionNode = rowSelection?.type === 'checkbox' ? renderSelectAllCheckbox({ dataSource, rowKey, rowSelection, checkRelation, treeKeyMaps, isTree }) : null;

    cells.push(
      <div key="__selection__" style={selectionStyle} className={classnames(style['col'], style['col-selection'], style['header-cell'], 'info-page-table-col')}>
        {isTree ? <TreeExpandContent level={0} indentSize={indentSize} hasChildren={false} selection={selectionNode} /> : <span className={classnames(style['col-content'], 'info-page-table-col-content')}>{selectionNode}</span>}
      </div>
    );
  }

  columns.forEach((column, index) => {
    const {
      widthBased,
      fillRemaining,
      style: columnStyle
    } = getColumnLayout(column, {
      defaultSpan,
      colsSize,
      isLastColumn: index === columns.length - 1,
      columns
    });
    cells.push(
      <div key={column.name} style={columnStyle} className={classnames(style['col'], fillRemaining ? style['col-width-fill'] : widthBased && style['col-width-based'], style['header-cell'], 'info-page-table-col')}>
        {renderHeaderCellContent(column, { sortRender, widthBased, setColsSize, defaultSpan, colsSize })}
      </div>
    );
  });

  return cells;
};

const Header = p => {
  const { dataSource, columns, rowKey, rowSelection, colsSize, setColsSize, headerStyle, sortRender, defaultSpan, isTree, indentSize, selectionColumnWidth, checkRelation, treeKeyMaps } = Object.assign(
    {},
    {
      rowKey: 'id'
    },
    p
  );

  return (
    <div style={headerStyle} className={classnames(style['header'], 'info-page-table-header')}>
      {renderHeaderGridCells({ dataSource, columns, rowKey, rowSelection, colsSize, setColsSize, sortRender, defaultSpan, isTree, indentSize, selectionColumnWidth, checkRelation, treeKeyMaps })}
    </div>
  );
};

export default Header;
