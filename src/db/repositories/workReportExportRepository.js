// Read-only aggregator for detailed FY Work Report PDF export.

import { getFileNameFromPath } from '../../utils/fileName';
import { isImageFilePath, localFileExists } from '../../utils/localFileUtils';
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
import { filterWorksByFinancialYear } from './reportsRepository';
import { getReTenderByWorkId } from './retendersRepository';
import { getSanctionByWorkId } from './sanctionsRepository';
import { getTenderByWorkId } from './tendersRepository';
import { getWorkById } from './worksRepository';
import { getWorkOrderByWorkId } from './workOrdersRepository';
import { getWorkProgressByWorkId, parseSitePhotosJson } from './workProgressRepository';

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
  };
};

export const getFinancialYearDetailedReport = (financialYear, works) => {
  const fyWorks = filterWorksByFinancialYear(works, financialYear);

  return {
    financialYear,
    generatedAt: new Date().toISOString(),
    workCount: fyWorks.length,
    works: fyWorks
      .map((w) => getWorkExportPayload(w.id, w))
      .filter(Boolean),
    generalCorrespondence: getAllGeneralCorrespondence(),
  };
};
