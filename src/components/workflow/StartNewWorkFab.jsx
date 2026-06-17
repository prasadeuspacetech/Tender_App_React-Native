import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';

import { Colors, FontFamily, FontSize, FontWeight, Spacing } from '../../theme';

const PRIMARY = Colors.primary ?? '#062E52';
const FAB_BOTTOM_OFFSET = Spacing.lg ?? 16;
const FAB_RIGHT_OFFSET = Spacing.lg ?? 16;

/** Extra scroll padding so list content clears the FAB. */
export const START_NEW_WORK_FAB_SCROLL_PADDING = 88;

/**
 * Fixed primary action for Add Work hub — clears current work and drafts.
 */
const StartNewWorkFab = ({ onPress, style }) => {
  const { t } = useTranslation('workflow');

  return (
    <View pointerEvents="box-none" style={[styles.anchor, style]}>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={t('hub.startNewWorkAccessibility')}
        style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
      >
        <Ionicons name="add" size={22} color={Colors.white ?? '#FFFFFF'} />
        <Text style={styles.label}>{t('hub.startNewWork')}</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  anchor: {
    position: 'absolute',
    right: FAB_RIGHT_OFFSET,
    bottom: FAB_BOTTOM_OFFSET,
    zIndex: 100,
    elevation: 12,
    ...Platform.select({
      android: { elevation: 8 },
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      default: {},
    }),
  },
  fab: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PRIMARY,
    paddingVertical: Spacing.sm ?? 14,
    paddingHorizontal: Spacing.md ?? 18,
    borderRadius: 28,
    gap: 6,
    minHeight: 52,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.22,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
      default: {},
    }),
  },
  fabPressed: {
    opacity: 0.88,
  },
  label: {
    color: Colors.white ?? '#FFFFFF',
    fontSize: FontSize.sm ?? 14,
    fontFamily: FontFamily.medium ?? FontFamily.regular,
    fontWeight: FontWeight.semibold ?? '600',
    letterSpacing: 0.2,
  },
});

export default StartNewWorkFab;
