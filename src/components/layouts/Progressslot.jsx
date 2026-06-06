import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import theme from '../../theme';

// ─── Status colour tokens ─────────────────────────────────────────────────────
const STATUS_TOKENS = {
  success: {
    accent:     theme.Colors.success      ?? '#2F5E34',
    background: theme.Colors.successLight ?? '#EEF6EF',
    border:     theme.Colors.success      ?? '#2F5E34',
    borderOpacity: 0.45,
  },
  error: {
    accent:     theme.Colors.error        ?? '#C0392B',
    background: theme.Colors.errorLight   ?? '#FDEEEE',
    border:     theme.Colors.error        ?? '#C0392B',
    borderOpacity: 0.45,
  },
  warning: {
    accent:     theme.Colors.warning      ?? '#B8860B',
    background: theme.Colors.warningLight ?? '#FDFAE8',
    border:     theme.Colors.warning      ?? '#B8860B',
    borderOpacity: 0.45,
  },
};

// ─── Screen-type → status map ─────────────────────────────────────────────────
const SCREEN_STATUS_MAP = {
  workDetails:           'success',
  pmcApproval:           'success',
  estimation:            'error',
  paymentStatus:         'error',
  tenderCreation:        'warning',
  reTender:              'warning',
  contractorAssignment:  'warning',
  sanctionApproval:      'warning',
  workOrder:             'warning',
  workProgress:          'warning',
  billSubmission:        'warning',
  completionAndClosure:  'warning',
  completionClosure:     'warning',
};

// ─── Circle-check icon (pure Views) ──────────────────────────────────────────
const CircleCheckIcon = ({ size = 32, color = '#2F5E34' }) => {
  const strokeWidth = size * 0.09;
  const tickW = size * 0.34;
  const tickH = size * 0.2;

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: strokeWidth,
        borderColor: color,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: color + '22', // 13% tint
      }}
    >
      {/* Tick mark */}
      <View
        style={{
          width: tickW,
          height: tickH,
          borderLeftWidth: strokeWidth,
          borderBottomWidth: strokeWidth,
          borderColor: color,
          transform: [{ rotate: '-45deg' }],
          marginTop: -tickH * 0.3,
        }}
      />
    </View>
  );
};

// ─── Component ────────────────────────────────────────────────────────────────
const ProgressSlot = ({
  step,
  title,
  description,

  screenType,
  statusType,

  showIcon = true,

  style,
  containerStyle,
}) => {
  // Resolve status: explicit prop beats screenType map, fallback to warning
  const resolvedStatus =
    statusType ??
    (screenType ? SCREEN_STATUS_MAP[screenType] : undefined) ??
    'warning';

  const { t } = useTranslation('workflow');
  const tokens = STATUS_TOKENS[resolvedStatus] ?? STATUS_TOKENS.warning;

  const stepLabel =
    step != null
      ? t('common.stepLabel', { step, title })
      : title;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: tokens.background,
          borderColor: tokens.accent,
        },
        containerStyle,
        style,
      ]}
    >
      {/* Left icon */}
      {showIcon && (
        <View style={styles.iconWrapper}>
          <CircleCheckIcon size={32} color={tokens.accent} />
        </View>
      )}

      {/* Text block */}
      <View style={styles.textBlock}>
        <Text style={[styles.stepLabel, { color: tokens.accent }]} numberOfLines={1}>
          {stepLabel}
        </Text>
        {description ? (
          <Text style={[styles.description, { color: tokens.accent }]} numberOfLines={2}>
            {description}
          </Text>
        ) : null}
      </View>
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: theme.Radius?.lg ?? 12,          // ✅ was theme.borderRadius?.lg
    paddingVertical: theme.Spacing?.sm ?? 10,       // ✅ was theme.spacing?.sm
    paddingHorizontal: theme.Spacing?.md ?? 14,     // ✅ was theme.spacing?.md
    marginBottom: 3,          // ✅ was theme.spacing?.md
    gap: theme.Spacing?.sm ?? 10,                   // ✅ was theme.spacing?.sm
  },
  iconWrapper: {
    flexShrink: 0,
  },
  textBlock: {
    flex: 1,
  },
  stepLabel: {
    fontSize: theme.FontSize?.sm ?? 13,             // ✅ was theme.typography?.sizes?.sm
    fontWeight: theme.FontWeight?.bold ?? '700',    // ✅ was theme.typography?.weights?.bold
    fontFamily: theme.FontFamily?.regular ?? undefined, // ✅ was theme.typography?.fonts?.body
    letterSpacing: 0.1,
    marginBottom: 2,
  },
  description: {
    fontSize: theme.FontSize?.xs ?? 12,             // ✅ was theme.typography?.sizes?.xs
    fontWeight: theme.FontWeight?.regular ?? '400', // ✅ was theme.typography?.weights?.regular
    fontFamily: theme.FontFamily?.regular ?? undefined, // ✅ was theme.typography?.fonts?.body
    opacity: 0.85,
    lineHeight: 16,
  },
});

export default ProgressSlot;