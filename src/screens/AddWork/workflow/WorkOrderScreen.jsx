// Step 8: Work Order / Start

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
import SitePhotosUpload from '../../../components/workflow/SitePhotosUpload';
import { DOCUMENT_TYPES } from '../../../constants/documentTypes';
import { TOTAL_WORKFLOW_STEPS, WORKFLOW_ROUTES } from '../../../constants/WorkflowSteps';
import {
    getWorkOrderByWorkId,
    mapWorkOrderRowToForm, MAX_INAUGURATION_PHOTOS, upsertWorkOrder
} from '../../../db/repositories/workOrdersRepository';
import useDocumentUpload from '../../../hooks/useDocumentUpload';
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
import theme from '../../../theme';
import { formatDateForStorage } from '../../../utils/dateFormat';
import { buildUploadDocumentEntry } from '../../../utils/documentUploadProps';

const SCREEN_TYPE = 'workOrder';
const STEP = 8;

const EMPTY_FORM = {
  work_order_number: '',
  work_start_date: '',
  expected_completion_date: '',
  notes: '',
  inauguration_photos: [],
  work_order_document_path: '',
};

const WorkOrderScreen = ({ navigation }) => {
  const { t } = useTranslation('workflow');

  useWorkflowStepGuard(WORKFLOW_ROUTES.WORK_ORDER, navigation);

  const getDraft = useDraftStore((s) => s.getDraft);
  const setDraft = useDraftStore((s) => s.setDraft);
  const { currentWorkId } = useWorkStore();
  const [form, setForm] = useState(EMPTY_FORM);
  const { bindForm, scheduleDebouncedSave, saveImmediately } = useWorkflowAutoSave('workOrder');

  useEffect(() => {
    bindForm(form);
  }, [form, bindForm]);

  useEffect(() => {
    const hydrate = () => {
      if (currentWorkId) {
        try {
          const row = getWorkOrderByWorkId(currentWorkId);
          const hydrated = mapWorkOrderRowToForm(row);
          if (hydrated) {
            setForm(hydrated);
            bindForm(hydrated);
            queueMicrotask(() => setDraft('workOrder', hydrated));
            return;
          }
        } catch (e) {
          console.warn('[WorkOrder] hydration error:', e);
        }
      }

      const draft = getDraft('workOrder');
      if (draft && Object.keys(draft).length > 0) {
        const merged = {
          ...EMPTY_FORM,
          ...draft,
          work_start_date: formatDateForStorage(draft.work_start_date),
          expected_completion_date: formatDateForStorage(draft.expected_completion_date),
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
          setDraft('workOrder', updated);
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
    'workOrder',
    (workId, data) => upsertWorkOrder(workId, data),
    WORKFLOW_ROUTES.WORK_PROGRESS,
    WORKFLOW_ROUTES.WORK_ORDER,
  );

  const { pickDocument: pickWorkOrderDoc, uploading: uploadingWorkOrderDoc } =
    useDocumentUpload(
      currentWorkId,
      DOCUMENT_TYPES.WORK_ORDER_DOCUMENT,
      (filePath) => updateField('work_order_document_path', filePath, { immediate: true }),
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
          currentStep={STEP}
          totalSteps={TOTAL_WORKFLOW_STEPS}
          showPercentage
          style={styles.progress}
        />
        <ProgressSlot
          step={STEP}
          title={getStepTitle(SCREEN_TYPE, t)}
          description={getStepProgressDescription(SCREEN_TYPE, t)}
          screenType="workOrder"
        />

        <View style={styles.form}>
          <Inputboxfield
            label={t('steps.workOrder.fields.orderNumber.label')}
            placeholder={t('steps.workOrder.fields.orderNumber.placeholder')}
            helpKey="workflow.workOrder.orderNumber"
            helpTooltipId="workOrder-orderNumber"
            type="alphanumeric"
            value={form.work_order_number}
            onChangeText={(v) => updateField('work_order_number', v)}
          />

          <NativeDateField
            label={t('steps.workOrder.fields.startDate.label')}
            placeholder={t('steps.workOrder.fields.startDate.placeholder')}
            helpKey="workflow.workOrder.startDate"
            helpTooltipId="workOrder-startDate"
            value={form.work_start_date}
            onDateChange={(v) =>
              updateField('work_start_date', formatDateForStorage(v), { immediate: true })
            }
          />

          <NativeDateField
            label={t('steps.workOrder.fields.expectedCompletion.label')}
            placeholder={t('steps.workOrder.fields.expectedCompletion.placeholder')}
            helpKey="workflow.workOrder.expectedCompletion"
            helpTooltipId="workOrder-expectedCompletion"
            value={form.expected_completion_date}
            onDateChange={(v) =>
              updateField('expected_completion_date', formatDateForStorage(v), { immediate: true })
            }
          />

          <Inputboxfield
            label={t('steps.workOrder.fields.notes.label')}
            placeholder={t('steps.workOrder.fields.notes.placeholder')}
            helpKey="workflow.workOrder.notes"
            helpTooltipId="workOrder-notes"
            value={form.notes}
            onChangeText={(v) => updateField('notes', v)}
            multiline
            numberOfLines={3}
          />

          <SitePhotosUpload
            workId={currentWorkId}
            photos={form.inauguration_photos}
            onChange={(photos) =>
              updateField('inauguration_photos', photos, { immediate: true })
            }
            sectionLabel={t('steps.workOrder.uploads.inaugurationPhotos')}
            maxPhotos={MAX_INAUGURATION_PHOTOS}
            storageSubfolder="work_order_inauguration_photos"
            filePrefix="inauguration_photo"
            addPhotoLabel={t('site.addPhotoPlus')}
            removeConfirmMessage={t('alerts.removeInaugurationPhotoMessage')}
          />

          <UploadDocument
            sectionLabel={t('common.documents')}
            documents={[
              buildUploadDocumentEntry({
                title: t('steps.workOrder.uploads.workOrderTitle'),
                uploadText: t('steps.workOrder.uploads.workOrderUpload'),
                filePath: form.work_order_document_path,
                onPress: pickWorkOrderDoc,
                loading: uploadingWorkOrderDoc,
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
  form: { marginTop: theme.Spacing?.sm ?? 8 },
  cta: {
    marginTop: theme.Spacing?.lg ?? 24,
    marginBottom: theme.Spacing?.xl ?? 32,
  },
});

export default WorkOrderScreen;
