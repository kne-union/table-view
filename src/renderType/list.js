import React from 'react';
import Ellipsis from '../Ellipsis';
import ListCell from './ListCell';

export const normalizeListValue = value => {
  if (Array.isArray(value)) {
    return { items: value, split: undefined };
  }
  if (value && typeof value === 'object') {
    const items = value.items ?? value.list ?? value.value;
    if (Array.isArray(items)) {
      return { items, split: value.split };
    }
  }
  return null;
};

const getListItemText = item => {
  if (item == null) {
    return null;
  }
  if (typeof item === 'object') {
    return item.text ?? item.label ?? item.children ?? item.value;
  }
  return item;
};

const isEmptyText = text => text == null || text === '';

const list = (value, { column, dataSource } = {}) => {
  const normalized = normalizeListValue(value);
  if (!normalized) {
    return value == null ? null : value;
  }

  const ellipsis = column?.ellipsis ?? true;
  const split = normalized.split ?? column?.split;

  // 兼容旧用法：显式传 split 时仍拼接为一行文本
  if (split != null) {
    const text = normalized.items
      .map(getListItemText)
      .filter(item => !isEmptyText(item))
      .join(split);
    return text ? <Ellipsis ellipsis={ellipsis}>{text}</Ellipsis> : null;
  }

  const renderItem = typeof column?.renderItem === 'function' ? column.renderItem : null;
  const items = renderItem ? normalized.items.filter(item => item != null) : normalized.items.filter(item => !isEmptyText(getListItemText(item)));
  if (items.length === 0) {
    return null;
  }

  return <ListCell items={items} maxCount={column?.maxCount} renderItem={(item, index) => (renderItem ? renderItem(item, { index, column, dataSource }) : <Ellipsis ellipsis={ellipsis}>{getListItemText(item)}</Ellipsis>)} />;
};

export default list;
