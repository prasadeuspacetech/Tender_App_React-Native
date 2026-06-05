// Step 8: Work Order / Start

import React, { useCallback, useEffect, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import Inputboxfield from '../../../components/Inputboxfield';
import ProgressSlot from '../../../components/layouts/Progressslot';
import ScreenLayout from '../../../components/layouts/Screenlayout';
import WorkflowProgress from '../../../components/layouts/Workflowprogress';
import NativeDateField from '../../../components/NativeDateField';
import PrimaryButton from '../../../components/PrimaryButton';
import SitePhotosUpload from '../../../components/workflow/SitePhotosUpload';
import UploadDocument from '../../../components/UploadDocument';
import { MAX_INAUGURATION_PHOTOS } from '../../../db/repositories/workOrdersRepository';
import { DOCUMENT_TYPES } from '../../../constants/documentTypes';
import { TOTAL_WORKFLOW_STEPS, WORKFLOW_ROUTES } from '../../../constants/WorkflowSteps';
import {
    getWorkOrderByWorkId,
    mapWorkOrderRowToForm,
    upsertWorkOrder,
} from '../../../db/repositories/workOrdersRepository';
import useDocumentUpload from '../../../hooks/useDocumentUpload';
import useSaveAndContinue from '../../../hooks/useSaveAndContinue';
import useWorkflowAutoSave from '../../../hooks/useWorkflowAutoSave';
import useWorkflowStepGuard from '../../../hooks/useWorkflowStepGuard';
import useDraftStore from '../../../store/useDraftStore';
import useWorkStore from '../../../store/useWorkStore';
import theme from '../../../theme';
import { formatDateForStorage } from '../../../utils/dateFormat';
import { buildUploadDocumentEntry } from '../../../utils/documentUploadProps';

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
      onValidationFail: (m) => Alert.alert('Save Failed', m),
    });
  };

  return (
    <ScreenLayout
      title="Work Order / Start"
      showBack
      showNotification
      scrollable
      keyboardAware
      onBackPress={() => navigation.goBack()}
    >
      <WorkflowProgress
        currentStep={STEP}
        totalSteps={TOTAL_WORKFLOW_STEPS}
        showPercentage
        style={styles.progress}
      />
      <ProgressSlot
        step={STEP}
        title="Work Order"
        description="Work order issued / Work started"
        screenType="workOrder"
      />

      <View style={styles.form}>
        <Inputboxfield
          label="Work order number"
          placeholder="DKT 005-2035"
          type="alphanumeric"
          value={form.work_order_number}
          onChangeText={(v) => updateField('work_order_number', v)}
        />

        <NativeDateField
          label="Work start date"
          placeholder="dd/mm/yyyy"
          value={form.work_start_date}
          onDateChange={(v) =>
            updateField('work_start_date', formatDateForStorage(v), { immediate: true })
          }
        />

        <NativeDateField
          label="Expected completion"
          placeholder="dd/mm/yyyy"
          value={form.expected_completion_date}
          onDateChange={(v) =>
            updateField('expected_completion_date', formatDateForStorage(v), { immediate: true })
          }
        />

        <Inputboxfield
          label="Notes (Optional)"
          placeholder="Add notes (optional)"
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
          sectionLabel="Inauguration Photos"
          maxPhotos={MAX_INAUGURATION_PHOTOS}
          storageSubfolder="work_order_inauguration_photos"
          filePrefix="inauguration_photo"
          addPhotoLabel="+ Add Photo"
          removeConfirmTitle="Remove photo"
          removeConfirmMessage="Remove this inauguration photo?"
        />

        <UploadDocument
          sectionLabel="Documents"
          documents={[
            buildUploadDocumentEntry({
              title: 'Work order document',
              uploadText: 'Upload work order document',
              filePath: form.work_order_document_path,
              onPress: pickWorkOrderDoc,
              loading: uploadingWorkOrderDoc,
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

const styles = StyleSheet.create({
  progress: { marginBottom: theme.Spacing?.sm ?? 8 },
  form: { marginTop: theme.Spacing?.sm ?? 8 },
  cta: {
    marginTop: theme.Spacing?.lg ?? 24,
    marginBottom: theme.Spacing?.xl ?? 32,
  },
});

export default WorkOrderScreen;
