// src/screens/AddWork/workflow/ReTenderScreen.jsx
// Step 5 of 9: Re-Tender (Optional)
//
// Toggle OFF  → fields hidden, no validation, save advances workflow.
// Toggle ON   → fields shown, persisted in `retenders` per work_id.

import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import ProgressSlot from '../../../components/layouts/Progressslot';
import ScreenLayout from '../../../components/layouts/Screenlayout';
import WorkflowProgress from '../../../components/layouts/Workflowprogress';

import { HelpTooltipScope } from '../../../components/help/helpTooltipScope';
import FormToggleField from '../../../components/FormToggleField';
import Inputboxfield from '../../../components/Inputboxfield';
import NativeDateField from '../../../components/NativeDateField';
import PrimaryButton from '../../../components/PrimaryButton';

import useSaveAndContinue from '../../../hooks/useSaveAndContinue';
import useWorkflowAutoSave from '../../../hooks/useWorkflowAutoSave';
import useWorkflowStepGuard from '../../../hooks/useWorkflowStepGuard';
import useDraftStore from '../../../store/useDraftStore';
import useWorkStore from '../../../store/useWorkStore';

import {
    getReTenderByWorkId,
    mapReTenderRowToForm,
    upsertReTender,
} from '../../../db/repositories/retendersRepository';
import { formatDateForStorage } from '../../../utils/dateFormat';

import {
    TOTAL_WORKFLOW_STEPS,
    WORKFLOW_ROUTES,
} from '../../../constants/WorkflowSteps';

import theme from '../../../theme';
import {
  getStepProgressDescription,
  getStepScreenTitle,
  getStepTitle,
} from '../../../i18n/workflowLabels';

const SCREEN_TYPE = 'reTender';

const EMPTY_FORM = {
  enable_retender: false,
  previous_tender_reference: '',
  new_tender_date: '',
  new_tender_amount: '',
  retender_reason: '',
};

const ReTenderScreen = ({ navigation }) => {
  const { t } = useTranslation('workflow');

  useWorkflowStepGuard(WORKFLOW_ROUTES.RE_TENDER, navigation);

  const getDraft = useDraftStore((s) => s.getDraft);
  const setDraft = useDraftStore((s) => s.setDraft);
  const { currentWorkId } = useWorkStore();

  const [form, setForm] = useState(EMPTY_FORM);
  const { bindForm, scheduleDebouncedSave, saveImmediately } = useWorkflowAutoSave('reTender');

  useEffect(() => {
    bindForm(form);
  }, [form, bindForm]);

  const loadReTenderForm = useCallback(() => {
    if (!currentWorkId) {
      setForm(EMPTY_FORM);
      bindForm(EMPTY_FORM);
      return;
    }

    try {
      const row = getReTenderByWorkId(currentWorkId);
      const hydrated = mapReTenderRowToForm(row);
      if (hydrated) {
        setForm(hydrated);
        bindForm(hydrated);
        queueMicrotask(() => setDraft('reTender', hydrated, currentWorkId));
        return;
      }
    } catch (e) {
      console.warn('[ReTenderScreen] hydration failed:', e);
    }

    const draft = getDraft('reTender', currentWorkId);
    if (draft && Object.keys(draft).length > 0) {
      const merged = {
        ...EMPTY_FORM,
        ...draft,
        new_tender_date: formatDateForStorage(draft.new_tender_date),
      };
      setForm(merged);
      bindForm(merged);
      return;
    }

    setForm(EMPTY_FORM);
    bindForm(EMPTY_FORM);
  }, [currentWorkId, getDraft, setDraft, bindForm]);

  useFocusEffect(
    useCallback(() => {
      loadReTenderForm();
    }, [loadReTenderForm]),
  );

  const updateField = useCallback(
    (key, value, { immediate = false } = {}) => {
      if (!currentWorkId) return;
      setForm((prev) => {
        const updated = { ...prev, [key]: value };
        queueMicrotask(() => {
          setDraft('reTender', updated, currentWorkId);
          bindForm(updated);
          if (immediate) saveImmediately();
          else scheduleDebouncedSave();
        });
        return updated;
      });
    },
    [currentWorkId, setDraft, bindForm, scheduleDebouncedSave, saveImmediately],
  );

  const handleToggle = useCallback(() => {
    if (!currentWorkId) return;
    setForm((prev) => {
      const turningOff = prev.enable_retender;
      const next = turningOff
        ? { ...EMPTY_FORM, enable_retender: false }
        : { ...prev, enable_retender: true };
      queueMicrotask(() => {
        setDraft('reTender', next, currentWorkId);
        bindForm(next);
        saveImmediately();
      });
      return next;
    });
  }, [currentWorkId, setDraft, bindForm, saveImmediately]);

  const { saveAndContinue, isSaving } = useSaveAndContinue(
    'reTender',
    (workId, data) => {
      if (!workId) {
        throw new Error('Work ID not found. Please complete Work Details first.');
      }
      return upsertReTender(workId, {
        enable_retender: data.enable_retender,
        previous_tender_reference: data.previous_tender_reference,
        new_tender_date: data.new_tender_date,
        new_tender_amount: data.new_tender_amount,
        retender_reason: data.retender_reason,
      });
    },
    WORKFLOW_ROUTES.CONTRACTOR_ASSIGNMENT,
    WORKFLOW_ROUTES.RE_TENDER,
  );

  const handleSave = () => {
    saveAndContinue(form, navigation, {
      onValidationFail: (m) => Alert.alert(t('common.saveFailedTitle'), m),
    });
  };

  return (
    <ScreenLayout
      title={getStepScreenTitle(SCREEN_TYPE, t)}
      showBack
      showNotification
      scrollable
      keyboardAware
      onBackPress={() => navigation.goBack()}
    >
      <WorkflowProgress
        currentStep={5}
        totalSteps={TOTAL_WORKFLOW_STEPS}
        showPercentage
        style={styles.progress}
      />

      <ProgressSlot
        step={5}
        title={getStepTitle(SCREEN_TYPE, t)}
        description={getStepProgressDescription(SCREEN_TYPE, t)}
        screenType="reTender"
      />

      <HelpTooltipScope>
        <View style={styles.form}>
          <FormToggleField
            rowLabelOn={t('steps.reTender.toggles.on')}
            rowLabelOff={t('steps.reTender.toggles.off')}
            helpKey="workflow.reTender.enableRetender"
            helpTooltipId="reTender-enableRetender"
            value={form.enable_retender}
            onToggle={handleToggle}
          />

          {form.enable_retender && (
            <>
              <Inputboxfield
                label={t('steps.reTender.fields.previousRef.label')}
                placeholder={t('steps.reTender.fields.previousRef.placeholder')}
                helpKey="workflow.reTender.previousRef"
                helpTooltipId="reTender-previousRef"
                type="alphanumeric"
                value={form.previous_tender_reference}
                onChangeText={(v) => updateField('previous_tender_reference', v)}
              />

              <NativeDateField
                label={t('steps.reTender.fields.newDate.label')}
                placeholder={t('steps.reTender.fields.newDate.placeholder')}
                helpKey="workflow.reTender.newDate"
                helpTooltipId="reTender-newDate"
                value={form.new_tender_date}
                onDateChange={(date) =>
                  updateField('new_tender_date', formatDateForStorage(date), { immediate: true })
                }
              />

              <Inputboxfield
                label={t('steps.reTender.fields.newAmount.label')}
                placeholder={t('steps.reTender.fields.newAmount.placeholder')}
                helpKey="workflow.reTender.newAmount"
                helpTooltipId="reTender-newAmount"
                value={form.new_tender_amount}
                type="number"
                keyboardType="numeric"
                onChangeText={(v) => updateField('new_tender_amount', v)}
              />

              <Inputboxfield
                label={t('steps.reTender.fields.reason.label')}
                placeholder={t('steps.reTender.fields.reason.placeholder')}
                helpKey="workflow.reTender.reason"
                helpTooltipId="reTender-reason"
                value={form.retender_reason}
                multiline
                numberOfLines={2}
                onChangeText={(v) => updateField('retender_reason', v)}
              />
            </>
          )}
        </View>
      </HelpTooltipScope>

      <PrimaryButton
        title={t('common.saveAndContinue')}
        onPress={handleSave}
        loading={isSaving}
        fullWidth
        style={styles.cta}
      />
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  progress: {
    marginBottom: theme.Spacing?.sm ?? 8,
  },
  form: {
    marginTop: theme.Spacing?.sm ?? 8,
  },
  cta: {
    marginTop: theme.Spacing?.lg ?? 24,
    marginBottom: theme.Spacing?.xl ?? 32,
  },
});

export default ReTenderScreen;
