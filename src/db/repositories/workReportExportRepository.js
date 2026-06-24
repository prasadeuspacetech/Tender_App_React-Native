// Read-only aggregator for detailed FY Work Report PDF export.

import { getEffectiveBudgetForRow } from './reportsRepository';
import { filterRecordsByFinancialYear } from '../../utils/financialYearDate';
import { getFileNameFromPath } from '../../utils/fileName';
import { isImageFilePath, localFileExists } from '../../utils/localFileUtils';
import { getWorkflowStepTitle } from '../../utils/reportWorkflowLabels';
import { getApprovalByWorkId } from './approvalsRepository';
import { getBillSubmissionByWorkId } from './billSubmissionRepository';
import { getCompletionClosureByWorkId } from './completionClosureRepository';
import { getContractorByWorkId } from './contractorRepository';
import { getEstimationByWorkId } from './estimationsRepository';
import { getAllGeneralCorrespondence } from './generalCorrespondenceRepository';
import {
  getPaymentInstallmentsForWork,
  getPaymentSummaryForWork,
} from './paymentsRepository';
import {
  filterWorksByFinancialYear,
  getReportsBudgetSummary,
} from './reportsRepository';
import { getReTenderByWorkId } from './retendersRepository';
import { getSanctionByWorkId } from './sanctionsRepository';
import { getTenderByWorkId } from './tendersRepository';
import { getWorkById } from './worksRepository';
import { getWorkOrderByWorkId } from './workOrdersRepository';
import { getWorkProgressByWorkId, parseSitePhotosJson } from './workProgressRepository';

const workCompletedToChipStatus = (workCompleted) => {
  if (workCompleted === 'Completed') return 'completed';
  if (workCompleted === 'In Progress') return 'progress';
  return 'pending';
};

const pushDocumentRef = (refs, type, path) => {
  if (!path || typeof path !== 'string' || !String(path).trim()) return;
  refs.push({
    type,
    path,
    fileName: getFileNameFromPath(path) || path,
    exists: localFileExists(path),
  });
};

const collectImagePaths = ({
  workProgress,
  workOrder,
  completion,
  documentRefs,
}) => {
  const paths = [];

  const add = (uri) => {
    if (uri && typeof uri === 'string' && isImageFilePath(uri)) {
      paths.push(uri);
    }
  };

  parseSitePhotosJson(workProgress?.site_photos).forEach(add);
  parseSitePhotosJson(workOrder?.inauguration_photos).forEach(add);

  const completionPhotos = parseSitePhotosJson(completion?.site_photos_path);
  if (completionPhotos.length) {
    completionPhotos.forEach(add);
  } else {
    add(completion?.site_photos_path);
  }

  documentRefs.forEach((doc) => {
    if (isImageFilePath(doc.path)) add(doc.path);
  });

  return [...new Set(paths)];
};

const collectDocumentRefs = ({
  approval,
  estimation,
  tender,
  contractor,
  sanction,
  workOrder,
  billSubmission,
  completion,
  paymentInstallments,
}) => {
  const refs = [];

  pushDocumentRef(refs, 'pmc_letter', approval?.pmc_letter_path);
  pushDocumentRef(refs, 'estimation', estimation?.document_path);
  pushDocumentRef(refs, 'tender_advertisement', tender?.advertisement_path);
  pushDocumentRef(refs, 'tender_notice', tender?.tender_notice_path);
  pushDocumentRef(refs, 'contractor', contractor?.document_path);
  pushDocumentRef(refs, 'sanction_letter', sanction?.sanction_letter_path);
  pushDocumentRef(refs, 'work_order', workOrder?.work_order_document_path);
  pushDocumentRef(refs, 'bill', billSubmission?.bill_document);
  pushDocumentRef(refs, 'completion_certificate', completion?.completion_certificate_path);

  paymentInstallments.forEach((row, index) => {
    pushDocumentRef(refs, `payment_receipt_${index}`, row.payment_receipt_path);
  });

  return refs;
};

const toBudgetRow = (payload) => ({
  work_budget: payload.work?.budget,
  estimated_cost: payload.estimation?.estimated_cost,
  tender_amount: payload.tender?.tender_amount,
  final_tender_amount: payload.contractor?.final_tender_amount,
  percentage_above_below: payload.contractor?.percentage_above_below,
  percentage_variation: payload.contractor?.percentage_variation,
  enable_retender: payload.retender?.enable_retender ? 1 : 0,
  new_tender_amount: payload.retender?.new_tender_amount,
});

export const buildWorkIndexRow = (payload, index, listRow, i18n) => {
  const { work, paymentSummary, sanction } = payload;
  const effectiveBudget = getEffectiveBudgetForRow(toBudgetRow(payload));
  const statusKey = workCompletedToChipStatus(listRow?.work_completed ?? 'Pending');

  return {
    index: index + 1,
    workId: work.id,
    workName: work.work_name ?? '',
    workCode: work.work_code ?? '',
    ward: work.ward ?? '',
    department: work.department ?? '',
    effectiveBudget,
    amountPaid: paymentSummary?.amountPaid ?? 0,
    pending: paymentSummary?.pending ?? 0,
    sanctionAmount: sanction?.sanction_amount ?? null,
    workflowStep: work.workflow_step ?? 1,
    stageLabel: getWorkflowStepTitle(i18n, work.workflow_step, {
      allCompleteKey: 'export.allStepsComplete',
    }),
    statusKey,
    workCompleted: listRow?.work_completed ?? 'Pending',
  };
};

export const getWorkExportPayload = (workId, workRow = null) => {
  const work = workRow ?? getWorkById(workId);
  if (!work) return null;

  const approval = getApprovalByWorkId(workId);
  const estimation = getEstimationByWorkId(workId);
  const tender = getTenderByWorkId(workId);
  const retender = getReTenderByWorkId(workId);
  const contractor = getContractorByWorkId(workId);
  const sanction = getSanctionByWorkId(workId);
  const workOrder = getWorkOrderByWorkId(workId);
  const workProgress = getWorkProgressByWorkId(workId);
  const paymentSummary = getPaymentSummaryForWork(workId);
  const paymentInstallments = getPaymentInstallmentsForWork(workId);
  const billSubmission = getBillSubmissionByWorkId(workId);
  const completion = getCompletionClosureByWorkId(workId);

  const documentRefs = collectDocumentRefs({
    approval,
    estimation,
    tender,
    contractor,
    sanction,
    workOrder,
    billSubmission,
    completion,
    paymentInstallments,
  });

  const imagePaths = collectImagePaths({
    workProgress,
    workOrder,
    completion,
    documentRefs,
  });

  return {
    workId,
    work,
    approval,
    estimation,
    tender,
    retender,
    contractor,
    sanction,
    workOrder,
    workProgress,
    paymentSummary,
    paymentInstallments,
    billSubmission,
    completion,
    documentRefs,
    imagePaths,
    effectiveBudget: getEffectiveBudgetForRow(toBudgetRow({
      work,
      estimation,
      tender,
      retender,
      contractor,
    })),
  };
};

export const getFinancialYearDetailedReport = (financialYear, works, i18n) => {
  const fyWorks = filterWorksByFinancialYear(works, financialYear);
  const workPayloads = fyWorks
    .map((w) => getWorkExportPayload(w.id, w))
    .filter(Boolean);

  let completed = 0;
  let inProgress = 0;
  let pending = 0;

  fyWorks.forEach((work) => {
    const status = workCompletedToChipStatus(work.work_completed);
    if (status === 'completed') completed += 1;
    else if (status === 'progress') inProgress += 1;
    else pending += 1;
  });

  const budgetSummary = getReportsBudgetSummary(financialYear, { useTotalAmountPaid: true });
  const indexRows = workPayloads.map((payload, index) =>
    buildWorkIndexRow(payload, index, fyWorks[index], i18n),
  );

  return {
    financialYear,
    generatedAt: new Date().toISOString(),
    workCount: fyWorks.length,
    summary: {
      completed,
      inProgress,
      pending,
      budgetSummary,
    },
    indexRows,
    works: workPayloads,
    generalCorrespondence: filterRecordsByFinancialYear(
      getAllGeneralCorrespondence(),
      financialYear,
    ),
  };
};
