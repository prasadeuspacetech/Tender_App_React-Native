// src/screens/AddWork/workflow/CompletionClosureScreen.jsx
// Step 10 of 10: Completion & Closure (final screen)
// On submit → persists locally, clears all drafts, navigates to AddWork list.

import { useCallback, useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import DropdownModal    from '../../../components/DropdownModal';
import Inputboxfield    from '../../../components/Inputboxfield';
import ProgressSlot     from '../../../components/layouts/Progressslot';
import ScreenLayout     from '../../../components/layouts/Screenlayout';
import WorkflowProgress from '../../../components/layouts/Workflowprogress';
import PrimaryButton    from '../../../components/PrimaryButton';
import UploadDocument from '../../../components/UploadDocument';
import { DOCUMENT_TYPES } from '../../../constants/documentTypes';
import useDocumentUpload from '../../../hooks/useDocumentUpload';
import { buildUploadDocumentEntry } from '../../../utils/documentUploadProps';

import useSaveAndContinue from '../../../hooks/useSaveAndContinue';
import useWorkflowStepGuard from '../../../hooks/useWorkflowStepGuard';
import useDraftStore      from '../../../store/useDraftStore';
import useWorkStore       from '../../../store/useWorkStore';

import { WORK_COMPLETED_OPTIONS }          from '../../../constants/dropdownOptions';
import { TOTAL_WORKFLOW_STEPS, WORKFLOW_ROUTES } from '../../../constants/WorkflowSteps';
import { getCompletionClosureByWorkId, upsertCompletionClosure } from '../../../db/repositories/completionClosureRepository';
import theme from '../../../theme';

// ─── Colour tokens ────────────────────────────────────────────────────────────
const TEXT      = theme.Colors?.text      ?? '#1A1A1A';
const SECONDARY = theme.Colors?.secondary ?? '#777777';
const BORDER    = theme.Colors?.border    ?? '#E0E0E0';
const WHITE     = theme.Colors?.white     ?? '#FFFFFF';

// ─── Initial form ─────────────────────────────────────────────────────────────
const EMPTY_FORM = {
  work_completed:              'Pending',
  completion_certificate_path: null,
  site_photos_path:            null,
};

// ─────────────────────────────────────────────────────────────────────────────
const CompletionClosureScreen = ({ navigation }) => {
  useWorkflowStepGuard(WORKFLOW_ROUTES.COMPLETION_CLOSURE, navigation);

  const { getDraft, setDraft, clearAllDrafts } = useDraftStore();
  const { currentWorkId, clearCurrentWork }    = useWorkStore();

  const [form, setForm]         = useState(EMPTY_FORM);
  const [isHydrated, setIsHydrated] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // ── Field updater ──────────────────────────────────────────────────────────
  const updateField = useCallback((key, value) => {
    const updated = { ...form, [key]: value };
    setForm(updated);
    setDraft('completionClosure', updated);
  }, [form, setDraft]);

  // ── Hydration ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const hydrate = () => {
      const draft = getDraft('completionClosure');
      if (draft && Object.keys(draft).length > 0) {
        setForm((prev) => ({ ...prev, ...draft }));
        setIsHydrated(true);
        return;
      }
      if (currentWorkId) {
        const saved = getCompletionClosureByWorkId(currentWorkId);
        if (saved) {
          setForm({
            work_completed:              saved.work_completed              ?? 'Pending',
            completion_certificate_path: saved.completion_certificate_path ?? null,
            site_photos_path:            saved.site_photos_path            ?? null,
          });
        }
      }
      setIsHydrated(true);
    };
    hydrate();
  }, [currentWorkId]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Dropdown handler ───────────────────────────────────────────────────────
  const handleDropdownSelect = useCallback((option) => {
    updateField('work_completed', option.value);
    setDropdownOpen(false);
  }, [updateField]);

  // ── Resolve display label from value ──────────────────────────────────────
  const getLabel = useCallback((options, value) => {
    if (!value) return '';
    return options.find((o) => o.value === value)?.label ?? value;
  }, []);

  // ── Save & Continue ────────────────────────────────────────────────────────
  const { saveAndContinue, isSaving } = useSaveAndContinue(
    'completionClosure',
    async (workId, data) => {
      await upsertCompletionClosure(workId, data);
      clearAllDrafts();
      clearCurrentWork();
      return workId;
    },
    WORKFLOW_ROUTES.ADD_WORK,
    WORKFLOW_ROUTES.COMPLETION_CLOSURE,
  );

  const { pickDocument: pickCompletionCert, uploading: uploadingCompletionCert } =
    useDocumentUpload(
      currentWorkId,
      DOCUMENT_TYPES.COMPLETION_CERTIFICATE,
      (filePath) => updateField('completion_certificate_path', filePath),
    );

  const { pickDocument: pickSitePhotos, uploading: uploadingSitePhotos } =
    useDocumentUpload(
      currentWorkId,
      DOCUMENT_TYPES.SITE_PHOTOS,
      (filePath) => updateField('site_photos_path', filePath),
    );

  const handleSubmit = () => {
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
      title="Completion & Closure"
      showBack
      showNotification
      scrollable
      keyboardAware
      onBackPress={() => navigation.goBack()}
    >
      <WorkflowProgress
        currentStep={9}
        totalSteps={TOTAL_WORKFLOW_STEPS}
        showPercentage
        style={styles.progress}
      />
      <ProgressSlot
        step={9}
        title="Completion & Closure"
        description="Mark work completion and close workflow"
        screenType="completionClosure"
      />

      <View style={styles.form}>

        {/* ── Work Completed dropdown — same pattern as WorkDetailsScreen ── */}
        <Inputboxfield
          label="Work completed"
          placeholder="Select status"
          value={getLabel(WORK_COMPLETED_OPTIONS, form.work_completed)}
          type="dropdown"
          onPress={() => setDropdownOpen(true)}
        />

        <UploadDocument
          sectionLabel="Documents"
          layout="grid"
          documents={[
            buildUploadDocumentEntry({
              title: 'Completion certificate',
              uploadText: 'Upload Completion certificate',
              filePath: form.completion_certificate_path,
              onPress: pickCompletionCert,
              loading: uploadingCompletionCert,
            }),
            buildUploadDocumentEntry({
              title: 'Site photos (final)',
              uploadText: 'Upload Site photos',
              filePath: form.site_photos_path,
              onPress: pickSitePhotos,
              loading: uploadingSitePhotos,
            }),
          ]}
        />

      </View>

      <PrimaryButton
        title="Submit"
        loading={isSaving}
        fullWidth
        style={styles.cta}
        onPress={handleSubmit}
      />

      {/* ── Dropdown modal ─────────────────────────────────────────────────── */}
      <DropdownModal
        visible={dropdownOpen}
        title="Work Completed"
        options={WORK_COMPLETED_OPTIONS}
        selectedValue={form.work_completed}
        onSelect={handleDropdownSelect}
        onClose={() => setDropdownOpen(false)}
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

export default CompletionClosureScreen;