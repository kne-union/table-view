import React from 'react';
import { Checkbox } from 'antd';
import style from './style.module.scss';

const MobileCardToolbar = ({ rowSelection, dataSource, getRowKey, mobileSortToolbar, columns }) => {
  const showSelectAll = rowSelection?.type === 'checkbox' && rowSelection.allowSelectedAll;
  const sortNode = typeof mobileSortToolbar === 'function' ? mobileSortToolbar({ columns }) : null;
  const showSort = !!sortNode;

  if (!showSelectAll && !showSort) {
    return null;
  }

  const checkedAll = showSelectAll && (rowSelection.isSelectedAll || (dataSource && dataSource.every(item => rowSelection.selectedRowKeys && rowSelection.selectedRowKeys.indexOf(getRowKey(item)) > -1)));
  const indeterminate = showSelectAll && rowSelection.selectedRowKeys && rowSelection.selectedRowKeys.length > 0 && !checkedAll;

  const handleSelectAllChange = e => {
    const checked = e.target.checked;
    if (typeof rowSelection.onIsSelectAllChange === 'function') {
      rowSelection.onIsSelectAllChange(checked);
      return;
    }
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
  };

  return (
    <div
      className={style['mobile-card-toolbar']}
      onClick={event => {
        event.stopPropagation();
      }}
    >
      <div className={style['mobile-card-toolbar-left']}>
        {showSelectAll ? (
          <>
            <Checkbox checked={!!checkedAll} indeterminate={!!indeterminate} onChange={handleSelectAllChange} />
            <span>全选</span>
          </>
        ) : null}
      </div>
      <div className={style['mobile-card-toolbar-right']}>{sortNode}</div>
    </div>
  );
};

export default MobileCardToolbar;
