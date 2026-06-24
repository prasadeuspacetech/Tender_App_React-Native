import Ionicons from '@expo/vector-icons/Ionicons';
import { useCallback, useId, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dimensions, Pressable, StyleSheet, View } from 'react-native';

import { dismissKeyboardAfterClose, dismissKeyboardBeforeOverlay } from '../../utils/keyboardDismiss';
import HelpTooltipContent, {
  HELP_TOOLTIP_MAX_BODY_HEIGHT,
} from './HelpTooltipContent';
import HelpTooltipOverlay from './HelpTooltipOverlay';
import { computeScopedHelpTooltipLayout } from './helpTooltipLayout';
import { useHelpTooltipRegistration } from './helpTooltipScope';

const ICON_SIZE = 18;
const ICON_COLOR = '#6B7280';
const HIT_SLOP = { top: 10, bottom: 10, left: 10, right: 10 };
const POPOVER_MIN_WIDTH = 260;
const ANCHOR_GAP = 6;
const CONTENT_HEIGHT = HELP_TOOLTIP_MAX_BODY_HEIGHT + 8;

const measureInWindowAsync = (node) => new Promise((resolve) => {
  if (!node?.measureInWindow) {
    resolve(null);
    return;
  }

  node.measureInWindow((x, y, width, height) => {
    resolve({ x, y, width, height });
  });
});

const measureLayoutAsync = (node, relativeTo) => new Promise((resolve) => {
  if (!node?.measureLayout || !relativeTo) {
    resolve(null);
    return;
  }

  node.measureLayout(
    relativeTo,
    (x, y, width, height) => {
      resolve({ x, y, width, height });
    },
    () => resolve(null),
  );
});

/**
 * Reusable contextual help trigger (ⓘ) + anchored popover.
 * Prefer `helpKey` (help namespace). Optional `text` overrides for tests.
 */
const FieldHelpTooltip = ({
  helpKey,
  text,
  fieldLabel,
  tooltipId: tooltipIdProp,
  style,
  iconColor = ICON_COLOR,
  iconSize = ICON_SIZE,
}) => {
  const { t, i18n } = useTranslation('help');
  const generatedId = useId();
  const tooltipId = tooltipIdProp ?? generatedId;
  const registration = useHelpTooltipRegistration(tooltipId);

  const triggerRef = useRef(null);
  const localScopeRef = useRef(null);
  const [localVisible, setLocalVisible] = useState(false);
  const [localAnchor, setLocalAnchor] = useState(null);
  const [localScopeSize, setLocalScopeSize] = useState(null);

  const resolvedText = useMemo(() => {
    const explicit = text?.trim();
    if (explicit) return explicit;
    if (!helpKey) return '';
    return t(helpKey, { defaultValue: '' }).trim();
  }, [text, helpKey, t, i18n.language]);

  const useScope = Boolean(registration);
  const visible = useScope ? registration.isOpen : localVisible;

  const localLayout = useMemo(() => {
    if (!localVisible || !localAnchor || !localScopeSize) return null;
    const safeScopeSize = {
      width: localScopeSize.width || Dimensions.get('window').width,
      height: localScopeSize.height || Dimensions.get('window').height,
    };
    return computeScopedHelpTooltipLayout(localAnchor, CONTENT_HEIGHT, safeScopeSize, {
      minWidth: POPOVER_MIN_WIDTH,
      gap: ANCHOR_GAP,
    });
  }, [localVisible, localAnchor, localScopeSize]);

  const syncTriggerBounds = useCallback(() => {
    measureInWindowAsync(triggerRef.current).then((bounds) => {
      if (bounds) {
        registration?.registerTriggerBounds(bounds);
      }
    });
  }, [registration]);

  const close = useCallback(() => {
    if (useScope) {
      registration.close();
    } else {
      setLocalVisible(false);
      setLocalAnchor(null);
    }
    dismissKeyboardAfterClose();
  }, [registration, useScope]);

  const measureAndOpen = useCallback(async () => {
    const scopeNode = useScope ? registration.scopeRef.current : localScopeRef.current;
    const triggerNode = triggerRef.current;

    if (!scopeNode || !triggerNode) return;

    const layoutAnchor = await measureLayoutAsync(triggerNode, scopeNode);
    const scopeWindow = await measureInWindowAsync(scopeNode);
    const triggerWindow = await measureInWindowAsync(triggerNode);

    if (!scopeWindow || !triggerWindow) return;

    const anchor = layoutAnchor ?? {
      x: triggerWindow.x - scopeWindow.x,
      y: triggerWindow.y - scopeWindow.y,
      width: triggerWindow.width,
      height: triggerWindow.height,
    };

    const scopeSize = {
      width: scopeWindow.width,
      height: scopeWindow.height,
    };

    if (useScope) {
      registration.registerTriggerBounds(triggerWindow);
      registration.open({
        text: resolvedText,
        anchor,
        scopeSize,
        scopeWindow: { x: scopeWindow.x, y: scopeWindow.y },
      });
      return;
    }

    setLocalScopeSize(scopeSize);
    setLocalAnchor(anchor);
    setLocalVisible(true);
  }, [registration, resolvedText, useScope]);

  const open = useCallback(() => {
    if (!resolvedText) return;
    dismissKeyboardBeforeOverlay();
    void measureAndOpen();
  }, [measureAndOpen, resolvedText]);

  const handleToggle = useCallback(() => {
    if (visible) {
      close();
      return;
    }
    open();
  }, [close, open, visible]);

  const accessibilityLabel = fieldLabel
    ? t('accessibility.helpFor', { field: fieldLabel })
    : t('accessibility.fieldHelp');

  const accessibilityHint = t('accessibility.hint');

  if (!resolvedText) {
    return null;
  }

  const trigger = (
    <View
      ref={triggerRef}
      collapsable={false}
      style={[styles.triggerWrap, style]}
      onLayout={syncTriggerBounds}
    >
      <Pressable
        onPress={handleToggle}
        hitSlop={HIT_SLOP}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        accessibilityState={{ expanded: visible }}
        style={styles.triggerPressable}
      >
        <Ionicons
          name="information-circle-outline"
          size={iconSize}
          color={iconColor}
        />
      </Pressable>
    </View>
  );

  if (useScope) {
    return trigger;
  }

  return (
    <View ref={localScopeRef} collapsable={false} style={styles.localScope}>
      {trigger}
      <HelpTooltipOverlay visible={localVisible} layout={localLayout}>
        <HelpTooltipContent text={resolvedText} />
      </HelpTooltipOverlay>
    </View>
  );
};

const styles = StyleSheet.create({
  triggerWrap: {
    minWidth: 28,
    minHeight: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  triggerPressable: {
    minWidth: 28,
    minHeight: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  localScope: {
    position: 'relative',
  },
});

export default FieldHelpTooltip;
