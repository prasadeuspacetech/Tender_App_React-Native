// src/screens/AddWork/workflow/TenderCreationScreen.jsx
// Step 4 of 10: Tender Creation

import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, StyleSheet, Text, View } from 'react-native';

import FormToggleField from '../../../components/FormToggleField';
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

import useSaveAndContinue from '../../../hooks/useSaveAndContinue';
import useWorkflowAutoSave from '../../../hooks/useWorkflowAutoSave';
import useWorkflowStepGuard from '../../../hooks/useWorkflowStepGuard';
import {
    getStepProgressDescription,
    getStepScreenTitle,
    getStepTitle,
} from '../../../i18n/workflowLabels';
import useDraftStore from '../../../store/useDraftStore';
import useWorkStore from '../../../store/useWorkStore';

import { TOTAL_WORKFLOW_STEPS, WORKFLOW_ROUTES } from '../../../constants/WorkflowSteps';
import { getTenderByWorkId, upsertTender } from '../../../db/repositories/tendersRepository';
import theme from '../../../theme';
import { formFieldStyles } from '../../../theme/formFieldStyles';
import { formatDateForStorage } from '../../../utils/dateFormat';

const SCREEN_TYPE = 'tenderCreation';

// ─── Initial form ─────────────────────────────────────────────────────────────
const EMPTY_FORM = {
  tender_name:        '',
  tender_number:      '',
  tender_date:        '',       // stored as 'DD/MM/YYYY' string
  tender_amount:      '',
  a_packet_open:      false,
  b_packet_open:      false,
  advertisement_path: null,
  tender_notice_path: null,
};

// ─────────────────────────────────────────────────────────────────────────────
const TenderCreationScreen = ({ navigation }) => {
  const { t } = useTranslation('workflow');

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
            a_packet_open: !!saved.a_packet_open,
            b_packet_open: !!saved.b_packet_open,
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
          currentStep={4}
          totalSteps={TOTAL_WORKFLOW_STEPS}
          showPercentage
          style={styles.progress}
        />
        <ProgressSlot
          step={4}
          title={getStepTitle(SCREEN_TYPE, t)}
          description={getStepProgressDescription(SCREEN_TYPE, t)}
          screenType="tenderCreation"
        />

        <View style={styles.form}>

          <Inputboxfield
            label={t('steps.tenderCreation.fields.tenderName.label')}
            placeholder={t('steps.tenderCreation.fields.tenderName.placeholder')}
            helpKey="workflow.tenderCreation.tenderName"
            helpTooltipId="tenderCreation-tenderName"
            type="textOnly"
            value={form.tender_name}
            onChangeText={(v) => updateField('tender_name', v)}
          />

          <Inputboxfield
            label={t('steps.tenderCreation.fields.tenderNumber.label')}
            placeholder={t('steps.tenderCreation.fields.tenderNumber.placeholder')}
            helpKey="workflow.tenderCreation.tenderNumber"
            helpTooltipId="tenderCreation-tenderNumber"
            type="alphanumeric"
            value={form.tender_number}
            onChangeText={(v) => updateField('tender_number', v)}
          />

          <NativeDateField
            label={t('steps.tenderCreation.fields.advertisementDate.label')}
            placeholder={t('steps.tenderCreation.fields.advertisementDate.placeholder')}
            helpKey="workflow.tenderCreation.advertisementDate"
            helpTooltipId="tenderCreation-advertisementDate"
            value={form.tender_date}
            onDateChange={(date) =>
              updateField('tender_date', formatDateForStorage(date), { immediate: true })
            }
          />

          <Inputboxfield
            label={t('steps.tenderCreation.fields.tenderAmount.label')}
            placeholder={t('steps.tenderCreation.fields.tenderAmount.placeholder')}
            helpKey="workflow.tenderCreation.tenderAmount"
            helpTooltipId="tenderCreation-tenderAmount"
            type="number"
            keyboardType="numeric"
            value={form.tender_amount}
            onChangeText={(v) => updateField('tender_amount', v)}
          />

          <Text style={styles.sectionLabel}>{t('steps.tenderCreation.sectionTenderStatus')}</Text>

        <FormToggleField
          rowLabelOn={t('steps.tenderCreation.toggles.aPacketOn')}
          rowLabelOff={t('steps.tenderCreation.toggles.aPacketOff')}
          value={form.a_packet_open}
          segmentLeftLabel={t('toggles.close')}
          segmentRightLabel={t('toggles.open')}
          onToggle={() =>
            updateField('a_packet_open', !form.a_packet_open, { immediate: true })
          }
        />

        <FormToggleField
          rowLabelOn={t('steps.tenderCreation.toggles.bPacketOn')}
          rowLabelOff={t('steps.tenderCreation.toggles.bPacketOff')}
          value={form.b_packet_open}
          segmentLeftLabel={t('toggles.close')}
          segmentRightLabel={t('toggles.open')}
          onToggle={() =>
            updateField('b_packet_open', !form.b_packet_open, { immediate: true })
          }
        />

          <UploadDocument
            sectionLabel={t('common.documents')}
            layout="grid"
            documents={[
              buildUploadDocumentEntry({
                title: t('steps.tenderCreation.uploads.newspaperTitle'),
                uploadText: t('steps.tenderCreation.uploads.newspaperUpload'),
                filePath: form.advertisement_path,
                onPress: pickAdvertisement,
                loading: uploadingAdvertisement,
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
  progress: { marginBottom: theme.Spacing?.sm ?? 8 },
  form:     { marginTop:    theme.Spacing?.sm ?? 8 },
  sectionLabel: {
    ...formFieldStyles.label,
    marginBottom: theme.Spacing?.xs ?? 4,
  },

  cta: {
    marginTop:    theme.Spacing?.lg ?? 24,
    marginBottom: theme.Spacing?.xl ?? 32,
  },
});

export default TenderCreationScreen;