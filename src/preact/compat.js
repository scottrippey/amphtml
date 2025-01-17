import {options} from /*OK*/ 'preact';

import * as mode from '#core/mode';

const REACT_FORWARD_SYMBOL =
  (typeof Symbol !== 'undefined' && Symbol.for?.('react.forward_ref')) || 0xf47;

// `__b` is the known mangled name exported by preact. This is called during
// the diffing algorithm with the constructed VNode, before the vnode is
// actually used to diff.
const oldDiff = options['__b'];
options['__b'] = newDiff;

/**
 * Checks if our VNode type has a `forwardRef_` sigil, in which case it was created by our forwardRef implementation.
 * If so, we move the VNode's ref to it's props, which will be passed to the Component as its props.
 *
 * See VNode type at https://github.com/preactjs/preact/blob/55ee4bc069f84cf5e3af8f2e2f338f4e74aca4d8/src/create-element.js#L58-L76
 *
 * @param {{
 *   type: (string|function()),
 *   ref: *,
 *   props: !Object,
 * }} vnode
 */
function newDiff(vnode) {
  if (vnode['type']?.forwardRef_ && vnode['ref']) {
    vnode['props']['ref'] = vnode['ref'];
    vnode['ref'] = null;
  }
  oldDiff?.(vnode);
}

/**
 * Reimplements forwardRef without dragging in everything from preact/compat.
 * See https://github.com/preactjs/preact/issues/3295
 *
 * @param {function(P):R} Component
 * @return {function(P):R}
 * @template P
 * @template R
 */
export function forwardRef(Component) {
  /**
   * @param {!Object} props
   * @return {R}
   */
  function Forward(props) {
    const {ref, ...clone} = props;
    return Component(clone, ref);
  }

  // Is faithful react support necessary? This file should only be used in Preact mode,
  // importers will directly import `React.forwardRef` in React builds.
  Forward.$$typeof = REACT_FORWARD_SYMBOL;

  // Preact pretends functional components are classical component instances,
  // which are expected to have a render method.
  Forward.render = Forward;

  // https://github.com/preactjs/preact/blob/d78746c96245b70a83514a69ba4047e5dd0c7f54/compat/src/render.js#L26-L27
  // Some libraries like `react-virtualized` explicitly check for this.
  Forward.prototype.isReactComponent = true;

  Forward.forwardRef_ = true;

  if (!mode.isProd()) {
    Forward.displayName = `ForwardRef(${
      Component.displayName || Component.name
    })`;
  }

  return Forward;
}
