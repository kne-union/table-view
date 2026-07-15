import React from 'react';
import { Checkbox } from 'antd';
import classnames from 'classnames';
import get from 'lodash/get';
import Label from '../Label';
import { renderColumnTitle } from '../useSort';
import { getColumnLayout, parseColumnWidth } from './columnWidth';
import { resolveColumnDimensions } from '../columnRenderType';
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

export const renderHeaderGridCells = ({ dataSource, columns, rowKey, rowSelection, colsSize, setColsSize, sortRender, defaultSpan }) => {
  const cells = [];

  if (rowSelection?.type === 'checkbox') {
    cells.push(
      <div key="__selection__" className={classnames(style['col'], style['col-fixed'], style['header-cell'], 'info-page-table-col')}>
        <span className={classnames(style['col-content'], 'info-page-table-col-content')}>
          {rowSelection.allowSelectedAll ? (
            (() => {
              const checkedAll =
                rowSelection.isSelectedAll || (dataSource && dataSource.every(item => rowSelection.selectedRowKeys && rowSelection.selectedRowKeys.indexOf(get(item, typeof rowKey === 'function' ? rowKey(item) : rowKey)) > -1));
              return (
                <Checkbox
                  checked={checkedAll}
                  indeterminate={rowSelection.selectedRowKeys && rowSelection.selectedRowKeys.length > 0 && !checkedAll}
                  onChange={e => {
                    const checked = e.target.checked;
                    if (typeof rowSelection.onIsSelectAllChange === 'function') {
                      rowSelection.onIsSelectAllChange(checked);
                      return;
                    }
                    const getRowKey = item => get(item, typeof rowKey === 'function' ? rowKey(item) : rowKey);
                    const pageKeys = (dataSource || []).map(getRowKey);
                    const existing = rowSelection.selectedRowKeys || [];
                    if (!checked) {
                      rowSelection.onChange(existing.filter(key => pageKeys.indexOf(key) === -1));
                      return;
                    }
                    if (!dataSource || dataSource.length === 0) {
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
            })()
          ) : (
            <Checkbox style={{ visibility: 'hidden' }} />
          )}
        </span>
      </div>
    );
  }

  if (rowSelection?.type === 'radio') {
    cells.push(<div key="__radio__" className={classnames(style['col'], style['col-fixed'], style['header-cell'], 'info-page-table-col')} />);
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
  const { dataSource, columns, rowKey, rowSelection, colsSize, setColsSize, headerStyle, sortRender, defaultSpan } = Object.assign(
    {},
    {
      rowKey: 'id'
    },
    p
  );

  return (
    <div style={headerStyle} className={classnames(style['header'], 'info-page-table-header')}>
      {renderHeaderGridCells({ dataSource, columns, rowKey, rowSelection, colsSize, setColsSize, sortRender, defaultSpan })}
    </div>
  );
};

export default Header;
