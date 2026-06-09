import React from 'react';
import {
  Dimensions,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';

import { getFileNameFromPath } from '../../utils/fileName';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const AttachmentImagePreviewModal = ({
  visible = false,
  imageUri = null,
  onClose,
}) => {
  const { t } = useTranslation('errors');

  if (!visible || !imageUri) return null;

  const fileName = getFileNameFromPath(imageUri);

  return (
    <Modal
      visible
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.header}>
          <Text style={styles.fileName} numberOfLines={1}>
            {fileName || t('preview.imageTitle')}
          </Text>
          <Pressable
            onPress={onClose}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel={t('preview.closeAccessibility')}
            style={styles.closeButton}
          >
            <Ionicons name="close" size={28} color="#FFFFFF" />
          </Pressable>
        </View>

        <ScrollView
          style={styles.zoomScroll}
          contentContainerStyle={styles.zoomContent}
          maximumZoomScale={Platform.OS === 'ios' ? 4 : 1}
          minimumZoomScale={1}
          centerContent
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
        >
          <Image
            source={{ uri: imageUri }}
            style={styles.image}
            contentFit="contain"
            accessibilityLabel={t('preview.imageAccessibility')}
          />
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.92)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 56 : 24,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  fileName: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    marginRight: 12,
  },
  closeButton: {
    padding: 4,
  },
  zoomScroll: {
    flex: 1,
  },
  zoomContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingBottom: 32,
  },
  image: {
    width: SCREEN_WIDTH - 24,
    height: Math.max(SCREEN_HEIGHT * 0.65, 320),
  },
});

export default AttachmentImagePreviewModal;
