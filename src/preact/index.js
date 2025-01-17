import * as preact from /*OK*/ 'preact';
// The preactDOM name is explicit, so we can remap to react-dom.
import * as preactDOM from /*OK*/ 'preact/dom';
import * as hooks from /*OK*/ 'preact/hooks';

// Defines the type interfaces for the approved Preact APIs.
// TODO: isValidElement, Component

/**
 * @param {!PreactDef.FunctionalComponent|string} unusedType
 * @param {?Object=} unusedProps
 * @param {...*} var_args
 * @return {!PreactDef.VNode}
 */
export function createElement(unusedType, unusedProps, var_args) {
  return preact.createElement.apply(undefined, arguments);
}

/**
 * @param {!PreactDef.VNode} unusedElement
 * @param {?Object=} unusedProps
 * @param {...PreactDef.Renderable} unusedChildren
 * @return {!PreactDef.VNode}
 */
export function cloneElement(unusedElement, unusedProps, unusedChildren) {
  return preact.cloneElement.apply(undefined, arguments);
}

/**
 * @param {?PreactDef.VNode} vnode
 * @param {Node} container
 * @param {?Node=} opt_replaceNode
 */
export function render(vnode, container, opt_replaceNode) {
  preactDOM.render(vnode, container, opt_replaceNode);
}

/**
 * @param {!PreactDef.VNode} vnode
 * @param {Node} container
 */
export function hydrate(vnode, container) {
  preactDOM.hydrate(vnode, container);
}

/**
 * @param {?Object=} props
 * @return {PreactDef.Renderable}
 */
export function Fragment(props) {
  return props.children;
}

/**
 * @return {{current: ?T}}
 * @template T
 */
export function createRef() {
  return preact.createRef();
}

/**
 * @param {T} value
 * @return {!PreactDef.Context<T>}
 * @template T
 */
export function createContext(value) {
  // TODO(preactjs/preact#2736): Remove once Preact's API is fixed.
  return preact.createContext(value, undefined);
}

/**
 * @param {...PreactDef.Renderable} unusedChildren
 * @return {!Array<PreactDef.Renderable>}
 */
export function toChildArray(unusedChildren) {
  return preact.toChildArray.apply(undefined, arguments);
}

// Defines the type interfaces for the approved Preact Hooks APIs.
// TODO: useReducer, useDebugValue, useErrorBoundary

/**
 * @param {S|function():S} initial
 * @return {{0: S, 1: function((S|function(S):S)):undefined}}
 * @template S
 */
export function useState(initial) {
  return hooks.useState(initial);
}

/**
 * @param {?T} initial
 * @return {{current: ?T}}
 * @template T
 */
export function useRef(initial) {
  return hooks.useRef(initial);
}

/**
 * @param {function():(function():undefined|undefined)} effect
 * @param {!Array<*>=} opt_deps
 */
export function useEffect(effect, opt_deps) {
  hooks.useEffect(effect, opt_deps);
}

/**
 * @param {function():(function():undefined|undefined)} effect
 * @param {!Array<*>=} opt_deps
 */
export function useLayoutEffect(effect, opt_deps) {
  hooks.useLayoutEffect(effect, opt_deps);
}

/**
 * @param {PreactDef.Context<T>} context
 * @return {T}
 * @template T
 */
export function useContext(context) {
  return hooks.useContext(context);
}

/**
 * @param {function():T} cb
 * @param {!Array<*>=} opt_deps
 * @return {T}
 * @template T
 */
export function useMemo(cb, opt_deps) {
  return hooks.useMemo(cb, opt_deps);
}

/**
 * @param {T} cb
 * @param {!Array<*>=} opt_deps
 * @return {T}
 * @template T
 */
export function useCallback(cb, opt_deps) {
  return hooks.useCallback(cb, opt_deps);
}

/**
 * @param {{current: ?T}} ref
 * @param {function():T} create
 * @param {!Array<*>=} opt_deps
 * @return {undefined}
 * @template T
 */
export function useImperativeHandle(ref, create, opt_deps) {
  return hooks.useImperativeHandle(ref, create, opt_deps);
}
