import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';

import { dashboardCardBorderStyle } from './dashboardCardBorder';

const RING_SIZE = 72;

const ProgressRing = ({
  percent = 0,
  size = RING_SIZE,
  strokeWidth = 7,
  color = '#9CA3AF',
  trackColor = '#E5E7EB',
  children,
}) => {
  const half = size / 2;
  const deg = (Math.min(Math.max(percent, 0), 100) / 100) * 360;
  const rightDeg = Math.min(deg, 180);
  const leftDeg = Math.max(0, deg - 180);

  return (
    <View style={{ width: size, height: size }}>
      <View
        style={{
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: half,
          borderWidth: strokeWidth,
          borderColor: trackColor,
        }}
      />
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: half,
          width: half,
          height: size,
          overflow: 'hidden',
        }}
      >
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: -half,
            width: size,
            height: size,
            borderRadius: half,
            borderWidth: strokeWidth,
            borderColor: color,
            transform: [{ rotate: `${rightDeg - 90}deg` }],
          }}
        />
      </View>
      {leftDeg > 0 && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: half,
            height: size,
            overflow: 'hidden',
          }}
        >
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: size,
              height: size,
              borderRadius: half,
              borderWidth: strokeWidth,
              borderColor: color,
              transform: [{ rotate: `${leftDeg - 90}deg` }],
            }}
          />
        </View>
      )}
      {children ? (
        <View
          pointerEvents="none"
          style={[styles.centerSlot, { width: size, height: size }]}
        >
          {children}
        </View>
      ) : null}
    </View>
  );
};

const DashboardStatCard = ({
  label,
  value,
  percent = 0,
  ringColor = '#9CA3AF',
  trackColor = '#E5E7EB',
  valueFontSize = 18,
  style,
}) => (
  <View style={[styles.card, style]}>
    <ProgressRing
      percent={percent}
      size={RING_SIZE}
      strokeWidth={7}
      color={ringColor}
      trackColor={trackColor}
    >
      <Text
        style={[styles.value, { fontSize: valueFontSize }]}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.65}
      >
        {value}
      </Text>
    </ProgressRing>
    <Text style={styles.label} numberOfLines={1}>
      {label}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minHeight: 115,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    ...dashboardCardBorderStyle,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  centerSlot: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 2,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  value: {
    fontWeight: '700',
    color: '#1A1A1A',
    textAlign: 'center',
    ...(Platform.OS === 'android' ? { includeFontPadding: false } : null),
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    color: '#4B5563',
    textAlign: 'center',
    marginTop: 6,
  },
});

export default DashboardStatCard;
