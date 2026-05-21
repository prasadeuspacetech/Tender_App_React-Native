// src/screens/AddWork/workflow/WorkDetailsScreen.jsx
// Step 1 of 10: Work Details
// ─────────────────────────────────────────────────────────────────────────────
// DROPDOWN UPDATE:
//   Ward, Department, Sub Department, Officer, Financial Year → DropdownModal
//   Sub Department options are filtered by the selected Department value.
//   All other logic (Zustand draft, SQLite save, validation) is UNCHANGED.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';

// ─── Layout ───────────────────────────────────────────────────────────────────
import ScreenLayout     from '../../../components/layouts/Screenlayout';
import WorkflowProgress from '../../../components/layouts/Workflowprogress';
import ProgressSlot     from '../../../components/layouts/Progressslot';

// ─── Form components ──────────────────────────────────────────────────────────
import Inputboxfield  from '../../../components/Inputboxfield';
import PrimaryButton  from '../../../components/PrimaryButton';
import DropdownModal  from '../../../components/DropdownModal';   // ← NEW

// ─── State & data ─────────────────────────────────────────────────────────────
import useDraftStore       from '../../../store/useDraftStore';
import useWorkStore        from '../../../store/useWorkStore';
import useSaveAndContinue  from '../../../hooks/useSaveAndContinue';
import useWorkflowStepGuard from '../../../hooks/useWorkflowStepGuard';
import { upsertWorkDetails } from '../../../db/repositories/worksRepository';

// ─── Dropdown options ─────────────────────────────────────────────────────────
import {
  FINANCIAL_YEAR_OPTIONS,
  WARD_OPTIONS,
  DEPARTMENT_OPTIONS,
  OFFICER_OPTIONS,
  getSubDepartmentOptions,
} from '../../../constants/dropdownOptions';                        // ← NEW

// ─── Constants ────────────────────────────────────────────────────────────────
import {
  WORKFLOW_ROUTES,
  TOTAL_WORKFLOW_STEPS,
} from '../../../constants/WorkflowSteps';

import theme from '../../../theme';

// ─── Validation (unchanged) ───────────────────────────────────────────────────
const validate = (form) => {
  const errors = {};
  if (!form.work_code?.trim())        errors.work_code      = 'Work code is required';
  if (!form.work_name?.trim())        errors.work_name      = 'Work name is required';
  if (!form.financial_year?.trim())   errors.financial_year = 'Financial year is required';
  if (!form.ward?.trim())             errors.ward           = 'Ward is required';
  if (!form.department?.trim())       errors.department     = 'Department is required';
  return errors;
};

const EMPTY_FORM = {
  work_code: '', financial_year: '', work_name: '',
  ward: '', department: '', sub_department: '', officer: '', budget: '',
};

// ─── Modal state shape ────────────────────────────────────────────────────────
// Tracks which dropdown (if any) is currently open.
const CLOSED_MODAL = { field: null, title: '', options: [] };

// ─────────────────────────────────────────────────────────────────────────────
const WorkDetailsScreen = ({ navigation }) => {
  useWorkflowStepGuard(WORKFLOW_ROUTES.WORK_DETAILS, navigation);

  const { getDraft, setDraft } = useDraftStore();
  const { currentWork }        = useWorkStore();

  const [form, setForm]     = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  // ── Dropdown modal state ──────────────────────────────────────────────────
  const [modal, setModal] = useState(CLOSED_MODAL);

  // ── Hydrate form from draft / currentWork (unchanged) ─────────────────────
  useEffect(() => {
    const draft = getDraft('workDetails');
    if (Object.keys(draft).length > 0) {
      setForm((prev) => ({ ...prev, ...draft }));
      return;
    }
    if (currentWork) {
      setForm({
        work_code:      currentWork.work_code      ?? '',
        financial_year: currentWork.financial_year ?? '',
        work_name:      currentWork.work_name      ?? '',
        ward:           currentWork.ward           ?? '',
        department:     currentWork.department     ?? '',
        sub_department: currentWork.sub_department ?? '',
        officer:        currentWork.officer        ?? '',
        budget:         currentWork.budget != null ? String(currentWork.budget) : '',
      });
    }
  }, []);

  // ── Field updater (unchanged) ─────────────────────────────────────────────
  // ✅ AFTER — compute next state first, then call both setForm and setDraft separately
const updateField = useCallback((key, value) => {
  const updated = { ...form, [key]: value };  // compute next form directly
  setForm(updated);                           // update local state
  setDraft('workDetails', updated);           // update Zustand draft (outside setState)
  if (errors[key]) {
    setErrors((prev) => { const e = { ...prev }; delete e[key]; return e; });
  }
}, [form, errors, setDraft]);

  // ── Save & Continue (unchanged) ───────────────────────────────────────────
  const { saveAndContinue, isSaving } = useSaveAndContinue(
    'workDetails',
    (workId, data) => upsertWorkDetails(workId, {
      ...data,
      budget: data.budget ? parseFloat(data.budget) : 0,
    }),
    WORKFLOW_ROUTES.PMC_APPROVAL,
    WORKFLOW_ROUTES.WORK_DETAILS,
  );

  const handleSave = () => {
    const validationErrors = validate(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    saveAndContinue(form, navigation, {
      onValidationFail: (msg) => Alert.alert('Save Failed', msg),
    });
  };

  // ─── Dropdown helpers ─────────────────────────────────────────────────────

  /**
   * Open a dropdown modal for a given field.
   * For sub_department, compute options from the currently selected department.
   */
  const openDropdown = useCallback((field) => {
    let options = [];
    let title   = '';

    switch (field) {
      case 'financial_year':
        options = FINANCIAL_YEAR_OPTIONS;
        title   = 'Select Financial Year';
        break;
      case 'ward':
        options = WARD_OPTIONS;
        title   = 'Select Ward';
        break;
      case 'department':
        options = DEPARTMENT_OPTIONS;
        title   = 'Select Department';
        break;
      case 'sub_department':
        // Dependent on current department selection
        options = getSubDepartmentOptions(form.department);
        title   = 'Select Sub Department';
        break;
      case 'officer':
        options = OFFICER_OPTIONS;
        title   = 'Select Officer';
        break;
      default:
        return;
    }

    setModal({ field, title, options });
  }, [form.department]);

  /** User tapped an option row inside the modal */
  // ✅ AFTER
const handleModalSelect = useCallback((option) => {
  if (!modal.field) return;

  if (modal.field === 'department') {
    const updated = { ...form, department: option.value, sub_department: '' };
    setForm(updated);
    setDraft('workDetails', updated);
    setErrors((prev) => {
      const e = { ...prev };
      delete e.department;
      delete e.sub_department;
      return e;
    });
  } else {
    updateField(modal.field, option.value);
  }

  setModal(CLOSED_MODAL);
}, [modal.field, form, updateField, setDraft]);

  const handleModalClose = useCallback(() => setModal(CLOSED_MODAL), []);

  // ─── Helper: resolve display label from a value ────────────────────────────
  const getLabel = useCallback((options, value) => {
    if (!value) return '';
    return options.find((o) => o.value === value)?.label ?? value;
  }, []);

  // Sub-department options depend on current department (for selected-value display)
  const subDeptOptions = getSubDepartmentOptions(form.department);

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <ScreenLayout
      title="Work Details"
      showBack
      showNotification
      scrollable
      keyboardAware
      onBackPress={() => navigation.goBack()}
    >
      <WorkflowProgress
        currentStep={1}
        totalSteps={TOTAL_WORKFLOW_STEPS}
        showPercentage
        style={styles.progress}
      />

      <ProgressSlot
        step={1}
        title="Work Details"
        description="Enter basic work information"
        screenType="workDetails"
      />

      <View style={styles.form}>

        {/* ── Text fields (unchanged behaviour) ─────────────────────────── */}

        <Inputboxfield
          label="Work Code"
          placeholder="eg. ERK-2025-0001"
          value={form.work_code}
          onChangeText={(v) => updateField('work_code', v)}
          error={errors.work_code}
          required
        />

        <Inputboxfield
          label="Work Name"
          placeholder="Enter the full name"
          value={form.work_name}
          onChangeText={(v) => updateField('work_name', v)}
          error={errors.work_name}
          required
        />

        <Inputboxfield
          label="Budget (₹)"
          placeholder="₹15,00,000"
          value={form.budget}
          type="number"
          keyboardType="numeric"
          onChangeText={(v) => updateField('budget', v)}
        />

        {/* ── Dropdown fields ────────────────────────────────────────────── */}

        {/* Financial Year */}
        <Inputboxfield
          label="Financial Year"
          placeholder="Select financial year"
          value={getLabel(FINANCIAL_YEAR_OPTIONS, form.financial_year)}
          type="dropdown"
          
          onPress={() => openDropdown('financial_year')}
          error={errors.financial_year}
          required
        />

        {/* Ward */}
        <Inputboxfield
          label="Ward"
          placeholder="Select the ward"
          value={getLabel(WARD_OPTIONS, form.ward)}
          type="dropdown"

          onPress={() => openDropdown('ward')}
          error={errors.ward}
          required
        />

        {/* Department */}
        <Inputboxfield
          label="Department"
          placeholder="Select the department"
          value={getLabel(DEPARTMENT_OPTIONS, form.department)}
          type="dropdown"

          onPress={() => openDropdown('department')}
          error={errors.department}
          required
        />

        {/* Sub Department — disabled until a department is chosen */}
        <Inputboxfield
          label="Sub Department"
          placeholder={
            form.department
              ? 'Select sub department'
              : 'Select a department first'
          }
          value={getLabel(subDeptOptions, form.sub_department)}
          type="dropdown"

          disabled={!form.department}
          onPress={form.department ? () => openDropdown('sub_department') : undefined}
        />

        {/* Officer */}
        <Inputboxfield
          label="Officer"
          placeholder="Select the officer"
          value={getLabel(OFFICER_OPTIONS, form.officer)}
          type="dropdown"

          onPress={() => openDropdown('officer')}
        />

      </View>

      <PrimaryButton
        title="Save & Continue"
        onPress={handleSave}
        loading={isSaving}
        fullWidth
        style={styles.cta}
      />

      {/* ── Reusable Dropdown Modal ────────────────────────────────────────── */}
      <DropdownModal
        visible={!!modal.field}
        title={modal.title}
        options={modal.options}
        selectedValue={form[modal.field] ?? ''}
        onSelect={handleModalSelect}
        onClose={handleModalClose}
        searchable={modal.options.length > 6}   // auto-enable search for long lists
      />

    </ScreenLayout>
  );
};

// ─── Styles (unchanged) ───────────────────────────────────────────────────────
const styles = StyleSheet.create({
  progress: { marginBottom: theme.Spacing?.sm ?? 8  },
  form:     { marginTop:    theme.Spacing?.sm ?? 8  },
  cta:      { marginTop:    theme.Spacing?.lg ?? 24, marginBottom: theme.Spacing?.xl ?? 32 },
});

export default WorkDetailsScreen;