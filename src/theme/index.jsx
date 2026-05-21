/**
 * ─────────────────────────────────────────────────────────────
 *  TENDER TRACKING APP — CENTRALIZED THEME SYSTEM
 *  src/theme/index.js
 *
 *  Single source of truth for all UI styling.
 *  Stack : React Native Expo · JavaScript/JSX · StyleSheet
 *  Mode  : Light only
 *  Font  : Roboto
 * ─────────────────────────────────────────────────────────────
 */

import { Platform, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ─────────────────────────────────────────────────────────────
// 1. COLOR SYSTEM
// ─────────────────────────────────────────────────────────────

/**
 * Brand palette derived from primary #062E52 (Deep Navy).
 * All tints/shades are hand-tuned for WCAG AA contrast on white surfaces.
 */
const palette = {
  // Navy scale
  navy900: '#062E52',   // primary — deepest brand
  navy800: '#0A3D6B',
  navy700: '#0D4D87',
  navy600: '#1060A3',
  navy500: '#1A75BF',
  navy400: '#3D8FCC',
  navy300: '#72AEDE',
  navy200: '#ADCFED',
  navy100: '#D6E8F7',
  navy50:  '#EDF5FC',

  // Accent — a controlled steel-teal that pairs with navy
  accent600: '#0E7490',
  accent500: '#0891B2',
  accent400: '#22B8D4',
  accent100: '#CFFAFE',
  accent50:  '#ECFEFF',

  // Neutrals — warm-leaning grey for professional warmth
  grey900: '#0F1923',
  grey800: '#1C2B3A',
  grey700: '#2E4057',
  grey600: '#445E7A',
  grey500: '#607D96',
  grey400: '#8FA5BA',
  grey300: '#B8CАДА',
  grey200: '#D8E4ED',
  grey100: '#EDF2F7',
  grey50:  '#F7FAFC',

  // Semantic base
  white:   '#FFFFFF',
  black:   '#000000',

  // Status palette
  green700: '#166534',
  green600: '#16A34A',
  green500: '#22C55E',
  green100: '#DCFCE7',
  green50:  '#F0FDF4',

  amber700: '#92400E',
  amber600: '#D97706',
  amber500: '#F59E0B',
  amber100: '#FEF3C7',
  amber50:  '#FFFBEB',

  red700:   '#991B1B',
  red600:   '#DC2626',
  red500:   '#EF4444',
  red100:   '#FEE2E2',
  red50:    '#FFF5F5',

  blue700:  '#1D4ED8',
  blue600:  '#2563EB',
  blue500:  '#3B82F6',
  blue100:  '#DBEAFE',
  blue50:   '#EFF6FF',

  violet700: '#5B21B6',
  violet500: '#8B5CF6',
  violet100: '#EDE9FE',

  orange600: '#EA580C',
  orange500: '#F97316',
  orange100: '#FFEDD5',
};

export const Colors = {
  // ── Brand ──────────────────────────────────────────────────
  primary:          palette.navy900,      // #062E52 — headers, CTAs, active tabs
  primaryDark:      palette.navy900,            // pressed state
  primaryMid:       palette.navy700,      // secondary brand usage
  primaryLight:     palette.navy500,      // links, interactive accents
  primarySubtle:    palette.navy100,      // tinted chip backgrounds
  primaryFaint:     palette.navy50,       // tinted section backgrounds

  accent:           palette.accent500,    // highlight / secondary CTA
  accentLight:      palette.accent100,

  // ── Backgrounds ────────────────────────────────────────────
  white:            palette.white,
  background:       palette.white,        // ScreenLayout + nav containers
  bgBase:           palette.white,        // page/screen background
  bgScreen:         palette.white,
  bgCard:           palette.white,        // card surface
  bgSection:        palette.white,        // grouped sections (same as screen)
  bgSubtle:         palette.white,        // no grey page tint behind forms
  bgOverlay:        'rgba(6, 46, 82, 0.55)', // modal scrim (navy-tinted)
  bgSkeleton:       palette.grey100,

  // ── Surface ────────────────────────────────────────────────
  surface:          palette.white,
  surfaceRaised:    palette.white,        // cards with shadow
  surfaceRecessed:  palette.white,
  surfaceDim:       palette.white,

  // ── Text hierarchy ─────────────────────────────────────────
  textPrimary:      palette.grey900,      // headings
  textSecondary:    palette.grey700,      // subheadings / labels
  textTertiary:     palette.grey500,      // supporting / meta text
  textDisabled:     palette.grey300,
  textInverse:      palette.white,        // text on dark surfaces
  textLink:         palette.navy600,
  textLinkActive:   palette.navy800,
  textPlaceholder:  palette.grey400,
  textOnPrimary:    palette.white,        // text sitting on primary bg

  // ── Borders ────────────────────────────────────────────────
  borderDefault:    palette.grey200,      // card/input default border
  borderStrong:     palette.grey300,      // dividers, table lines
  borderFocus:      palette.navy600,      // focused input ring
  borderError:      palette.red600,
  borderSubtle:     palette.grey100,      // very light separator

  // ── Input specific ─────────────────────────────────────────
  inputBg:          palette.white,
  inputBgDisabled:  palette.grey50,
  inputBorder:      palette.grey200,
  inputBorderFocus: palette.navy700,
  inputBorderError: palette.red600,
  inputText:        palette.grey900,
  inputPlaceholder: palette.grey400,
  inputLabel:       palette.grey700,
  inputIcon:        palette.grey400,

  // ── Disabled states ────────────────────────────────────────
  disabledBg:       palette.grey100,
  disabledText:     palette.grey400,
  disabledBorder:   palette.grey200,

  // ── Divider ────────────────────────────────────────────────
  divider:          palette.grey100,
  dividerStrong:    palette.grey200,

  // ── Icon tones ─────────────────────────────────────────────
  iconDefault:      palette.grey500,
  iconActive:       palette.navy900,
  iconMuted:        palette.grey300,
  iconOnDark:       palette.white,

  // ─────────────────────────────────────────────────────────
  // WORKFLOW STATUS COLORS
  // Each status has: bg (chip bg), text, border, icon, badgeBg
  // ─────────────────────────────────────────────────────────

  status: {
    pending: {
      bg:     palette.amber50,
      text:   palette.amber700,
      border: palette.amber500,
      icon:   palette.amber600,
      badge:  palette.amber500,
      label:  'Pending',
    },
    inProgress: {
      bg:     palette.blue50,
      text:   palette.blue700,
      border: palette.blue500,
      icon:   palette.blue600,
      badge:  palette.blue500,
      label:  'In Progress',
    },
    approved: {
      bg:     palette.green50,
      text:   palette.green700,
      border: palette.green500,
      icon:   palette.green600,
      badge:  palette.green500,
      label:  'Approved',
    },
    rejected: {
      bg:     palette.red50,
      text:   palette.red700,
      border: palette.red500,
      icon:   palette.red600,
      badge:  palette.red500,
      label:  'Rejected',
    },
    completed: {
      bg:     palette.navy50,
      text:   palette.navy800,
      border: palette.navy400,
      icon:   palette.navy600,
      badge:  palette.navy700,
      label:  'Completed',
    },
    draft: {
      bg:     palette.grey100,
      text:   palette.grey700,
      border: palette.grey300,
      icon:   palette.grey500,
      badge:  palette.grey400,
      label:  'Draft',
    },
    underReview: {
      bg:     palette.violet100,
      text:   palette.violet700,
      border: palette.violet500,
      icon:   palette.violet500,
      badge:  palette.violet500,
      label:  'Under Review',
    },
    onHold: {
      bg:     palette.orange100,
      text:   palette.orange600,
      border: palette.orange500,
      icon:   palette.orange600,
      badge:  palette.orange500,
      label:  'On Hold',
    },
    // Semantic shortcuts
    success: {
      bg:     palette.green50,
      text:   palette.green700,
      border: palette.green500,
      icon:   palette.green600,
      badge:  palette.green500,
    },
    warning: {
      bg:     palette.amber50,
      text:   palette.amber700,
      border: palette.amber500,
      icon:   palette.amber600,
      badge:  palette.amber500,
    },
    error: {
      bg:     palette.red50,
      text:   palette.red700,
      border: palette.red500,
      icon:   palette.red600,
      badge:  palette.red500,
    },
    info: {
      bg:     palette.blue50,
      text:   palette.blue700,
      border: palette.blue500,
      icon:   palette.blue600,
      badge:  palette.blue500,
    },
  },
};

// ─────────────────────────────────────────────────────────────
// 2. TYPOGRAPHY SYSTEM
// ─────────────────────────────────────────────────────────────

export const FontFamily = {
  regular:  'Roboto-Regular',
  medium:   'Roboto-Medium',
  semiBold: 'Roboto-Medium',   // Roboto has no SemiBold; Medium is closest
  bold:     'Roboto-Bold',
  light:    'Roboto-Light',
  mono:     Platform.select({ ios: 'Courier New', android: 'monospace' }),
};

export const FontSize = {
  xs:   10,
  sm:   12,
  base: 14,
  md:   16,
  lg:   18,
  xl:   20,
  xxl:  24,
  xxxl: 28,
  h2:   32,
  h1:   38,
};

export const FontWeight = {
  light:    '300',
  regular:  '400',
  medium:   '500',
  semiBold: '600',
  bold:     '700',
  extraBold:'800',
};

export const LineHeight = {
  tight:    1.2,   // used as multiplier: fontSize * LineHeight.tight
  snug:     1.35,
  normal:   1.5,
  relaxed:  1.65,
  loose:    1.8,
};

/**
 * Typography presets.
 * Usage: <Text style={Typography.h1}>...</Text>
 * Combine with color: [Typography.body, { color: Colors.textSecondary }]
 */
export const Typography = {
  h1: {
    fontFamily:  FontFamily.bold,
    fontSize:    FontSize.h1,
    fontWeight:  FontWeight.bold,
    lineHeight:  Math.round(FontSize.h1 * LineHeight.tight),
    color:       Colors.textPrimary,
    letterSpacing: -0.5,
  },
  h2: {
    fontFamily:  FontFamily.bold,
    fontSize:    FontSize.h2,
    fontWeight:  FontWeight.bold,
    lineHeight:  Math.round(FontSize.h2 * LineHeight.tight),
    color:       Colors.textPrimary,
    letterSpacing: -0.3,
  },
  h3: {
    fontFamily:  FontFamily.bold,
    fontSize:    FontSize.xxxl,
    fontWeight:  FontWeight.bold,
    lineHeight:  Math.round(FontSize.xxxl * LineHeight.snug),
    color:       Colors.textPrimary,
    letterSpacing: -0.2,
  },
  title: {
    fontFamily:  FontFamily.bold,
    fontSize:    FontSize.xxl,
    fontWeight:  FontWeight.bold,
    lineHeight:  Math.round(FontSize.xxl * LineHeight.snug),
    color:       Colors.textPrimary,
    letterSpacing: -0.1,
  },
  subtitle: {
    fontFamily:  FontFamily.medium,
    fontSize:    FontSize.xl,
    fontWeight:  FontWeight.medium,
    lineHeight:  Math.round(FontSize.xl * LineHeight.normal),
    color:       Colors.textSecondary,
  },
  sectionHeader: {
    fontFamily:  FontFamily.semiBold,
    fontSize:    FontSize.sm,
    fontWeight:  FontWeight.semiBold,
    lineHeight:  Math.round(FontSize.sm * LineHeight.normal),
    color:       Colors.textTertiary,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  body: {
    fontFamily:  FontFamily.regular,
    fontSize:    FontSize.base,
    fontWeight:  FontWeight.regular,
    lineHeight:  Math.round(FontSize.base * LineHeight.relaxed),
    color:       Colors.textPrimary,
  },
  bodyMedium: {
    fontFamily:  FontFamily.medium,
    fontSize:    FontSize.base,
    fontWeight:  FontWeight.medium,
    lineHeight:  Math.round(FontSize.base * LineHeight.relaxed),
    color:       Colors.textPrimary,
  },
  bodySm: {
    fontFamily:  FontFamily.regular,
    fontSize:    FontSize.sm,
    fontWeight:  FontWeight.regular,
    lineHeight:  Math.round(FontSize.sm * LineHeight.relaxed),
    color:       Colors.textSecondary,
  },
  label: {
    fontFamily:  FontFamily.medium,
    fontSize:    FontSize.sm,
    fontWeight:  FontWeight.medium,
    lineHeight:  Math.round(FontSize.sm * LineHeight.normal),
    color:       Colors.inputLabel,
  },
  caption: {
    fontFamily:  FontFamily.regular,
    fontSize:    FontSize.sm,
    fontWeight:  FontWeight.regular,
    lineHeight:  Math.round(FontSize.sm * LineHeight.normal),
    color:       Colors.textTertiary,
  },
  smallText: {
    fontFamily:  FontFamily.regular,
    fontSize:    FontSize.xs,
    fontWeight:  FontWeight.regular,
    lineHeight:  Math.round(FontSize.xs * LineHeight.normal),
    color:       Colors.textTertiary,
  },
  buttonText: {
    fontFamily:  FontFamily.semiBold,
    fontSize:    FontSize.base,
    fontWeight:  FontWeight.semiBold,
    lineHeight:  Math.round(FontSize.base * LineHeight.tight),
    letterSpacing: 0.3,
  },
  buttonTextSm: {
    fontFamily:  FontFamily.semiBold,
    fontSize:    FontSize.sm,
    fontWeight:  FontWeight.semiBold,
    lineHeight:  Math.round(FontSize.sm * LineHeight.tight),
    letterSpacing: 0.2,
  },
  buttonTextLg: {
    fontFamily:  FontFamily.bold,
    fontSize:    FontSize.md,
    fontWeight:  FontWeight.bold,
    lineHeight:  Math.round(FontSize.md * LineHeight.tight),
    letterSpacing: 0.3,
  },
  tabLabel: {
    fontFamily:  FontFamily.medium,
    fontSize:    FontSize.xs,
    fontWeight:  FontWeight.medium,
    lineHeight:  14,
    letterSpacing: 0.2,
  },
  badge: {
    fontFamily:  FontFamily.bold,
    fontSize:    FontSize.xs,
    fontWeight:  FontWeight.bold,
    lineHeight:  14,
    letterSpacing: 0.3,
  },
  chipText: {
    fontFamily:  FontFamily.medium,
    fontSize:    FontSize.xs,
    fontWeight:  FontWeight.medium,
    lineHeight:  16,
    letterSpacing: 0.2,
  },
  inputText: {
    fontFamily:  FontFamily.regular,
    fontSize:    FontSize.base,
    fontWeight:  FontWeight.regular,
    lineHeight:  Math.round(FontSize.base * LineHeight.normal),
  },
  mono: {
    fontFamily:  FontFamily.mono,
    fontSize:    FontSize.sm,
    fontWeight:  FontWeight.regular,
    lineHeight:  20,
  },
};

// ─────────────────────────────────────────────────────────────
// 3. SPACING SYSTEM
// ─────────────────────────────────────────────────────────────

/**
 * 4-pt base grid — every value is a multiple of 4.
 * xs → 4, sm → 8, md → 16 (1 rem equivalent), lg → 24 …
 */
export const Spacing = {
  none:  0,
  xs:    4,
  sm:    8,
  md:    16,
  lg:    24,
  xl:    32,
  xxl:   48,
  xxxl:  64,

  // Named aliases for semantic clarity
  inputPaddingH:   12,
  inputPaddingV:   12,
  cardPaddingH:    16,
  cardPaddingV:    16,
  sectionGap:      24,
  listItemGap:     12,
  inlineGap:        8,
  screenPaddingH:  16,
  screenPaddingV:  20,
  formFieldGap:    16,
  buttonPaddingH:  20,
  headerPaddingV:  12,
  tabBarPaddingV:   8,
};

// ─────────────────────────────────────────────────────────────
// 4. BORDER RADIUS
// ─────────────────────────────────────────────────────────────

export const Radius = {
  none:   0,
  xs:     4,    // subtle — table cells, tags
  sm:     6,    // small elements — badges, small chips
  md:     10,   // inputs, small cards
  lg:     14,   // cards, modals (standard)
  xl:     20,   // large cards, bottom sheets
  xxl:    28,   // floating sheets
  full:   9999, // pills, toggles, avatar circles

  // Semantic aliases
  button:     10,
  buttonSm:    6,
  buttonLg:   12,
  input:      10,
  card:       14,
  cardSm:     10,
  modal:      20,
  bottomSheet:24,
  chip:       9999,
  badge:      9999,
  avatar:     9999,
  icon:        8,
  fab:         9999,
};

// ─────────────────────────────────────────────────────────────
// 5. SHADOWS / ELEVATION
// ─────────────────────────────────────────────────────────────

/**
 * Cross-platform shadow helper.
 * Android uses elevation; iOS uses shadow* props.
 * Call Shadow.card, Shadow.button, etc. and spread into StyleSheet.
 *
 * The navy-tinted shadow color (rgba(6,46,82,…)) gives cards a subtle
 * brand-coherent depth instead of the generic black shadow.
 */
const navyShadowColor = 'rgba(6, 46, 82, 0.18)';
const navyShadowColorStrong = 'rgba(6, 46, 82, 0.28)';

export const Shadow = {
  none: {
    shadowColor:  'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius:  0,
    elevation:     0,
  },
  xs: {
    shadowColor:   navyShadowColor,
    shadowOffset:  { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius:  2,
    elevation:     1,
  },
  sm: {
    shadowColor:   navyShadowColor,
    shadowOffset:  { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius:  4,
    elevation:     2,
  },
  // Standard card shadow
  card: {
    shadowColor:   navyShadowColor,
    shadowOffset:  { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius:  8,
    elevation:     4,
  },
  cardHovered: {
    shadowColor:   navyShadowColorStrong,
    shadowOffset:  { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius:  14,
    elevation:     8,
  },
  // Primary / ghost button press shadow
  button: {
    shadowColor:   'rgba(6, 46, 82, 0.30)',
    shadowOffset:  { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius:  8,
    elevation:     4,
  },
  // Bottom tab navigator floating shadow
  bottomNav: {
    shadowColor:   'rgba(6, 46, 82, 0.20)',
    shadowOffset:  { width: 0, height: -3 },
    shadowOpacity: 1,
    shadowRadius:  10,
    elevation:     16,
  },
  // Modal / bottom sheet
  modal: {
    shadowColor:   'rgba(6, 46, 82, 0.30)',
    shadowOffset:  { width: 0, height: -4 },
    shadowOpacity: 1,
    shadowRadius:  20,
    elevation:     24,
  },
  // Floating action button
  fab: {
    shadowColor:   'rgba(6, 46, 82, 0.35)',
    shadowOffset:  { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius:  14,
    elevation:     10,
  },
  // Header bar
  header: {
    shadowColor:   navyShadowColor,
    shadowOffset:  { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius:  6,
    elevation:     6,
  },
};

// ─────────────────────────────────────────────────────────────
// 6. LAYOUT CONSTANTS
// ─────────────────────────────────────────────────────────────

export const Layout = {
  screenWidth:         SCREEN_WIDTH,
  screenHeight:        SCREEN_HEIGHT,

  // Horizontal screen padding (standard iOS/Android guideline)
  screenPaddingH:      16,
  screenPaddingV:      20,

  // Content area width (screen minus padding)
  contentWidth:        SCREEN_WIDTH - 32,

  // Navigation
  headerHeight:        Platform.select({ ios: 96, android: 64 }),  // includes status bar on iOS
  tabBarHeight:        Platform.select({ ios: 82, android: 64 }),   // includes home indicator on iOS
  statusBarHeight:     Platform.select({ ios: 44, android: 0 }),    // rough; use expo-status-bar

  // Cards & containers
  cardPaddingH:        16,
  cardPaddingV:        16,
  cardGap:             12,
  sectionGap:          24,

  // Form elements
  inputHeight:         52,
  inputHeightSm:       44,
  inputHeightLg:       60,
  textAreaMinHeight:   100,

  // Buttons
  buttonHeightSm:      36,
  buttonHeight:        48,
  buttonHeightLg:      56,

  // Icon sizes
  iconXs:              14,
  iconSm:              18,
  iconMd:              22,
  iconLg:              28,
  iconXl:              36,

  // Avatar sizes
  avatarSm:            32,
  avatarMd:            44,
  avatarLg:            56,
  avatarXl:            80,

  // Chip / Badge
  chipHeight:          28,
  chipHeightSm:        22,
  badgeSize:           20,
  badgeSizeSm:         16,

  // FAB
  fabSize:             56,
  fabSizeSm:           44,

  // Stepper
  stepperNodeSize:     32,
  stepperNodeSizeSm:   24,

  // Progress bar
  progressBarHeight:    6,
  progressBarHeightLg: 10,

  // Divider
  dividerThickness:     1,

  // Touch target (WCAG minimum)
  touchTarget:         44,

  // Max content width (tablet guard)
  maxContentWidth:     560,
};

// ─────────────────────────────────────────────────────────────
// 7. COMPONENT-LEVEL CONSTANTS
// ─────────────────────────────────────────────────────────────

// ── Buttons ──────────────────────────────────────────────────

export const Button = {
  // Sizes
  sm: {
    height:          Layout.buttonHeightSm,
    paddingH:        Spacing.md,
    borderRadius:    Radius.buttonSm,
    ...Typography.buttonTextSm,
  },
  md: {
    height:          Layout.buttonHeight,
    paddingH:        Spacing.lg,
    borderRadius:    Radius.button,
    ...Typography.buttonText,
  },
  lg: {
    height:          Layout.buttonHeightLg,
    paddingH:        Spacing.xl,
    borderRadius:    Radius.buttonLg,
    ...Typography.buttonTextLg,
  },

  // Variants — use these to build StyleSheet entries
  variant: {
    primary: {
      backgroundColor: Colors.primary,
      color:           Colors.textOnPrimary,
      borderWidth:     0,
    },
    primaryOutline: {
      backgroundColor: 'transparent',
      color:           Colors.primary,
      borderWidth:     1.5,
      borderColor:     Colors.primary,
    },
    secondary: {
      backgroundColor: Colors.primaryFaint,
      color:           Colors.primary,
      borderWidth:     0,
    },
    ghost: {
      backgroundColor: 'transparent',
      color:           Colors.primary,
      borderWidth:     0,
    },
    danger: {
      backgroundColor: Colors.status.error.bg,
      color:           Colors.status.error.text,
      borderWidth:     0,
    },
    dangerSolid: {
      backgroundColor: Colors.status.error.badge,
      color:           Colors.textInverse,
      borderWidth:     0,
    },
    disabled: {
      backgroundColor: Colors.disabledBg,
      color:           Colors.disabledText,
      borderWidth:     0,
    },
  },
};

// ── Inputs / Form fields ──────────────────────────────────────

export const Input = {
  height:          Layout.inputHeight,
  heightSm:        Layout.inputHeightSm,
  heightLg:        Layout.inputHeightLg,
  paddingH:        Spacing.inputPaddingH,
  paddingV:        Spacing.inputPaddingV,
  borderRadius:    Radius.input,
  borderWidth:     1.5,
  fontSize:        FontSize.base,
  fontFamily:      FontFamily.regular,

  // State colors (reference Colors for dynamic changes)
  state: {
    default: {
      backgroundColor: Colors.inputBg,
      borderColor:     Colors.inputBorder,
      color:           Colors.inputText,
    },
    focused: {
      backgroundColor: Colors.inputBg,
      borderColor:     Colors.inputBorderFocus,
      color:           Colors.inputText,
    },
    error: {
      backgroundColor: Colors.status.error.bg,
      borderColor:     Colors.inputBorderError,
      color:           Colors.inputText,
    },
    disabled: {
      backgroundColor: Colors.inputBgDisabled,
      borderColor:     Colors.borderSubtle,
      color:           Colors.disabledText,
    },
    filled: {
      backgroundColor: Colors.inputBg,
      borderColor:     Colors.borderDefault,
      color:           Colors.inputText,
    },
  },

  // Label spacing
  labelMarginBottom: 6,
  helperMarginTop:   4,
  errorMarginTop:    4,
};

// ── Cards ─────────────────────────────────────────────────────

export const Card = {
  paddingH:     Layout.cardPaddingH,
  paddingV:     Layout.cardPaddingV,
  borderRadius: Radius.card,
  borderWidth:  1,
  borderColor:  Colors.borderSubtle,
  background:   Colors.bgCard,
  gap:          Layout.cardGap,
};

// ── Status Chips / Badges ─────────────────────────────────────

export const Chip = {
  height:          Layout.chipHeight,
  heightSm:        Layout.chipHeightSm,
  paddingH:        Spacing.sm,
  borderRadius:    Radius.chip,
  borderWidth:     1,
  ...Typography.chipText,
};

// ── Header ────────────────────────────────────────────────────

export const Header = {
  height:          Layout.headerHeight,
  backgroundColor: Colors.primary,
  paddingH:        Spacing.screenPaddingH,
  titleColor:      Colors.textInverse,
  iconColor:       Colors.textInverse,
  ...Shadow.header,
};

// ── Bottom Tab Bar ────────────────────────────────────────────

export const TabBar = {
  height:            Layout.tabBarHeight,
  backgroundColor:   Colors.surface,
  activeTintColor:   Colors.primary,
  inactiveTintColor: Colors.grey400,
  indicatorColor:    Colors.primary,
  borderTopWidth:    1,
  borderTopColor:    Colors.borderSubtle,
  ...Shadow.bottomNav,
};

// ── Stepper / Workflow Tracker ────────────────────────────────

export const Stepper = {
  nodeSize:         Layout.stepperNodeSize,
  nodeSizeSm:       Layout.stepperNodeSizeSm,
  connectorWidth:    2,
  activeColor:      Colors.primary,
  completedColor:   Colors.status.completed.icon,
  pendingColor:     Colors.grey300,
  errorColor:       Colors.status.error.icon,
  labelStyle:       Typography.caption,
};

// ── Progress Bar ──────────────────────────────────────────────

export const ProgressBar = {
  height:          Layout.progressBarHeight,
  heightLg:        Layout.progressBarHeightLg,
  borderRadius:    Radius.full,
  trackColor:      Colors.grey100,
  fillColor:       Colors.primary,
  successColor:    Colors.status.success.icon,
  warningColor:    Colors.status.warning.icon,
  errorColor:      Colors.status.error.icon,
};

// ── Divider ───────────────────────────────────────────────────

export const Divider = {
  thickness:   Layout.dividerThickness,
  color:       Colors.divider,
  colorStrong: Colors.dividerStrong,
  marginV:     Spacing.md,
};

// ── Modal / Bottom Sheet ──────────────────────────────────────

export const Modal = {
  borderRadius:    Radius.modal,
  backgroundColor: Colors.surface,
  paddingH:        Spacing.lg,
  paddingV:        Spacing.lg,
  overlayColor:    Colors.bgOverlay,
  handleColor:     Colors.grey200,
  handleWidth:     36,
  handleHeight:    4,
  handleRadius:    Radius.full,
};

// ── Upload Component ──────────────────────────────────────────

export const Upload = {
  borderRadius:    5,
  borderWidth:     1,
  borderStyle:     'dashed',
  borderColor:     '#666565',
  backgroundColor: '#EEECEC',
  height:          71,
  iconColor:       '#666565',
  textColor:       '#666565',
  paddingV:        6,
  paddingH:        10,
};

// ─────────────────────────────────────────────────────────────
// 8. ANIMATION / TRANSITION CONSTANTS
// ─────────────────────────────────────────────────────────────

export const Animation = {
  durationFast:    150,
  durationBase:    250,
  durationSlow:    400,
  durationXSlow:   600,
  easingDefault:   'ease-in-out',
};

// ─────────────────────────────────────────────────────────────
// 9. Z-INDEX STACK
// ─────────────────────────────────────────────────────────────

export const ZIndex = {
  base:       0,
  raised:     10,
  dropdown:   100,
  sticky:     200,
  overlay:    300,
  modal:      400,
  toast:      500,
  tooltip:    600,
};

// ─────────────────────────────────────────────────────────────
// 10. UTILITY HELPERS
// ─────────────────────────────────────────────────────────────

/**
 * Returns the status color token object for a given status key.
 * Usage: getStatusColors('approved') → { bg, text, border, icon, badge }
 */
export const getStatusColors = (statusKey) => {
  return Colors.status[statusKey] ?? Colors.status.pending;
};

/**
 * Returns inline styles for a status chip given a status key.
 * Usage: <View style={getChipStyle('approved')} />
 */
export const getChipStyle = (statusKey) => {
  const s = getStatusColors(statusKey);
  return {
    backgroundColor: s.bg,
    borderColor:     s.border,
    borderWidth:     1,
    borderRadius:    Radius.chip,
    paddingHorizontal: Spacing.sm,
    height:          Chip.height,
    alignItems:      'center',
    justifyContent:  'center',
    flexDirection:   'row',
  };
};

/**
 * Converts a hex color to rgba string.
 * Usage: hexToRgba('#062E52', 0.15) → 'rgba(6,46,82,0.15)'
 */
export const hexToRgba = (hex, alpha = 1) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
};

// ─────────────────────────────────────────────────────────────
// DEFAULT EXPORT — complete theme object
// ─────────────────────────────────────────────────────────────

const Theme = {
  Colors,
  FontFamily,
  FontSize,
  FontWeight,
  LineHeight,
  Typography,
  Spacing,
  Radius,
  Shadow,
  Layout,
  Button,
  Input,
  Card,
  Chip,
  Header,
  TabBar,
  Stepper,
  ProgressBar,
  Divider,
  Modal,
  Upload,
  Animation,
  ZIndex,
  // Helpers
  getStatusColors,
  getChipStyle,
  hexToRgba,
};

export default Theme;