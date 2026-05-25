/**
 * Persists workflow step form data to SQLite using existing repository upserts.
 * Same payloads as useSaveAndContinue — no schema changes.
 */

import { upsertApprovalDetails } from '../db/repositories/approvalsRepository';
import { upsertBillSubmission } from '../db/repositories/billSubmissionRepository';
import { upsertCompletionClosure } from '../db/repositories/completionClosureRepository';
import { upsertContractorAssignment } from '../db/repositories/contractorRepository';
import { upsertEstimation } from '../db/repositories/estimationsRepository';
import { upsertPayment } from '../db/repositories/paymentsRepository';
import { upsertReTender } from '../db/repositories/retendersRepository';
import { upsertSanction } from '../db/repositories/sanctionsRepository';
import { upsertTender } from '../db/repositories/tendersRepository';
import { upsertWorkOrder } from '../db/repositories/workOrdersRepository';
import { upsertWorkProgress } from '../db/repositories/workProgressRepository';
import { upsertWorkDetails } from '../db/repositories/worksRepository';
import { formatDateForStorage } from './dateFormat';

/** @returns {number|null} resolved work id */
export const persistWorkflowStep = (screenKey, workId, formData) => {
  switch (screenKey) {
    case 'workDetails':
      return upsertWorkDetails(workId, {
        ...formData,
        budget: formData.budget ? parseFloat(String(formData.budget).replace(/[^0-9.]/g, '')) || 0 : 0,
      });

    case 'pmcApproval':
      if (!workId) return null;
      return upsertApprovalDetails(workId, {
        letter_number: formData.letter_number,
        letter_date: formatDateForStorage(formData.letter_date),
        approval_date: formatDateForStorage(formData.approval_date),
        finance_required: formData.finance_committee,
        finance_status: formData.finance_approval_status,
        pmc_letter_path: formData.pmc_letter_path,
      });

    case 'estimation':
      if (!workId) return null;
      return upsertEstimation(workId, {
        estimate_done: formData.estimate_done,
        estimation_date: formData.estimation_date,
        estimated_cost: formData.estimated_cost,
        notes: formData.notes,
        estimation_file_path: formData.estimation_file_path,
      });

    case 'tenderCreation':
      if (!workId) return null;
      return upsertTender(workId, formData);

    case 'reTender':
      if (!workId) return null;
      return upsertReTender(workId, {
        enable_retender: formData.enable_retender,
        previous_tender_reference: formData.previous_tender_reference,
        new_tender_date: formData.new_tender_date,
        new_tender_amount: formData.new_tender_amount,
        retender_reason: formData.retender_reason,
      });

    case 'contractorAssignment':
      if (!workId) return null;
      return upsertContractorAssignment(workId, {
        contractor_name: formData.contractor_name,
        contractor_contact: formData.contractor_contact,
        percentage_above_below: formData.percentage_above_below,
        percentage_variation: formData.percentage_variation,
        final_tender_amount: formData.final_tender_amount,
        contractor_doc_path: formData.contractor_doc_path,
      });

    case 'sanctionApproval':
      if (!workId) return null;
      return upsertSanction(workId, formData);

    case 'workOrder':
      if (!workId) return null;
      return upsertWorkOrder(workId, formData);

    case 'workProgress':
      if (!workId) return null;
      return upsertWorkProgress(workId, formData);

    case 'paymentStatus':
      if (!workId) return null;
      return upsertPayment(workId, formData);

    case 'billSubmission':
      if (!workId) return null;
      return upsertBillSubmission(workId, formData);

    case 'completionClosure':
      if (!workId) return null;
      return upsertCompletionClosure(workId, formData);

    default:
      console.warn(`[workflowPersist] unknown screenKey: ${screenKey}`);
      return workId ?? null;
  }
};
