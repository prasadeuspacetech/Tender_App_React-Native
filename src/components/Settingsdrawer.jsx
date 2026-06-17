import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Pressable,
  Animated,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { FigmaMenuIcon, FIGMA_HEADER_ICON_SIZE } from './icons/HeaderIcons';
import {
  initialWindowMetrics,
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import theme from '../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DRAWER_WIDTH = Math.min(260, SCREEN_WIDTH * 0.72);
const ANIMATION_DURATION = 280;

// ─── Menu item definitions (labels resolved via i18n) ─────────────────────────
const MENU_ITEMS = [
  {
    key: 'generalCorrespondence',
    labelKey: 'drawer.generalCorrespondence',
    route: 'GeneralCorrespondence',
  },
  { key: 'backup',       labelKey: 'drawer.backup',       handlerKey: 'onBackupPress' },
  { key: 'restore',      labelKey: 'drawer.restore',      handlerKey: 'onRestorePress' },
  { key: 'subscription', labelKey: 'drawer.subscription', handlerKey: 'onSubscriptionPress' },
  { key: 'help',         labelKey: 'drawer.help',         handlerKey: 'onHelpPress' },
];

// Renders inside Modal's SafeAreaProvider so insets are available on first open.
const DrawerPanel = ({
  onClose,
  onBackupPress,
  onRestorePress,
  onSubscriptionPress,
  onHelpPress,
  style,
  translateX,
  overlayOpacity,
}) => {
  const navigation = useNavigation();
  const { t } = useTranslation('navigation');
  const insets = useSafeAreaInsets();

  const handlers = { onBackupPress, onRestorePress, onSubscriptionPress, onHelpPress };

  const menuItems = useMemo(
    () =>
      MENU_ITEMS.map((item) => ({
        ...item,
        label: t(item.labelKey),
      })),
    [t],
  );

  const handleItemPress = (item) => {
    if (item.route) {
      navigation.navigate(item.route);
      onClose?.();
      return;
    }

    const handler = handlers[item.handlerKey];
    if (typeof handler === 'function') {
      handler();
    }
    onClose?.();
  };

  const headerTopPadding =
    insets.top + (theme.Spacing?.sm ?? 8);

  return (
    <View style={styles.modalRoot}>
      <Animated.View
        pointerEvents="none"
        style={[styles.overlay, { opacity: overlayOpacity }]}
      />

      <Animated.View
        style={[styles.drawer, { transform: [{ translateX }] }, style]}
      >
        <View style={styles.header}>
          <View style={[styles.headerContent, { paddingTop: headerTopPadding }]}>
            <View style={styles.headerTitleRow}>
              <TouchableOpacity
                onPress={onClose}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                activeOpacity={0.65}
                accessibilityRole="button"
                accessibilityLabel={t('accessibility.closeMenu')}
                style={styles.headerMenuButton}
              >
                <FigmaMenuIcon color={ITEM_TEXT} size={FIGMA_HEADER_ICON_SIZE} />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>{t('drawer.title')}</Text>
            </View>
            <View style={styles.headerDivider} />
          </View>
        </View>

        <View style={styles.menu}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={item.key}
              style={[
                styles.menuItem,
                index < menuItems.length - 1 && styles.menuItemBorder,
              ]}
              onPress={() => handleItemPress(item)}
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

      {/* Touch layer above drawer — flex row so Android gets a real hit target */}
      <View style={styles.dismissLayer} pointerEvents="box-none">
        <View style={styles.dismissDrawerSpacer} pointerEvents="none" />
        <Pressable
          style={styles.dismissPressable}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel={t('accessibility.closeMenu')}
        />
      </View>
    </View>
  );
};

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
  }, [visible, translateX, overlayOpacity]);

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      {/*
        Modal renders in a separate native window. A nested SafeAreaProvider with
        initialWindowMetrics supplies correct insets on the first open — the root
        provider alone is not reliable inside Modal on iOS.
      */}
      <SafeAreaProvider style={styles.modalRoot} initialMetrics={initialWindowMetrics}>
        <DrawerPanel
          onClose={onClose}
          onBackupPress={onBackupPress}
          onRestorePress={onRestorePress}
          onSubscriptionPress={onSubscriptionPress}
          onHelpPress={onHelpPress}
          style={style}
          translateX={translateX}
          overlayOpacity={overlayOpacity}
        />
      </SafeAreaProvider>
    </Modal>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const HEADER_BG = theme.Colors.primary ?? '#062E52';
const DRAWER_BG = theme.Colors.primaryDark ?? '#041F38';
const ITEM_TEXT = theme.Colors.white ?? '#FFFFFF';
const DIVIDER = 'rgba(255,255,255,0.12)';

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  dismissLayer: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    zIndex: 20,
    elevation: 20,
  },
  dismissDrawerSpacer: {
    width: DRAWER_WIDTH,
  },
  dismissPressable: {
    flex: 1,
  },
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
    borderTopRightRadius: theme.Radius?.lg ?? 16,
    borderBottomRightRadius: theme.Radius?.lg ?? 16,
    shadowColor: '#000000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.22,
    shadowRadius: 12,
    elevation: 12,
  },
  header: {
    backgroundColor: HEADER_BG,
    borderTopRightRadius: theme.Radius?.lg ?? 16,
  },
  headerContent: {
    paddingHorizontal: theme.Spacing?.lg ?? 20,
    paddingBottom: theme.Spacing?.md ?? 16,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.Spacing?.sm ?? 8,
  },
  headerMenuButton: {
    marginRight: theme.Spacing?.sm ?? 8,
  },
  headerTitle: {
    color: ITEM_TEXT,
    fontSize: theme.FontSize?.xl ?? 20,
    fontWeight: theme.FontWeight?.bold ?? '700',
    fontFamily: theme.FontFamily?.bold ?? undefined,
    letterSpacing: 0.3,
  },
  headerDivider: {
    height: 1,
    backgroundColor: DIVIDER,
    marginTop: theme.Spacing?.xs ?? 4,
  },
  menu: {
    flex: 1,
    paddingTop: theme.Spacing?.sm ?? 8,
    paddingHorizontal: theme.Spacing?.md ?? 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.Spacing?.md ?? 16,
    paddingHorizontal: theme.Spacing?.sm ?? 8,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: DIVIDER,
  },
  menuLabel: {
    color: ITEM_TEXT,
    fontSize: theme.FontSize?.md ?? 15,
    fontWeight: theme.FontWeight?.medium ?? '500',
    fontFamily: theme.FontFamily?.regular ?? undefined,
    letterSpacing: 0.2,
  },
  menuChevron: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 20,
    lineHeight: 22,
  },
});

export default SettingsDrawer;
