import React from 'react';
import ListCell from './ListCell';
import { normalizeListValue } from './list';
import { normalizeTagItem, renderTagItem } from './tagUtils';

const tagList = (value, { column, dataSource } = {}) => {
  const normalized = normalizeListValue(value);
  if (!normalized) {
    return null;
  }

  const renderItem = typeof column?.renderItem === 'function' ? column.renderItem : null;
  const items = normalized.items.filter(item => {
    if (renderItem) {
      return item != null;
    }
    const tag = normalizeTagItem(item);
    return tag && (tag.text != null || tag.children != null);
  });
  if (items.length === 0) {
    return null;
  }

  return <ListCell inline items={items} maxCount={column?.maxCount} renderItem={(item, index) => (renderItem ? renderItem(item, { index, column, dataSource }) : renderTagItem(item))} />;
};

export default tagList;
