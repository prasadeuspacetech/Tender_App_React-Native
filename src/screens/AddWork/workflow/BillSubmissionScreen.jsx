// src/screens/AddWork/workflow/BillSubmissionScreen.jsx
// Step 8 of 9: Payment Status (stack route name: BillSubmission)

import React, { useCallback, useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import CalendarPicker from '../../../components/CalendarPicker';
import Inputboxfield from '../../../components/Inputboxfield';
import FormToggleField from '../../../components/FormToggleField';
import ProgressSlot from '../../../components/layouts/Progressslot';
import ScreenLayout from '../../../components/layouts/Screenlayout';
import WorkflowProgress from '../../../components/layouts/Workflowprogress';
import PrimaryButton from '../../../components/PrimaryButton';
import UploadDocument from '../../../components/UploadDocument';
import { DOCUMENT_TYPES } from '../../../constants/documentTypes';
import useDocumentUpload from '../../../hooks/useDocumentUpload';
import { buildUploadDocumentEntry } from '../../../utils/documentUploadProps';

import useSaveAndContinue from '../../../hooks/useSaveAndContinue';
import useWorkflowStepGuard from '../../../hooks/useWorkflowStepGuard';
import useDraftStore from '../../../store/useDraftStore';
import useWorkStore from '../../../store/useWorkStore';

import { TOTAL_WORKFLOW_STEPS, WORKFLOW_ROUTES } from '../../../constants/WorkflowSteps';
import {
  getPaymentByWorkId,
  getPaymentSummaryForWork,
  upsertPayment,
} from '../../../db/repositories/paymentsRepository';
import theme from '../../../theme';

const formatRupee = (amount) => {
  const n = Number(amount) || 0;
  return `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
};

// ─── Colour tokens ────────────────────────────────────────────────────────────
const TEXT = theme.Colors?.text ?? '#1A1A1A';
const SECONDARY = theme.Colors?.secondary ?? '#777777';
const BORDER = theme.Colors?.border ?? '#E0E0E0';
const WHITE = theme.Colors?.white ?? '#FFFFFF';
const PENDING = '#C0392B';
const PAID = '#1D6B43';

// ─── Helper: Date → 'DD/MM/YYYY' ─────────────────────────────────────────────
const toDateString = (date) => {
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
};

// ─── Summary card ─────────────────────────────────────────────────────────────
const SummaryCard = ({ label, value, valueColor }) => (
  <View style={cardStyles.card}>
    <Text style={cardStyles.label}>{label}</Text>
    <Text style={[cardStyles.value, { color: valueColor ?? TEXT }]}>{value}</Text>
  </View>
);

const cardStyles = StyleSheet.create({
  card: {
    flex: 1,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: theme.Radius?.md ?? 10,
    backgroundColor: WHITE,
    paddingVertical: theme.Spacing?.sm ?? 10,
    paddingHorizontal: theme.Spacing?.xs ?? 8,
    marginHorizontal: 3,
  },
  label: {
    fontSize: theme.FontSize?.xs ?? 11,
    color: SECONDARY,
    marginBottom: 4,
  },
  value: {
    fontSize: theme.FontSize?.md ?? 15,
    fontWeight: '700',
  },
});

// ─── Initial form ─────────────────────────────────────────────────────────────
const EMPTY_FORM = {
  payment_released: false,
  amount_paid: '',
  payment_date: '',    // stored as 'DD/MM/YYYY' string
  payment_pdf_path: '',
};

// ─────────────────────────────────────────────────────────────────────────────
const BillSubmissionScreen = ({ navigation }) => {
  useWorkflowStepGuard(WORKFLOW_ROUTES.PAYMENT_STATUS, navigation);

  const { getDraft, setDraft } = useDraftStore();
  const { currentWorkId } = useWorkStore();

  const [form, setForm] = useState(EMPTY_FORM);
  const [summary, setSummary] = useState({ totalBill: 0, amountPaid: 0, pending: 0 });

  // ── Field updater ──────────────────────────────────────────────────────────
  const updateField = useCallback((key, value) => {
    const updated = { ...form, [key]: value };
    setForm(updated);
    setDraft('paymentStatus', updated);
  }, [form, setDraft]);

  // ── Toggle — boolean only, no event object ─────────────────────────────────
  const handleToggle = useCallback(() => {
    updateField('payment_released', !form.payment_released);
  }, [form.payment_released, updateField]);

  // ── Hydration ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const hydrate = () => {
      // 1. In-session Zustand draft (user navigated back mid-flow)
      const draft = getDraft('paymentStatus');
      if (draft && Object.keys(draft).length > 0) {
        setForm((prev) => ({ ...prev, ...draft }));
      } else if (currentWorkId) {
        const saved = getPaymentByWorkId(currentWorkId);
        if (saved) {
          setForm({
            payment_released: saved.paid === 1,
            amount_paid: saved.amount_paid != null ? String(saved.amount_paid) : '',
            payment_date: saved.payment_date ?? '',
            payment_pdf_path: saved.payment_receipt_path ?? '',
          });
        }
      }

      if (currentWorkId) {
        setSummary(getPaymentSummaryForWork(currentWorkId));
      }
    };

    hydrate();
  }, [currentWorkId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!currentWorkId) return;
    const paid = form.payment_released && form.amount_paid
      ? parseFloat(String(form.amount_paid).replace(/[^0-9.]/g, '')) || 0
      : 0;
    const base = getPaymentSummaryForWork(currentWorkId);
    setSummary({
      totalBill: base.totalBill,
      amountPaid: form.payment_released ? paid : base.amountPaid,
      pending: Math.max(0, base.totalBill - (form.payment_released ? paid : base.amountPaid)),
    });
  }, [currentWorkId, form.payment_released, form.amount_paid]);

  // ── Save & Continue ────────────────────────────────────────────────────────
  // Final step: after persist, clear all drafts + work state, go to list
  const { saveAndContinue, isSaving } = useSaveAndContinue(
    'paymentStatus',
    (workId, data) => upsertPayment(workId, data),
    WORKFLOW_ROUTES.COMPLETION_CLOSURE,
    WORKFLOW_ROUTES.PAYMENT_STATUS,
  );

  const { pickDocument: pickPaymentReceipt, uploading: uploadingPaymentReceipt } =
    useDocumentUpload(
      currentWorkId,
      DOCUMENT_TYPES.PAYMENT_RECEIPT,
      (filePath) => updateField('payment_pdf_path', filePath),
    );

  const handleSave = () => {
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
      title="Payment Status"
      showBack
      showNotification
      scrollable
      keyboardAware
      onBackPress={() => navigation.goBack()}
    >
      <WorkflowProgress
        currentStep={8}
        totalSteps={TOTAL_WORKFLOW_STEPS}
        showPercentage
        style={styles.progress}
      />
      <ProgressSlot
        step={8}
        title="Payment Status"
        description="Payment is not pay"
        screenType="paymentStatus"
      />

      <View style={styles.summaryRow}>
        <SummaryCard
          label="Total bill amount"
          value={formatRupee(summary.totalBill)}
          valueColor={TEXT}
        />
        <SummaryCard
          label="Amount paid"
          value={formatRupee(summary.amountPaid)}
          valueColor={PAID}
        />
        <SummaryCard
          label="Pending"
          value={formatRupee(summary.pending)}
          valueColor={PENDING}
        />
      </View>

      <FormToggleField
        rowLabel="Payment released?"
        value={form.payment_released}
        onToggle={handleToggle}
      />

      {/* ── Conditional fields — visible only when toggle is ON ───────────── */}
      {form.payment_released && (
        <>
          <Inputboxfield
            label="Amount paid (₹)"
            placeholder="Amount paid (₹)"
            keyboardType="numeric"
            value={form.amount_paid}
            onChangeText={(v) => updateField('amount_paid', v)}
          />

          <View>
            <CalendarPicker
              label="Payment date"
              placeholder="dd/mm/yy"
              value={form.payment_date}
              onDateChange={(date) => updateField('payment_date', toDateString(date))}
            />
          </View>

          <UploadDocument
            sectionLabel="Documents"
            documents={[
              buildUploadDocumentEntry({
                title: 'Payment PDF',
                uploadText: 'Upload Payment PDF',
                filePath: form.payment_pdf_path,
                onPress: pickPaymentReceipt,
                loading: uploadingPaymentReceipt,
              }),
            ]}
          />
        </>
      )}

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

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  progress: { marginBottom: theme.Spacing?.sm ?? 8 },

  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.Spacing?.sm ?? 8,
    marginBottom: theme.Spacing?.md ?? 14,
    marginHorizontal: -3,   // compensates SummaryCard's marginHorizontal: 3
  },

  cta: {
    marginTop: theme.Spacing?.lg ?? 24,
    marginBottom: theme.Spacing?.xl ?? 32,
  },
});

export default BillSubmissionScreen;