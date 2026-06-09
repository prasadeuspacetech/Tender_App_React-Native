// General Correspondence — standalone module (SQLite-backed list + add/delete)

import Ionicons from '@expo/vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

import Inputboxfield from '../../components/Inputboxfield';
import ScreenLayout from '../../components/layouts/Screenlayout';
import NativeDateField from '../../components/NativeDateField';
import PrimaryButton from '../../components/PrimaryButton';
import UploadDocument from '../../components/UploadDocument';
import {
  createGeneralCorrespondence,
  deleteGeneralCorrespondence,
  getAllGeneralCorrespondence,
} from '../../db/repositories/generalCorrespondenceRepository';
import { pickAndStoreCorrespondenceDocument } from '../../services/documentUploadService';
import theme from '../../theme';
import { formatDateForStorage } from '../../utils/dateFormat';
import useAttachmentPreview from '../../hooks/useAttachmentPreview';
import { buildUploadDocumentEntry } from '../../utils/documentUploadProps';
import { getFileNameFromPath } from '../../utils/fileName';

const EMPTY_FORM = {
  subject: '',
  date: '',
  document_path: '',
};

const CorrespondenceCard = ({ item, onDelete, onPreviewDocument, t }) => {
  const documentName = item.document_path
    ? getFileNameFromPath(item.document_path)
    : t('common:dash');
  const canPreviewDocument = !!item.document_path;

  return (
    <View style={styles.card}>
      <View style={styles.cardBody}>
        <Text style={styles.cardSubject} numberOfLines={2}>
          {item.subject || t('common:dash')}
        </Text>
        <Text style={styles.cardDate} numberOfLines={1}>
          {formatDateForStorage(item.date) || t('common:dash')}
        </Text>
        {canPreviewDocument ? (
          <TouchableOpacity
            onPress={() => onPreviewDocument(item.document_path)}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={t('correspondence:previewDocumentAccessibility', {
              name: documentName,
            })}
          >
            <Text style={[styles.cardDocument, styles.cardDocumentPreview]} numberOfLines={1}>
              {t('correspondence:documentLabel')}: {documentName}
            </Text>
          </TouchableOpacity>
        ) : (
          <Text style={styles.cardDocument} numberOfLines={1}>
            {t('correspondence:documentLabel')}: {documentName}
          </Text>
        )}
      </View>
      <TouchableOpacity
        onPress={() => onDelete(item.id)}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        accessibilityRole="button"
        accessibilityLabel={t('correspondence:deleteAccessibility')}
        style={styles.deleteButton}
      >
        <Ionicons
          name="trash-outline"
          size={22}
          color={theme.Colors?.textSecondary ?? '#666666'}
        />
      </TouchableOpacity>
    </View>
  );
};

const GeneralCorrespondenceScreen = ({ navigation }) => {
  const { t } = useTranslation(['correspondence', 'common']);
  const { previewAttachment, AttachmentPreviewModals } = useAttachmentPreview();
  const [entries, setEntries] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingDocument, setUploadingDocument] = useState(false);

  const refreshList = useCallback(() => {
    try {
      setEntries(getAllGeneralCorrespondence());
    } catch (error) {
      console.error('[GeneralCorrespondence] load failed:', error);
      setEntries([]);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      refreshList();
    }, [refreshList]),
  );

  const openModal = () => {
    setForm(EMPTY_FORM);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setForm(EMPTY_FORM);
  };

  const pickDocument = useCallback(async () => {
    setUploadingDocument(true);
    try {
      const result = await pickAndStoreCorrespondenceDocument();
      if (result?.filePath) {
        setForm((prev) => ({ ...prev, document_path: result.filePath }));
      }
    } finally {
      setUploadingDocument(false);
    }
  }, []);

  const handleSubmit = () => {
    if (submitting) return;

    setSubmitting(true);
    try {
      createGeneralCorrespondence({
        subject: form.subject,
        date: form.date,
        document_path: form.document_path,
      });
      closeModal();
      refreshList();
    } catch (error) {
      console.error('[GeneralCorrespondence] create failed:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (id) => {
    try {
      deleteGeneralCorrespondence(id);
      refreshList();
    } catch (error) {
      console.error('[GeneralCorrespondence] delete failed:', error);
    }
  };

  const renderAddButton = () => (
    <TouchableOpacity
      onPress={openModal}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      accessibilityRole="button"
      accessibilityLabel={t('correspondence:addAccessibility')}
      style={styles.addButton}
    >
      <Text style={styles.addButtonText}>{t('common:add')}</Text>
    </TouchableOpacity>
  );

  return (
    <>
      <ScreenLayout
        title={t('correspondence:title')}
        showBack
        showNotification={false}
        scrollable={false}
        onBackPress={() => navigation.goBack()}
        headerRight={renderAddButton()}
        contentStyle={styles.screenContent}
      >
        <FlatList
          data={entries}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <CorrespondenceCard
              item={item}
              onDelete={handleDelete}
              onPreviewDocument={previewAttachment}
              t={t}
            />
          )}
          contentContainerStyle={[
            styles.listContent,
            entries.length === 0 && styles.listContentEmpty,
          ]}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>{t('correspondence:emptyTitle')}</Text>
              <Text style={styles.emptyHint}>{t('correspondence:emptyHint')}</Text>
            </View>
          }
        />
      </ScreenLayout>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={closeModal}
      >
        <TouchableWithoutFeedback onPress={closeModal} accessible={false}>
          <View style={styles.modalOverlay} />
        </TouchableWithoutFeedback>

        <View style={styles.modalSheet}>
          <View style={styles.modalHandle} />
          <Text style={styles.modalTitle}>{t('correspondence:modalTitle')}</Text>

          <Inputboxfield
            label={t('common:subject')}
            placeholder={t('common:subject')}
            type="text"
            value={form.subject}
            onChangeText={(value) => setForm((prev) => ({ ...prev, subject: value }))}
          />

          <NativeDateField
            label={t('common:date')}
            placeholder={t('common:datePlaceholder')}
            value={form.date}
            onDateChange={(date) =>
              setForm((prev) => ({
                ...prev,
                date: formatDateForStorage(date),
              }))
            }
          />

          <UploadDocument
            sectionLabel={t('common:documents')}
            documents={[
              buildUploadDocumentEntry({
                title: t('correspondence:documentUploadTitle'),
                uploadText: t('correspondence:documentUploadText'),
                filePath: form.document_path,
                onPress: pickDocument,
                loading: uploadingDocument,
              }),
            ]}
          />

          <PrimaryButton
            title={t('common:submit')}
            fullWidth
            loading={submitting}
            style={styles.submitButton}
            onPress={handleSubmit}
          />
        </View>
      </Modal>

      <AttachmentPreviewModals />
    </>
  );
};

const styles = StyleSheet.create({
  screenContent: {
    flex: 1,
    paddingTop: theme.Spacing?.sm ?? 8,
  },
  addButton: {
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  addButtonText: {
    color: theme.Colors?.white ?? '#FFFFFF',
    fontSize: theme.FontSize?.md ?? 15,
    fontWeight: theme.FontWeight?.semiBold ?? '600',
    fontFamily: theme.FontFamily?.medium ?? undefined,
  },
  listContent: {
    paddingBottom: theme.Spacing?.xl ?? 24,
    flexGrow: 1,
  },
  listContentEmpty: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.Colors?.white ?? '#FFFFFF',
    borderWidth: 0.5,
    borderColor: '#000000',
    borderRadius: theme.Radius?.md ?? 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 13,
  },
  cardBody: {
    flex: 1,
    paddingRight: 12,
    minWidth: 0,
  },
  cardSubject: {
    fontSize: 17,
    fontWeight: '700',
    color: '#000000',
    lineHeight: 22,
    marginBottom: 6,
  },
  cardDate: {
    fontSize: 14,
    fontWeight: '400',
    color: '#444444',
    lineHeight: 18,
    marginBottom: 4,
  },
  cardDocument: {
    fontSize: 14,
    fontWeight: '400',
    color: '#444444',
    lineHeight: 18,
  },
  cardDocumentPreview: {
    color: theme.Colors?.primary ?? '#062E52',
    textDecorationLine: 'underline',
  },
  deleteButton: {
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  empty: {
    alignItems: 'center',
    paddingHorizontal: theme.Spacing?.md ?? 16,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.Colors?.textPrimary ?? '#1A1A1A',
  },
  emptyHint: {
    fontSize: theme.FontSize?.sm ?? 13,
    color: theme.Colors?.textSecondary ?? '#666666',
    marginTop: 8,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  modalSheet: {
    backgroundColor: theme.Colors?.white ?? '#FFFFFF',
    borderTopLeftRadius: theme.Radius?.lg ?? 16,
    borderTopRightRadius: theme.Radius?.lg ?? 16,
    paddingHorizontal: theme.Spacing?.lg ?? 20,
    paddingTop: theme.Spacing?.sm ?? 8,
    paddingBottom: theme.Spacing?.xl ?? 32,
  },
  modalHandle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1D5DB',
    marginBottom: theme.Spacing?.md ?? 16,
  },
  modalTitle: {
    fontSize: theme.FontSize?.lg ?? 17,
    fontWeight: theme.FontWeight?.bold ?? '700',
    color: theme.Colors?.textPrimary ?? '#1A1A1A',
    marginBottom: theme.Spacing?.md ?? 16,
  },
  submitButton: {
    marginTop: theme.Spacing?.lg ?? 24,
  },
});

export default GeneralCorrespondenceScreen;
