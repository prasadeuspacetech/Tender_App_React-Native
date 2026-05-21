import React, { useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Animated,
  StyleSheet,
  Dimensions,
  Platform,
  StatusBar,
} from 'react-native';
import theme from '../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DRAWER_WIDTH = Math.min(260, SCREEN_WIDTH * 0.72);
const ANIMATION_DURATION = 280;

// ─── Menu item definitions ────────────────────────────────────────────────────
const MENU_ITEMS = [
  { key: 'backup',       label: 'Backup',       handlerKey: 'onBackupPress' },
  { key: 'restore',      label: 'Restore',      handlerKey: 'onRestorePress' },
  { key: 'subscription', label: 'Subscription', handlerKey: 'onSubscriptionPress' },
  { key: 'help',         label: 'Help',         handlerKey: 'onHelpPress' },
];

// ─── Component ────────────────────────────────────────────────────────────────
const SettingsDrawer = ({
  visible,
  onClose,
  onBackupPress,
  onRestorePress,
  onSubscriptionPress,
  onHelpPress,
  style,
}) => {
  const translateX = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  const handlers = { onBackupPress, onRestorePress, onSubscriptionPress, onHelpPress };

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: 0,
          duration: ANIMATION_DURATION,
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: ANIMATION_DURATION,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: -DRAWER_WIDTH,
          duration: ANIMATION_DURATION - 30,
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: ANIMATION_DURATION - 30,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleItemPress = (handlerKey) => {
    const handler = handlers[handlerKey];
    if (typeof handler === 'function') {
      handler();
    }
    onClose?.();
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      {/* Dim overlay */}
      <TouchableWithoutFeedback onPress={onClose} accessible={false}>
        <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]} />
      </TouchableWithoutFeedback>

      {/* Drawer panel */}
      <Animated.View
        style={[styles.drawer, { transform: [{ translateX }] }, style]}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Setting</Text>
          <View style={styles.headerDivider} />
        </View>

        {/* Menu items */}
        <View style={styles.menu}>
          {MENU_ITEMS.map((item, index) => (
            <TouchableOpacity
              key={item.key}
              style={[
                styles.menuItem,
                index < MENU_ITEMS.length - 1 && styles.menuItemBorder,
              ]}
              onPress={() => handleItemPress(item.handlerKey)}
              activeOpacity={0.65}
              accessibilityRole="menuitem"
              accessibilityLabel={item.label}
            >
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Text style={styles.menuChevron}>›</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Animated.View>
    </Modal>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const HEADER_BG = theme.Colors.primary ?? '#062E52';
const DRAWER_BG = theme.Colors.primaryDark ?? '#041F38';
const ITEM_TEXT = theme.Colors.white ?? '#FFFFFF';
const DIVIDER = 'rgba(255,255,255,0.12)'; 
const STATUS_BAR_HEIGHT =
  Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) : 0;

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  drawer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
    backgroundColor: DRAWER_BG,
    paddingTop: STATUS_BAR_HEIGHT,
    borderTopRightRadius: theme.Radius?.lg ?? 16,        // ✅ was theme.borderRadius?.lg
    borderBottomRightRadius: theme.Radius?.lg ?? 16,     // ✅ was theme.borderRadius?.lg
    // Shadow for right edge
    shadowColor: '#000000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.22,
    shadowRadius: 12,
    elevation: 12,
  },
  header: {
    backgroundColor: HEADER_BG,
    paddingHorizontal: theme.Spacing?.lg ?? 20,          // ✅ was theme.spacing?.lg
    paddingTop: theme.Spacing?.xl ?? 28,                 // ✅ was theme.spacing?.xl
    paddingBottom: theme.Spacing?.md ?? 16,              // ✅ was theme.spacing?.md
    borderTopRightRadius: theme.Radius?.lg ?? 16,        // ✅ was theme.borderRadius?.lg
  },
  headerTitle: {
    color: ITEM_TEXT,
    fontSize: theme.FontSize?.xl ?? 20,                  // ✅ was theme.typography?.sizes?.xl
    fontWeight: theme.FontWeight?.bold ?? '700',         // ✅ was theme.typography?.weights?.bold
    fontFamily: theme.FontFamily?.bold ?? undefined,     // ✅ was theme.typography?.fonts?.heading
    letterSpacing: 0.3,
    marginBottom: theme.Spacing?.sm ?? 8,                // ✅ was theme.spacing?.sm
  },
  headerDivider: {
    height: 1,
    backgroundColor: DIVIDER,
    marginTop: theme.Spacing?.xs ?? 4,                   // ✅ was theme.spacing?.xs
  },
  menu: {
    flex: 1,
    paddingTop: theme.Spacing?.sm ?? 8,                  // ✅ was theme.spacing?.sm
    paddingHorizontal: theme.Spacing?.md ?? 16,          // ✅ was theme.spacing?.md
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.Spacing?.md ?? 16,            // ✅ was theme.spacing?.md
    paddingHorizontal: theme.Spacing?.sm ?? 8,           // ✅ was theme.spacing?.sm
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: DIVIDER,
  },
  menuLabel: {
    color: ITEM_TEXT,
    fontSize: theme.FontSize?.md ?? 15,                  // ✅ was theme.typography?.sizes?.md
    fontWeight: theme.FontWeight?.medium ?? '500',       // ✅ was theme.typography?.weights?.medium
    fontFamily: theme.FontFamily?.regular ?? undefined,  // ✅ was theme.typography?.fonts?.body
    letterSpacing: 0.2,
  },
  menuChevron: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 20,
    lineHeight: 22,
  },
});

export default SettingsDrawer;