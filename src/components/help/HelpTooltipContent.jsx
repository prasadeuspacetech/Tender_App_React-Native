import { ScrollView, StyleSheet, Text, View } from 'react-native';

import theme from '../../theme';
import { FORM_FIELD_BORDER_RADIUS } from '../../theme/formFieldStyles';

const MAX_BODY_HEIGHT = 180;

/**
 * Scrollable help body shown inside AnchoredPopover.
 */
const HelpTooltipContent = ({ text, style }) => {
  if (!text) return null;

  return (
    <View style={[styles.wrap, style]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator
        bounces={false}
        nestedScrollEnabled
      >
        <Text style={styles.body}>{text}</Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    maxHeight: MAX_BODY_HEIGHT,
    borderRadius: FORM_FIELD_BORDER_RADIUS,
    backgroundColor: '#FFFFFF',
  },
  scroll: {
    maxHeight: MAX_BODY_HEIGHT,
  },
  scrollContent: {
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  body: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: theme.FontFamily?.regular ?? undefined,
    color: theme.Colors?.textPrimary ?? '#1A1A1A',
  },
});

export default HelpTooltipContent;
export { MAX_BODY_HEIGHT as HELP_TOOLTIP_MAX_BODY_HEIGHT };
