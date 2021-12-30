import * as Preact from '#preact';
import {Fragment, useMemo} from '#preact';
import {ContainWrapper} from '#preact/component';
import {useAmpContext} from '#preact/context';
import {xhrUtils} from '#preact/utils/xhr';

import {useStyles} from './component.jss';
import {useAsync} from './useAsync';

const defaultItemTemplate = (item) => <li>{String(item)}</li>;
const defaultTemplate = (list) => <ul>{list}</ul>;
const defaultErrorTemplate = (error) => `Error: ${error.message}`;
const defaultLoadingTemplate = () => `Loading...`;

/**
 *
 * @param {string} src
 * @return {Promise<any>}
 */
async function fetchItemsDefault(src) {
  return await xhrUtils.fetchJson(src).then((res) => res.json());
}

/**
 *
 * @param {object} results
 * @param {string} itemsKey
 * @return {*}
 */
function getItemsFromResults(results, itemsKey) {
  if (!results) {
    return null;
  }
  let items = itemsKey && itemsKey !== '.' ? results[itemsKey] : results;
  if (!items) {
    return null;
  }
  if (!Array.isArray(items)) {
    items = [items];
  }
  return items;
}

/**
 * @param {!BentoListDef.Props} props
 * @return {PreactDef.Renderable}
 */
export function BentoList({
  src = null,
  fetchItems = fetchItemsDefault,
  itemsKey = 'items',
  template: itemTemplate = defaultItemTemplate,
  wrapper: wrapperTemplate = defaultTemplate,
  loading: loadingTemplate = defaultLoadingTemplate,
  error: errorTemplate = defaultErrorTemplate,
  ...rest
}) {
  const {renderable} = useAmpContext();

  const styles = useStyles();

  const {error, loading, results} = useAsync(async () => {
    if (!renderable) {
      return null;
    }
    const results = await fetchItems(src);
    return results;
  }, [fetchItems, src, renderable]);

  const items = useMemo(() => {
    return getItemsFromResults(results, itemsKey);
  }, [results, itemsKey]);

  const list = items?.map((item, i) => (
    <Fragment key={i}>{itemTemplate(item)}</Fragment>
  ));

  return (
    <ContainWrapper aria-live="polite" {...rest}>
      {list && wrapperTemplate(list)}
      {loading && loadingTemplate?.()}
      {error && errorTemplate?.(error)}
    </ContainWrapper>
  );
}
