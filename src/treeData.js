import get from 'lodash/get';

export const isTreeDataType = dataType => dataType === 'tree' || dataType === 'treeList';

export const isEmptyParentKey = value => value == null || value === '';

export const getRowKeyValue = (item, rowKey) => get(item, typeof rowKey === 'function' ? rowKey(item) : rowKey);

export const getNodeChildren = (item, childrenKey = 'children') => {
  const children = get(item, childrenKey);
  return Array.isArray(children) ? children : [];
};

export const nodeCanExpand = (item, { childrenKey = 'children', hasChildrenKey = 'hasChildren' } = {}) => {
  const children = getNodeChildren(item, childrenKey);
  if (children.length > 0) {
    return true;
  }
  return get(item, hasChildrenKey) === true;
};

export const hasLoadedChildren = (item, { childrenKey = 'children' } = {}) => Array.isArray(get(item, childrenKey));

export const buildTreeFromList = (list = [], { rowKey = 'id', parentKey = 'parentId', childrenKey = 'children' } = {}) => {
  const nodes = (list || []).map(item => Object.assign({}, item, { [childrenKey]: [] }));
  const nodeMap = new Map();
  nodes.forEach(node => {
    nodeMap.set(getRowKeyValue(node, rowKey), node);
  });

  const roots = [];
  nodes.forEach(node => {
    const parentId = get(node, parentKey);
    if (isEmptyParentKey(parentId)) {
      roots.push(node);
      return;
    }
    const parent = nodeMap.get(parentId);
    if (parent) {
      parent[childrenKey].push(node);
    } else {
      roots.push(node);
    }
  });

  return roots;
};

export const normalizeTreeData = (dataSource, { dataType = 'list', rowKey = 'id', parentKey = 'parentId', childrenKey = 'children' } = {}) => {
  if (!isTreeDataType(dataType) || !dataSource) {
    return dataSource || [];
  }
  if (dataType === 'treeList') {
    return buildTreeFromList(dataSource, { rowKey, parentKey, childrenKey });
  }
  return dataSource;
};

const walkTree = (nodes, { rowKey, childrenKey, hasChildrenKey = 'hasChildren', level = 0, visitChildren, onNode }) => {
  (nodes || []).forEach(item => {
    const key = getRowKeyValue(item, rowKey);
    const children = getNodeChildren(item, childrenKey);
    const hasChildren = nodeCanExpand(item, { childrenKey, hasChildrenKey });
    const shouldVisitChildren = children.length > 0 && visitChildren(item, { key, level, hasChildren, children });
    onNode({ item, key, level, hasChildren, children, expanded: !!shouldVisitChildren });
    if (shouldVisitChildren) {
      walkTree(children, { rowKey, childrenKey, hasChildrenKey, level: level + 1, visitChildren, onNode });
    }
  });
};

export const collectExpandableKeys = (tree, { rowKey = 'id', childrenKey = 'children', hasChildrenKey = 'hasChildren' } = {}) => {
  const keys = [];
  walkTree(tree, {
    rowKey,
    childrenKey,
    hasChildrenKey,
    visitChildren: () => true,
    onNode: ({ key, hasChildren }) => {
      if (hasChildren) {
        keys.push(key);
      }
    }
  });
  return keys;
};

export const isExpandedKey = (expandedKeys, key, expandableKeys) => {
  if (expandedKeys === true) {
    return true;
  }
  if (expandedKeys === false || expandedKeys == null) {
    return false;
  }
  if (!Array.isArray(expandedKeys)) {
    return false;
  }
  if (expandableKeys && expandedKeys.length === expandableKeys.length && expandableKeys.every(item => expandedKeys.indexOf(item) > -1)) {
    return expandedKeys.indexOf(key) > -1;
  }
  return expandedKeys.indexOf(key) > -1;
};

export const flattenAllTree = (tree, { rowKey = 'id', childrenKey = 'children', hasChildrenKey = 'hasChildren' } = {}) => {
  const rows = [];
  walkTree(tree, {
    rowKey,
    childrenKey,
    hasChildrenKey,
    visitChildren: () => true,
    onNode: ({ item, key, level, hasChildren }) => {
      rows.push({ item, key, level, hasChildren, expanded: hasChildren });
    }
  });
  return rows;
};

export const flattenVisibleTree = (tree, { rowKey = 'id', childrenKey = 'children', hasChildrenKey = 'hasChildren', expandedKeys = false } = {}) => {
  const expandableKeys = expandedKeys === true ? null : collectExpandableKeys(tree, { rowKey, childrenKey, hasChildrenKey });
  const rows = [];
  walkTree(tree, {
    rowKey,
    childrenKey,
    hasChildrenKey,
    visitChildren: (_item, { key, hasChildren }) => hasChildren && isExpandedKey(expandedKeys, key, expandableKeys),
    onNode: ({ item, key, level, hasChildren, expanded }) => {
      rows.push({ item, key, level, hasChildren, expanded: !!(hasChildren && expanded) });
    }
  });
  return rows;
};

export const getMaxTreeLevel = (rows = []) => rows.reduce((max, row) => Math.max(max, row.level || 0), 0);

/** 返回从根到当前节点（含自身）的节点列表，用于移动端面包屑 */
export const getTreeBreadcrumbItems = (key, maps) => {
  if (!maps || key == null) {
    return [];
  }
  const ancestorKeys = maps.getAncestorKeys(key).slice().reverse();
  const pathKeys = [...ancestorKeys, key];
  return pathKeys.map(pathKey => maps.nodeMap.get(pathKey)).filter(Boolean);
};

export const toggleExpandedKey = (expandedKeys, key, expandableKeys) => {
  if (expandedKeys === true) {
    return (expandableKeys || []).filter(item => item !== key);
  }
  if (expandedKeys === false || expandedKeys == null) {
    return [key];
  }
  const current = Array.isArray(expandedKeys) ? expandedKeys.slice() : [];
  const index = current.indexOf(key);
  if (index > -1) {
    current.splice(index, 1);
    return current;
  }
  current.push(key);
  if (expandableKeys && current.length === expandableKeys.length && expandableKeys.every(item => current.indexOf(item) > -1)) {
    return true;
  }
  return current;
};

const mapTreeNodes = (nodes, { rowKey, childrenKey, parentKeyValue, children, hasChildrenKey }) =>
  (nodes || []).map(item => {
    const key = getRowKeyValue(item, rowKey);
    const nextChildren = getNodeChildren(item, childrenKey);
    if (key === parentKeyValue) {
      const list = Array.isArray(children) ? children : [];
      return Object.assign({}, item, {
        [childrenKey]: list,
        [hasChildrenKey]: list.length > 0
      });
    }
    if (nextChildren.length === 0) {
      return item;
    }
    return Object.assign({}, item, {
      [childrenKey]: mapTreeNodes(nextChildren, { rowKey, childrenKey, parentKeyValue, children, hasChildrenKey })
    });
  });

/**
 * 将懒加载得到的子节点合并进 dataSource（不可变）。
 * tree：挂到父节点 children；treeList：按 rowKey upsert 扁平列表并补 parentKey。
 */
export const mergeTreeChildren = (dataSource = [], children = [], options = {}) => {
  const { parentKeyValue, dataType = 'tree', rowKey = 'id', parentKey = 'parentId', childrenKey = 'children', hasChildrenKey = 'hasChildren' } = options;
  const childList = Array.isArray(children) ? children : [];

  if (dataType === 'treeList') {
    const childKeySet = new Set(childList.map(item => getRowKeyValue(item, rowKey)));
    const nextChildren = childList.map(item => {
      const next = Object.assign({}, item);
      if (isEmptyParentKey(get(next, parentKey))) {
        next[parentKey] = parentKeyValue;
      }
      return next;
    });
    const childMap = new Map(nextChildren.map(item => [getRowKeyValue(item, rowKey), item]));
    const result = [];
    const seen = new Set();

    (dataSource || []).forEach(item => {
      const key = getRowKeyValue(item, rowKey);
      if (key === parentKeyValue) {
        result.push(
          Object.assign({}, item, {
            [hasChildrenKey]: childList.length > 0
          })
        );
        seen.add(key);
        return;
      }
      if (childKeySet.has(key)) {
        result.push(childMap.get(key));
        seen.add(key);
        return;
      }
      result.push(item);
      seen.add(key);
    });

    nextChildren.forEach(item => {
      const key = getRowKeyValue(item, rowKey);
      if (!seen.has(key)) {
        result.push(item);
        seen.add(key);
      }
    });

    return result;
  }

  return mapTreeNodes(dataSource, { rowKey, childrenKey, parentKeyValue, children: childList, hasChildrenKey });
};
