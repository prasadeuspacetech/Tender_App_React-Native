// src/screens/AddWork/workflow/ContractorAssignmentScreen.jsx
// Step 6 of 10: Contractor Assignment

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, StyleSheet, Text, View } from 'react-native';

// ─── Layout ───────────────────────────────────────────────────────────────────
import ProgressSlot from '../../../components/layouts/Progressslot';
import ScreenLayout from '../../../components/layouts/Screenlayout';
import WorkflowProgress from '../../../components/layouts/Workflowprogress';

// ─── Form components ──────────────────────────────────────────────────────────
import FormDropdown from '../../../components/FormDropdown';
import FormFieldLabel from '../../../components/help/FormFieldLabel';
import { HelpTooltipScope } from '../../../components/help/helpTooltipScope';
import Inputboxfield from '../../../components/Inputboxfield';
import PrimaryButton from '../../../components/PrimaryButton';
import UploadDocument from '../../../components/UploadDocument';
import { DOCUMENT_TYPES } from '../../../constants/documentTypes';
import useDocumentUpload from '../../../hooks/useDocumentUpload';
import { buildUploadDocumentEntry } from '../../../utils/documentUploadProps';

// ─── State & data ─────────────────────────────────────────────────────────────
import { CONTRACTOR_ESTIMATE_OPTIONS } from '../../../constants/dropdownOptions';
import {
  getContractorByWorkId,
  mapContractorRowToForm,
  normalizeEstimateType,
  upsertContractorAssignment,
} from '../../../db/repositories/contractorRepository';
import { getTenderAmountByWorkId } from '../../../db/repositories/tendersRepository';
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
import { computeFinalTenderAmount } from '../../../utils/finalTenderAmount';

const SCREEN_TYPE = 'contractorAssignment';

// ─── Constants ────────────────────────────────────────────────────────────────
import {
  TOTAL_WORKFLOW_STEPS,
  WORKFLOW_ROUTES,
} from '../../../constants/WorkflowSteps';

import theme from '../../../theme';

// ─── Initial form state ───────────────────────────────────────────────────────
// Persisted: contractor_name, contractor_contact, percentage_above_below,
//            percentage_variation, final_tender_amount
const EMPTY_FORM = {
  contractor_name: '',
  contractor_contact: '',
  percentage_above_below: 'above',
  percentage_variation: '',
  final_tender_amount: '',
  contractor_doc_path: '',
};

// ─────────────────────────────────────────────────────────────────────────────
const ContractorAssignmentScreen = ({ navigation }) => {
  const { t } = useTranslation('workflow');
  const estimateOptions = useMemo(
    () => localizeDropdownOptions(CONTRACTOR_ESTIMATE_OPTIONS, t),
    [t],
  );

  useWorkflowStepGuard(WORKFLOW_ROUTES.CONTRACTOR_ASSIGNMENT, navigation);

  const getDraft = useDraftStore((s) => s.getDraft);
  const setDraft = useDraftStore((s) => s.setDraft);
  const { currentWorkId } = useWorkStore();

  const [form, setForm] = useState(EMPTY_FORM);
  const [tenderAmount, setTenderAmount] = useState(null);
  const { bindForm, scheduleDebouncedSave, saveImmediately } = useWorkflowAutoSave('contractorAssignment');

  const withComputedFinalAmount = useCallback(
    (baseForm, baseTenderAmount = tenderAmount) => {
      const computed = computeFinalTenderAmount(
        baseTenderAmount,
        baseForm.percentage_above_below,
        baseForm.percentage_variation,
      );
      return {
        ...baseForm,
        final_tender_amount: computed != null ? String(computed) : '',
      };
    },
    [tenderAmount],
  );

  useEffect(() => {
    bindForm(form);
  }, [form, bindForm]);

  useEffect(() => {
    if (!currentWorkId) {
      setTenderAmount(null);
      return;
    }
    try {
      setTenderAmount(getTenderAmountByWorkId(currentWorkId));
    } catch (e) {
      console.warn('[ContractorAssignment] tender amount load failed:', e);
      setTenderAmount(null);
    }
  }, [currentWorkId]);

  useEffect(() => {
    const hydrate = () => {
      const baseTenderAmount = currentWorkId
        ? getTenderAmountByWorkId(currentWorkId)
        : null;
      setTenderAmount(baseTenderAmount);

      if (currentWorkId) {
        try {
          const row = getContractorByWorkId(currentWorkId);
          const hydrated = mapContractorRowToForm(row, EMPTY_FORM);
          if (hydrated) {
            const merged = withComputedFinalAmount(
              { ...EMPTY_FORM, ...hydrated },
              baseTenderAmount,
            );
            setForm(merged);
            bindForm(merged);
            queueMicrotask(() => setDraft('contractorAssignment', merged));
            return;
          }
        } catch (e) {
          console.warn('[ContractorAssignment] hydration failed:', e);
        }
      }

      const draft = getDraft('contractorAssignment');
      if (draft && Object.keys(draft).length > 0) {
        const legacyDirection = draft.percentage_above_below
          ?? (typeof draft.percentage_direction === 'string'
            ? draft.percentage_direction
            : draft.percentage_direction?.value);
        const merged = withComputedFinalAmount(
          {
            ...EMPTY_FORM,
            ...draft,
            percentage_above_below: normalizeEstimateType(legacyDirection),
          },
          baseTenderAmount,
        );
        setForm(merged);
        bindForm(merged);
      }
    };

    hydrate();
  }, [currentWorkId]); // eslint-disable-line react-hooks/exhaustive-deps

  const updateField = useCallback(
    (key, value, { immediate = false } = {}) => {
      setForm((prev) => {
        let updated = { ...prev, [key]: value };
        if (key === 'percentage_above_below' || key === 'percentage_variation') {
          updated = withComputedFinalAmount(updated);
        }
        queueMicrotask(() => {
          setDraft('contractorAssignment', updated);
          bindForm(updated);
          if (immediate) saveImmediately();
          else scheduleDebouncedSave();
        });
        return updated;
      });
    },
    [setDraft, bindForm, scheduleDebouncedSave, saveImmediately, withComputedFinalAmount],
  );

  // ─── Save & Continue ──────────────────────────────────────────────────────
  const { saveAndContinue, isSaving } = useSaveAndContinue(
    'contractorAssignment',
    (workId, data) => upsertContractorAssignment(workId, {
      contractor_name: data.contractor_name,
      contractor_contact: data.contractor_contact,
      percentage_above_below: data.percentage_above_below,
      percentage_variation: data.percentage_variation,
      final_tender_amount: data.final_tender_amount,
      contractor_doc_path: data.contractor_doc_path,
    }),
    WORKFLOW_ROUTES.SANCTION_APPROVAL,
    WORKFLOW_ROUTES.CONTRACTOR_ASSIGNMENT,
  );

  const { pickDocument: pickContractorDoc, uploading: uploadingContractorDoc } =
    useDocumentUpload(
      currentWorkId,
      DOCUMENT_TYPES.CONTRACTOR_DETAILS,
      (filePath) => updateField('contractor_doc_path', filePath, { immediate: true }),
    );

  const handleSave = () => {
    saveAndContinue(form, navigation, {
      onValidationFail: (msg) => Alert.alert(t('common.saveFailedTitle'), msg),
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
      <WorkflowProgress
        currentStep={6}
        totalSteps={TOTAL_WORKFLOW_STEPS}
        showPercentage
        style={styles.progress}
      />

      <ProgressSlot
        step={6}
        title={getStepTitle(SCREEN_TYPE, t)}
        description={getStepProgressDescription(SCREEN_TYPE, t)}
        screenType="contractorAssignment"
      />

      <HelpTooltipScope>
        <View style={styles.form}>

          <Inputboxfield
            label={t('steps.contractorAssignment.fields.contractorName.label')}
            placeholder={t('steps.contractorAssignment.fields.contractorName.placeholder')}
            helpKey="workflow.contractorAssignment.contractorName"
            helpTooltipId="contractorAssignment-contractorName"
            type="textOnly"
            value={form.contractor_name}
            onChangeText={(v) => updateField('contractor_name', v)}
          />

          <Inputboxfield
            label={t('steps.contractorAssignment.fields.contactMobile.label')}
            placeholder={t('steps.contractorAssignment.fields.contactMobile.placeholder')}
            helpKey="workflow.contractorAssignment.contactMobile"
            helpTooltipId="contractorAssignment-contactMobile"
            value={form.contractor_contact}
            type="phone"
            keyboardType="phone-pad"
            onChangeText={(v) => updateField('contractor_contact', v)}
          />

          <FormFieldLabel
            label={t('steps.contractorAssignment.fields.percentRow')}
            helpKey="workflow.contractorAssignment.percentAboveBelow"
            helpTooltipId="contractorAssignment-percentAboveBelow"
            labelStyle={styles.rowLabel}
            style={styles.percentLabelRow}
          />
          <View style={styles.percentRow}>
            <View style={styles.directionCell}>
              <FormDropdown
                placeholder={t('dropdowns.above')}
                data={estimateOptions}
                value={form.percentage_above_below || null}
                onChange={(item) =>
                  updateField('percentage_above_below', item.value, { immediate: true })
                }
                style={styles.noMargin}
                fieldStyle={styles.directionField}
              />
            </View>

            <View style={styles.percentCell}>
              <Inputboxfield
                placeholder={t('steps.contractorAssignment.fields.percentPlaceholder')}
                value={form.percentage_variation}
                type="decimal"
                keyboardType="decimal-pad"
                onChangeText={(v) => updateField('percentage_variation', v)}
                rightIcon={<Text style={styles.percentSuffix}>%</Text>}
                containerStyle={styles.noMargin}
              />
            </View>
          </View>

          <Inputboxfield
            label={t('steps.contractorAssignment.fields.finalTenderAmount.label')}
            placeholder={t('steps.contractorAssignment.fields.finalTenderAmount.placeholder')}
            helpKey="workflow.contractorAssignment.finalTenderAmount"
            helpTooltipId="contractorAssignment-finalTenderAmount"
            value={form.final_tender_amount}
            type="number"
            keyboardType="numeric"
            editable={false}
          />

          <UploadDocument
            sectionLabel={t('common.documents')}
            documents={[
              buildUploadDocumentEntry({
                title: t('steps.contractorAssignment.uploads.contractorTitle'),
                uploadText: t('steps.contractorAssignment.uploads.contractorUpload'),
                filePath: form.contractor_doc_path,
                onPress: pickContractorDoc,
                loading: uploadingContractorDoc,
              }),
            ]}
          />

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

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  progress: { marginBottom: theme.Spacing?.sm ?? 8 },
  form: { marginTop: theme.Spacing?.sm ?? 8 },
  cta: { marginTop: theme.Spacing?.lg ?? 24, marginBottom: theme.Spacing?.xl ?? 32 },

  // ── % above/below row ──────────────────────────────────────────────────────
  percentLabelRow: {
    marginBottom: theme.Spacing?.xs ?? 6,
  },
  rowLabel: {
    fontSize: theme.FontSize?.sm ?? 14,
    fontWeight: theme.FontWeight?.medium ?? '500',
    fontFamily: theme.FontFamily?.regular ?? undefined,
    color: theme.Colors?.textPrimary ?? '#1A1A1A',
    marginBottom: 0,
    letterSpacing: 0.1,
  },
  percentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.Spacing?.sm ?? 8,
    marginBottom: theme.Spacing?.md ?? 14,
  },
  // Wide enough for "Below" + chevron without clipping (110px was too narrow)
  directionCell: {
    minWidth: 124,
    width: '36%',
    maxWidth: 148,
  },
  directionField: {
    paddingHorizontal: 12,
  },
  // Percentage input — takes remaining width
  percentCell: {
    flex: 1,
  },
  noMargin: {
    marginBottom: 0,   // row handles its own bottom margin
  },
  percentSuffix: {
    fontSize: theme.FontSize?.sm ?? 14,
    color: theme.Colors?.textTertiary ?? '#888888',
    fontWeight: theme.FontWeight?.medium ?? '500',
  },

});

export default ContractorAssignmentScreen;