import { Dimensions, Platform } from 'react-native';

const EDGE = 12;
const GAP = 6;
/** Minimum clearance below the icon before Android considers flipping above. */
const ANDROID_MIN_SPACE_BELOW = 48;

const clampHorizontal = (left, menuWidth, containerWidth, edge = EDGE) => {
  let nextLeft = left;
  if (nextLeft + menuWidth > containerWidth - edge) {
    nextLeft = containerWidth - edge - menuWidth;
  }
  if (nextLeft < edge) {
    nextLeft = edge;
  }
  return nextLeft;
};

const resolveOpenBelow = (spaceBelow, spaceAbove, contentHeight) => {
  if (Platform.OS === 'android') {
    return spaceBelow >= ANDROID_MIN_SPACE_BELOW || spaceBelow >= spaceAbove;
  }
  return spaceBelow >= contentHeight || spaceBelow >= spaceAbove;
};

/**
 * Compute help-tooltip position anchored to the icon rect in window coordinates.
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
  const left = clampHorizontal(iconCenterX - menuWidth / 2, menuWidth, screenWidth);

  const belowTop = anchor.y + anchor.height + gap;
  const spaceBelow = screenHeight - belowTop - EDGE;
  const spaceAbove = anchor.y - EDGE;
  const openBelow = resolveOpenBelow(spaceBelow, spaceAbove, contentHeight);

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

/**
 * Compute tooltip position relative to a scoped container (measureLayout coords).
 */
export const computeScopedHelpTooltipLayout = (
  anchor,
  contentHeight,
  scopeSize,
  options = {},
) => {
  if (anchor == null || anchor.width == null || anchor.height == null) {
    return null;
  }
  if (!scopeSize?.width || !scopeSize?.height) {
    return null;
  }

  const edge = options.edge ?? EDGE;
  const gap = options.gap ?? GAP;
  const minWidth = options.minWidth ?? 260;
  const scopeWidth = scopeSize.width;
  const scopeHeight = scopeSize.height;

  const menuWidth = Math.min(
    Math.max(minWidth, anchor.width),
    scopeWidth - edge * 2,
  );

  const iconCenterX = anchor.x + anchor.width / 2;
  const left = clampHorizontal(iconCenterX - menuWidth / 2, menuWidth, scopeWidth, edge);

  const belowTop = anchor.y + anchor.height + gap;
  const spaceBelow = scopeHeight - belowTop - edge;
  const spaceAbove = anchor.y - edge;
  const openBelow = resolveOpenBelow(spaceBelow, spaceAbove, contentHeight);

  const top = openBelow
    ? belowTop
    : Math.max(edge, anchor.y - gap - contentHeight);

  return {
    top,
    left,
    width: menuWidth,
    maxHeight: contentHeight,
    openBelow,
  };
};

export const pointInRect = (pageX, pageY, rect) => {
  if (!rect) return false;
  return (
    pageX >= rect.x
    && pageX <= rect.x + rect.width
    && pageY >= rect.y
    && pageY <= rect.y + rect.height
  );
};
