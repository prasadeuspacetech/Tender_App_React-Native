// src/screens/AddWork/workflow/ReTenderScreen.jsx
// Step 5 of 9: Re-Tender (Optional)
//
// Toggle OFF  → fields hidden, no validation, save advances workflow.
// Toggle ON   → 4 fields required, persisted in `retenders` per work_id.

import React, { useCallback, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import ProgressSlot from '../../../components/layouts/Progressslot';
import ScreenLayout from '../../../components/layouts/Screenlayout';
import WorkflowProgress from '../../../components/layouts/Workflowprogress';

import CalendarPicker from '../../../components/CalendarPicker';
import FormToggleField from '../../../components/FormToggleField';
import Inputboxfield from '../../../components/Inputboxfield';
import PrimaryButton from '../../../components/PrimaryButton';
import { formFieldStyles } from '../../../theme/formFieldStyles';

import useDraftStore from '../../../store/useDraftStore';
import useSaveAndContinue from '../../../hooks/useSaveAndContinue';
import useWorkflowStepGuard from '../../../hooks/useWorkflowStepGuard';
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

const EMPTY_FORM = {
  enable_retender: false,
  previous_tender_reference: '',
  new_tender_date: '',
  new_tender_amount: '',
  retender_reason: '',
};

const validate = (form) => {
  const errors = {};
  if (!form.enable_retender) return errors;

  if (!form.previous_tender_reference?.trim()) {
    errors.previous_tender_reference = 'Previous tender reference is required';
  }
  if (!form.new_tender_date) {
    errors.new_tender_date = 'New tender date is required';
  }
  if (!form.new_tender_amount?.toString().trim()) {
    errors.new_tender_amount = 'New tender amount is required';
  }
  if (!form.retender_reason?.trim()) {
    errors.retender_reason = 'Re-tender reason is required';
  }
  return errors;
};

const ReTenderScreen = ({ navigation }) => {
  useWorkflowStepGuard(WORKFLOW_ROUTES.RE_TENDER, navigation);

  const { getDraft, setDraft } = useDraftStore();
  const { currentWorkId } = useWorkStore();

  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  const loadReTenderForm = useCallback(() => {
    if (!currentWorkId) {
      setForm(EMPTY_FORM);
      setErrors({});
      return;
    }

    const draft = getDraft('reTender', currentWorkId);
    if (draft && Object.keys(draft).length > 0) {
      setForm({
        ...EMPTY_FORM,
        ...draft,
        new_tender_date: formatDateForStorage(draft.new_tender_date),
      });
      return;
    }

    try {
      const row = getReTenderByWorkId(currentWorkId);
      const hydrated = mapReTenderRowToForm(row);
      if (hydrated) {
        setForm(hydrated);
        queueMicrotask(() => setDraft('reTender', hydrated, currentWorkId));
      } else {
        setForm(EMPTY_FORM);
      }
    } catch (e) {
      console.warn('[ReTenderScreen] hydration failed:', e);
      setForm(EMPTY_FORM);
    }
  }, [currentWorkId, getDraft, setDraft]);

  useFocusEffect(
    useCallback(() => {
      loadReTenderForm();
    }, [loadReTenderForm]),
  );

  const updateField = useCallback(
    (key, value) => {
      if (!currentWorkId) return;
      setForm((prev) => {
        const updated = { ...prev, [key]: value };
        queueMicrotask(() => setDraft('reTender', updated, currentWorkId));
        return updated;
      });
      if (errors[key]) {
        setErrors((prev) => {
          const e = { ...prev };
          delete e[key];
          return e;
        });
      }
    },
    [currentWorkId, errors, setDraft],
  );

  const handleToggle = useCallback(() => {
    if (!currentWorkId) return;
    setForm((prev) => {
      const turningOff = prev.enable_retender;
      const next = turningOff
        ? { ...EMPTY_FORM, enable_retender: false }
        : { ...prev, enable_retender: true };
      queueMicrotask(() => setDraft('reTender', next, currentWorkId));
      return next;
    });
    setErrors({});
  }, [currentWorkId, setDraft]);

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
    if (!currentWorkId) {
      Alert.alert('Error', 'Work ID not found. Please restart from Work Details.');
      return;
    }

    const validationErrors = validate(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    saveAndContinue(form, navigation, {
      onValidationFail: (m) => Alert.alert('Save Failed', m),
    });
  };

  return (
    <ScreenLayout
      title="Re-Tender (Optional)"
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
        title="Re-Tender (Optional)"
        description="Re-tender if original tender failed"
        screenType="reTender"
      />

      <View style={styles.form}>
        <FormToggleField
          rowLabel="Enable re-tender?"
          value={form.enable_retender}
          onToggle={handleToggle}
        />

        {form.enable_retender && (
          <>
            <View>
              <Inputboxfield
                label="Previous tender ref"
                placeholder="e.g TND-2025-001"
                value={form.previous_tender_reference}
                onChangeText={(v) => updateField('previous_tender_reference', v)}
                error={errors.previous_tender_reference}
                required
              />
            </View>

            <View>
              <CalendarPicker
                label="New tender date"
                placeholder="dd/mm/yyyy"
                value={form.new_tender_date}
                onDateChange={(date) =>
                  updateField('new_tender_date', formatDateForStorage(date))
                }
                required
              />
              {errors.new_tender_date ? (
                <Text style={formFieldStyles.errorText}>
                  {errors.new_tender_date}
                </Text>
              ) : null}
            </View>

            <Inputboxfield
              label="New tender amount (₹)"
              placeholder="₹0.00"
              value={form.new_tender_amount}
              type="number"
              keyboardType="numeric"
              onChangeText={(v) => updateField('new_tender_amount', v)}
              error={errors.new_tender_amount}
              required
            />

            <Inputboxfield
              label="Re-tender reason"
              placeholder="Why is this tender re-issued?"
              value={form.retender_reason}
              multiline
              numberOfLines={2}
              onChangeText={(v) => updateField('retender_reason', v)}
              error={errors.retender_reason}
              required
            />
          </>
        )}
      </View>

      <PrimaryButton
        title="Save & Continue"
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
