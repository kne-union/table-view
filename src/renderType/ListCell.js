import React, { useState } from 'react';
import classnames from 'classnames';
import { DownOutlined } from '@ant-design/icons';
import { useIntl } from '@kne/react-intl';
import withLocale from '../withLocale';
import style from './list.module.scss';

export const DEFAULT_MAX_COUNT = 3;

const resolveMaxCount = maxCount => (Number.isInteger(maxCount) && maxCount > 0 ? maxCount : DEFAULT_MAX_COUNT);

const ListToggle = withLocale(({ expanded, hiddenCount, onToggle }) => {
  const { formatMessage } = useIntl();
  return (
    <span
      role="button"
      tabIndex={0}
      className={classnames(style['list-toggle'], { [style['is-expanded']]: expanded })}
      onClick={e => {
        e.stopPropagation();
        onToggle();
      }}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onToggle();
        }
      }}
    >
      <span>{expanded ? formatMessage({ id: 'ListCollapse' }) : formatMessage({ id: 'ListExpand' }, { count: hiddenCount })}</span>
      <DownOutlined className={style['list-toggle-icon']} />
    </span>
  );
});

const ListCell = ({ items, maxCount, renderItem, inline }) => {
  const [expanded, setExpanded] = useState(false);
  const limit = resolveMaxCount(maxCount);
  const foldable = items.length > limit;
  // 折叠时「展开」占用一个名额：4 条、maxCount 3 → 展示 2 条 + 展开
  const visibleCount = foldable ? Math.max(limit - 1, 1) : items.length;
  const visibleItems = foldable && !expanded ? items.slice(0, visibleCount) : items;

  return (
    <div className={classnames(style['list'], { [style['is-inline']]: inline })}>
      {visibleItems.map((item, index) => (
        <div key={index} className={style['list-item']}>
          {renderItem(item, index)}
        </div>
      ))}
      {foldable ? <ListToggle expanded={expanded} hiddenCount={items.length - visibleCount} onToggle={() => setExpanded(value => !value)} /> : null}
    </div>
  );
};

export default ListCell;
