import { resolveColumnDimensions } from '../columnRenderType';

export const SELECTION_CHECKBOX_WIDTH = 48;
export const SELECTION_RADIO_WIDTH = 48;
export const TREE_EXPAND_ICON_WIDTH = 18;
export const TREE_SELECTION_CONTROL_WIDTH = 16;
export const TREE_SELECTION_GAP = 4;
export const TREE_SELECTION_INLINE_PADDING = 8;

export const getTreeSelectionColumnWidth = ({ indentSize = 16, maxLevel = 0, rowSelection, isTree } = {}) => {
  if (!isTree) {
    if (rowSelection?.type === 'checkbox') {
      return SELECTION_CHECKBOX_WIDTH;
    }
    if (rowSelection?.type === 'radio') {
      return SELECTION_RADIO_WIDTH;
    }
    return 0;
  }
  // 紧凑宽度：缩进 + 三角(18) +（有勾选时）间距 + 勾选控件 + 左右 padding
  const hasSelection = rowSelection?.type === 'checkbox' || rowSelection?.type === 'radio';
  const selectionExtra = hasSelection ? TREE_SELECTION_GAP + TREE_SELECTION_CONTROL_WIDTH : 0;
  return indentSize * maxLevel + TREE_EXPAND_ICON_WIDTH + selectionExtra + TREE_SELECTION_INLINE_PADDING;
};

export const parseColumnWidth = width => {
  if (width == null) {
    return 0;
  }
  if (typeof width === 'number' && !Number.isNaN(width)) {
    return width;
  }
  if (typeof width === 'string') {
    const trimmed = width.trim();
    const pxMatch = trimmed.match(/^([\d.]+)px$/i);
    if (pxMatch) {
      return parseFloat(pxMatch[1]);
    }
    const num = parseFloat(trimmed);
    if (!Number.isNaN(num)) {
      return num;
    }
  }
  return 0;
};

export const getResolvedColumnWidth = column => resolveColumnDimensions(column).width;

export const hasColumnSpan = column => column.span != null;

export const getConfiguredColumnWidthPx = column => parseColumnWidth(column.width != null ? column.width : getResolvedColumnWidth(column));

export const hasColumnWidth = column => {
  if (hasColumnSpan(column)) {
    return false;
  }
  return getConfiguredColumnWidthPx(column) > 0;
};

export const shouldLastColumnFillRemaining = columns => !columns.some(hasColumnSpan) && columns.every(column => hasColumnWidth(column));

export const getColumnWidthPx = (column, colsSize = {}) => {
  const configured = getConfiguredColumnWidthPx(column);
  if (configured > 0) {
    return configured;
  }
  return colsSize[column.name] || 0;
};

export const formatColumnWidthPx = px => `${px}px`;

export const getColumnTrackSize = (column, { defaultSpan, colsSize, isLastColumn, columns } = {}) => {
  const widthPx = getColumnWidthPx(column, colsSize);
  if (hasColumnWidth(column)) {
    if (isLastColumn && shouldLastColumnFillRemaining(columns)) {
      return `minmax(${widthPx}px, 1fr)`;
    }
    return `${widthPx}px`;
  }
  const span = hasColumnSpan(column) ? column.span : (defaultSpan ?? 1);
  const minWidth = colsSize[column.name] || 0;
  return minWidth > 0 ? `minmax(${minWidth}px, ${span}fr)` : `minmax(0, ${span}fr)`;
};

export const getGridTemplateColumns = (columns, { defaultSpan, colsSize, rowSelection, isTree, indentSize, maxLevel } = {}) => {
  const tracks = [];
  const lastColumnIndex = columns.length - 1;
  const treeSelectionWidth = getTreeSelectionColumnWidth({ indentSize, maxLevel, rowSelection, isTree });

  if (treeSelectionWidth > 0) {
    tracks.push(`${treeSelectionWidth}px`);
  }

  columns.forEach((column, index) => {
    tracks.push(
      getColumnTrackSize(column, {
        defaultSpan,
        colsSize,
        isLastColumn: index === lastColumnIndex,
        columns
      })
    );
  });

  return tracks.join(' ');
};

export const getColumnLayout = (column, { defaultSpan, colsSize, isLastColumn, columns } = {}) => {
  const widthBased = hasColumnWidth(column);
  const widthPx = getColumnWidthPx(column, colsSize);
  const fillRemaining = isLastColumn && widthBased && shouldLastColumnFillRemaining(columns);

  return {
    widthBased,
    fillRemaining,
    style: {
      '--col-width': formatColumnWidthPx(widthPx),
      '--col-align': column.align || 'top',
      '--col-justify': column.justify || 'flex-start'
    }
  };
};
