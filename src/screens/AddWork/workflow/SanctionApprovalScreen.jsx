// src/screens/AddWork/workflow/SanctionApprovalScreen.jsx
// Step 7 of 10: Sanction Approval
//
// Changes from stub:
//   + sanction_amount field (₹, numeric keyboard)
//   + CalendarPicker replacing plain Inputboxfield for sanction_date
//   + Documents section (Sanction letter + UploadDocument)
//   + Hydration on mount via getSanctionByWorkId
//   + Real upsertSanction wired to useSaveAndContinue (stub removed)
//   + Validation for required fields

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
import {
    getStepProgressDescription,
    getStepScreenTitle,
    getStepTitle,
} from '../../../i18n/workflowLabels';
import { buildUploadDocumentEntry } from '../../../utils/documentUploadProps';

const SCREEN_TYPE = 'sanctionApproval';

import useSaveAndContinue from '../../../hooks/useSaveAndContinue';
import useWorkflowAutoSave from '../../../hooks/useWorkflowAutoSave';
import useWorkflowStepGuard from '../../../hooks/useWorkflowStepGuard';
import useDraftStore from '../../../store/useDraftStore';
import useWorkStore from '../../../store/useWorkStore';

import { TOTAL_WORKFLOW_STEPS, WORKFLOW_ROUTES } from '../../../constants/WorkflowSteps';
import {
    getSanctionByWorkId,
    mapSanctionRowToForm,
    upsertSanction,
} from '../../../db/repositories/sanctionsRepository';
import theme from '../../../theme';
import { formatDateForStorage } from '../../../utils/dateFormat';

// ─── Initial form state ───────────────────────────────────────────────────────
const EMPTY_FORM = {
  docket_number:        '',
  sanction_date:        '',
  sanction_amount:      '',
  sanction_authority:   '',
  sanction_letter_path: '',
};

// ─────────────────────────────────────────────────────────────────────────────
const SanctionApprovalScreen = ({ navigation }) => {
  const { t } = useTranslation('workflow');

  useWorkflowStepGuard(WORKFLOW_ROUTES.SANCTION_APPROVAL, navigation);

  const getDraft = useDraftStore((s) => s.getDraft);
  const setDraft = useDraftStore((s) => s.setDraft);
  const { currentWorkId }  = useWorkStore();

  const [form, setForm] = useState(EMPTY_FORM);
  const { bindForm, scheduleDebouncedSave, saveImmediately } = useWorkflowAutoSave('sanctionApproval');

  useEffect(() => {
    bindForm(form);
  }, [form, bindForm]);

  useEffect(() => {
    const hydrate = () => {
      if (currentWorkId) {
        try {
          const row = getSanctionByWorkId(currentWorkId);
          const hydrated = mapSanctionRowToForm(row);
          if (hydrated) {
            setForm(hydrated);
            bindForm(hydrated);
            queueMicrotask(() => setDraft('sanctionApproval', hydrated));
            return;
          }
        } catch (e) {
          console.warn('[SanctionApproval] hydration error:', e);
        }
      }

      const draft = getDraft('sanctionApproval');
      if (draft && Object.keys(draft).length > 0) {
        const merged = {
          ...EMPTY_FORM,
          ...draft,
          sanction_date: formatDateForStorage(draft.sanction_date),
        };
        setForm(merged);
        bindForm(merged);
      }
    };

    hydrate();
  }, [currentWorkId]); // eslint-disable-line react-hooks/exhaustive-deps

  const updateField = useCallback(
    (key, val, { immediate = false } = {}) => {
      setForm((prev) => {
        const updated = { ...prev, [key]: val };
        queueMicrotask(() => {
          setDraft('sanctionApproval', updated);
          bindForm(updated);
          if (immediate) saveImmediately();
          else scheduleDebouncedSave();
        });
        return updated;
      });
    },
    [setDraft, bindForm, scheduleDebouncedSave, saveImmediately],
  );

  // ── Save & Continue ────────────────────────────────────────────────────────
  const { saveAndContinue, isSaving } = useSaveAndContinue(
    'sanctionApproval',
    (workId, data) => upsertSanction(workId, data),
    WORKFLOW_ROUTES.WORK_ORDER,
    WORKFLOW_ROUTES.SANCTION_APPROVAL,
  );

  const { pickDocument: pickSanctionLetter, uploading: uploadingSanctionLetter } =
    useDocumentUpload(
      currentWorkId,
      DOCUMENT_TYPES.SANCTION_LETTER,
      (filePath) => updateField('sanction_letter_path', filePath, { immediate: true }),
    );

  const handleSave = () => {
    saveAndContinue(form, navigation, {
      onValidationFail: (m) => Alert.alert(t('common.saveFailedTitle'), m),
    });
  };

  // ─────────────────────────────────────────────────────────────────────────
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
          currentStep={7}
          totalSteps={TOTAL_WORKFLOW_STEPS}
          showPercentage
          style={styles.progress}
        />
        <ProgressSlot
          step={7}
          title={getStepTitle(SCREEN_TYPE, t)}
          description={getStepProgressDescription(SCREEN_TYPE, t)}
          screenType="sanctionApproval"
        />

        <View style={styles.form}>

          <Inputboxfield
            label={t('steps.sanctionApproval.fields.docketNumber.label')}
            placeholder={t('steps.sanctionApproval.fields.docketNumber.placeholder')}
            helpKey="workflow.sanctionApproval.docketNumber"
            helpTooltipId="sanctionApproval-docketNumber"
            type="alphanumeric"
            value={form.docket_number}
            onChangeText={(v) => updateField('docket_number', v)}
          />

          <NativeDateField
            label={t('steps.sanctionApproval.fields.sanctionDate.label')}
            placeholder={t('steps.sanctionApproval.fields.sanctionDate.placeholder')}
            helpKey="workflow.sanctionApproval.sanctionDate"
            helpTooltipId="sanctionApproval-sanctionDate"
            value={form.sanction_date}
            onDateChange={(v) =>
              updateField('sanction_date', formatDateForStorage(v), { immediate: true })
            }
          />

          <Inputboxfield
            label={t('steps.sanctionApproval.fields.sanctionAmount.label')}
            placeholder={t('steps.sanctionApproval.fields.sanctionAmount.placeholder')}
            helpKey="workflow.sanctionApproval.sanctionAmount"
            helpTooltipId="sanctionApproval-sanctionAmount"
            type="number"
            value={form.sanction_amount}
            onChangeText={(v) => updateField('sanction_amount', v)}
            keyboardType="decimal-pad"
          />

          <Inputboxfield
            label={t('steps.sanctionApproval.fields.sanctionAuthority.label')}
            placeholder={t('steps.sanctionApproval.fields.sanctionAuthority.placeholder')}
            helpKey="workflow.sanctionApproval.sanctionAuthority"
            helpTooltipId="sanctionApproval-sanctionAuthority"
            value={form.sanction_authority}
            onChangeText={(v) => updateField('sanction_authority', v)}
          />

          <UploadDocument
            sectionLabel={t('common.documents')}
            documents={[
              buildUploadDocumentEntry({
                title: t('steps.sanctionApproval.uploads.sanctionLetterTitle'),
                uploadText: t('steps.sanctionApproval.uploads.sanctionLetterUpload'),
                filePath: form.sanction_letter_path,
                onPress: pickSanctionLetter,
                loading: uploadingSanctionLetter,
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

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  progress: { marginBottom: theme.Spacing?.sm ?? 8  },
  form:     { marginTop:    theme.Spacing?.sm ?? 8  },
  cta:      { marginTop: theme.Spacing?.lg ?? 24, marginBottom: theme.Spacing?.xl ?? 32 },

});

export default SanctionApprovalScreen;