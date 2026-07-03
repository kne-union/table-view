import { resolveColumnDimensions } from '../columnRenderType';

export const SELECTION_CHECKBOX_WIDTH = 48;
export const SELECTION_RADIO_WIDTH = 48;

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

export const getGridTemplateColumns = (columns, { defaultSpan, colsSize, rowSelection } = {}) => {
  const tracks = [];
  const lastColumnIndex = columns.length - 1;

  if (rowSelection?.type === 'checkbox') {
    tracks.push(`${SELECTION_CHECKBOX_WIDTH}px`);
  } else if (rowSelection?.type === 'radio') {
    tracks.push(`${SELECTION_RADIO_WIDTH}px`);
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
