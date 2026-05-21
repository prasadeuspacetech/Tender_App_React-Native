// src/screens/AddWork/workflow/TenderCreationScreen.jsx
// Step 4 of 10: Tender Creation

import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Alert } from 'react-native';

import ScreenLayout     from '../../../components/layouts/Screenlayout';
import WorkflowProgress from '../../../components/layouts/Workflowprogress';
import ProgressSlot     from '../../../components/layouts/Progressslot';
import Inputboxfield    from '../../../components/Inputboxfield';
import CalendarPicker   from '../../../components/CalendarPicker';   // ← self-contained field
import UploadDocument from '../../../components/UploadDocument';
import { DOCUMENT_TYPES } from '../../../constants/documentTypes';
import useDocumentUpload from '../../../hooks/useDocumentUpload';
import { buildUploadDocumentEntry } from '../../../utils/documentUploadProps';
import StatusToggle     from '../../../components/StatusToggle';
import PrimaryButton    from '../../../components/PrimaryButton';

import useDraftStore      from '../../../store/useDraftStore';
import useWorkStore       from '../../../store/useWorkStore';
import useSaveAndContinue from '../../../hooks/useSaveAndContinue';
import useWorkflowStepGuard from '../../../hooks/useWorkflowStepGuard';

import { upsertTender, getTenderByWorkId } from '../../../db/repositories/tendersRepository';
import { WORKFLOW_ROUTES, TOTAL_WORKFLOW_STEPS } from '../../../constants/WorkflowSteps';
import theme from '../../../theme';

// ─── Helper: Date object → 'DD/MM/YYYY' string ───────────────────────────────
// CalendarPicker calls onDateChange with a real Date object.
// We store dates as strings in SQLite and Zustand.
const toDateString = (date) => {
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
};

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

  const { getDraft, setDraft } = useDraftStore();
  const { currentWorkId }      = useWorkStore();

  const [form, setForm]            = useState(EMPTY_FORM);
  const [isHydrated, setIsHydrated] = useState(false);

  // ── Field updater — sequential calls, NOT nested ──────────────────────────
  // setDraft must NOT be called inside setForm's updater (setState-in-render bug)
  const updateField = useCallback((key, value) => {
    const updated = { ...form, [key]: value };
    setForm(updated);
    setDraft('tenderCreation', updated);
  }, [form, setDraft]);

  // ── Hydration ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const hydrate = () => {
      // 1. In-session Zustand draft (user navigated back)
      const draft = getDraft('tenderCreation');
      if (draft && Object.keys(draft).length > 0) {
        setForm((prev) => ({ ...prev, ...draft }));
        setIsHydrated(true);
        return;
      }
      // 2. SQLite (app was killed and reopened)
      if (currentWorkId) {
        const saved = getTenderByWorkId(currentWorkId);
        if (saved) {
          setForm({
            tender_name:        saved.tender_name        ?? '',
            tender_number:      saved.tender_number      ?? '',
            tender_date:        saved.tender_date        ?? '',
            tender_amount:      saved.tender_amount != null ? String(saved.tender_amount) : '',
            status:             saved.status             ?? 'closed',
            advertisement_path: saved.advertisement_path ?? null,
            tender_notice_path: saved.tender_notice_path ?? null,
          });
        }
      }
      setIsHydrated(true);
    };

    hydrate();
  }, [currentWorkId]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Status toggle — ignores callback argument to avoid event-object bug ───
  const handleStatusToggle = useCallback(() => {
    updateField('status', form.status === 'open' ? 'closed' : 'open');
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
      (filePath) => updateField('advertisement_path', filePath),
    );

  const { pickDocument: pickTenderNotice, uploading: uploadingTenderNotice } =
    useDocumentUpload(
      currentWorkId,
      DOCUMENT_TYPES.TENDER_NOTICE,
      (filePath) => updateField('tender_notice_path', filePath),
    );

  const handleSave = () => {
    if (!currentWorkId) {
      Alert.alert('Error', 'Work ID not found. Please restart from Work Details.');
      return;
    }
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

        {/*
          CalendarPicker is self-contained: renders its own label + input row
          + inline calendar dropdown. No Inputboxfield wrapper needed.

          onDateChange receives a Date object → convert to 'DD/MM/YYYY' string.
          value accepts 'DD/MM/YYYY' string → CalendarPicker normalises it internally.
        */}
        <CalendarPicker
            label="Tender date"
            placeholder="dd/mm/yy"
            value={form.tender_date}
            onDateChange={(date) => updateField('tender_date', toDateString(date))}
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