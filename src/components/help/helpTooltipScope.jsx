import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';

import HelpTooltipContent, {
  HELP_TOOLTIP_MAX_BODY_HEIGHT,
} from './HelpTooltipContent';
import HelpTooltipOverlay from './HelpTooltipOverlay';
import {
  computeScopedHelpTooltipLayout,
  pointInRect,
} from './helpTooltipLayout';
import { dismissKeyboardAfterClose } from '../../utils/keyboardDismiss';

const HelpTooltipScopeContext = createContext(null);

const POPOVER_MIN_WIDTH = 260;
const ANCHOR_GAP = 6;
const CONTENT_HEIGHT = HELP_TOOLTIP_MAX_BODY_HEIGHT + 8;
const TRIGGER_HIT_PADDING = 10;

const inflateRect = (rect, padding = TRIGGER_HIT_PADDING) => {
  if (!rect) return null;
  return {
    x: rect.x - padding,
    y: rect.y - padding,
    width: rect.width + padding * 2,
    height: rect.height + padding * 2,
  };
};

const normalizeScopeSize = (scopeSize, layoutSize) => {
  const window = Dimensions.get('window');
  return {
    width: scopeSize?.width || layoutSize?.width || window.width,
    height: scopeSize?.height || layoutSize?.height || window.height,
  };
};

const normalizeAnchor = (anchor) => ({
  x: anchor.x,
  y: anchor.y,
  width: Math.max(anchor.width ?? 0, 28),
  height: Math.max(anchor.height ?? 0, 28),
});

/** Ensures only one field help tooltip is open within a screen/section. */
export const HelpTooltipScope = ({ children }) => {
  const scopeRef = useRef(null);
  const triggerBoundsRef = useRef(new Map());
  const tooltipOpenAtTouchStartRef = useRef(false);
  const [scopeLayout, setScopeLayout] = useState(null);
  const [activeTooltip, setActiveTooltip] = useState(null);

  const closeAll = useCallback(() => {
    setActiveTooltip(null);
    dismissKeyboardAfterClose();
  }, []);

  const registerTriggerBounds = useCallback((tooltipId, bounds) => {
    if (!tooltipId || !bounds) return;
    triggerBoundsRef.current.set(tooltipId, bounds);
  }, []);

  const handleScopeLayout = useCallback((event) => {
    const { width, height } = event.nativeEvent.layout;
    if (width > 0 && height > 0) {
      setScopeLayout({ width, height });
    }
  }, []);

  const openTooltip = useCallback(({ id, text, anchor, scopeSize, scopeWindow }) => {
    if (!id || !text?.trim() || !anchor) return;

    const safeAnchor = normalizeAnchor(anchor);
    const safeScopeSize = normalizeScopeSize(scopeSize, scopeLayout);
    const layout = computeScopedHelpTooltipLayout(safeAnchor, CONTENT_HEIGHT, safeScopeSize, {
      minWidth: POPOVER_MIN_WIDTH,
      gap: ANCHOR_GAP,
    });

    if (!layout) return;

    setActiveTooltip({
      id,
      text: text.trim(),
      anchor: safeAnchor,
      layout,
      scopeWindow,
    });
  }, [scopeLayout]);

  const isTouchOnTrigger = useCallback((pageX, pageY) => {
    for (const bounds of triggerBoundsRef.current.values()) {
      if (pointInRect(pageX, pageY, inflateRect(bounds))) {
        return true;
      }
    }
    return false;
  }, []);

  const isTouchOnPanel = useCallback((pageX, pageY, tooltip) => {
    if (!tooltip?.scopeWindow || !tooltip?.layout) return false;

    const panelRect = {
      x: tooltip.scopeWindow.x + tooltip.layout.left,
      y: tooltip.scopeWindow.y + tooltip.layout.top,
      width: tooltip.layout.width,
      height: tooltip.layout.maxHeight,
    };

    return pointInRect(pageX, pageY, panelRect);
  }, []);

  const handleTouchStart = useCallback(() => {
    tooltipOpenAtTouchStartRef.current = Boolean(activeTooltip);
  }, [activeTooltip]);

  const handleTouchEnd = useCallback(
    (evt) => {
      if (!tooltipOpenAtTouchStartRef.current || !activeTooltip) {
        return;
      }

      const pageX = evt.nativeEvent.pageX;
      const pageY = evt.nativeEvent.pageY;
      if (pageX == null || pageY == null) {
        return;
      }

      if (isTouchOnTrigger(pageX, pageY)) {
        return;
      }

      if (isTouchOnPanel(pageX, pageY, activeTooltip)) {
        return;
      }

      closeAll();
    },
    [activeTooltip, closeAll, isTouchOnPanel, isTouchOnTrigger],
  );

  const value = useMemo(
    () => ({
      openId: activeTooltip?.id ?? null,
      scopeRef,
      openTooltip,
      closeAll,
      registerTriggerBounds,
      setOpenId: (id) => {
        if (!id) closeAll();
      },
    }),
    [activeTooltip?.id, closeAll, openTooltip, registerTriggerBounds],
  );

  return (
    <HelpTooltipScopeContext.Provider value={value}>
      <View
        ref={scopeRef}
        collapsable={false}
        style={[
          styles.scope,
          scopeLayout ? { minHeight: scopeLayout.height } : null,
        ]}
        onLayout={handleScopeLayout}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {children}
        <HelpTooltipOverlay
          visible={Boolean(activeTooltip?.layout)}
          layout={activeTooltip?.layout}
          scopeLayout={scopeLayout}
        >
          <HelpTooltipContent text={activeTooltip?.text} />
        </HelpTooltipOverlay>
      </View>
    </HelpTooltipScopeContext.Provider>
  );
};

const styles = StyleSheet.create({
  scope: {
    position: 'relative',
  },
});

export const useHelpTooltipScope = () => useContext(HelpTooltipScopeContext);

/** @returns {object | null} */
export const useHelpTooltipRegistration = (tooltipId) => {
  const scope = useHelpTooltipScope();

  const open = useCallback(
    ({ text, anchor, scopeSize, scopeWindow }) => {
      if (!scope || !tooltipId || !text?.trim() || !anchor) return;

      scope.openTooltip({
        id: tooltipId,
        text,
        anchor,
        scopeSize,
        scopeWindow,
      });
    },
    [scope, tooltipId],
  );

  const close = useCallback(() => {
    if (!scope || !tooltipId) return;
    if (scope.openId === tooltipId) {
      scope.closeAll();
    }
  }, [scope, tooltipId]);

  const registerTriggerBounds = useCallback(
    (bounds) => {
      scope?.registerTriggerBounds(tooltipId, bounds);
    },
    [scope, tooltipId],
  );

  if (!scope || !tooltipId) {
    return null;
  }

  return {
    open,
    close,
    isOpen: scope.openId === tooltipId,
    scopeRef: scope.scopeRef,
    registerTriggerBounds,
  };
};
