/**
 * Modal overlay shell for FieldHelpTooltip — same panel styling as AnchoredPopover.
 */
import React from 'react';
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';

import {
  FORM_FIELD_BORDER_COLOR,
  FORM_FIELD_BORDER_RADIUS,
  FORM_FIELD_BORDER_WIDTH,
} from '../../theme/formFieldStyles';

const HelpTooltipOverlay = ({
  visible = false,
  layout = null,
  onClose,
  children,
}) => {
  if (!visible || !layout) return null;

  return (
    <Modal
      visible
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <Pressable
        style={styles.backdrop}
        onPress={onClose}
        accessible={false}
      />

      <View
        style={[
          styles.panel,
          {
            top: layout.top,
            left: layout.left,
            width: layout.width,
            maxHeight: layout.maxHeight,
          },
        ]}
        pointerEvents="box-none"
      >
        <View style={styles.panelInner} pointerEvents="auto">
          {children}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.22)',
  },
  panel: {
    position: 'absolute',
    borderRadius: FORM_FIELD_BORDER_RADIUS,
    borderWidth: FORM_FIELD_BORDER_WIDTH,
    borderColor: FORM_FIELD_BORDER_COLOR,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.14,
        shadowRadius: 12,
      },
      android: { elevation: 10 },
      default: {},
    }),
  },
  panelInner: {
    width: '100%',
  },
});

export default HelpTooltipOverlay;
