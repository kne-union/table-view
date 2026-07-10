import React from 'react';
import { Button, Dropdown } from 'antd';
import { CheckOutlined, DownOutlined } from '@ant-design/icons';
import classnames from 'classnames';
import clone from 'lodash/clone';
import { usePopupContainer } from '@kne/responsive-utils';
import { getSortSingle } from '../useSort';
import style from './style.module.scss';

const getColumnTitleText = (title, fallback) => {
  if (typeof title === 'string' || typeof title === 'number') {
    return String(title);
  }
  return fallback;
};

const MobileSortToolbar = ({ columns, sort, setMapSort }) => {
  const getPopupContainer = usePopupContainer();
  const activeEntry = (sort || []).find(item => columns.some(column => column.name === item.name));
  const activeName = activeEntry?.name;
  const activeDirection = activeEntry?.sort;
  const activeColumn = columns.find(column => column.name === activeName);
  const activeTitle = activeColumn ? getColumnTitleText(activeColumn.title, activeColumn.name) : '排序';

  const applySort = (name, direction) => {
    const column = columns.find(item => item.name === name);
    if (!column) {
      return;
    }
    const single = getSortSingle(column.sort);
    setMapSort(sortMap => {
      if (single) {
        return new Map([[name, direction]]);
      }
      const newSort = clone(sortMap);
      newSort.set(name, direction);
      return newSort;
    });
  };

  const clearSort = () => {
    if (!activeName) {
      return;
    }
    const column = columns.find(item => item.name === activeName);
    const single = getSortSingle(column?.sort);
    setMapSort(sortMap => {
      if (single) {
        return new Map();
      }
      const newSort = clone(sortMap);
      newSort.delete(activeName);
      return newSort;
    });
  };

  const handleColumnChange = name => {
    applySort(name, activeName === name && activeEntry?.sort ? activeEntry.sort : 'DESC');
  };

  const handleDirectionChange = direction => {
    if (activeName && activeDirection === direction) {
      clearSort();
      return;
    }
    const targetName = activeName || columns[0]?.name;
    if (!targetName) {
      return;
    }
    applySort(targetName, direction);
  };

  const columnMenuItems = columns.map(column => ({
    key: column.name,
    label: (
      <span className={style['mobile-card-sort-menu-item']}>
        <span className={style['mobile-card-sort-menu-label']}>{getColumnTitleText(column.title, column.name)}</span>
        {activeName === column.name ? <CheckOutlined className={style['mobile-card-sort-menu-check']} /> : null}
      </span>
    ),
    onClick: () => handleColumnChange(column.name)
  }));

  if (activeName) {
    columnMenuItems.push(
      { type: 'divider' },
      {
        key: '__clear__',
        label: (
          <span className={style['mobile-card-sort-menu-item']}>
            <span className={style['mobile-card-sort-menu-label']}>取消排序</span>
          </span>
        ),
        onClick: clearSort
      }
    );
  }

  return (
    <div
      className={style['mobile-card-sort']}
      onClick={event => {
        event.stopPropagation();
      }}
    >
      <Dropdown
        trigger={['click']}
        getPopupContainer={getPopupContainer}
        overlayClassName={style['mobile-card-sort-dropdown']}
        menu={{
          selectable: true,
          selectedKeys: activeName ? [activeName] : [],
          items: columnMenuItems
        }}
      >
        <Button size="small" className={style['mobile-card-sort-field-btn']} icon={<DownOutlined />} iconPosition="end">
          <span className={style['mobile-card-sort-field-text']}>{activeTitle}</span>
        </Button>
      </Dropdown>
      <div className={style['mobile-card-sort-direction']} role="group" aria-label="排序方向">
        <Button
          size="small"
          type="text"
          className={classnames(style['mobile-card-sort-direction-btn'], {
            [style['is-active']]: activeDirection === 'ASC'
          })}
          onClick={() => handleDirectionChange('ASC')}
        >
          升序
        </Button>
        <Button
          size="small"
          type="text"
          className={classnames(style['mobile-card-sort-direction-btn'], {
            [style['is-active']]: activeDirection === 'DESC'
          })}
          onClick={() => handleDirectionChange('DESC')}
        >
          降序
        </Button>
      </div>
    </div>
  );
};

export default MobileSortToolbar;
