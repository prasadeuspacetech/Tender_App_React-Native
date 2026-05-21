import React from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
} from 'react-native';
import theme from '../theme'

// ─── Chevron drawn purely with View borders (no icon lib needed) ──────────────
const ChevronRight = ({ size = 11, color = '#555555', strokeWidth = 2.5 }) => (
  <View style={{ width: size, height: size, justifyContent: 'center' }}>
    <View
      style={{
        position: 'absolute',
        width: size * 0.6,
        height: size * 0.6,
        borderTopWidth: strokeWidth,
        borderRightWidth: strokeWidth,
        borderColor: color,
        transform: [{ rotate: '45deg' }],
        top: size * 0.2,
        left: 0,
      }}
    />
  </View>
);

// ─── Component ────────────────────────────────────────────────────────────────
const NavigationCard = ({
  title,
  subtitle = null,
  onPress,
  disabled = false,
  interactive = true,
  showArrow = true,
  style,
  leftIcon = null,
  rightIcon,
}) => {
  const hasSubtitle = subtitle != null && subtitle !== '';

  const content = (
    <>
      <View style={styles.leftSection}>
        {leftIcon ? <View style={styles.leftIconWrapper}>{leftIcon}</View> : null}
        <View style={styles.textBlock}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          {hasSubtitle ? (
            typeof subtitle === 'string' ? (
              <Text style={styles.subtitle} numberOfLines={2}>
                {subtitle}
              </Text>
            ) : (
              subtitle
            )
          ) : null}
        </View>
      </View>

      <View style={styles.rightSection}>
        {rightIcon !== undefined
          ? rightIcon
          : showArrow && (
              <ChevronRight
                size={12}
                color={theme.Colors.textSecondary ?? '#777777'}
                strokeWidth={2.5}
              />
            )}
      </View>
    </>
  );

  const cardStyle = [
    styles.card,
    hasSubtitle && styles.cardWithSubtitle,
    disabled && styles.disabled,
    style,
  ];

  if (!interactive) {
    return (
      <View
        style={cardStyle}
        accessibilityRole="text"
        accessibilityLabel={title}
      >
        {content}
      </View>
    );
  }

  return (
    <TouchableOpacity
      onPress={disabled ? undefined : onPress}
      activeOpacity={disabled ? 1 : 0.72}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled }}
      style={cardStyle}
    >
      {content}
    </TouchableOpacity>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.Colors.white ?? '#FFFFFF',
    borderWidth: 1,
    borderColor: theme.Colors.borderDefault ?? '#E4E4E4',
    borderRadius: theme.Radius?.md ?? 8,
    minHeight: 60,
    paddingVertical: 10,
    paddingHorizontal: theme.Spacing?.lg ?? 18,
    marginBottom: theme.Spacing?.sm ?? 10,
    // Drop shadow matching Figma (0, 4, 4, 0, #000 25%)
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  cardWithSubtitle: {
    minHeight: 68,
    paddingVertical: 12,
  },
  leftSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: theme.Spacing?.sm ?? 8,
  },
  leftIconWrapper: {
    marginRight: theme.Spacing?.sm ?? 10,
    alignSelf: 'center',
  },
  textBlock: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: 15,
    fontWeight: theme.FontWeight?.semiBold ?? '600',
    fontFamily: theme.FontFamily?.regular ?? undefined,
    color: theme.Colors.textPrimary ?? '#1A1A1A',
    letterSpacing: 0.1,
  },
  subtitle: {
    marginTop: 2,
    fontSize: theme.FontSize?.xs ?? 12,
    fontWeight: theme.FontWeight?.regular ?? '400',
    fontFamily: theme.FontFamily?.regular ?? undefined,
    color: theme.Colors.textSecondary ?? '#666666',
    lineHeight: 16,
  },
  rightSection: {
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: theme.Spacing?.sm ?? 8,
  },
  disabled: {
    opacity: 0.45,
  },
});

export default NavigationCard;