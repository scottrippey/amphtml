import {
  GestureHandlers,
  UserGestureConfig,
  UserHandlers,
  useGesture,
} from '@use-gesture/react';
import type {ComponentChildren, Ref} from 'preact';

import {scale as cssScale, px, translate} from '#core/dom/style';

import * as Preact from '#preact';
import {useEffect, useImperativeHandle, useRef} from '#preact';
import {Children, forwardRef} from '#preact/compat';
import {ContainWrapper} from '#preact/component';
import {useResizeObserver} from '#preact/hooks/useResizeObserver';
import {logger} from '#preact/logger';

import {useStyles} from './component.jss';
import {usePanZoomState} from './hooks/usePanZoomState';

const TAG = 'amp-pan-zoom';

const DOUBLE_TAP_TIME = 500; // Maximum time between tap starts

const gestureConfig: Omit<UserGestureConfig, 'target'> = {
  drag: {
    filterTaps: true,
    tapsThreshold: 10,
  },
};

const ELIGIBLE_TAGS = new Set([
  'svg',
  'div',
  'img',
  // 'AMP-IMG',
  // 'AMP-LAYOUT',
  // 'AMP-SELECTOR',
]);

export type BentoPanZoomProps = {
  children?: ComponentChildren;
  controls?: boolean;
  initialScale?: number | string;
  initialX?: number | string;
  initialY?: number | string;
  maxScale?: number | string;
};

export type BentoPanZoomApi = {
  transform(scale: number, x: number, y: number): void;
};

function getElementPosition(
  clientX: number,
  clientY: number,
  element: HTMLElement
) {
  const elBounds = element./* REVIEW */ getBoundingClientRect();
  return {
    anchorX: clientX - elBounds.x,
    anchorY: clientY - elBounds.y,
  };
}

function classNames(...args: Array<string | false | null | 0>) {
  return args.filter(Boolean).join(' ');
}

/**
 * @return {PreactDef.Renderable}
 */
export function BentoPanZoomWithRef(
  props: BentoPanZoomProps,
  ref: Ref<BentoPanZoomApi>
) {
  const {
    children,
    controls = true,
    // These are here so they will be omitted from '...rest'
    initialScale, // eslint-disable-line @typescript-eslint/no-unused-vars
    initialX, // eslint-disable-line @typescript-eslint/no-unused-vars
    initialY, // eslint-disable-line @typescript-eslint/no-unused-vars
    maxScale, // eslint-disable-line @typescript-eslint/no-unused-vars
    ...rest
  } = props;
  const styles = useStyles();

  // Warn if there are too many children:
  useEffect(() => {
    const childrenArray = Children.toArray(children);
    if (childrenArray.length !== 1) {
      // this should also potentially check child types?
      logger.error(TAG, 'Component should only have one child');
    }
  }, [children]);

  const [state, actions] = usePanZoomState(props);

  const contentRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const updateSizes = () => {
    const contentBox = contentRef.current!./* REVIEW */ getBoundingClientRect();
    const containerBox =
      containerRef.current!./* REVIEW */ getBoundingClientRect();

    actions.updateBounds({
      containerSize: containerBox,
      contentSize: contentBox,
      contentOffset: {
        x: contentBox.x - containerBox.x,
        y: contentBox.y - containerBox.y,
      },
    });
  };
  useResizeObserver(contentRef, updateSizes);
  useResizeObserver(containerRef, updateSizes);

  useImperativeHandle(
    ref,
    () => /** @type {!BentoPanZoom.PanZoomApi} */ ({
      transform: (scale: number, x: number, y: number) => {
        actions.transform({
          scale,
          posX: x,
          posY: y,
        });
      },
    }),
    [actions]
  );

  const panZoomStyles = {
    transformOrigin:
      px(-state.contentOffset.x) + ' ' + px(-state.contentOffset.y),
    transform: translate(state.posX, state.posY) + cssScale(state.scale),
  };

  const lastTapTime = useRef(0);
  const handlers: Partial<UserHandlers> = {
    onDragStart() {
      if (state.isPannable) {
        actions.draggingStart();
      }
    },
    onDragEnd() {
      actions.draggingRelease();
    },
    onDrag(ev) {
      // Taps come through the `onDrag` handler:
      if (ev.tap) {
        const isDoubleTap =
          ev.startTime - lastTapTime.current <= DOUBLE_TAP_TIME;
        if (isDoubleTap) {
          // Double tap:
          const [clientX, clientY] = ev.xy;
          const anchor = getElementPosition(
            clientX,
            clientY,
            containerRef.current!
          );
          actions.updateScale(anchor);
          lastTapTime.current = 0; // Prevent triple-taps
        } else {
          // Single tap
          lastTapTime.current = ev.startTime;
        }
        return;
      }

      // Let's pan!
      if (!state.isPannable) {
        return;
      }
      const [deltaX, deltaY] = ev.movement;
      const [initialX, initialY] = ev.memo || [state.posX, state.posY];

      actions.transform({
        posX: initialX + deltaX,
        posY: initialY + deltaY,
      });

      if (ev.first) {
        // This return value is accessed later via `ev.memo`
        return [initialX, initialY];
      }
    },

    onPinchStart: () => {
      actions.draggingStart();
    },
    onPinchEnd: () => {
      actions.draggingRelease();
    },
    onPinch: (ev) => {
      console.log('onPinch', ev);
    },
  };
  const bind = useGesture(handlers as GestureHandlers, gestureConfig);

  return (
    <ContainWrapper
      {...rest}
      layout
      contentClassName={styles.ampPanZoomWrapper}
      contentRef={containerRef}
    >
      <div
        class={classNames(
          styles.ampPanZoomContainer,
          state.isPannable && styles.ampPanZoomPannable
        )}
        style={{
          touchAction: state.isPannable ? 'none' : 'pan-x pan-y',
          userSelect: state.isPannable ? 'none' : null,
        }}
        {...bind()}
      >
        <div ref={contentRef}>
          <div
            class={classNames(
              styles.ampPanZoomContent,
              state.isDragging && styles.ampPanZoomDragging
            )}
            style={panZoomStyles}
            onPointerDown={(ev) => {
              if (state.isPannable) {
                // Prevent images from being dragged, etc:
                ev.preventDefault();
              }
            }}
          >
            {children}
          </div>
        </div>
      </div>

      {controls && (
        <button
          class={classNames(
            styles.ampPanZoomButton,
            state.canZoom ? styles.ampPanZoomInIcon : styles.ampPanZoomOutIcon
          )}
          onClick={() => actions.updateScale({})}
        />
      )}
    </ContainWrapper>
  );
}

const BentoPanZoom = forwardRef(BentoPanZoomWithRef);
BentoPanZoom.displayName = 'BentoPanZoom'; // Make findable for tests.
export {BentoPanZoom};
