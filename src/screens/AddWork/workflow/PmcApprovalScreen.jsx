// src/screens/AddWork/workflow/PmcApprovalScreen.jsx
// Step 2 of 10: PMC Approval

import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import ScreenLayout from '../../../components/layouts/Screenlayout';
import WorkflowProgress from '../../../components/layouts/Workflowprogress';
import ProgressSlot from '../../../components/layouts/Progressslot';
import Inputboxfield from '../../../components/Inputboxfield';
import UploadDocument from '../../../components/UploadDocument';
import { DOCUMENT_TYPES } from '../../../constants/documentTypes';
import useDocumentUpload from '../../../hooks/useDocumentUpload';
import { buildUploadDocumentEntry } from '../../../utils/documentUploadProps';
import PrimaryButton from '../../../components/PrimaryButton';
import DropdownModal from '../../../components/DropdownModal';
import CalendarPicker from '../../../components/CalendarPicker';

import useDraftStore from '../../../store/useDraftStore';
import useWorkStore from '../../../store/useWorkStore';
import useSaveAndContinue from '../../../hooks/useSaveAndContinue';
import useWorkflowStepGuard from '../../../hooks/useWorkflowStepGuard';
import {
  upsertApprovalDetails,
  getApprovalByWorkId,
  mapApprovalRowToForm,
} from '../../../db/repositories/approvalsRepository';
import { FINANCE_APPROVAL_STATUS_OPTIONS } from '../../../constants/dropdownOptions';
import { WORKFLOW_ROUTES, TOTAL_WORKFLOW_STEPS } from '../../../constants/WorkflowSteps';
import theme from '../../../theme';
import { formatDateForStorage } from '../../../utils/dateFormat';

import FormToggleField from '../../../components/FormToggleField';
import { formFieldStyles } from '../../../theme/formFieldStyles';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getLabel = (options, value) =>
  options.find((o) => o.value === value)?.label ?? '';

// const validate = (form) => {
//   const errors = {};
//   if (!form.letter_number?.trim()) errors.letter_number = 'Letter number is required';
//   if (!form.letter_date?.trim())   errors.letter_date   = 'Letter date is required';
//   if (!form.approval_date?.trim()) errors.approval_date = 'Approval date is required';
//   return errors;
// };


const validate = (form) => {
  const errors = {};
  if (!form.letter_number?.trim()) errors.letter_number = 'Letter number is required';
  if (!form.letter_date) errors.letter_date = 'Letter date is required';
  if (!form.approval_date) errors.approval_date = 'Approval date is required';
  return errors;
};

// ─── Initial form state ───────────────────────────────────────────────────────
const EMPTY_FORM = {
  letter_number: '',
  letter_date: '',
  approval_date: '',
  finance_committee: false,   // boolean — maps to finance_required in SQLite
  finance_approval_status: '',      // string: 'Pending' | 'Approved' | 'Rejected'
  pmc_letter_path: '',
};

// ─────────────────────────────────────────────────────────────────────────────
const PmcApprovalScreen = ({ navigation }) => {
  useWorkflowStepGuard(WORKFLOW_ROUTES.PMC_APPROVAL, navigation);

  const { getDraft, setDraft } = useDraftStore();
  const { currentWorkId } = useWorkStore();

  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  // ── Hydrate on every focus (hub navigate / goBack does not always remount) ─
  const loadPmcForm = useCallback(() => {
    const draft = getDraft('pmcApproval');
    if (draft && Object.keys(draft).length > 0) {
      setForm({
        ...EMPTY_FORM,
        ...draft,
        letter_date: formatDateForStorage(draft.letter_date),
        approval_date: formatDateForStorage(draft.approval_date),
      });
      return;
    }

    if (!currentWorkId) return;

    try {
      const row = getApprovalByWorkId(currentWorkId);
      const hydrated = mapApprovalRowToForm(row);
      if (!hydrated) return;

      setForm(hydrated);
      queueMicrotask(() => setDraft('pmcApproval', hydrated));
    } catch (e) {
      console.warn('[PmcApprovalScreen] hydration failed:', e);
    }
  }, [currentWorkId, getDraft, setDraft]);

  useFocusEffect(
    useCallback(() => {
      loadPmcForm();
    }, [loadPmcForm]),
  );

  // ── Calendar state ─────────────────────────────────────────────────────────
  // field: which form key is being picked ('letter_date' | 'approval_date' | null)
  // const [calendarField, setCalendarField] = useState(null);

  // ── Dropdown state ─────────────────────────────────────────────────────────
  const [dropdown, setDropdown] = useState({ visible: false, field: '', title: '', options: [] });

  // ── Field update — never call setDraft inside setForm updater (cross-store render bug)
  const updateField = useCallback((key, val) => {
    setForm((prev) => {
      const updated = { ...prev, [key]: val };
      queueMicrotask(() => setDraft('pmcApproval', updated));
      return updated;
    });
    if (errors[key]) {
      setErrors((prev) => { const e = { ...prev }; delete e[key]; return e; });
    }
  }, [errors, setDraft]);

  // ── Open calendar ──────────────────────────────────────────────────────────
  // const openCalendar = (field) => setCalendarField(field);

  // ── Open dropdown ──────────────────────────────────────────────────────────
  const openDropdown = (field) => {
    setDropdown({
      visible: true,
      field,
      title: 'Finance Approval Status',
      options: FINANCE_APPROVAL_STATUS_OPTIONS,
    });
  };

  const handleDropdownSelect = (option) => {
    const updated = { ...form, [dropdown.field]: option.value };
    setForm(updated);
    queueMicrotask(() => setDraft('pmcApproval', updated));
    setDropdown((d) => ({ ...d, visible: false }));
  };

  // ── Save & Continue ────────────────────────────────────────────────────────
  const { saveAndContinue, isSaving } = useSaveAndContinue(
    'pmcApproval',
    (workId, data) => upsertApprovalDetails(workId, {
      letter_number: data.letter_number,
      letter_date: formatDateForStorage(data.letter_date),
      approval_date: formatDateForStorage(data.approval_date),
      finance_required: data.finance_committee,
      finance_status: data.finance_approval_status,
      pmc_letter_path: data.pmc_letter_path,
    }),
    WORKFLOW_ROUTES.ESTIMATION,
    WORKFLOW_ROUTES.PMC_APPROVAL,
  );

  const { pickDocument: pickPmcLetter, uploading: uploadingPmcLetter } = useDocumentUpload(
    currentWorkId,
    DOCUMENT_TYPES.PMC_LETTER,
    (filePath) => updateField('pmc_letter_path', filePath),
  );

  const handleSave = () => {
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

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <>
      <ScreenLayout
        title="PMC Approval"
        showBack
        showNotification
        scrollable
        keyboardAware
        onBackPress={() => navigation.goBack()}
      >
        <WorkflowProgress
          currentStep={2}
          totalSteps={TOTAL_WORKFLOW_STEPS}
          showPercentage
          style={styles.progress}
        />
        <ProgressSlot
          step={2}
          title="PMC Approval"
          description="Upload PMC letter and get approval"
          screenType="pmcApproval"
        />

        <View style={styles.form}>
          {/* Letter Number */}
          <Inputboxfield
            label="Letter Number"
            placeholder="eg. ERK-2025-0001"
            value={form.letter_number}
            onChangeText={(v) => updateField('letter_number', v)}
            error={errors.letter_number}
            required
          />

          <View>
            <CalendarPicker
              label="Letter Date"
              value={form.letter_date}
              onDateChange={(date) => updateField('letter_date', formatDateForStorage(date))}
              placeholder="dd/mm/yyyy"
            />
            {errors.letter_date ? (
              <Text style={formFieldStyles.errorText}>{errors.letter_date}</Text>
            ) : null}
          </View>

          <View>
            <CalendarPicker
              label="Approval Date"
              value={form.approval_date}
              onDateChange={(date) => updateField('approval_date', formatDateForStorage(date))}
              placeholder="dd/mm/yyyy"
            />
            {errors.approval_date ? (
              <Text style={formFieldStyles.errorText}>{errors.approval_date}</Text>
            ) : null}
          </View>

          <FormToggleField
            label="Finance Committee"
            rowLabel="Finance committee required"
            value={form.finance_committee}
            onToggle={() => updateField('finance_committee', !form.finance_committee)}
          />

          {/* Finance Approval Status dropdown */}
          <Inputboxfield
            label="Finance Approval Status"
            placeholder="Select status"
            type="dropdown"
            value={getLabel(FINANCE_APPROVAL_STATUS_OPTIONS, form.finance_approval_status)}
            onPress={() => openDropdown('finance_approval_status')}
          />

          <UploadDocument
            sectionLabel="Documents"
            documents={[
              buildUploadDocumentEntry({
                title: 'PMC Letter PDF',
                uploadText: 'Upload PMC Letter PDF',
                filePath: form.pmc_letter_path,
                onPress: pickPmcLetter,
                loading: uploadingPmcLetter,
                showUploadAction: true,
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


      {/* Dropdown modal */}
      <DropdownModal
        visible={dropdown.visible}
        title={dropdown.title}
        options={dropdown.options}
        selectedValue={form[dropdown.field]}
        onSelect={handleDropdownSelect}
        onClose={() => setDropdown((d) => ({ ...d, visible: false }))}
      />
    </>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  progress: { marginBottom: theme.Spacing?.sm ?? 8 },
  form:     { marginTop:    theme.Spacing?.sm ?? 8 },
  cta:      { marginTop: theme.Spacing?.lg ?? 24, marginBottom: theme.Spacing?.xl ?? 32 },

});

export default PmcApprovalScreen;