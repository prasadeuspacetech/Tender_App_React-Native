import { Dimensions, Platform } from 'react-native';

/** Keep in sync with BottomTabNavigator tabBarStyle height. */
export const TAB_BAR_BASE_HEIGHT = 72;
export const DROPDOWN_ITEM_ROW_HEIGHT = 44;
export const DROPDOWN_MENU_VERTICAL_PADDING = 8;
export const DROPDOWN_SEARCH_FIELD_HEIGHT = 52;
export const DROPDOWN_EDGE_PADDING = 8;

/**
 * Bottom chrome height (tab bar + home indicator on iOS).
 * @param {{ bottom?: number }} safeAreaInsets
 */
export const getTabBarObstructionHeight = (safeAreaInsets = {}) => {
  if (Platform.OS === 'ios') {
    return TAB_BAR_BASE_HEIGHT + (safeAreaInsets.bottom ?? 0);
  }
  return TAB_BAR_BASE_HEIGHT;
};

export const estimateDropdownMenuHeight = ({
  optionCount = 0,
  maxHeight = 280,
  searchable = false,
}) => {
  const rowsHeight = Math.max(optionCount, 1) * DROPDOWN_ITEM_ROW_HEIGHT;
  const searchHeight = searchable ? DROPDOWN_SEARCH_FIELD_HEIGHT : 0;
  const estimated = rowsHeight + searchHeight + DROPDOWN_MENU_VERTICAL_PADDING;
  return Math.min(maxHeight, estimated);
};

/**
 * Choose dropdown direction based on measured field position and available space.
 * @returns {'top' | 'bottom'}
 */
export const resolveDropdownPlacement = ({
  fieldY,
  fieldHeight,
  windowHeight = Dimensions.get('window').height,
  menuMaxHeight,
  optionCount,
  searchable = false,
  bottomObstruction = TAB_BAR_BASE_HEIGHT,
  topInset = 0,
  edgePadding = DROPDOWN_EDGE_PADDING,
}) => {
  const menuHeight = estimateDropdownMenuHeight({
    optionCount,
    maxHeight: menuMaxHeight,
    searchable,
  });

  const fieldBottom = fieldY + fieldHeight;
  const spaceBelow = windowHeight - fieldBottom - bottomObstruction - edgePadding;
  const spaceAbove = fieldY - topInset - edgePadding;

  if (spaceBelow >= menuHeight) return 'bottom';
  if (spaceAbove >= menuHeight) return 'top';
  return spaceAbove > spaceBelow ? 'top' : 'bottom';
};
