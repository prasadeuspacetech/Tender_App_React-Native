import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import theme from '../../theme';

const WorkflowProgress = ({
  currentStep = 0,
  totalSteps = 1,

  title,
  showTitle = false,
  showPercentage = false,
  showStepText = true,

  completedColor = theme.Colors.primary ?? '#062E52',
  trackColor = theme.Colors.border ?? '#E0E0E0',

  style,
  containerStyle,
}) => {
  // Clamp step to valid range
  const safeStep = Math.min(Math.max(currentStep, 0), totalSteps);
  const safeTotalSteps = Math.max(totalSteps, 1);
  const ratio = safeStep / safeTotalSteps;
  const percentage = Math.round(ratio * 100);

  // Animate the progress bar width
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: ratio,
      duration: 420,
      useNativeDriver: false,
    }).start();
  }, [ratio]);

  const widthInterpolated = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={[styles.container, containerStyle, style]}>
      {/* Optional title row */}
      {showTitle && title ? (
        <Text style={styles.title}>{title}</Text>
      ) : null}

      {/* Step text + optional percentage */}
      <View style={styles.textRow}>
        {showStepText ? (
          <Text style={styles.stepText}>
            <Text style={styles.stepCount}>{safeStep}</Text>
            {' of '}
            <Text style={styles.stepCount}>{safeTotalSteps}</Text>
            {' steps completed'}
          </Text>
        ) : null}

        {showPercentage ? (
          <Text style={[styles.percentage, { color: completedColor }]}>
            {percentage}%
          </Text>
        ) : null}
      </View>

      {/* Progress track */}
      <View style={[styles.track, { backgroundColor: trackColor }]}>
        <Animated.View
          style={[
            styles.fill,
            { backgroundColor: completedColor, width: widthInterpolated },
          ]}
        />
      </View>
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const TRACK_HEIGHT = 7;

const styles = StyleSheet.create({
  container: {
    paddingVertical: theme.Spacing?.sm ?? 10,              // ✅ was theme.spacing?.sm
  },
  title: {
    fontSize: theme.FontSize?.xs ?? 11,                    // ✅ was theme.typography?.sizes?.xs
    fontWeight: theme.FontWeight?.semiBold ?? '600',       // ✅ was theme.typography?.weights?.semibold
    fontFamily: theme.FontFamily?.regular ?? undefined,    // ✅ was theme.typography?.fonts?.body
    color: theme.Colors.textSecondary ?? '#777777',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: theme.Spacing?.xs ?? 4,                  // ✅ was theme.spacing?.xs
  },
  textRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: theme.Spacing?.xs ?? 6,                  // ✅ was theme.spacing?.xs
  },
  stepText: {
    fontSize: theme.FontSize?.sm ?? 13,                    // ✅ was theme.typography?.sizes?.sm
    fontFamily: theme.FontFamily?.regular ?? undefined,    // ✅ was theme.typography?.fonts?.body
    color: theme.Colors.textSecondary ?? '#666666',
    fontWeight: theme.FontWeight?.regular ?? '400',        // ✅ was theme.typography?.weights?.regular
  },
  stepCount: {
    fontWeight: theme.FontWeight?.bold ?? '700',           // ✅ was theme.typography?.weights?.bold
    color: theme.Colors.textPrimary ?? '#1A1A1A',
  },
  percentage: {
    fontSize: theme.FontSize?.sm ?? 13,                    // ✅ was theme.typography?.sizes?.sm
    fontWeight: theme.FontWeight?.bold ?? '700',           // ✅ was theme.typography?.weights?.bold
    fontFamily: theme.FontFamily?.regular ?? undefined,    // ✅ was theme.typography?.fonts?.body
  },
  track: {
    height: TRACK_HEIGHT,
    borderRadius: TRACK_HEIGHT / 2,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: TRACK_HEIGHT / 2,
  },
});

export default WorkflowProgress;