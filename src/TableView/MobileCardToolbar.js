import React from 'react';
import { Checkbox } from 'antd';
import style from './style.module.scss';

const MobileCardToolbar = ({ rowSelection, dataSource, getId, mobileSortToolbar, columns }) => {
  const showSelectAll = rowSelection?.type === 'checkbox' && rowSelection.allowSelectedAll;
  const sortNode = typeof mobileSortToolbar === 'function' ? mobileSortToolbar({ columns }) : null;
  const showSort = !!sortNode;

  if (!showSelectAll && !showSort) {
    return null;
  }

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
