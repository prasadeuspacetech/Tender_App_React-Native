import React from 'react';
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { WebView } from 'react-native-webview';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';

const AttachmentPdfPreviewModal = ({
  visible = false,
  documentUri = null,
  title = '',
  onClose,
}) => {
  const { t } = useTranslation('errors');
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (visible) {
      setLoading(true);
    }
  }, [visible, documentUri]);

  if (!visible || !documentUri) return null;

  return (
    <Modal
      visible
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={1}>
            {title || t('preview.documentTitle')}
          </Text>
          <Pressable
            onPress={onClose}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel={t('preview.closeAccessibility')}
            style={styles.closeButton}
          >
            <Ionicons name="close" size={28} color="#111827" />
          </Pressable>
        </View>

        <View style={styles.viewer}>
          {loading ? (
            <ActivityIndicator
              size="large"
              color="#062E52"
              style={styles.loader}
            />
          ) : null}
          <WebView
            source={{ uri: documentUri }}
            style={styles.webView}
            originWhitelist={['*']}
            allowFileAccess
            allowFileAccessFromFileURLs
            allowUniversalAccessFromFileURLs
            onLoadEnd={() => setLoading(false)}
            onError={() => setLoading(false)}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'ios' ? 52 : 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginRight: 12,
  },
  closeButton: {
    padding: 4,
  },
  viewer: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  webView: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  loader: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
    backgroundColor: '#F3F4F6',
  },
});

export default AttachmentPdfPreviewModal;
