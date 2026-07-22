import { getNodeChildren, getRowKeyValue } from './treeData';

export const CHECK_RELATION = {
  PARENT: 'parent',
  ALL: 'all',
  INDEPENDENT: 'independent'
};

export const resolveCheckRelation = (checkRelation, { isTree, selectionType } = {}) => {
  if (!isTree || selectionType !== 'checkbox') {
    return CHECK_RELATION.INDEPENDENT;
  }
  if (checkRelation === CHECK_RELATION.ALL || checkRelation === CHECK_RELATION.INDEPENDENT) {
    return checkRelation;
  }
  return CHECK_RELATION.PARENT;
};

export const buildTreeKeyMaps = (tree, { rowKey = 'id', childrenKey = 'children' } = {}) => {
  const nodeMap = new Map();
  const parentMap = new Map();
  const childrenMap = new Map();
  const descendantCache = new Map();
  const rootKeys = [];
  const allKeys = [];

  const walk = (nodes, parentKey = null) => {
    (nodes || []).forEach(item => {
      const key = getRowKeyValue(item, rowKey);
      const children = getNodeChildren(item, childrenKey);
      const childKeys = children.map(child => getRowKeyValue(child, rowKey));
      nodeMap.set(key, item);
      parentMap.set(key, parentKey);
      childrenMap.set(key, childKeys);
      allKeys.push(key);
      if (parentKey == null) {
        rootKeys.push(key);
      }
      walk(children, key);
    });
  };

  walk(tree);

  const getDescendantKeys = key => {
    if (descendantCache.has(key)) {
      return descendantCache.get(key);
    }
    const result = [];
    const collect = current => {
      (childrenMap.get(current) || []).forEach(childKey => {
        result.push(childKey);
        collect(childKey);
      });
    };
    collect(key);
    descendantCache.set(key, result);
    return result;
  };

  const getAncestorKeys = key => {
    const ancestors = [];
    let current = parentMap.get(key);
    while (current != null) {
      ancestors.push(current);
      current = parentMap.get(current);
    }
    return ancestors;
  };

  return {
    nodeMap,
    parentMap,
    childrenMap,
    rootKeys,
    getDescendantKeys,
    getAncestorKeys,
    allKeys
  };
};

const keySetOf = keys => new Set(keys || []);

const isCoveredByAncestor = (key, selectedSet, maps) => maps.getAncestorKeys(key).some(ancestor => selectedSet.has(ancestor));

const isEffectivelySelected = (key, selectedSet, maps) => selectedSet.has(key) || isCoveredByAncestor(key, selectedSet, maps);

const isSubtreeFullySelected = (key, selectedSet, maps, mode) => {
  if (mode === CHECK_RELATION.PARENT) {
    return isEffectivelySelected(key, selectedSet, maps);
  }
  if (!selectedSet.has(key)) {
    return false;
  }
  return maps.getDescendantKeys(key).every(descendant => selectedSet.has(descendant));
};

const hasEffectiveSelectedDescendant = (key, selectedSet, maps, mode) => {
  const descendants = maps.getDescendantKeys(key);
  if (descendants.length === 0) {
    return false;
  }
  if (mode === CHECK_RELATION.PARENT) {
    return descendants.some(descendant => isEffectivelySelected(descendant, selectedSet, maps));
  }
  return descendants.some(descendant => selectedSet.has(descendant));
};

const formatKeys = (set, preferredOrder) => {
  if (preferredOrder && preferredOrder.length) {
    return preferredOrder.filter(key => set.has(key));
  }
  return Array.from(set);
};

/** parent 模式：折叠全选子树为父 key，并去掉被父覆盖的子孙 */
export const normalizeParentKeys = (keys, maps) => {
  const selectedSet = keySetOf(keys);
  if (selectedSet.size === 0 || !maps) {
    return [];
  }

  const expanded = new Set();
  selectedSet.forEach(key => {
    if (!maps.nodeMap.has(key)) {
      return;
    }
    if (!isCoveredByAncestor(key, selectedSet, maps)) {
      expanded.add(key);
    }
  });

  // 子孙多的先处理，便于自底向上折叠
  const keysByDepth = maps.allKeys.slice().sort((a, b) => maps.getDescendantKeys(b).length - maps.getDescendantKeys(a).length);

  keysByDepth.forEach(key => {
    const childKeys = maps.childrenMap.get(key) || [];
    if (childKeys.length === 0) {
      return;
    }
    const allChildrenSelected = childKeys.every(childKey => isEffectivelySelected(childKey, expanded, maps));
    if (!allChildrenSelected) {
      return;
    }
    childKeys.forEach(childKey => {
      expanded.delete(childKey);
      maps.getDescendantKeys(childKey).forEach(descendant => expanded.delete(descendant));
    });
    expanded.add(key);
  });

  const result = [];
  expanded.forEach(key => {
    if (!isCoveredByAncestor(key, expanded, maps)) {
      result.push(key);
    }
  });
  return formatKeys(keySetOf(result), maps.allKeys);
};

const getPathFromAncestorToNode = (ancestorKey, nodeKey, maps) => {
  const chain = [];
  let cursor = nodeKey;
  while (cursor != null && cursor !== ancestorKey) {
    chain.unshift(cursor);
    cursor = maps.parentMap.get(cursor);
  }
  if (cursor !== ancestorKey) {
    return null;
  }
  chain.unshift(ancestorKey);
  return chain;
};

const uncheckUnderAncestorParentMode = (targetKey, selectedSet, maps) => {
  const coveringAncestor = maps.getAncestorKeys(targetKey).find(ancestor => selectedSet.has(ancestor));
  if (!coveringAncestor) {
    selectedSet.delete(targetKey);
    return;
  }

  selectedSet.delete(coveringAncestor);

  const chain = getPathFromAncestorToNode(coveringAncestor, targetKey, maps);
  if (!chain) {
    return;
  }

  for (let i = 0; i < chain.length - 1; i += 1) {
    const parentKey = chain[i];
    const nextKey = chain[i + 1];
    (maps.childrenMap.get(parentKey) || []).forEach(childKey => {
      if (childKey !== nextKey) {
        selectedSet.add(childKey);
      }
    });
  }
};

const checkNodeParentMode = (key, selectedSet, maps) => {
  selectedSet.add(key);
  maps.getDescendantKeys(key).forEach(descendant => selectedSet.delete(descendant));
};

const fillAncestorsAllMode = (key, selectedSet, maps) => {
  let parentKey = maps.parentMap.get(key);
  while (parentKey != null) {
    const siblings = maps.childrenMap.get(parentKey) || [];
    const allChildrenFullySelected = siblings.every(sibling => isSubtreeFullySelected(sibling, selectedSet, maps, CHECK_RELATION.ALL));
    if (!allChildrenFullySelected) {
      break;
    }
    selectedSet.add(parentKey);
    parentKey = maps.parentMap.get(parentKey);
  }
};

const clearAncestorsAllMode = (key, selectedSet, maps) => {
  maps.getAncestorKeys(key).forEach(ancestor => selectedSet.delete(ancestor));
};

export const toggleTreeCheck = ({ key, checked, selectedKeys, mode = CHECK_RELATION.PARENT, maps }) => {
  if (!maps) {
    return selectedKeys || [];
  }

  if (mode === CHECK_RELATION.INDEPENDENT) {
    const next = keySetOf(selectedKeys);
    if (checked) {
      next.add(key);
    } else {
      next.delete(key);
    }
    return formatKeys(next, maps.allKeys);
  }

  const selectedSet = keySetOf(selectedKeys);

  if (mode === CHECK_RELATION.ALL) {
    if (checked) {
      selectedSet.add(key);
      maps.getDescendantKeys(key).forEach(descendant => selectedSet.add(descendant));
      fillAncestorsAllMode(key, selectedSet, maps);
    } else {
      selectedSet.delete(key);
      maps.getDescendantKeys(key).forEach(descendant => selectedSet.delete(descendant));
      clearAncestorsAllMode(key, selectedSet, maps);
    }
    return formatKeys(selectedSet, maps.allKeys);
  }

  // parent mode
  if (checked) {
    checkNodeParentMode(key, selectedSet, maps);
    return normalizeParentKeys(Array.from(selectedSet), maps);
  }

  if (isCoveredByAncestor(key, selectedSet, maps)) {
    uncheckUnderAncestorParentMode(key, selectedSet, maps);
  } else {
    selectedSet.delete(key);
  }
  return normalizeParentKeys(Array.from(selectedSet), maps);
};

export const getTreeCheckState = (key, selectedKeys, mode = CHECK_RELATION.PARENT, maps) => {
  if (!maps || mode === CHECK_RELATION.INDEPENDENT) {
    const checked = !!(selectedKeys && selectedKeys.indexOf(key) > -1);
    return { checked, indeterminate: false };
  }

  const selectedSet = keySetOf(selectedKeys);

  if (mode === CHECK_RELATION.ALL) {
    const checked = selectedSet.has(key);
    if (checked) {
      return { checked: true, indeterminate: false };
    }
    const indeterminate = hasEffectiveSelectedDescendant(key, selectedSet, maps, mode);
    return { checked: false, indeterminate };
  }

  const checked = isEffectivelySelected(key, selectedSet, maps);
  if (checked) {
    return { checked: true, indeterminate: false };
  }
  const indeterminate = hasEffectiveSelectedDescendant(key, selectedSet, maps, mode);
  return { checked: false, indeterminate };
};

export const buildSelectAllKeys = ({ mode, maps, existingKeys = [] }) => {
  if (!maps) {
    return existingKeys.slice();
  }
  if (mode === CHECK_RELATION.PARENT) {
    const merged = keySetOf(existingKeys);
    maps.rootKeys.forEach(key => {
      merged.add(key);
      maps.getDescendantKeys(key).forEach(descendant => merged.delete(descendant));
    });
    return normalizeParentKeys(Array.from(merged), maps);
  }
  const merged = keySetOf(existingKeys);
  maps.allKeys.forEach(key => merged.add(key));
  return formatKeys(merged, maps.allKeys);
};

export const buildClearSelectAllKeys = ({ maps, existingKeys = [] }) => {
  if (!maps) {
    return [];
  }
  const pageKeySet = keySetOf(maps.allKeys);
  return (existingKeys || []).filter(key => !pageKeySet.has(key));
};

export const isAllTreeSelected = ({ mode, maps, selectedKeys }) => {
  if (!maps || maps.allKeys.length === 0) {
    return false;
  }
  const selectedSet = keySetOf(selectedKeys);
  if (mode === CHECK_RELATION.PARENT) {
    return maps.rootKeys.every(key => isEffectivelySelected(key, selectedSet, maps));
  }
  return maps.allKeys.every(key => selectedSet.has(key));
};

export const hasAnyTreeSelected = ({ mode, maps, selectedKeys }) => {
  if (!maps || !selectedKeys || selectedKeys.length === 0) {
    return false;
  }
  const selectedSet = keySetOf(selectedKeys);
  if (mode === CHECK_RELATION.PARENT) {
    return maps.allKeys.some(key => isEffectivelySelected(key, selectedSet, maps));
  }
  return maps.allKeys.some(key => selectedSet.has(key));
};
