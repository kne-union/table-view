export const parsePixelValue = value => {
  const num = parseFloat(value);
  return Number.isNaN(num) ? 0 : num;
};

export const normalizeScrollTopInsetCSSValue = value => {
  if (value == null) {
    return undefined;
  }
  if (typeof value === 'number') {
    return `${value}px`;
  }
  return String(value);
};

export const resolveScrollTopInset = (scrollTopInset, stickyOffset) => scrollTopInset ?? stickyOffset;

export const readCssVariableLength = (element, variableName, fallback = '0px') => {
  if (typeof document === 'undefined') {
    return 0;
  }
  const host = element || document.documentElement;
  const probe = document.createElement('div');
  probe.style.cssText = 'position:absolute;visibility:hidden;pointer-events:none;height:0;width:0;overflow:hidden;';
  probe.style.marginTop = `var(${variableName}, ${fallback})`;
  host.appendChild(probe);
  const value = parsePixelValue(getComputedStyle(probe).marginTop);
  host.removeChild(probe);
  return value;
};

export const parseInsetPixels = (inset, element) => {
  if (inset == null) {
    return 0;
  }
  if (typeof inset === 'number') {
    return inset;
  }
  if (typeof inset === 'string') {
    const trimmed = inset.trim();
    if (trimmed.endsWith('px')) {
      return parsePixelValue(trimmed);
    }
    const variableMatch = trimmed.match(/var\(\s*(--[^,\s)]+)/);
    if (variableMatch) {
      return readCssVariableLength(element, variableMatch[1], '0px');
    }
  }
  return 0;
};
