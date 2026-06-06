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
import {
  createGeneralCorrespondence,
  deleteGeneralCorrespondence,
  getAllGeneralCorrespondence,
} from '../../db/repositories/generalCorrespondenceRepository';
import theme from '../../theme';
import { formatDateForStorage } from '../../utils/dateFormat';

const EMPTY_FORM = {
  subject: '',
  date: '',
};

const CorrespondenceCard = ({ item, onDelete, t }) => (
  <View style={styles.card}>
    <View style={styles.cardBody}>
      <Text style={styles.cardSubject} numberOfLines={2}>
        {item.subject || t('common:dash')}
      </Text>
      <Text style={styles.cardDate} numberOfLines={1}>
        {formatDateForStorage(item.date) || t('common:dash')}
      </Text>
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

const GeneralCorrespondenceScreen = ({ navigation }) => {
  const { t } = useTranslation(['correspondence', 'common']);
  const [entries, setEntries] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

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

  const handleSubmit = () => {
    if (submitting) return;

    setSubmitting(true);
    try {
      createGeneralCorrespondence({
        subject: form.subject,
        date: form.date,
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
            <CorrespondenceCard item={item} onDelete={handleDelete} t={t} />
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

          <PrimaryButton
            title={t('common:submit')}
            fullWidth
            loading={submitting}
            style={styles.submitButton}
            onPress={handleSubmit}
          />
        </View>
      </Modal>
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
