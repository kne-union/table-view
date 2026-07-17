import React from 'react';
import { Button, Dropdown } from 'antd';
import { CaretDownOutlined, CaretUpOutlined, CheckOutlined, DownOutlined } from '@ant-design/icons';
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

  // 与 PC 端 sortRender 一致：DESC -> ASC -> 取消
  const handleDirectionCycle = () => {
    if (activeName) {
      if (activeDirection === 'DESC') {
        applySort(activeName, 'ASC');
        return;
      }
      if (activeDirection === 'ASC') {
        clearSort();
        return;
      }
    }
    const targetName = activeName || columns[0]?.name;
    if (!targetName) {
      return;
    }
    applySort(targetName, 'DESC');
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
      <span className={style['mobile-card-sort-direction']} role="button" aria-label="排序方向" onClick={handleDirectionCycle}>
        <CaretUpOutlined
          className={classnames(style['mobile-card-sort-icon'], style['mobile-card-sort-icon-up'], {
            [style['is-active']]: activeDirection === 'ASC'
          })}
        />
        <CaretDownOutlined
          className={classnames(style['mobile-card-sort-icon'], style['mobile-card-sort-icon-down'], {
            [style['is-active']]: activeDirection === 'DESC'
          })}
        />
      </span>
    </div>
  );
};

export default MobileSortToolbar;
