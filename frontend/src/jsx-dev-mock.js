import { jsx, jsxs, Fragment } from 'react/jsx-runtime';

export function jsxDEV(type, props, key, isStaticChildren, source, self) {
  return jsx(type, props, key);
}

export { Fragment };
