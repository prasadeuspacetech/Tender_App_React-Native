// src/screens/AddWork/workflow/TenderCreationScreen.jsx
// Step 4 of 10: Tender Creation

import React, { useCallback, useEffect, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import Inputboxfield from '../../../components/Inputboxfield';
import ProgressSlot from '../../../components/layouts/Progressslot';
import ScreenLayout from '../../../components/layouts/Screenlayout';
import WorkflowProgress from '../../../components/layouts/Workflowprogress';
import NativeDateField from '../../../components/NativeDateField';
import PrimaryButton from '../../../components/PrimaryButton';
import StatusToggle from '../../../components/StatusToggle';
import UploadDocument from '../../../components/UploadDocument';
import { DOCUMENT_TYPES } from '../../../constants/documentTypes';
import useDocumentUpload from '../../../hooks/useDocumentUpload';
import { buildUploadDocumentEntry } from '../../../utils/documentUploadProps';

import useSaveAndContinue from '../../../hooks/useSaveAndContinue';
import useWorkflowAutoSave from '../../../hooks/useWorkflowAutoSave';
import useWorkflowStepGuard from '../../../hooks/useWorkflowStepGuard';
import useDraftStore from '../../../store/useDraftStore';
import useWorkStore from '../../../store/useWorkStore';

import { TOTAL_WORKFLOW_STEPS, WORKFLOW_ROUTES } from '../../../constants/WorkflowSteps';
import { getTenderByWorkId, upsertTender } from '../../../db/repositories/tendersRepository';
import theme from '../../../theme';
import { formatDateForStorage } from '../../../utils/dateFormat';

// ─── Initial form ─────────────────────────────────────────────────────────────
const EMPTY_FORM = {
  tender_name:        '',
  tender_number:      '',
  tender_date:        '',       // stored as 'DD/MM/YYYY' string
  tender_amount:      '',
  status:             'closed', // 'open' | 'closed'
  advertisement_path: null,
  tender_notice_path: null,
};

// ─────────────────────────────────────────────────────────────────────────────
const TenderCreationScreen = ({ navigation }) => {
  useWorkflowStepGuard(WORKFLOW_ROUTES.TENDER_CREATION, navigation);

  const getDraft = useDraftStore((s) => s.getDraft);
  const setDraft = useDraftStore((s) => s.setDraft);
  const { currentWorkId }      = useWorkStore();

  const [form, setForm]            = useState(EMPTY_FORM);
  const [isHydrated, setIsHydrated] = useState(false);
  const { bindForm, scheduleDebouncedSave, saveImmediately } = useWorkflowAutoSave('tenderCreation');

  useEffect(() => {
    bindForm(form);
  }, [form, bindForm]);

  const updateField = useCallback(
    (key, value, { immediate = false } = {}) => {
      setForm((prev) => {
        const updated = { ...prev, [key]: value };
        queueMicrotask(() => {
          setDraft('tenderCreation', updated);
          bindForm(updated);
          if (immediate) saveImmediately();
          else scheduleDebouncedSave();
        });
        return updated;
      });
    },
    [setDraft, bindForm, scheduleDebouncedSave, saveImmediately],
  );

  useEffect(() => {
    const hydrate = () => {
      if (currentWorkId) {
        const saved = getTenderByWorkId(currentWorkId);
        if (saved) {
          const hydrated = {
            tender_name: saved.tender_name ?? '',
            tender_number: saved.tender_number ?? '',
            tender_date: saved.tender_date ?? '',
            tender_amount: saved.tender_amount != null ? String(saved.tender_amount) : '',
            status: saved.status ?? 'closed',
            advertisement_path: saved.advertisement_path ?? null,
            tender_notice_path: saved.tender_notice_path ?? null,
          };
          setForm(hydrated);
          bindForm(hydrated);
          setIsHydrated(true);
          return;
        }
      }

      const draft = getDraft('tenderCreation');
      if (draft && Object.keys(draft).length > 0) {
        const merged = { ...EMPTY_FORM, ...draft };
        setForm(merged);
        bindForm(merged);
      }
      setIsHydrated(true);
    };

    hydrate();
  }, [currentWorkId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleStatusToggle = useCallback(() => {
    updateField('status', form.status === 'open' ? 'closed' : 'open', { immediate: true });
  }, [form.status, updateField]);

  // ── Save & Continue ────────────────────────────────────────────────────────
  const { saveAndContinue, isSaving } = useSaveAndContinue(
    'tenderCreation',
    (workId, data) => upsertTender(workId, data),
    WORKFLOW_ROUTES.RE_TENDER,
    WORKFLOW_ROUTES.TENDER_CREATION,
  );

  const { pickDocument: pickAdvertisement, uploading: uploadingAdvertisement } =
    useDocumentUpload(
      currentWorkId,
      DOCUMENT_TYPES.TENDER_ADVERTISEMENT,
      (filePath) => updateField('advertisement_path', filePath, { immediate: true }),
    );

  const { pickDocument: pickTenderNotice, uploading: uploadingTenderNotice } =
    useDocumentUpload(
      currentWorkId,
      DOCUMENT_TYPES.TENDER_NOTICE,
      (filePath) => updateField('tender_notice_path', filePath, { immediate: true }),
    );

  const handleSave = () => {
    saveAndContinue(form, navigation, {
      onValidationFail: (m) => Alert.alert('Save Failed', m),
    });
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <ScreenLayout
      title="Tender Creation"
      showBack
      showNotification
      scrollable
      keyboardAware
      onBackPress={() => navigation.goBack()}
    >
      <WorkflowProgress
        currentStep={4}
        totalSteps={TOTAL_WORKFLOW_STEPS}
        showPercentage
        style={styles.progress}
      />
      <ProgressSlot
        step={4}
        title="Tender Creation"
        description="Work on creating the tender has not started"
        screenType="tenderCreation"
      />

      <View style={styles.form}>

        <Inputboxfield
          label="Tender name"
          placeholder="Enter the tender name"
          value={form.tender_name}
          onChangeText={(v) => updateField('tender_name', v)}
        />

        <Inputboxfield
          label="Tender number"
          placeholder="e.g TND-2025-001"
          value={form.tender_number}
          onChangeText={(v) => updateField('tender_number', v)}
        />

        <NativeDateField
          label="Tender date"
          placeholder="dd/mm/yy"
          value={form.tender_date}
          onDateChange={(date) =>
            updateField('tender_date', formatDateForStorage(date), { immediate: true })
          }
        />

        <Inputboxfield
          label="Tender amount (₹)"
          placeholder="₹0.00"
          type="number"
          keyboardType="numeric"
          value={form.tender_amount}
          onChangeText={(v) => updateField('tender_amount', v)}
        />

        <Inputboxfield
          label="Status"
          placeholder="Tender Status"
          value=""
          editable={false}
          rightIcon={
            <StatusToggle
              status={form.status}
              onToggle={handleStatusToggle}
            />
          }
        />

        <UploadDocument
          sectionLabel="Documents"
          layout="grid"
          documents={[
            buildUploadDocumentEntry({
              title: 'Newspaper Advertisement',
              uploadText: 'Upload Newspaper ad',
              filePath: form.advertisement_path,
              onPress: pickAdvertisement,
              loading: uploadingAdvertisement,
            }),
            buildUploadDocumentEntry({
              title: 'Tender Notice',
              uploadText: 'Upload Tender notice',
              filePath: form.tender_notice_path,
              onPress: pickTenderNotice,
              loading: uploadingTenderNotice,
            }),
          ]}
        />

      </View>

      <PrimaryButton
        title="Save & Continue"
        loading={isSaving}
        fullWidth
        style={styles.cta}
        onPress={handleSave}
      />
    </ScreenLayout>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  progress: { marginBottom: theme.Spacing?.sm ?? 8 },
  form:     { marginTop:    theme.Spacing?.sm ?? 8 },

  cta: {
    marginTop:    theme.Spacing?.lg ?? 24,
    marginBottom: theme.Spacing?.xl ?? 32,
  },
});

export default TenderCreationScreen;