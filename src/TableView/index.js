import React, { useMemo, useRef, useState } from 'react';
import Header, { renderHeaderGridCells } from './Header';
import MobileCardList from './MobileCardList';
import MobileCardToolbar from './MobileCardToolbar';
import TreeExpandContent from './TreeExpandContent';
import { Checkbox, Empty, Radio } from 'antd';
import classnames from 'classnames';
import get from 'lodash/get';
import computeColumnsValue, { computeDisplay } from '../computeColumnsValue';
import { isEmpty } from '@kne/is-empty';
import { useIsMobile } from '@kne/responsive-utils';
import { getColumnLayout, getGridTemplateColumns, getTreeSelectionColumnWidth, hasColumnSpan, hasColumnWidth } from './columnWidth';
import style from './style.module.scss';
import useSelectedRow from '../useSelectedRow';
import useSort from '../useSort';
import { renderCellContent } from '../renderCellContent';
import { resolveColumns } from '../columnRenderType';
import { isRenderMobileActive, resolveRenderMobile } from '../resolveRenderMobile';
import { collectExpandableKeys, flattenAllTree, flattenVisibleTree, getMaxTreeLevel, getNodeChildren, getTreeBreadcrumbItems, isExpandedKey, isTreeDataType, normalizeTreeData, toggleExpandedKey } from '../treeData';
import { buildTreeKeyMaps, getTreeCheckState, resolveCheckRelation, toggleTreeCheck } from '../treeCheck';

const getLayoutColumns = columns => columns.filter(column => column.display !== false);

const TableView = p => {
  const [colsSize, setColsSize] = useState({});
  const [loadingKeys, setLoadingKeys] = useState(() => new Set());
  const loadedKeysRef = useRef(new Set());
  const isMobile = useIsMobile();
  const props = Object.assign(
    {},
    {
      rowKey: 'id',
      valueIsEmpty: isEmpty,
      placeholder: '-',
      emptyIsPlaceholder: true,
      empty: <Empty />,
      dataType: 'list',
      parentKey: 'parentId',
      childrenKey: 'children',
      hasChildrenKey: 'hasChildren',
      treeTitleKey: 'name',
      defaultExpandedKeys: false,
      indentSize: 16
    },
    p
  );
  const {
    className,
    dataSource,
    columns: columnsProp,
    rowKey,
    rowSelection,
    valueIsEmpty,
    emptyIsPlaceholder,
    placeholder,
    empty,
    onRowSelect,
    render,
    renderMobile,
    context,
    sticky,
    headerStyle,
    sortRender,
    mobileSortToolbar,
    size,
    forceCardRender,
    dataType,
    parentKey,
    childrenKey,
    hasChildrenKey,
    treeTitleKey,
    onLoadChildren,
    expandedKeys: expandedKeysProp,
    defaultExpandedKeys,
    onExpandedKeysChange,
    indentSize,
    ...others
  } = props;

  const isTree = isTreeDataType(dataType);
  const isExpandedControlled = Object.prototype.hasOwnProperty.call(p, 'expandedKeys');
  const [innerExpandedKeys, setInnerExpandedKeys] = useState(defaultExpandedKeys);
  const expandedKeys = isExpandedControlled ? expandedKeysProp : innerExpandedKeys;
  const checkRelation = resolveCheckRelation(rowSelection?.checkRelation, { isTree, selectionType: rowSelection?.type });

  const sizeClassName = size === 'small' ? style['is-size-small'] : size === 'large' ? style['is-size-large'] : null;
  const resolvedRenderMobile = useMemo(() => resolveRenderMobile(renderMobile), [renderMobile]);
  // forceCardRender 可在非移动端强制走卡片渲染（如 PC 卡片模式）
  const useMobileRender = forceCardRender ? resolvedRenderMobile === true || typeof resolvedRenderMobile === 'function' : isRenderMobileActive(renderMobile, isMobile);
  const columns = useMemo(() => resolveColumns(columnsProp), [columnsProp]);
  const layoutColumns = useMemo(() => getLayoutColumns(columns), [columns]);
  const defaultSpan = useMemo(() => {
    const assignedSpan = layoutColumns.reduce((a, b) => a + (b.span || 0), 0);
    const undistributedColCount = layoutColumns.filter(item => !hasColumnSpan(item) && !hasColumnWidth(item)).length;

    return undistributedColCount > 0 ? Math.round(Math.max(24 - assignedSpan, 0) / undistributedColCount) : 1;
  }, [layoutColumns]);

  const treeRows = useMemo(() => {
    if (!isTree) {
      return null;
    }
    const tree = normalizeTreeData(dataSource, { dataType, rowKey, parentKey, childrenKey });
    const allRows = flattenAllTree(tree, { rowKey, childrenKey, hasChildrenKey });
    const displayRows = flattenVisibleTree(tree, { rowKey, childrenKey, hasChildrenKey, expandedKeys });
    const expandableKeys = collectExpandableKeys(tree, { rowKey, childrenKey, hasChildrenKey });
    const treeKeyMaps = buildTreeKeyMaps(tree, { rowKey, childrenKey });
    return { tree, allRows, displayRows, expandableKeys, treeKeyMaps };
  }, [isTree, dataSource, dataType, rowKey, parentKey, childrenKey, hasChildrenKey, expandedKeys]);

  const displayDataSource = useMemo(() => {
    if (!isTree) {
      return dataSource;
    }
    return (treeRows?.displayRows || []).map(row => row.item);
  }, [isTree, dataSource, treeRows]);

  const allDataSource = useMemo(() => {
    if (!isTree) {
      return dataSource;
    }
    return (treeRows?.allRows || []).map(row => row.item);
  }, [isTree, dataSource, treeRows]);

  const displayRowMetaMap = useMemo(() => {
    if (!isTree) {
      return null;
    }
    const map = new Map();
    (treeRows?.displayRows || []).forEach(row => {
      map.set(row.key, row);
    });
    return map;
  }, [isTree, treeRows]);

  const maxLevel = useMemo(() => (isTree ? getMaxTreeLevel(treeRows?.displayRows || []) : 0), [isTree, treeRows]);
  const selectionColumnWidth = useMemo(() => getTreeSelectionColumnWidth({ indentSize, maxLevel, rowSelection, isTree }), [indentSize, maxLevel, rowSelection, isTree]);

  const gridTemplateColumns = useMemo(() => getGridTemplateColumns(layoutColumns, { defaultSpan, colsSize, rowSelection, isTree, indentSize, maxLevel }), [layoutColumns, defaultSpan, colsSize, rowSelection, isTree, indentSize, maxLevel]);

  const handleExpandedChange = nextKeys => {
    if (!isExpandedControlled) {
      setInnerExpandedKeys(nextKeys);
    }
    onExpandedKeysChange && onExpandedKeysChange(nextKeys);
  };

  const clearLoadingKey = key => {
    setLoadingKeys(prev => {
      if (!prev.has(key)) {
        return prev;
      }
      const next = new Set(prev);
      next.delete(key);
      return next;
    });
  };

  const handleToggleExpand = key => {
    const expandableKeys = treeRows?.expandableKeys;
    const wasExpanded = isExpandedKey(expandedKeys, key, expandableKeys);
    const nextKeys = toggleExpandedKey(expandedKeys, key, expandableKeys);
    handleExpandedChange(nextKeys);

    const willExpand = !wasExpanded;
    if (!willExpand || typeof onLoadChildren !== 'function') {
      return;
    }
    const item = treeRows?.treeKeyMaps?.nodeMap.get(key);
    if (!item) {
      return;
    }
    if (get(item, hasChildrenKey) !== true) {
      return;
    }
    if (getNodeChildren(item, childrenKey).length > 0) {
      return;
    }
    if (loadingKeys.has(key) || loadedKeysRef.current.has(key)) {
      return;
    }

    setLoadingKeys(prev => new Set(prev).add(key));
    Promise.resolve(onLoadChildren(item, { key }))
      .catch(() => {})
      .finally(() => {
        loadedKeysRef.current.add(key);
        clearLoadingKey(key);
      });
  };

  const getCheckState = id => {
    if (!isTree || rowSelection?.type !== 'checkbox') {
      const checked = !!(rowSelection?.selectedRowKeys && rowSelection.selectedRowKeys.indexOf(id) > -1);
      return { checked, indeterminate: false };
    }
    return getTreeCheckState(id, rowSelection?.selectedRowKeys, checkRelation, treeRows?.treeKeyMaps);
  };

  const headerCellProps = {
    dataSource: allDataSource,
    columns: layoutColumns,
    rowKey,
    rowSelection,
    colsSize,
    setColsSize,
    sortRender,
    defaultSpan,
    isTree,
    indentSize,
    selectionColumnWidth,
    checkRelation,
    treeKeyMaps: treeRows?.treeKeyMaps
  };

  const header = <Header {...headerCellProps} headerStyle={headerStyle} />;

  const handleRowClick = (item, { dataSource: rowDataSource, context: rowContext, id, isChecked }) => {
    if (item.disabled) {
      return;
    }
    onRowSelect && onRowSelect(item, { columns: layoutColumns, dataSource: rowDataSource });
    if (!rowSelection || rowSelection.isSelectedAll) {
      return;
    }
    if (rowSelection.type === 'checkbox') {
      if (isTree && treeRows?.treeKeyMaps) {
        const nextKeys = toggleTreeCheck({
          key: id,
          checked: !isChecked,
          selectedKeys: rowSelection.selectedRowKeys || [],
          mode: checkRelation,
          maps: treeRows.treeKeyMaps
        });
        rowSelection.onChange(nextKeys, id, { context: rowContext, checked: !isChecked });
        return;
      }
      const selectedRowKeys = (rowSelection.selectedRowKeys || []).slice(0);
      isChecked ? selectedRowKeys.splice(rowSelection.selectedRowKeys.indexOf(id), 1) : selectedRowKeys.push(id);
      rowSelection.onChange(selectedRowKeys, id, { context: rowContext, checked: !isChecked });
      return;
    }
    const selectedRowKeys = rowSelection.selectedRowKeys.length && rowSelection.selectedRowKeys[0] === id ? [] : [id];
    rowSelection.onChange(selectedRowKeys, id, { context: rowContext, checked: !isChecked });
  };

  const getRowKey = item => get(item, typeof rowKey === 'function' ? rowKey(item) : rowKey);

  const renderSelectionControl = (item, { id, isChecked, indeterminate, onSelectionChange }) => {
    if (rowSelection?.type === 'checkbox') {
      return (
        <Checkbox disabled={item.disabled || rowSelection.isSelectedAll} checked={(rowSelection.isSelectedAll && !item.disabled) || isChecked} indeterminate={!rowSelection.isSelectedAll && !!indeterminate} onChange={onSelectionChange} />
      );
    }
    if (rowSelection?.type === 'radio') {
      return <Radio disabled={item.disabled} checked={isChecked} onChange={onSelectionChange} />;
    }
    return null;
  };

  const renderTreeSelectionCell = (item, meta, { id, isChecked, indeterminate, onSelectionChange }) => {
    const selection = renderSelectionControl(item, { id, isChecked, indeterminate, onSelectionChange });
    if (!isTree) {
      if (!selection) {
        return null;
      }
      return (
        <div key={`${id}__selection__`} style={{ '--selection-col-width': `${selectionColumnWidth}px` }} className={classnames(style['col'], style['col-selection'], 'info-page-table-col')}>
          <span className={classnames(style['col-content'], 'info-page-table-col-content')}>{selection}</span>
        </div>
      );
    }

    return (
      <div key={`${id}__selection__`} style={{ '--selection-col-width': `${selectionColumnWidth}px` }} className={classnames(style['col'], style['col-selection'], 'info-page-table-col')}>
        <TreeExpandContent level={meta?.level || 0} indentSize={indentSize} hasChildren={!!meta?.hasChildren} expanded={!!meta?.expanded} loading={loadingKeys.has(id)} onExpand={() => handleToggleExpand(id)} selection={selection} />
      </div>
    );
  };

  const renderBodyGridCells = (nextDataSource, nextContext) => {
    if (!nextDataSource || nextDataSource.length === 0) {
      return null;
    }

    return nextDataSource.map(item => {
      const id = getRowKey(item);
      const meta = displayRowMetaMap?.get(id);
      const { checked: isChecked, indeterminate } = getCheckState(id);
      const columnsValue = computeColumnsValue({ columns: layoutColumns, emptyIsPlaceholder, valueIsEmpty, removeEmpty: true, dataSource: item, placeholder, context: nextContext });
      const columnMap = columnsValue.reduce((result, column) => Object.assign(result, { [column.name]: column }), {});
      const rowClassName = classnames(style['body'], style['body-cell'], style['body-row'], 'info-page-table-row', {
        [style['is-selected-all']]: rowSelection?.isSelectedAll,
        [style['is-selected']]: isChecked,
        [style['is-disabled']]: item.disabled,
        [style['is-tree-child']]: isTree && meta && meta.level > 0
      });
      const onSelectionChange = () => handleRowClick(item, { dataSource: nextDataSource, context: nextContext, id, isChecked });
      const cells = [];
      const selectionCell = renderTreeSelectionCell(item, meta, { id, isChecked, indeterminate, onSelectionChange });
      if (selectionCell) {
        cells.push(selectionCell);
      }

      layoutColumns.forEach((column, index) => {
        const columnValue = columnMap[column.name];
        const {
          widthBased,
          fillRemaining,
          style: columnStyle
        } = getColumnLayout(column, {
          defaultSpan,
          colsSize,
          isLastColumn: index === layoutColumns.length - 1,
          columns: layoutColumns
        });

        cells.push(
          <div key={`${id}-${column.name}`} style={columnStyle} className={classnames(style['col'], fillRemaining ? style['col-width-fill'] : widthBased && style['col-width-based'], 'info-page-table-col')}>
            {columnValue ? renderCellContent(computeDisplay({ column: columnValue, placeholder, dataSource: item, context: nextContext }), columnValue, style['col-content']) : <span className={style['col-content']} />}
          </div>
        );
      });

      return (
        <div key={id} className={rowClassName}>
          {cells}
        </div>
      );
    });
  };

  const renderGrid = (nextDataSource, nextContext) => (
    <div className={style['grid']} style={{ gridTemplateColumns }}>
      {renderHeaderGridCells(headerCellProps)}
      {renderBodyGridCells(nextDataSource, nextContext)}
    </div>
  );

  const getSelectionProps = item => {
    const id = getRowKey(item);
    const { checked: isChecked, indeterminate } = getCheckState(id);
    return {
      checked: (rowSelection?.isSelectedAll && !item.disabled) || isChecked,
      indeterminate: !rowSelection?.isSelectedAll && !!indeterminate,
      disabled: !!(item.disabled || rowSelection?.isSelectedAll),
      onChange: () => handleRowClick(item, { dataSource: allDataSource, context, id, isChecked })
    };
  };

  const getTreeTitleValue = item => {
    if (!item) {
      return '';
    }
    if (typeof treeTitleKey === 'function') {
      return treeTitleKey(item);
    }
    const value = get(item, treeTitleKey || 'name');
    return value == null ? '' : String(value);
  };

  const getTreeRowMeta = item => {
    const id = getRowKey(item);
    return displayRowMetaMap?.get(id) || null;
  };

  const getBreadcrumb = item => {
    const id = getRowKey(item);
    return getTreeBreadcrumbItems(id, treeRows?.treeKeyMaps)
      .map(node => getTreeTitleValue(node))
      .filter(Boolean);
  };

  const isExpandLoading = item => loadingKeys.has(getRowKey(item));

  const renderToolbar = (nextDataSource = allDataSource) => (
    <MobileCardToolbar rowSelection={rowSelection} dataSource={nextDataSource} getRowKey={getRowKey} mobileSortToolbar={mobileSortToolbar} columns={layoutColumns} checkRelation={checkRelation} treeKeyMaps={treeRows?.treeKeyMaps} />
  );

  const renderMobileCardBody = (nextDataSource = displayDataSource, nextContext = context) => {
    if (!nextDataSource || nextDataSource.length === 0) {
      return <div className={style['empty']}>{empty}</div>;
    }

    return (
      <MobileCardList
        dataSource={nextDataSource}
        columns={layoutColumns}
        rowKey={rowKey}
        rowSelection={rowSelection}
        valueIsEmpty={valueIsEmpty}
        emptyIsPlaceholder={emptyIsPlaceholder}
        placeholder={placeholder}
        context={nextContext}
        onRowSelect={onRowSelect}
        onSelectionChange={handleRowClick}
        toolbar={renderToolbar(allDataSource)}
        isTree={isTree}
        indentSize={indentSize}
        rowMetaMap={displayRowMetaMap}
        onToggleExpand={handleToggleExpand}
        getCheckState={getCheckState}
        loadingKeys={loadingKeys}
        treeKeyMaps={treeRows?.treeKeyMaps}
        treeTitleKey={treeTitleKey}
      />
    );
  };

  const renderBody = (nextDataSource = displayDataSource, nextContext = context) => {
    if (!nextDataSource || nextDataSource.length === 0) {
      return <div className={style['empty']}>{empty}</div>;
    }

    return <div className={classnames('info-page-table-body')}>{renderGrid(nextDataSource, nextContext)}</div>;
  };

  if (useMobileRender) {
    if (typeof resolvedRenderMobile === 'function') {
      return (
        <div className={classnames(style['is-mobile-render'], 'info-page-table', sizeClassName, className)}>
          {resolvedRenderMobile({
            ...others,
            header: null,
            renderBody: renderMobileCardBody,
            renderToolbar,
            dataSource,
            displayDataSource,
            columns: layoutColumns,
            rowKey,
            rowSelection,
            context,
            empty,
            isTree,
            getRowKey,
            getSelectionProps,
            getTreeRowMeta,
            getBreadcrumb,
            isExpandLoading,
            onToggleExpand: handleToggleExpand,
            onSelectionChange: handleRowClick
          })}
        </div>
      );
    }

    return (
      <div {...others} className={classnames(style['table'], style['tableView'], style['is-mobile-card'], style['is-mobile-render'], 'info-page-table', sizeClassName, className)}>
        {renderMobileCardBody(displayDataSource, context)}
      </div>
    );
  }

  if (typeof render === 'function') {
    return (
      <div {...others} className={classnames(style['table'], style['tableView'], 'info-page-table', sizeClassName, className)}>
        {render({ header, renderBody })}
      </div>
    );
  }

  return (
    <div {...others} className={classnames(style['table'], style['tableView'], 'info-page-table', sizeClassName, className)}>
      {displayDataSource && displayDataSource.length > 0 ? (
        renderGrid(displayDataSource, context)
      ) : (
        <>
          <div className={style['grid']} style={{ gridTemplateColumns }}>
            {renderHeaderGridCells(headerCellProps)}
          </div>
          <div className={style['empty']}>{empty}</div>
        </>
      )}
    </div>
  );
};

TableView.Header = Header;
TableView.useSelectedRow = useSelectedRow;
TableView.useSort = useSort;
TableView.sortDataSource = useSort.sortDataSource;
export default TableView;
