/**
 * Shared form field design tokens — master reference: Inputboxfield (Letter Number).
 * Import in Inputboxfield, NativeDateField, FormDropdown, FormToggleField, UploadDocument, etc.
 */

import { Platform, StyleSheet } from 'react-native';
import theme from './index';

export const FORM_FIELD_HEIGHT = 52;
export const FORM_FIELD_BORDER_RADIUS = 12;
export const FORM_FIELD_BORDER_WIDTH = 2;
export const FORM_FIELD_BORDER_COLOR = '#D0D5DD';
export const FORM_FIELD_BORDER_COLOR_ERROR =
  theme.Colors?.status?.error?.badge ?? '#D0371A';
export const FORM_FIELD_H_PADDING = theme.Spacing?.lg ?? 16;
export const FORM_FIELD_MARGIN_BOTTOM = 18;
export const FORM_FIELD_LABEL_MARGIN_BOTTOM = 7;
export const FORM_FIELD_FONT_SIZE = 15;
/** Comfortable line height for Latin + Devanagari in form controls */
export const FORM_FIELD_TEXT_LINE_HEIGHT = 22;
export const FORM_FIELD_LABEL_FONT_SIZE = 14;
export const FORM_FIELD_LABEL_FONT_WEIGHT = '500';
/** Prevents Devanagari ascenders from clipping on iOS/Android */
export const FORM_FIELD_LABEL_LINE_HEIGHT = 20;
export const SECTION_LABEL_FONT_SIZE = 15;
export const SECTION_LABEL_LINE_HEIGHT = FORM_FIELD_TEXT_LINE_HEIGHT;
export const FORM_FIELD_BG = '#FFFFFF';
export const FORM_FIELD_PLACEHOLDER_COLOR =
  theme.Colors?.inputPlaceholder ?? '#AAAAAA';
export const FORM_FIELD_TEXT_COLOR = theme.Colors?.textPrimary ?? '#1A1A1A';
export const FORM_FIELD_ICON_GAP = theme.Spacing?.xs ?? 8;

const labelTextPlatform = Platform.select({
  android: {
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  default: {},
});

export const formFieldStyles = StyleSheet.create({
  container: {
    marginBottom: FORM_FIELD_MARGIN_BOTTOM,
    width: '100%',
  },

  label: {
    fontSize: FORM_FIELD_LABEL_FONT_SIZE,
    fontWeight: FORM_FIELD_LABEL_FONT_WEIGHT,
    fontFamily: theme.FontFamily?.regular ?? undefined,
    color: FORM_FIELD_TEXT_COLOR,
    marginBottom: FORM_FIELD_LABEL_MARGIN_BOTTOM,
    letterSpacing: 0.1,
    lineHeight: FORM_FIELD_LABEL_LINE_HEIGHT,
    ...labelTextPlatform,
  },

  /** Standalone section headers (site photos, upload groups) — 15px labels */
  sectionLabel: {
    fontSize: SECTION_LABEL_FONT_SIZE,
    fontWeight: '400',
    fontFamily: theme.FontFamily?.regular ?? undefined,
    color: FORM_FIELD_TEXT_COLOR,
    lineHeight: SECTION_LABEL_LINE_HEIGHT,
    letterSpacing: 0.1,
    ...labelTextPlatform,
  },

  required: {
    color: FORM_FIELD_BORDER_COLOR_ERROR,
  },

  /** Shared bordered row shell — fixed height applied via `control` or `minHeight` via variants */
  controlShell: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: FORM_FIELD_BORDER_RADIUS,
    borderWidth: FORM_FIELD_BORDER_WIDTH,
    borderColor: FORM_FIELD_BORDER_COLOR,
    backgroundColor: FORM_FIELD_BG,
    paddingHorizontal: FORM_FIELD_H_PADDING,
    width: '100%',
  },

  /** Outer box — text input, dropdown, calendar row, document row */
  control: {
    height: FORM_FIELD_HEIGHT,
    overflow: 'hidden',
  },

  /** Multi-line-safe bordered row (toggle labels, document type labels) */
  controlAutoHeight: {
    minHeight: FORM_FIELD_HEIGHT,
    overflow: 'visible',
  },

  controlError: {
    borderColor: FORM_FIELD_BORDER_COLOR_ERROR,
  },

  controlDisabled: {
    backgroundColor: theme.Colors?.inputBgDisabled ?? '#F7FAFC',
    opacity: 0.65,
  },

  controlText: {
    flex: 1,
    fontSize: FORM_FIELD_FONT_SIZE,
    fontFamily: theme.FontFamily?.regular ?? undefined,
    color: FORM_FIELD_TEXT_COLOR,
    padding: 0,
    margin: 0,
  },

  controlPlaceholder: {
    color: FORM_FIELD_PLACEHOLDER_COLOR,
  },

  rightIcon: {
    marginLeft: FORM_FIELD_ICON_GAP,
    justifyContent: 'center',
    alignItems: 'center',
  },

  /** Toggle field row — label left, switch right; grows for long translations */
  toggleControl: {
    justifyContent: 'space-between',
    minHeight: FORM_FIELD_HEIGHT,
    paddingVertical: 10,
    overflow: 'visible',
  },

  toggleLabelWrap: {
    flex: 1,
    flexShrink: 1,
    minWidth: 0,
    marginRight: FORM_FIELD_ICON_GAP,
    justifyContent: 'center',
  },

  toggleLabel: {
    fontSize: FORM_FIELD_FONT_SIZE,
    fontFamily: theme.FontFamily?.regular ?? undefined,
    lineHeight: FORM_FIELD_TEXT_LINE_HEIGHT,
    textAlignVertical: 'center',
    includeFontPadding: false,
  },

  toggleSwitchSlot: {
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
    marginLeft: FORM_FIELD_ICON_GAP,
  },

  leftIcon: {
    marginRight: FORM_FIELD_ICON_GAP,
    justifyContent: 'center',
    alignItems: 'center',
  },

  errorText: {
    marginTop: 4,
    fontSize: 12,
    color: FORM_FIELD_BORDER_COLOR_ERROR,
    fontFamily: theme.FontFamily?.regular ?? undefined,
  },
});
