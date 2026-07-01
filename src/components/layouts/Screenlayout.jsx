import { useTranslation } from 'react-i18next';
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BackButton from '../../components/Backbutton';
import NotificationButton from '../../components/Notificationbutton';
import { FIGMA_HEADER_ICON_SIZE, FigmaMenuIcon } from '../../components/icons/HeaderIcons';
import theme from '../../theme';

// ─── Component ────────────────────────────────────────────────────────────────
const ScreenLayout = ({
  // Content
  title,
  headerTitleStyle,
  children,

  // Header controls
  showBack = false,
  showMenu = false,
  showNotification = true,
  showHeader = true,

  // Behavior
  scrollable = false,
  safeArea = true,
  keyboardAware = true,

  // Callbacks
  onBackPress,
  onMenuPress,
  onNotificationPress,
  notificationBadgeCount,
  notificationShowBadge = false,

  /** Custom right header slot (e.g. FY dropdown). Overrides notification when set. */
  headerRight,

  // Styles
  containerStyle,
  headerStyle,
  contentStyle,
}) => {
  const { t } = useTranslation('navigation');

  // ─── Header ───────────────────────────────────────────────────────────────
  const renderHeader = () => {
    if (!showHeader) return null;

    return (
      <View style={[styles.header, headerStyle]}>
        {/* Left: Back or Menu */}
        <View style={styles.headerLeft}>
          {showBack ? (
            <BackButton
              onPress={onBackPress}
              iconColor={theme.Colors.white ?? '#FFFFFF'}
              iconSize={FIGMA_HEADER_ICON_SIZE}
            />
          ) : showMenu ? (
            <TouchableOpacity
              onPress={onMenuPress}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              activeOpacity={0.65}
              accessibilityRole="button"
              accessibilityLabel={t('accessibility.openMenu')}
              style={styles.menuButton}
            >
              <FigmaMenuIcon color={theme.Colors.white ?? '#FFFFFF'} size={FIGMA_HEADER_ICON_SIZE} />
            </TouchableOpacity>
          ) : (
            // Spacer so title stays centred when neither icon shows
            <View style={styles.headerIconPlaceholder} />
          )}
        </View>

        {/* Centre-left: Title */}
        <View style={styles.headerCenter}>
          {title ? (
            <Text style={[styles.headerTitle, headerTitleStyle]} numberOfLines={1}>
              {title}
            </Text>
          ) : null}
        </View>

        {/* Right: custom slot or notification */}
        <View style={styles.headerRight}>
          {headerRight ?? (
            showNotification ? (
              <NotificationButton
                onPress={onNotificationPress}
                iconColor={theme.Colors.white ?? '#FFFFFF'}
                iconSize={20}
                badgeCount={notificationBadgeCount}
                showBadge={notificationShowBadge}
              />
            ) : (
              <View style={styles.headerIconPlaceholder} />
            )
          )}
        </View>
      </View>
    );
  };

  // ─── Body content ─────────────────────────────────────────────────────────
  const renderBody = () => {
    const bodyContent = (
      <View style={[styles.body, contentStyle]}>
        {children}
      </View>
    );

    if (scrollable) {
      return (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.scrollContent, contentStyle]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      );
    }

    return bodyContent;
  };

  // ─── Root wrappers ────────────────────────────────────────────────────────
  const rootContent = (
    <View style={[styles.root, containerStyle]}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={theme.Colors.primary ?? '#062E52'}
        translucent={false}
      />
      {renderHeader()}
      {renderBody()}
    </View>
  );

  // KeyboardAvoidingView
  const withKeyboard = keyboardAware ? (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      {rootContent}
    </KeyboardAvoidingView>
  ) : (
    rootContent
  );

  if (safeArea) {
    return (
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        {withKeyboard}
      </SafeAreaView>
    );
  }

  return <View style={styles.flex}>{withKeyboard}</View>;
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const HEADER_BG = theme.Colors.primary ?? '#062E52';
const HEADER_HEIGHT = 60;
const ICON_SLOT_WIDTH = 44; // fixed width keeps title visually centred

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    backgroundColor: HEADER_BG, // status bar area matches header
  },
  root: {
    flex: 1,
    backgroundColor: theme.Colors.bgScreen ?? theme.Colors.background ?? '#FFFFFF',
  },

  // ─── Header ───────────────────────────────────────────────────────────────
  header: {
    flexDirection:    'row',
    alignItems:       'center',
    backgroundColor:  HEADER_BG,
    height:           HEADER_HEIGHT,
    paddingHorizontal: theme.Spacing?.md ?? 16,   // ✅ was theme.spacing?.md
    shadowColor:      '#000000',
    shadowOffset:     { width: 0, height: 2 },
    shadowOpacity:    0.12,
    shadowRadius:     4,
    elevation:        4,
  },

  headerLeft: {
    width:          ICON_SLOT_WIDTH,
    alignItems:     'flex-start',
    justifyContent: 'center',
  },

  headerCenter: {
    flex:           1,
    justifyContent: 'center',
    paddingLeft:    theme.Spacing?.sm ?? 8,        // ✅ was theme.spacing?.sm
    paddingRight:   theme.Spacing?.xs ?? 4,        // ✅ was theme.spacing?.xs
  },

  headerTitle: {
    color:         '#FFFFFF',
    fontSize:      theme.FontSize?.lg ?? 18,       // ✅ was theme.typography?.sizes?.lg
    fontWeight:    '700',
    letterSpacing: 0.2,
  },

  headerRight: {
    minWidth:       ICON_SLOT_WIDTH,
    maxWidth:       200,
    alignItems:     'flex-end',
    justifyContent: 'center',
    flexShrink:     0,
  },

  menuButton: {
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },

  headerIconPlaceholder: {
    width: ICON_SLOT_WIDTH,
  },

  // ─── Body ─────────────────────────────────────────────────────────────────
  body: {
    flex: 1,
    backgroundColor: theme.Colors.bgScreen ?? theme.Colors.background ?? '#FFFFFF',
    paddingHorizontal: theme.Spacing?.md ?? 16,
    paddingTop: theme.Spacing?.md ?? 16,
  },
  scrollView: {
    flex: 1,
    backgroundColor: theme.Colors.bgScreen ?? theme.Colors.background ?? '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: theme.Spacing?.md ?? 16,   // ✅ was theme.spacing?.md (in scrollContent)
    paddingTop: theme.Spacing?.md ?? 16,
    paddingBottom: theme.Spacing?.xl ?? 32,        // ✅ was theme.spacing?.xl
  },
});

export default ScreenLayout;