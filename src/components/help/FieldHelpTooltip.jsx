import React, { useCallback, useId, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';

import HelpTooltipContent, {
  HELP_TOOLTIP_MAX_BODY_HEIGHT,
} from './HelpTooltipContent';
import HelpTooltipOverlay from './HelpTooltipOverlay';
import { computeHelpTooltipLayout } from './helpTooltipLayout';
import { useHelpTooltipRegistration } from './helpTooltipScope';
import { dismissKeyboardAfterClose, dismissKeyboardBeforeOverlay } from '../../utils/keyboardDismiss';

const ICON_SIZE = 18;
const ICON_COLOR = '#6B7280';
const HIT_SLOP = { top: 10, bottom: 10, left: 10, right: 10 };
const POPOVER_MIN_WIDTH = 260;
const ANCHOR_GAP = 6;
const CONTENT_HEIGHT = HELP_TOOLTIP_MAX_BODY_HEIGHT + 8;

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
  const [localVisible, setLocalVisible] = useState(false);
  const [anchor, setAnchor] = useState(null);

  const resolvedText = useMemo(() => {
    const explicit = text?.trim();
    if (explicit) return explicit;
    if (!helpKey) return '';
    return t(helpKey, { defaultValue: '' }).trim();
  }, [text, helpKey, t, i18n.language]);

  const useScope = Boolean(registration);
  const visible = useScope ? registration.isOpen : localVisible;

  const layout = useMemo(() => {
    if (!visible || !anchor) return null;
    return computeHelpTooltipLayout(anchor, CONTENT_HEIGHT, {
      minWidth: POPOVER_MIN_WIDTH,
      gap: ANCHOR_GAP,
    });
  }, [visible, anchor]);

  const close = useCallback(() => {
    if (useScope) {
      registration.close();
    } else {
      setLocalVisible(false);
    }
    setAnchor(null);
    dismissKeyboardAfterClose();
  }, [registration, useScope]);

  const open = useCallback(() => {
    if (!resolvedText) return;

    dismissKeyboardBeforeOverlay();

    if (useScope) {
      registration.open();
    } else {
      setLocalVisible(true);
    }

    triggerRef.current?.measureInWindow((x, y, width, height) => {
      setAnchor({ x, y, width, height });
    });
  }, [registration, resolvedText, useScope]);

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

  return (
    <>
      <Pressable
        ref={triggerRef}
        collapsable={false}
        onPress={handleToggle}
        hitSlop={HIT_SLOP}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        accessibilityState={{ expanded: visible }}
        style={[styles.trigger, style]}
      >
        <Ionicons
          name="information-circle-outline"
          size={iconSize}
          color={iconColor}
        />
      </Pressable>

      <HelpTooltipOverlay visible={visible} layout={layout} onClose={close}>
        <HelpTooltipContent text={resolvedText} />
      </HelpTooltipOverlay>
    </>
  );
};

const styles = StyleSheet.create({
  trigger: {
    minWidth: 28,
    minHeight: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
});

export default FieldHelpTooltip;
