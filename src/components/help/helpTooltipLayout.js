import { Dimensions, Platform } from 'react-native';

const EDGE = 12;
const GAP = 6;
/** Minimum clearance below the icon before Android considers flipping above. */
const ANDROID_MIN_SPACE_BELOW = 48;

/**
 * Compute help-tooltip position anchored to the ⓘ icon rect.
 * Reads window size at call time (Android can report stale values if cached at import).
 */
export const computeHelpTooltipLayout = (anchor, contentHeight, options = {}) => {
  if (anchor == null || anchor.width == null || anchor.height == null) {
    return null;
  }

  const { height: screenHeight, width: screenWidth } = Dimensions.get('window');
  const minWidth = options.minWidth ?? 260;
  const gap = options.gap ?? GAP;
  const menuWidth = Math.min(
    Math.max(minWidth, anchor.width),
    screenWidth - EDGE * 2,
  );

  const iconCenterX = anchor.x + anchor.width / 2;
  let left = iconCenterX - menuWidth / 2;
  if (left + menuWidth > screenWidth - EDGE) {
    left = screenWidth - EDGE - menuWidth;
  }
  if (left < EDGE) {
    left = EDGE;
  }

  const belowTop = anchor.y + anchor.height + gap;
  const spaceBelow = screenHeight - belowTop - EDGE;
  const spaceAbove = anchor.y - EDGE;

  let openBelow;
  if (Platform.OS === 'android') {
    // Android: default below (match iOS). Only flip when there is clearly more room above.
    openBelow =
      spaceBelow >= ANDROID_MIN_SPACE_BELOW || spaceBelow >= spaceAbove;
  } else {
    openBelow =
      spaceBelow >= contentHeight || spaceBelow >= spaceAbove;
  }

  const top = openBelow
    ? belowTop
    : Math.max(EDGE, anchor.y - gap - contentHeight);

  return {
    top,
    left,
    width: menuWidth,
    maxHeight: contentHeight,
    openBelow,
  };
};
