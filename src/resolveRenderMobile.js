import { globalParams } from './globalParams';

export const resolveRenderMobile = renderMobile => {
  if (renderMobile === true) {
    return true;
  }
  if (typeof renderMobile === 'function') {
    return renderMobile;
  }
  if (typeof renderMobile === 'string') {
    const name = renderMobile.trim();
    if (!name) {
      return null;
    }
    const renderFn = globalParams.renderMobile?.[name];
    return typeof renderFn === 'function' ? renderFn : null;
  }
  return null;
};

export const isRenderMobileActive = (renderMobile, isMobile) => {
  if (!isMobile) {
    return false;
  }
  const resolved = resolveRenderMobile(renderMobile);
  return resolved === true || typeof resolved === 'function';
};
