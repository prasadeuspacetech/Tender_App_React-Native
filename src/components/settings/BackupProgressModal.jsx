import React from 'react';
import { ActivityIndicator, Modal, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import theme from '../../theme';

/**
 * @param {{ visible: boolean, mode: 'export' | 'import' | null, phase?: string | null }} props
 */
const BackupProgressModal = ({ visible, mode, phase = null }) => {
  const { t } = useTranslation('settings');

  if (!visible || !mode) return null;

  const namespace = mode === 'export' ? 'backup' : 'restore';
  const phaseKey = phase ? `${namespace}.phases.${phase}` : null;
  const phaseLabel = phaseKey ? t(phaseKey, { defaultValue: '' }) : '';
  const title = t(`${namespace}.${mode === 'export' ? 'exportingTitle' : 'importingTitle'}`);
  const fallbackMessage = t(
    `${namespace}.${mode === 'export' ? 'exportingMessage' : 'importingMessage'}`,
  );
  const message = phaseLabel || fallbackMessage;

  return (
    <Modal visible transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <ActivityIndicator size="large" color={theme.Colors.primary ?? '#062E52'} />
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.Spacing?.lg ?? 20,
  },
  card: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: theme.Colors.white ?? '#FFFFFF',
    borderRadius: 12,
    paddingVertical: theme.Spacing?.lg ?? 20,
    paddingHorizontal: theme.Spacing?.lg ?? 20,
    alignItems: 'center',
  },
  title: {
    marginTop: theme.Spacing?.md ?? 14,
    fontSize: theme.FontSize?.base ?? 15,
    fontWeight: theme.FontWeight?.semiBold ?? '600',
    color: theme.Colors.textPrimary ?? '#1A1A1A',
    textAlign: 'center',
  },
  message: {
    marginTop: theme.Spacing?.sm ?? 8,
    fontSize: theme.FontSize?.sm ?? 13,
    color: theme.Colors.textSecondary ?? '#666666',
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default BackupProgressModal;
