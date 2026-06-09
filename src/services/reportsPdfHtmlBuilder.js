import { formatRupeesFull } from '../utils/currencyFormat';
import { formatDateForStorage } from '../utils/dateFormat';
import { getFileNameFromPath } from '../utils/fileName';

const escapeHtml = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const formatGeneratedDate = () => {
  const d = new Date();
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

const tw = (i18n, key) => i18n.t(key, { ns: 'workflow' });
const tr = (i18n, key) => i18n.t(key, { ns: 'reports' });
const tc = (i18n, key) => i18n.t(key, { ns: 'correspondence' });
const tCommon = (i18n) => i18n.t('dash', { ns: 'common' });

const displayText = (value, i18n) => {
  if (value == null || value === '') return tCommon(i18n);
  return String(value);
};

const displayMoney = (value, i18n) => {
  if (value == null || value === '') return tCommon(i18n);
  const n = Number(value);
  if (!Number.isFinite(n)) return displayText(value, i18n);
  return formatRupeesFull(n);
};

const displayDate = (value, i18n) => displayText(formatDateForStorage(value) || value, i18n);

const displayBool = (value, i18n, onKey, offKey) =>
  tw(i18n, value ? onKey : offKey);

const fieldRowsHtml = (rows) =>
  rows
    .map(
      ([label, value]) =>
        `<tr><td>${escapeHtml(label)}</td><td>${escapeHtml(value)}</td></tr>`,
    )
    .join('');

const sectionHtml = (title, rows) => {
  if (!rows.length) return '';
  return `
    <section class="step-section">
      <h3>${escapeHtml(title)}</h3>
      <table class="field-table">${fieldRowsHtml(rows)}</table>
    </section>`;
};

const documentLabelForType = (i18n, type) => {
  if (type.startsWith('payment_receipt_')) {
    return tw(i18n, 'steps.paymentStatus.uploads.paymentTitle');
  }
  const workflowMap = {
    pmc_letter: 'steps.pmcApproval.uploads.pmcLetterTitle',
    estimation: 'steps.estimation.uploads.title',
    tender_advertisement: 'steps.tenderCreation.uploads.newspaperTitle',
    tender_notice: 'steps.tenderCreation.uploads.newspaperTitle',
    contractor: 'steps.contractorAssignment.uploads.contractorTitle',
    sanction_letter: 'steps.sanctionApproval.uploads.sanctionLetterTitle',
    work_order: 'steps.workOrder.uploads.workOrderTitle',
    bill: 'steps.billSubmission.uploads.billTitle',
  };
  if (type === 'completion_certificate') {
    return tr(i18n, 'export.completion.certificate');
  }
  const key = workflowMap[type];
  return key ? tw(i18n, key) : type;
};

const tCommonField = (i18n, key) => i18n.t(key, { ns: 'common' });

const imagesHtml = (imagePaths, imageCache, i18n) => {
  if (!imagePaths?.length) return '';

  const items = imagePaths
    .map((path) => {
      const dataUri = imageCache.get(path);
      if (!dataUri) return '';
      const name = getFileNameFromPath(path);
      return `<div class="thumb-wrap">
        <img src="${dataUri}" alt="${escapeHtml(name)}" class="thumb" />
        <div class="thumb-caption">${escapeHtml(name)}</div>
      </div>`;
    })
    .filter(Boolean)
    .join('');

  if (!items) return '';

  return `
    <section class="step-section">
      <h3>${escapeHtml(tr(i18n, 'export.imagesSection'))}</h3>
      <div class="thumb-grid">${items}</div>
    </section>`;
};

const attachmentsHtml = (documentRefs, i18n) => {
  if (!documentRefs?.length) return '';

  const rows = documentRefs.map((doc) => {
    const label = documentLabelForType(i18n, doc.type);
    const fileName = doc.fileName || tCommon(i18n);
    const suffix = doc.exists ? '' : ` ${tr(i18n, 'export.fileNotFound')}`;
    return [label, `${fileName}${suffix}`];
  });

  return sectionHtml(tr(i18n, 'export.attachmentsSection'), rows);
};

const buildWorkDetailsSection = (work, i18n) =>
  sectionHtml(tw(i18n, 'steps.workDetails.title'), [
    [tw(i18n, 'steps.workDetails.fields.budgetCode.label'), displayText(work.work_code, i18n)],
    [tw(i18n, 'steps.workDetails.fields.workName.label'), displayText(work.work_name, i18n)],
    [tw(i18n, 'steps.workDetails.fields.financialYear.label'), displayText(work.financial_year, i18n)],
    [tw(i18n, 'steps.workDetails.fields.ward.label'), displayText(work.ward, i18n)],
    [tw(i18n, 'steps.workDetails.fields.department.label'), displayText(work.department, i18n)],
    [tw(i18n, 'steps.workDetails.fields.subDepartment.label'), displayText(work.sub_department, i18n)],
    [tw(i18n, 'steps.workDetails.fields.officer.label'), displayText(work.officer, i18n)],
    [tw(i18n, 'steps.workDetails.fields.officerMobile.label'), displayText(work.officer_mobile, i18n)],
    [tw(i18n, 'steps.workDetails.fields.budget.label'), displayMoney(work.budget, i18n)],
  ]);

const buildPmcSection = (approval, i18n) => {
  if (!approval) return '';
  return sectionHtml(tw(i18n, 'steps.pmcApproval.title'), [
    [tw(i18n, 'steps.pmcApproval.fields.letterNumber.label'), displayText(approval.letter_number, i18n)],
    [tw(i18n, 'steps.pmcApproval.fields.letterDate.label'), displayDate(approval.letter_date, i18n)],
    [
      tw(i18n, 'steps.pmcApproval.fields.financeCommittee.label'),
      displayBool(
        approval.finance_required,
        i18n,
        'steps.pmcApproval.toggles.financeOn',
        'steps.pmcApproval.toggles.financeOff',
      ),
    ],
    [tw(i18n, 'steps.pmcApproval.fields.approvalDate.label'), displayDate(approval.approval_date, i18n)],
    [
      tw(i18n, 'steps.pmcApproval.fields.financeApprovalStatus.label'),
      displayText(approval.finance_status, i18n),
    ],
  ]);
};

const buildEstimationSection = (estimation, i18n) => {
  if (!estimation) return '';
  return sectionHtml(tw(i18n, 'steps.estimation.title'), [
    [
      tw(i18n, 'steps.estimation.toggles.label'),
      displayBool(
        estimation.estimate_done,
        i18n,
        'steps.estimation.toggles.on',
        'steps.estimation.toggles.off',
      ),
    ],
    [tw(i18n, 'steps.estimation.fields.estimationDate.label'), displayDate(estimation.estimation_date, i18n)],
    [tw(i18n, 'steps.estimation.fields.estimatedCost.label'), displayMoney(estimation.estimated_cost, i18n)],
    [tw(i18n, 'steps.estimation.fields.natureOfWorks.label'), displayText(estimation.notes, i18n)],
  ]);
};

const buildTenderSection = (tender, i18n) => {
  if (!tender) return '';
  return sectionHtml(tw(i18n, 'steps.tenderCreation.title'), [
    [tw(i18n, 'steps.tenderCreation.fields.tenderName.label'), displayText(tender.tender_name, i18n)],
    [tw(i18n, 'steps.tenderCreation.fields.tenderNumber.label'), displayText(tender.tender_number, i18n)],
    [tw(i18n, 'steps.tenderCreation.fields.advertisementDate.label'), displayDate(tender.tender_date, i18n)],
    [tw(i18n, 'steps.tenderCreation.fields.tenderAmount.label'), displayMoney(tender.tender_amount, i18n)],
    [
      tr(i18n, 'export.tender.aPacket'),
      displayBool(tender.a_packet_open, i18n, 'steps.tenderCreation.toggles.aPacketOn', 'steps.tenderCreation.toggles.aPacketOff'),
    ],
    [
      tr(i18n, 'export.tender.bPacket'),
      displayBool(tender.b_packet_open, i18n, 'steps.tenderCreation.toggles.bPacketOn', 'steps.tenderCreation.toggles.bPacketOff'),
    ],
    [tw(i18n, 'steps.tenderCreation.sectionTenderStatus'), displayText(tender.status, i18n)],
  ]);
};

const buildReTenderSection = (retender, i18n) => {
  if (!retender) return '';
  return sectionHtml(tw(i18n, 'steps.reTender.title'), [
    [
      tw(i18n, 'steps.reTender.toggles.on'),
      displayBool(retender.enable_retender, i18n, 'steps.reTender.toggles.on', 'steps.reTender.toggles.off'),
    ],
    [tw(i18n, 'steps.reTender.fields.previousRef.label'), displayText(retender.previous_tender_reference, i18n)],
    [tw(i18n, 'steps.reTender.fields.newDate.label'), displayDate(retender.new_tender_date, i18n)],
    [tw(i18n, 'steps.reTender.fields.newAmount.label'), displayMoney(retender.new_tender_amount, i18n)],
    [tw(i18n, 'steps.reTender.fields.reason.label'), displayText(retender.retender_reason, i18n)],
  ]);
};

const buildContractorSection = (contractor, i18n) => {
  if (!contractor) return '';
  return sectionHtml(tw(i18n, 'steps.contractorAssignment.title'), [
    [tw(i18n, 'steps.contractorAssignment.fields.contractorName.label'), displayText(contractor.contractor_name, i18n)],
    [tw(i18n, 'steps.contractorAssignment.fields.contactMobile.label'), displayText(contractor.contractor_contact, i18n)],
    [tw(i18n, 'steps.contractorAssignment.fields.percentRow'), displayText(contractor.percentage_above_below, i18n)],
    [
      tr(i18n, 'export.contractor.variation'),
      contractor.percentage_variation != null ? String(contractor.percentage_variation) : tCommon(i18n),
    ],
    [
      tw(i18n, 'steps.contractorAssignment.fields.finalTenderAmount.label'),
      displayMoney(contractor.final_tender_amount, i18n),
    ],
  ]);
};

const buildSanctionSection = (sanction, i18n) => {
  if (!sanction) return '';
  return sectionHtml(tw(i18n, 'steps.sanctionApproval.title'), [
    [tw(i18n, 'steps.sanctionApproval.fields.docketNumber.label'), displayText(sanction.docket_number, i18n)],
    [tw(i18n, 'steps.sanctionApproval.fields.sanctionDate.label'), displayDate(sanction.sanction_date, i18n)],
    [tw(i18n, 'steps.sanctionApproval.fields.sanctionAmount.label'), displayMoney(sanction.sanction_amount, i18n)],
    [tw(i18n, 'steps.sanctionApproval.fields.sanctionAuthority.label'), displayText(sanction.sanction_authority, i18n)],
  ]);
};

const buildWorkOrderSection = (workOrder, i18n) => {
  if (!workOrder) return '';
  return sectionHtml(tw(i18n, 'steps.workOrder.title'), [
    [tw(i18n, 'steps.workOrder.fields.orderNumber.label'), displayText(workOrder.work_order_number, i18n)],
    [tw(i18n, 'steps.workOrder.fields.startDate.label'), displayDate(workOrder.work_start_date, i18n)],
    [
      tw(i18n, 'steps.workOrder.fields.expectedCompletion.label'),
      displayDate(workOrder.expected_completion_date, i18n),
    ],
    [tw(i18n, 'steps.workOrder.fields.notes.label'), displayText(workOrder.notes, i18n)],
  ]);
};

const buildWorkProgressSection = (workProgress, i18n) => {
  if (!workProgress) return '';
  return sectionHtml(tw(i18n, 'steps.workProgress.title'), [
    [
      tw(i18n, 'steps.workProgress.toggles.label'),
      displayBool(
        workProgress.work_completion,
        i18n,
        'steps.workProgress.toggles.on',
        'steps.workProgress.toggles.off',
      ),
    ],
    [tw(i18n, 'site.notes'), displayText(workProgress.site_notes, i18n)],
  ]);
};

const buildPaymentSection = (paymentSummary, paymentInstallments, i18n) => {
  const summaryRows = [
    [tw(i18n, 'payment.totalBillAmount'), displayMoney(paymentSummary.totalBill, i18n)],
    [tw(i18n, 'payment.amountPaid'), displayMoney(paymentSummary.amountPaid, i18n)],
    [tw(i18n, 'payment.pending'), displayMoney(paymentSummary.pending, i18n)],
  ];

  let historyHtml = '';
  if (paymentInstallments?.length) {
    const header = `
      <tr>
        <th>${escapeHtml(tr(i18n, 'export.payment.date'))}</th>
        <th>${escapeHtml(tr(i18n, 'export.payment.amount'))}</th>
        <th>${escapeHtml(tr(i18n, 'export.payment.receipt'))}</th>
      </tr>`;
    const body = paymentInstallments
      .map((row) => {
        const receipt = row.payment_receipt_path
          ? getFileNameFromPath(row.payment_receipt_path)
          : tCommon(i18n);
        return `<tr>
          <td>${escapeHtml(displayDate(row.payment_date, i18n))}</td>
          <td>${escapeHtml(displayMoney(row.amount_paid, i18n))}</td>
          <td>${escapeHtml(receipt)}</td>
        </tr>`;
      })
      .join('');
    historyHtml = `
      <h4 class="subheading">${escapeHtml(tw(i18n, 'payment.historyHeading'))}</h4>
      <table class="history-table">${header}${body}</table>`;
  }

  return `
    <section class="step-section">
      <h3>${escapeHtml(tw(i18n, 'steps.paymentStatus.title'))}</h3>
      <table class="field-table">${fieldRowsHtml(summaryRows)}</table>
      ${historyHtml}
    </section>`;
};

const buildBillSection = (billSubmission, i18n) => {
  if (!billSubmission) return '';
  return sectionHtml(tw(i18n, 'steps.billSubmission.title'), [
    [
      tw(i18n, 'steps.billSubmission.toggles.label'),
      displayBool(
        billSubmission.bill_submitted,
        i18n,
        'steps.billSubmission.toggles.on',
        'steps.billSubmission.toggles.off',
      ),
    ],
    [tw(i18n, 'steps.billSubmission.fields.billNumber.label'), displayText(billSubmission.bill_number, i18n)],
    [tw(i18n, 'steps.billSubmission.fields.billDate.label'), displayDate(billSubmission.bill_date, i18n)],
  ]);
};

const buildCompletionSection = (completion, i18n) => {
  if (!completion) return '';
  return sectionHtml(tr(i18n, 'export.completion.sectionTitle'), [
    [tr(i18n, 'export.completion.status'), displayText(completion.work_completed, i18n)],
  ]);
};

const buildWorkBlockHtml = (workPayload, index, imageCache, i18n) => {
  const { work } = workPayload;
  const workTitle = displayText(work.work_name, i18n);

  return `
    <section class="work-block">
      <h2>${escapeHtml(tr(i18n, 'export.workSectionTitle'))} ${index + 1}: ${escapeHtml(workTitle)}</h2>
      <div class="work-divider"></div>
      ${buildWorkDetailsSection(work, i18n)}
      ${buildPmcSection(workPayload.approval, i18n)}
      ${buildEstimationSection(workPayload.estimation, i18n)}
      ${buildTenderSection(workPayload.tender, i18n)}
      ${buildReTenderSection(workPayload.retender, i18n)}
      ${buildContractorSection(workPayload.contractor, i18n)}
      ${buildSanctionSection(workPayload.sanction, i18n)}
      ${buildWorkOrderSection(workPayload.workOrder, i18n)}
      ${buildWorkProgressSection(workPayload.workProgress, i18n)}
      ${buildPaymentSection(workPayload.paymentSummary, workPayload.paymentInstallments, i18n)}
      ${buildBillSection(workPayload.billSubmission, i18n)}
      ${buildCompletionSection(workPayload.completion, i18n)}
      ${imagesHtml(workPayload.imagePaths, imageCache, i18n)}
      ${attachmentsHtml(workPayload.documentRefs, i18n)}
    </section>`;
};

const buildCorrespondenceSection = (entries, i18n) => {
  if (!entries?.length) return '';

  const blocks = entries
    .map((entry) => {
      const docName = entry.document_path
        ? getFileNameFromPath(entry.document_path)
        : tCommon(i18n);
      return `
        <div class="correspondence-item">
          <table class="field-table">
            ${fieldRowsHtml([
              [tCommonField(i18n, 'subject'), displayText(entry.subject, i18n)],
              [tCommonField(i18n, 'date'), displayDate(entry.date, i18n)],
              [tc(i18n, 'documentLabel'), displayText(docName, i18n)],
            ])}
          </table>
        </div>`;
    })
    .join('');

  return `
    <section class="correspondence-section">
      <h2>${escapeHtml(tr(i18n, 'export.correspondenceSection'))}</h2>
      ${blocks}
    </section>`;
};

export const buildDetailedReportHtml = (report, i18n, imageCache) => {
  const workSections = report.works
    .map((workPayload, index) => buildWorkBlockHtml(workPayload, index, imageCache, i18n))
    .join('');

  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        color: #111827;
        margin: 32px;
        line-height: 1.45;
        font-size: 13px;
      }
      h1 {
        font-size: 22px;
        margin: 0 0 12px;
        color: #062E52;
      }
      h2 {
        font-size: 17px;
        margin: 28px 0 8px;
        color: #062E52;
        page-break-before: always;
      }
      h2:first-of-type { page-break-before: auto; }
      h3 {
        font-size: 14px;
        margin: 16px 0 8px;
        color: #1F2937;
        border-bottom: 1px solid #E5E7EB;
        padding-bottom: 4px;
      }
      h4.subheading {
        font-size: 13px;
        margin: 12px 0 6px;
        color: #374151;
      }
      .cover-meta {
        font-size: 13px;
        color: #4B5563;
        margin-bottom: 6px;
      }
      .work-divider {
        border-top: 2px solid #062E52;
        margin-bottom: 12px;
      }
      .work-block {
        margin-bottom: 32px;
        page-break-inside: avoid;
      }
      .step-section {
        margin-bottom: 14px;
      }
      .field-table, .history-table {
        width: 100%;
        border-collapse: collapse;
      }
      .field-table td, .history-table td, .history-table th {
        padding: 6px 0;
        vertical-align: top;
        border-bottom: 1px solid #E5E7EB;
      }
      .field-table td:first-child {
        width: 42%;
        color: #6B7280;
        font-weight: 600;
        padding-right: 12px;
      }
      .field-table td:last-child {
        color: #111827;
        font-weight: 500;
      }
      .history-table th {
        text-align: left;
        font-size: 12px;
        color: #6B7280;
        font-weight: 600;
      }
      .thumb-grid {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        margin-top: 8px;
      }
      .thumb-wrap {
        width: 140px;
        text-align: center;
      }
      .thumb {
        width: 140px;
        height: 105px;
        object-fit: cover;
        border: 1px solid #D1D5DB;
        border-radius: 4px;
      }
      .thumb-caption {
        font-size: 10px;
        color: #6B7280;
        margin-top: 4px;
        word-break: break-all;
      }
      .correspondence-section {
        margin-top: 36px;
        page-break-before: always;
      }
      .correspondence-item {
        margin-bottom: 16px;
        padding-bottom: 8px;
        border-bottom: 1px dashed #E5E7EB;
      }
    </style>
  </head>
  <body>
    <h1>${escapeHtml(tr(i18n, 'export.detailedReportTitle'))}</h1>
    <div class="cover-meta">${escapeHtml(tr(i18n, 'export.financialYearLabel'))}: FY ${escapeHtml(report.financialYear)}</div>
    <div class="cover-meta">${escapeHtml(tr(i18n, 'export.generatedOnLabel'))}: ${escapeHtml(formatGeneratedDate())}</div>
    <div class="cover-meta">${escapeHtml(tr(i18n, 'export.totalWorkCount'))}: ${escapeHtml(String(report.workCount))}</div>
    ${workSections}
    ${buildCorrespondenceSection(report.generalCorrespondence, i18n)}
  </body>
</html>`;
};
