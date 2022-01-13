import {useCallback, useRef} from '#preact';
import {useValueRef} from '#preact/component';

import {useStateSafe} from './useStateSafe';

const initialState = {
  loading: false,
  error: null,
  pages: [],
  hasMore: true,
};

/**
 *
 * @param {object} config
 * @param {function({ pageParam: TPageParam }): Promise<TPage>} config.fetchPage
 * @param {function(page: TPage): TPageParam} config.getNextPageParam
 * @return {{pages: *[], loadMore: ((function(*=): Promise<void>)|*), hasMore: boolean, refresh: refresh, loading: boolean, error: null}}
 * @template TPage
 * @template TPageParam
 */
export function useInfiniteQuery({fetchPage, getNextPageParam}) {
  const [state, setState] = useStateSafe(initialState);

  const ref = useValueRef({fetchPage, getNextPageParam, state});
  const fetchIndexRef = useRef(0);

  const loadMore = useCallback(
    async (resetting = false) => {
      const {fetchPage, getNextPageParam, state} = ref.current;

      if (!resetting && state.loading) {
        return;
      }

      const fetchIndex = ++fetchIndexRef.current;

      setState((s) => ({...s, loading: true}));

      const pages = resetting ? [] : state.pages;
      const lastPage = pages.length ? pages[pages.length - 1] : undefined;

      try {
        const newPage = await fetchPage({
          pageParam: lastPage ? getNextPageParam(lastPage) : undefined,
        });

        if (fetchIndex !== fetchIndexRef.current) {
          // A new request has been started; cancel this one:
          return;
        }

        const nextPageParam = getNextPageParam(newPage);

        setState({
          loading: false,
          error: null,
          pages: [...pages, newPage],
          hasMore: nextPageParam !== undefined && nextPageParam !== null,
        });
      } catch (error) {
        if (fetchIndex !== fetchIndexRef.current) {
          // A new request has been started; cancel this one:
          return;
        }

        setState((s) => ({...s, loading: false, error}));
      }
    },
    [ref, setState]
  );

  const reset = useCallback(() => loadMore(true), [loadMore]);

  return {
    ...state,
    loadMore,
    reset,
  };
}
