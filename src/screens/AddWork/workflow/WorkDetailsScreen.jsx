// src/screens/AddWork/workflow/WorkDetailsScreen.jsx
// Step 1 of 10: Work Details

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, StyleSheet, View } from 'react-native';

import FormDropdown from '../../../components/FormDropdown';
import { HelpTooltipScope } from '../../../components/help/helpTooltipScope';
import Inputboxfield from '../../../components/Inputboxfield';
import ProgressSlot from '../../../components/layouts/Progressslot';
import ScreenLayout from '../../../components/layouts/Screenlayout';
import WorkflowProgress from '../../../components/layouts/Workflowprogress';
import PrimaryButton from '../../../components/PrimaryButton';
import { FINANCIAL_YEAR_OPTIONS } from '../../../constants/dropdownOptions';
import {
    TOTAL_WORKFLOW_STEPS,
    WORKFLOW_ROUTES,
} from '../../../constants/WorkflowSteps';
import { getWorkById, upsertWorkDetails } from '../../../db/repositories/worksRepository';
import useSaveAndContinue from '../../../hooks/useSaveAndContinue';
import useWorkflowAutoSave from '../../../hooks/useWorkflowAutoSave';
import useWorkflowStepGuard from '../../../hooks/useWorkflowStepGuard';
import {
    getStepProgressDescription,
    getStepScreenTitle,
    getStepTitle,
    localizeDropdownOptions,
} from '../../../i18n/workflowLabels';
import useDraftStore from '../../../store/useDraftStore';
import useWorkStore from '../../../store/useWorkStore';
import theme from '../../../theme';

const SCREEN_TYPE = 'workDetails';

const EMPTY_FORM = {
  work_code: '',
  financial_year: '',
  work_name: '',
  ward: '',
  department: '',
  sub_department: '',
  officer: '',
  officer_mobile: '',
  budget: '',
};

const WorkDetailsScreen = ({ navigation }) => {
  const { t } = useTranslation('workflow');
  const financialYearOptions = useMemo(
    () => localizeDropdownOptions(FINANCIAL_YEAR_OPTIONS, t),
    [t],
  );

  useWorkflowStepGuard(WORKFLOW_ROUTES.WORK_DETAILS, navigation);

  const getDraft = useDraftStore((s) => s.getDraft);
  const setDraft = useDraftStore((s) => s.setDraft);
  const currentWorkId = useWorkStore((s) => s.currentWorkId);
  const { currentWork } = useWorkStore();

  const [form, setForm] = useState(EMPTY_FORM);
  const { bindForm, scheduleDebouncedSave, saveImmediately } = useWorkflowAutoSave('workDetails');

  // Hydrate from SQLite/draft only on the first effect run for this mount.
  // After that the form is the source of truth — autosave creating the work
  // row (which sets currentWorkId) must not re-hydrate and overwrite fields
  // the user is currently typing (e.g. budget defaulting back to "0").
  const didHydrateRef = useRef(false);

  useEffect(() => {
    bindForm(form);
  }, [form, bindForm]);

  useEffect(() => {
    if (didHydrateRef.current) return;
    didHydrateRef.current = true;

    if (currentWorkId) {
      try {
        const work = getWorkById(currentWorkId);
        if (work) {
          const hydrated = {
            work_code: work.work_code ?? '',
            financial_year: work.financial_year ?? '',
            work_name: work.work_name ?? '',
            ward: work.ward ?? '',
            department: work.department ?? '',
            sub_department: work.sub_department ?? '',
            officer: work.officer ?? '',
            officer_mobile: work.officer_mobile ?? '',
            budget: work.budget != null ? String(work.budget) : '',
          };
          setForm(hydrated);
          bindForm(hydrated);
          queueMicrotask(() => setDraft('workDetails', hydrated));
          return;
        }
      } catch (e) {
        console.warn('[WorkDetails] hydration error:', e);
      }
    }

    const draft = getDraft('workDetails');
    if (Object.keys(draft).length > 0) {
      const merged = { ...EMPTY_FORM, ...draft };
      setForm(merged);
      bindForm(merged);
      return;
    }

    if (currentWork) {
      const hydrated = {
        work_code: currentWork.work_code ?? '',
        financial_year: currentWork.financial_year ?? '',
        work_name: currentWork.work_name ?? '',
        ward: currentWork.ward ?? '',
        department: currentWork.department ?? '',
        sub_department: currentWork.sub_department ?? '',
        officer: currentWork.officer ?? '',
        officer_mobile: currentWork.officer_mobile ?? '',
        budget: currentWork.budget != null ? String(currentWork.budget) : '',
      };
      setForm(hydrated);
      bindForm(hydrated);
    }
  }, [currentWorkId]); // eslint-disable-line react-hooks/exhaustive-deps

  const updateField = useCallback(
    (key, value, { immediate = false } = {}) => {
      setForm((prev) => {
        const updated = { ...prev, [key]: value };
        queueMicrotask(() => {
          setDraft('workDetails', updated);
          bindForm(updated);
          if (immediate) saveImmediately();
          else scheduleDebouncedSave();
        });
        return updated;
      });
    },
    [setDraft, bindForm, scheduleDebouncedSave, saveImmediately],
  );

  const { saveAndContinue, isSaving } = useSaveAndContinue(
    'workDetails',
    (workId, data) =>
      upsertWorkDetails(workId, {
        ...data,
        budget: data.budget ? parseFloat(data.budget) : 0,
      }),
    WORKFLOW_ROUTES.PMC_APPROVAL,
    WORKFLOW_ROUTES.WORK_DETAILS,
  );

  const handleSave = () => {
    saveAndContinue(form, navigation, {
      onValidationFail: (msg) => Alert.alert(t('common.saveFailedTitle'), msg),
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
      <HelpTooltipScope>
        <WorkflowProgress
          currentStep={1}
          totalSteps={TOTAL_WORKFLOW_STEPS}
          showPercentage
          style={styles.progress}
        />

        <ProgressSlot
          step={1}
          title={getStepTitle(SCREEN_TYPE, t)}
          description={getStepProgressDescription(SCREEN_TYPE, t)}
          screenType="workDetails"
        />

        <View style={styles.form}>
          <Inputboxfield
            label={t('steps.workDetails.fields.budgetCode.label')}
            placeholder={t('steps.workDetails.fields.budgetCode.placeholder')}
            helpKey="workflow.workDetails.budgetCode"
            helpTooltipId="workDetails-budgetCode"
            type="alphanumeric"
            value={form.work_code}
            onChangeText={(v) => updateField('work_code', v)}
          />

          <Inputboxfield
            label={t('steps.workDetails.fields.workName.label')}
            placeholder={t('steps.workDetails.fields.workName.placeholder')}
            helpKey="workflow.workDetails.workName"
            helpTooltipId="workDetails-workName"
            type="textOnly"
            value={form.work_name}
            onChangeText={(v) => updateField('work_name', v)}
          />

          <Inputboxfield
            label={t('steps.workDetails.fields.budget.label')}
            placeholder={t('steps.workDetails.fields.budget.placeholder')}
            helpKey="workflow.workDetails.budget"
            helpTooltipId="workDetails-budget"
            value={form.budget}
            type="number"
            keyboardType="numeric"
            onChangeText={(v) => updateField('budget', v)}
          />

          <FormDropdown
            label={t('steps.workDetails.fields.financialYear.label')}
            placeholder={t('steps.workDetails.fields.financialYear.placeholder')}
            helpKey="workflow.workDetails.financialYear"
            helpTooltipId="workDetails-financialYear"
            data={financialYearOptions}
            value={form.financial_year || null}
            onChange={(item) =>
              updateField('financial_year', item.value, { immediate: true })
            }
          />

          <Inputboxfield
            label={t('steps.workDetails.fields.ward.label')}
            placeholder={t('steps.workDetails.fields.ward.placeholder')}
            helpKey="workflow.workDetails.ward"
            helpTooltipId="workDetails-ward"
            type="alphanumeric"
            value={form.ward}
            onChangeText={(v) => updateField('ward', v)}
          />

          <Inputboxfield
            label={t('steps.workDetails.fields.department.label')}
            placeholder={t('steps.workDetails.fields.department.placeholder')}
            helpKey="workflow.workDetails.department"
            helpTooltipId="workDetails-department"
            type="textOnly"
            value={form.department}
            onChangeText={(v) => updateField('department', v)}
          />

          <Inputboxfield
            label={t('steps.workDetails.fields.subDepartment.label')}
            placeholder={t('steps.workDetails.fields.subDepartment.placeholder')}
            helpKey="workflow.workDetails.subDepartment"
            helpTooltipId="workDetails-subDepartment"
            type="textOnly"
            value={form.sub_department}
            onChangeText={(v) => updateField('sub_department', v)}
          />

          <Inputboxfield
            label={t('steps.workDetails.fields.officer.label')}
            placeholder={t('steps.workDetails.fields.officer.placeholder')}
            helpKey="workflow.workDetails.officer"
            helpTooltipId="workDetails-officer"
            type="textOnly"
            value={form.officer}
            onChangeText={(v) => updateField('officer', v)}
          />

          <Inputboxfield
            label={t('steps.workDetails.fields.officerMobile.label')}
            placeholder={t('steps.workDetails.fields.officerMobile.placeholder')}
            helpKey="workflow.workDetails.officerMobile"
            helpTooltipId="workDetails-officerMobile"
            type="phone"
            keyboardType="phone-pad"
            value={form.officer_mobile}
            onChangeText={(v) => updateField('officer_mobile', v)}
          />
        </View>

        <PrimaryButton
          title={t('common.saveAndContinue')}
          onPress={handleSave}
          loading={isSaving}
          fullWidth
          style={styles.cta}
        />
      </HelpTooltipScope>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  progress: { marginBottom: theme.Spacing?.sm ?? 8 },
  form: { marginTop: theme.Spacing?.sm ?? 8 },
  cta: {
    marginTop: theme.Spacing?.lg ?? 24,
    marginBottom: theme.Spacing?.xl ?? 32,
  },
});

export default WorkDetailsScreen;
