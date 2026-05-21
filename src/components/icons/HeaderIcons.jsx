import Entypo from '@expo/vector-icons/Entypo';
import Ionicons from '@expo/vector-icons/Ionicons';

/** Header icon size — matches icons.expo.fyi reference (24) */
export const FIGMA_HEADER_ICON_SIZE = 24;

/** Settings drawer — Entypo `menu` (icons.expo.fyi/Entypo/menu) */
export const FigmaMenuIcon = ({
  size = FIGMA_HEADER_ICON_SIZE,
  color = '#FFFFFF',
}) => <Entypo name="menu" size={28} color={color} />;

/** Back button — Ionicons `chevron-back` (icons.expo.fyi/Ionicons/chevron-back) */
export const FigmaBackIcon = ({
  size = FIGMA_HEADER_ICON_SIZE,
  color = '#FFFFFF',
}) => <Ionicons name="chevron-back" size={size} color={color} />;
