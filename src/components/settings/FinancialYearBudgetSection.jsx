import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import FormDropdown from '../FormDropdown';
import Inputboxfield from '../Inputboxfield';
import PrimaryButton from '../PrimaryButton';
import { FINANCIAL_YEAR_OPTIONS } from '../../constants/dropdownOptions';
import {
  getFinancialYearBudget,
  upsertFinancialYearBudget,
} from '../../db/repositories/financialYearBudgetRepository';
import { localizeDropdownOptions } from '../../i18n/workflowLabels';
import theme from '../../theme';

/** Neutral default — not stored in SQLite. */
const FY_NONE = '';

const FY_PLACEHOLDER_OPTION = { label: '-', value: FY_NONE };

const FinancialYearBudgetSection = () => {
  const { t } = useTranslation(['settings', 'workflow']);
  const [financialYear, setFinancialYear] = useState(FY_NONE);
  const [budgetAmount, setBudgetAmount] = useState('');
  const [saving, setSaving] = useState(false);

  const fyOptions = useMemo(
    () => [
      FY_PLACEHOLDER_OPTION,
      ...localizeDropdownOptions(FINANCIAL_YEAR_OPTIONS, t),
    ],
    [t],
  );

  const resetToDefault = useCallback(() => {
    setFinancialYear(FY_NONE);
    setBudgetAmount('');
  }, []);

  const loadBudgetForYear = useCallback((fy) => {
    if (!fy) {
      setBudgetAmount('');
      return;
    }

    try {
      const row = getFinancialYearBudget(fy);
      setBudgetAmount(
        row?.budget_amount != null && row.budget_amount > 0
          ? String(row.budget_amount)
          : '',
      );
    } catch (error) {
      console.error('[FinancialYearBudgetSection] load failed:', error);
      setBudgetAmount('');
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      resetToDefault();
    }, [resetToDefault]),
  );

  const handleYearChange = (value) => {
    const nextYear = value ?? FY_NONE;
    setFinancialYear(nextYear);
    loadBudgetForYear(nextYear);
  };

  const handleSave = () => {
    if (saving) return;

    if (!financialYear) {
      Alert.alert(
        t('settings:fyBudget.selectYearTitle'),
        t('settings:fyBudget.selectYearMessage'),
      );
      return;
    }

    const amount = parseFloat(String(budgetAmount).replace(/[^0-9.]/g, ''));
    if (!Number.isFinite(amount) || amount < 0) {
      Alert.alert(t('settings:fyBudget.invalidTitle'), t('settings:fyBudget.invalidMessage'));
      return;
    }

    setSaving(true);
    try {
      upsertFinancialYearBudget(financialYear, amount);
      Alert.alert(t('settings:fyBudget.savedTitle'), t('settings:fyBudget.savedMessage'));
      resetToDefault();
    } catch (error) {
      console.error('[FinancialYearBudgetSection] save failed:', error);
      Alert.alert(t('settings:fyBudget.errorTitle'), t('settings:fyBudget.errorMessage'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.hint}>{t('settings:fyBudget.subtitle')}</Text>

      <FormDropdown
        label={t('settings:fyBudget.financialYearLabel')}
        placeholder={t('settings:fyBudget.financialYearPlaceholder')}
        data={fyOptions}
        value={financialYear}
        onChange={(item) => handleYearChange(item?.value)}
      />

      <Inputboxfield
        label={t('settings:fyBudget.amountLabel')}
        placeholder={t('settings:fyBudget.amountPlaceholder')}
        type="number"
        keyboardType="numeric"
        value={budgetAmount}
        onChangeText={setBudgetAmount}
      />

      <PrimaryButton
        title={t('settings:fyBudget.save')}
        fullWidth
        loading={saving}
        style={styles.saveButton}
        onPress={handleSave}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: theme.Spacing?.xs ?? 4,
  },
  hint: {
    fontSize: theme.FontSize?.sm ?? 13,
    color: theme.Colors?.textSecondary ?? '#666666',
    marginBottom: theme.Spacing?.sm ?? 8,
  },
  saveButton: {
    marginTop: theme.Spacing?.md ?? 16,
  },
});

export default FinancialYearBudgetSection;
