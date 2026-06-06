// src/screens/Works/WorksScreen.jsx
// Works list — load from SQLite, tap to resume on Add Work hub.

import React, { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import ScreenLayout from '../../components/layouts/Screenlayout';
import SettingsDrawer from '../../components/Settingsdrawer';
import StatusChip from '../../components/Statuschip';
import StatusChipGroup from '../../components/Statuschipgroup';
import { workCompletedToChipStatus } from '../../components/Statuschip';
import useWorkStore from '../../store/useWorkStore';
import { WORKFLOW_ROUTES } from '../../constants/WorkflowSteps';
import theme from '../../theme';

const formatBudget = (budget) => {
  const n = Number(budget) || 0;
  if (n === 0) return '—';
  return `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
};

const WorkListCard = ({ work, onPress, t }) => {
  const chipStatus = workCompletedToChipStatus(work.work_completed);
  const meta = [work.ward, work.department].filter(Boolean).join(' | ');

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.72}
      accessibilityRole="button"
      accessibilityLabel={t('works:openWorkAccessibility', {
        name: work.work_name || t('common:untitledWork'),
      })}
    >
      <View style={styles.cardRow}>
        <View style={styles.cardBody}>
          <Text style={styles.cardTitle} numberOfLines={2}>
            {work.work_name || t('common:untitledWork')}
          </Text>
          {work.work_code ? (
            <Text style={styles.cardCode} numberOfLines={1}>
              {t('common:codePrefix', { code: work.work_code })}
            </Text>
          ) : null}
          {meta ? (
            <Text style={styles.cardMeta} numberOfLines={1}>
              {meta}
            </Text>
          ) : null}
          <Text style={styles.cardBudget}>{formatBudget(work.budget)}</Text>
        </View>

        <View style={styles.cardChipColumn}>
          <StatusChip status={chipStatus} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const WorksScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation(['works', 'common']);
  const { works, refreshWorks, setCurrentWorkId } = useWorkStore();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');

  useFocusEffect(
    useCallback(() => {
      refreshWorks();
    }, [refreshWorks]),
  );

  const filteredWorks = useMemo(() => {
    if (statusFilter === 'all') return works;
    return works.filter(
      (work) => workCompletedToChipStatus(work.work_completed) === statusFilter,
    );
  }, [works, statusFilter]);

  const handleOpenWork = useCallback(
    (work) => {
      setCurrentWorkId(work.id);
      navigation.navigate('Add Work', {
        screen: WORKFLOW_ROUTES.ADD_WORK,
      });
    },
    [navigation, setCurrentWorkId],
  );

  const renderItem = useCallback(
    ({ item }) => (
      <WorkListCard work={item} onPress={() => handleOpenWork(item)} t={t} />
    ),
    [handleOpenWork, t, i18n.language],
  );

  const ListHeader = useCallback(
    () => (
      <StatusChipGroup
        selectedStatus={statusFilter}
        onChange={setStatusFilter}
      />
    ),
    [statusFilter, i18n.language],
  );

  return (
    <>
      <ScreenLayout
        title={t('works:title')}
        showMenu
        showNotification
        scrollable={false}
        onMenuPress={() => setDrawerOpen(true)}
      >
        <FlatList
          style={styles.list}
          data={filteredWorks}
          extraData={i18n.language}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          ListHeaderComponent={ListHeader}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>{t('works:emptyTitle')}</Text>
              <Text style={styles.emptyHint}>{t('works:emptyHint')}</Text>
            </View>
          }
        />
      </ScreenLayout>

      <SettingsDrawer
        visible={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: theme.Spacing?.xl ?? 24,
    flexGrow: 1,
  },
  card: {
    backgroundColor: theme.Colors?.white ?? '#FFFFFF',
    borderWidth: 0.5,
    borderColor: '#000000',
    borderRadius: theme.Radius?.md ?? 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 13,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardBody: {
    flex: 1,
    paddingRight: 10,
    minWidth: 0,
  },
  cardChipColumn: {
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#000000',
    lineHeight: 22,
    marginBottom: 4,
  },
  cardCode: {
    fontSize: 13,
    fontWeight: '400',
    color: '#444444',
    lineHeight: 18,
    marginBottom: 2,
  },
  cardMeta: {
    fontSize: 13,
    fontWeight: '400',
    color: '#444444',
    lineHeight: 18,
    marginBottom: 6,
  },
  cardBudget: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.Colors?.primary ?? '#062E52',
    lineHeight: 20,
  },
  empty: {
    paddingTop: theme.Spacing?.xl ?? 32,
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
});

export default WorksScreen;
