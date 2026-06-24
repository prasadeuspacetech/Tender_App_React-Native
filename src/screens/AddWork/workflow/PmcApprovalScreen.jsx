// src/screens/AddWork/workflow/PmcApprovalScreen.jsx
// Step 2 of 10: PMC Approval

import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, StyleSheet, View } from 'react-native';

import { HelpTooltipScope } from '../../../components/help/helpTooltipScope';
import Inputboxfield from '../../../components/Inputboxfield';
import ProgressSlot from '../../../components/layouts/Progressslot';
import ScreenLayout from '../../../components/layouts/Screenlayout';
import WorkflowProgress from '../../../components/layouts/Workflowprogress';
import NativeDateField from '../../../components/NativeDateField';
import PrimaryButton from '../../../components/PrimaryButton';
import UploadDocument from '../../../components/UploadDocument';
import { DOCUMENT_TYPES } from '../../../constants/documentTypes';
import useDocumentUpload from '../../../hooks/useDocumentUpload';
import { buildUploadDocumentEntry } from '../../../utils/documentUploadProps';

import { TOTAL_WORKFLOW_STEPS, WORKFLOW_ROUTES } from '../../../constants/WorkflowSteps';
import {
    getApprovalByWorkId,
    mapApprovalRowToForm,
    upsertApprovalDetails,
} from '../../../db/repositories/approvalsRepository';
import useSaveAndContinue from '../../../hooks/useSaveAndContinue';
import useWorkflowAutoSave from '../../../hooks/useWorkflowAutoSave';
import useWorkflowStepGuard from '../../../hooks/useWorkflowStepGuard';
import useDraftStore from '../../../store/useDraftStore';
import useWorkStore from '../../../store/useWorkStore';
import theme from '../../../theme';
import { formatDateForStorage } from '../../../utils/dateFormat';

import FormToggleField from '../../../components/FormToggleField';
import {
    getStepProgressDescription,
    getStepScreenTitle,
    getStepTitle,
} from '../../../i18n/workflowLabels';

const SCREEN_TYPE = 'pmcApproval';

const EMPTY_FORM = {
  letter_number: '',
  letter_date: '',
  approval_date: '',
  finance_committee: false,
  finance_approval_status: '',
  pmc_letter_path: '',
};

const PmcApprovalScreen = ({ navigation }) => {
  const { t } = useTranslation('workflow');

  useWorkflowStepGuard(WORKFLOW_ROUTES.PMC_APPROVAL, navigation);

  const getDraft = useDraftStore((s) => s.getDraft);
  const setDraft = useDraftStore((s) => s.setDraft);
  const { currentWorkId } = useWorkStore();

  const [form, setForm] = useState(EMPTY_FORM);
  const { bindForm, scheduleDebouncedSave, saveImmediately } = useWorkflowAutoSave('pmcApproval');

  useEffect(() => {
    bindForm(form);
  }, [form, bindForm]);

  const loadPmcForm = useCallback(() => {
    if (currentWorkId) {
      try {
        const row = getApprovalByWorkId(currentWorkId);
        const hydrated = mapApprovalRowToForm(row);
        if (hydrated) {
          setForm(hydrated);
          bindForm(hydrated);
          queueMicrotask(() => setDraft('pmcApproval', hydrated));
          return;
        }
      } catch (e) {
        console.warn('[PmcApprovalScreen] hydration failed:', e);
      }
    }

    const draft = getDraft('pmcApproval');
    if (draft && Object.keys(draft).length > 0) {
      const merged = {
        ...EMPTY_FORM,
        ...draft,
        letter_date: formatDateForStorage(draft.letter_date),
        approval_date: formatDateForStorage(draft.approval_date),
      };
      setForm(merged);
      bindForm(merged);
    }
  }, [currentWorkId, getDraft, setDraft, bindForm]);

  useFocusEffect(
    useCallback(() => {
      loadPmcForm();
    }, [loadPmcForm]),
  );

  const updateField = useCallback(
    (key, val, { immediate = false } = {}) => {
      setForm((prev) => {
        const updated = { ...prev, [key]: val };
        queueMicrotask(() => {
          setDraft('pmcApproval', updated);
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
    (filePath) => updateField('pmc_letter_path', filePath, { immediate: true }),
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
        <HelpTooltipScope>
          <WorkflowProgress
            currentStep={2}
            totalSteps={TOTAL_WORKFLOW_STEPS}
            showPercentage
            style={styles.progress}
          />
          <ProgressSlot
            step={2}
            title={getStepTitle(SCREEN_TYPE, t)}
            description={getStepProgressDescription(SCREEN_TYPE, t)}
            screenType="pmcApproval"
          />

          <View style={styles.form}>
            <Inputboxfield
              label={t('steps.pmcApproval.fields.letterNumber.label')}
              placeholder={t('steps.pmcApproval.fields.letterNumber.placeholder')}
              helpKey="workflow.pmcApproval.letterNumber"
              helpTooltipId="pmcApproval-letterNumber"
              type="alphanumeric"
              value={form.letter_number}
              onChangeText={(v) => updateField('letter_number', v)}
            />

            <NativeDateField
              label={t('steps.pmcApproval.fields.letterDate.label')}
              value={form.letter_date}
              onDateChange={(date) =>
                updateField('letter_date', formatDateForStorage(date), { immediate: true })
              }
              placeholder={t('steps.pmcApproval.fields.letterDate.placeholder')}
              helpKey="workflow.pmcApproval.letterDate"
              helpTooltipId="pmcApproval-letterDate"
            />

            <FormToggleField
              label={t('steps.pmcApproval.fields.financeCommittee.label')}
              rowLabelOn={t('steps.pmcApproval.toggles.financeOn')}
              rowLabelOff={t('steps.pmcApproval.toggles.financeOff')}
              helpKey="workflow.pmcApproval.financeCommittee"
              helpTooltipId="pmcApproval-financeCommittee"
              value={form.finance_committee}
              onToggle={() =>
                updateField('finance_committee', !form.finance_committee, { immediate: true })
              }
            />

            {form.finance_committee ? (
              <>
                <NativeDateField
                  label={t('steps.pmcApproval.fields.approvalDate.label')}
                  value={form.approval_date}
                  onDateChange={(date) =>
                    updateField('approval_date', formatDateForStorage(date), { immediate: true })
                  }
                  placeholder={t('steps.pmcApproval.fields.approvalDate.placeholder')}
                  helpKey="workflow.pmcApproval.approvalDate"
                  helpTooltipId="pmcApproval-approvalDate"
                />

                <Inputboxfield
                  label={t('steps.pmcApproval.fields.financeApprovalStatus.label')}
                  placeholder={t('steps.pmcApproval.fields.financeApprovalStatus.placeholder')}
                  helpKey="workflow.pmcApproval.financeApprovalStatus"
                  helpTooltipId="pmcApproval-financeApprovalStatus"
                  type="textOnly"
                  value={form.finance_approval_status}
                  onChangeText={(v) => updateField('finance_approval_status', v)}
                />
              </>
            ) : null}

            <UploadDocument
              sectionLabel={t('steps.pmcApproval.uploads.financeLetter')}
              documents={[
                buildUploadDocumentEntry({
                  title: t('steps.pmcApproval.uploads.pmcLetterTitle'),
                  uploadText: t('steps.pmcApproval.uploads.pmcLetterUpload'),
                  filePath: form.pmc_letter_path,
                  onPress: pickPmcLetter,
                  loading: uploadingPmcLetter,
                  showUploadAction: true,
                }),
              ]}
            />
          </View>

          <PrimaryButton
            title={t('common.saveAndContinue')}
            loading={isSaving}
            fullWidth
            style={styles.cta}
            onPress={handleSave}
          />
        </HelpTooltipScope>
      </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  progress: { marginBottom: theme.Spacing?.sm ?? 8 },
  form:     { marginTop:    theme.Spacing?.sm ?? 8 },
  cta:      { marginTop: theme.Spacing?.lg ?? 24, marginBottom: theme.Spacing?.xl ?? 32 },

});

export default PmcApprovalScreen;
