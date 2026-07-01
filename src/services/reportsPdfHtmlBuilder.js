import { getStatusLabel } from '../i18n/statusLabels';
import { formatRupeesCompact, formatRupeesFull } from '../utils/currencyFormat';
import { formatDateForStorage } from '../utils/dateFormat';
import { getFileNameFromPath } from '../utils/fileName';

const escapeHtml = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const formatGeneratedTimestamp = () => {
  const d = new Date();
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${year}, ${hours}:${minutes}`;
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

const displayBoolPdf = (value, i18n, onKey, offKey) =>
  tr(i18n, coercePdfBool(value) ? onKey : offKey);

const displayEstimateDirection = (value, i18n) => {
  if (value == null || value === '') return tCommon(i18n);
  const key = String(value).trim().toLowerCase();
  if (key === 'above' || key === 'वर') return tr(i18n, 'export.pdfLabels.above');
  if (key === 'below' || key === 'खाली') return tr(i18n, 'export.pdfLabels.below');
  return String(value);
};

const coercePdfBool = (value) => {
  if (value === true || value === 1) return true;
  if (value === false || value === 0 || value == null) return false;
  const normalized = String(value).trim().toLowerCase();
  if (normalized === '1' || normalized === 'true' || normalized === 'yes') return true;
  if (normalized === '0' || normalized === 'false' || normalized === 'no') return false;
  return Boolean(value);
};

const fieldRowsHtml = (rows) =>
  rows
    .map(
      ([label, value]) =>
        `<tr><td>${escapeHtml(label)}</td><td>${escapeHtml(value)}</td></tr>`,
    )
    .join('');

const sectionHtml = (title, rows, { className = 'step-section' } = {}) => {
  if (!rows.length) return '';
  return `
    <section class="${className}">
      <h3>${escapeHtml(title)}</h3>
      <table class="field-table">${fieldRowsHtml(rows)}</table>
    </section>`;
};

const groupSectionHtml = (title, rows) => sectionHtml(title, rows, { className: 'group-section' });

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

const statusBadgeHtml = (statusKey, i18n) => {
  const label = getStatusLabel(statusKey);
  return `<span class="status-badge status-${escapeHtml(statusKey)}">${escapeHtml(label)}</span>`;
};

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
    <section class="group-section">
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

  return groupSectionHtml(tr(i18n, 'export.attachmentsSection'), rows);
};

const buildIdentitySection = (work, i18n) =>
  groupSectionHtml(tr(i18n, 'export.groups.identity'), [
    [tw(i18n, 'steps.workDetails.fields.budgetCode.label'), displayText(work.work_code, i18n)],
    [tr(i18n, 'export.pdfLabels.workName'), displayText(work.work_name, i18n)],
    [tw(i18n, 'steps.workDetails.fields.ward.label'), displayText(work.ward, i18n)],
    [tw(i18n, 'steps.workDetails.fields.department.label'), displayText(work.department, i18n)],
    [tw(i18n, 'steps.workDetails.fields.subDepartment.label'), displayText(work.sub_department, i18n)],
    [tw(i18n, 'steps.workDetails.fields.officer.label'), displayText(work.officer, i18n)],
    [tw(i18n, 'steps.workDetails.fields.officerMobile.label'), displayText(work.officer_mobile, i18n)],
  ]);

const buildFinancialSummarySection = (payload, i18n) => {
  const { work, estimation, tender, retender, contractor, sanction, paymentSummary, effectiveBudget } =
    payload;

  const rows = [
    [tr(i18n, 'export.pdfLabels.budgetAmount'), displayMoney(work.budget, i18n)],
    [tr(i18n, 'export.fields.estimationCost'), displayMoney(estimation?.estimated_cost, i18n)],
    [tw(i18n, 'steps.tenderCreation.fields.tenderAmount.label'), displayMoney(tender?.tender_amount, i18n)],
  ];

  if (retender?.enable_retender) {
    rows.push([
      tw(i18n, 'steps.reTender.fields.newAmount.label'),
      displayMoney(retender.new_tender_amount, i18n),
    ]);
  }

  rows.push(
    [tr(i18n, 'export.fields.finalTenderAmount'), displayMoney(contractor?.final_tender_amount, i18n)],
    [tr(i18n, 'export.fields.effectiveBudget'), displayMoney(effectiveBudget, i18n)],
    [tr(i18n, 'export.fields.sanctionAmount'), displayMoney(sanction?.sanction_amount, i18n)],
    [tr(i18n, 'export.fields.totalAmountPaid'), displayMoney(paymentSummary?.amountPaid, i18n)],
    [tr(i18n, 'export.fields.pendingAmount'), displayMoney(paymentSummary?.pending, i18n)],
  );

  return groupSectionHtml(tr(i18n, 'export.groups.financial'), rows);
};

const buildTimelineSection = (payload, i18n) => {
  const { approval, estimation, tender, retender, sanction, workOrder, billSubmission } = payload;

  const rows = [
    [tw(i18n, 'steps.pmcApproval.fields.approvalDate.label'), displayDate(approval?.approval_date, i18n)],
    [tw(i18n, 'steps.estimation.fields.estimationDate.label'), displayDate(estimation?.estimation_date, i18n)],
    [tw(i18n, 'steps.tenderCreation.fields.advertisementDate.label'), displayDate(tender?.tender_date, i18n)],
    [tw(i18n, 'steps.reTender.fields.newDate.label'), displayDate(retender?.new_tender_date, i18n)],
    [tw(i18n, 'steps.sanctionApproval.fields.sanctionDate.label'), displayDate(sanction?.sanction_date, i18n)],
    [tw(i18n, 'steps.workOrder.fields.startDate.label'), displayDate(workOrder?.work_start_date, i18n)],
    [
      tw(i18n, 'steps.workOrder.fields.expectedCompletion.label'),
      displayDate(workOrder?.expected_completion_date, i18n),
    ],
    [tw(i18n, 'steps.billSubmission.fields.billDate.label'), displayDate(billSubmission?.bill_date, i18n)],
  ].filter(([, value]) => value && value !== tCommon(i18n));

  return rows.length ? groupSectionHtml(tr(i18n, 'export.groups.timeline'), rows) : '';
};

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
      tr(i18n, 'export.pdfLabels.estimationComplete'),
      displayBoolPdf(
        estimation.estimate_done,
        i18n,
        'export.pdfLabels.estimationCompleteYes',
        'export.pdfLabels.estimationCompleteNo',
      ),
    ],
    [tw(i18n, 'steps.estimation.fields.natureOfWorks.label'), displayText(estimation.notes, i18n)],
  ]);
};

const buildTenderSection = (tender, i18n) => {
  if (!tender) return '';
  return sectionHtml(tw(i18n, 'steps.tenderCreation.title'), [
    [tw(i18n, 'steps.tenderCreation.fields.tenderName.label'), displayText(tender.tender_name, i18n)],
    [tw(i18n, 'steps.tenderCreation.fields.tenderNumber.label'), displayText(tender.tender_number, i18n)],
    [
      tr(i18n, 'export.pdfLabels.aPacketOpen'),
      displayBoolPdf(tender.a_packet_open, i18n, 'export.pdfLabels.yes', 'export.pdfLabels.no'),
    ],
    [
      tr(i18n, 'export.pdfLabels.bPacketOpen'),
      displayBoolPdf(tender.b_packet_open, i18n, 'export.pdfLabels.yes', 'export.pdfLabels.no'),
    ],
    [tw(i18n, 'steps.tenderCreation.sectionTenderStatus'), displayText(tender.status, i18n)],
  ]);
};

const buildReTenderSection = (retender, i18n) => {
  if (!retender) return '';
  return sectionHtml(tw(i18n, 'steps.reTender.title'), [
    [
      tr(i18n, 'export.pdfLabels.retenderRequired'),
      displayBoolPdf(retender.enable_retender, i18n, 'export.pdfLabels.yes', 'export.pdfLabels.no'),
    ],
    [tw(i18n, 'steps.reTender.fields.previousRef.label'), displayText(retender.previous_tender_reference, i18n)],
    [tw(i18n, 'steps.reTender.fields.reason.label'), displayText(retender.retender_reason, i18n)],
  ]);
};

const buildContractorSection = (contractor, i18n) => {
  if (!contractor) return '';
  return sectionHtml(tw(i18n, 'steps.contractorAssignment.title'), [
    [tw(i18n, 'steps.contractorAssignment.fields.contractorName.label'), displayText(contractor.contractor_name, i18n)],
    [tw(i18n, 'steps.contractorAssignment.fields.contactMobile.label'), displayText(contractor.contractor_contact, i18n)],
    [
      tr(i18n, 'export.pdfLabels.tenderAmountComparison'),
      displayEstimateDirection(contractor.percentage_above_below, i18n),
    ],
    [
      tr(i18n, 'export.contractor.variation'),
      contractor.percentage_variation != null
        ? String(contractor.percentage_variation)
        : tCommon(i18n),
    ],
  ]);
};

const buildSanctionSection = (sanction, i18n) => {
  if (!sanction) return '';
  return sectionHtml(tw(i18n, 'steps.sanctionApproval.title'), [
    [tw(i18n, 'steps.sanctionApproval.fields.docketNumber.label'), displayText(sanction.docket_number, i18n)],
    [tw(i18n, 'steps.sanctionApproval.fields.sanctionAuthority.label'), displayText(sanction.sanction_authority, i18n)],
  ]);
};

const buildWorkOrderSection = (workOrder, i18n) => {
  if (!workOrder) return '';
  return sectionHtml(tw(i18n, 'steps.workOrder.title'), [
    [tw(i18n, 'steps.workOrder.fields.orderNumber.label'), displayText(workOrder.work_order_number, i18n)],
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

  if (!historyHtml) return '';

  return `
    <section class="step-section">
      <h3>${escapeHtml(tw(i18n, 'steps.paymentStatus.title'))}</h3>
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
  ]);
};

const buildCompletionSection = (completion, i18n) => {
  if (!completion) return '';
  return sectionHtml(tr(i18n, 'export.completion.sectionTitle'), [
    [tr(i18n, 'export.completion.status'), displayText(completion.work_completed, i18n)],
  ]);
};

const buildWorkflowDetailsSection = (payload, i18n) => {
  const blocks = [
    buildPmcSection(payload.approval, i18n),
    buildEstimationSection(payload.estimation, i18n),
    buildTenderSection(payload.tender, i18n),
    buildReTenderSection(payload.retender, i18n),
    buildContractorSection(payload.contractor, i18n),
    buildSanctionSection(payload.sanction, i18n),
    buildWorkOrderSection(payload.workOrder, i18n),
    buildWorkProgressSection(payload.workProgress, i18n),
    buildPaymentSection(payload.paymentSummary, payload.paymentInstallments, i18n),
    buildBillSection(payload.billSubmission, i18n),
    buildCompletionSection(payload.completion, i18n),
  ].filter(Boolean);

  if (!blocks.length) return '';

  return `
    <section class="group-section">
      <h3>${escapeHtml(tr(i18n, 'export.groups.workflow'))}</h3>
      ${blocks.join('')}
    </section>`;
};

const buildWorkDetailHtml = (workPayload, index, indexRow, imageCache, i18n) => {
  const { work } = workPayload;
  const workTitle = displayText(work.work_name, i18n);
  const statusBadge = statusBadgeHtml(indexRow.statusKey, i18n);

  return `
    <section class="work-block detail-block">
      <div class="work-block-header">
        <h2>${escapeHtml(tr(i18n, 'export.workSectionTitle'))} ${index + 1}: ${escapeHtml(workTitle)}</h2>
        <div class="work-block-meta">
          ${statusBadge}
          <span class="stage-pill">${escapeHtml(indexRow.stageLabel)}</span>
        </div>
      </div>
      <div class="work-divider"></div>
      ${buildIdentitySection(work, i18n)}
      ${buildFinancialSummarySection(workPayload, i18n)}
      ${buildTimelineSection(workPayload, i18n)}
      ${buildWorkflowDetailsSection(workPayload, i18n)}
    </section>`;
};

const buildSummaryHtml = (report, i18n) => {
  const { summary, financialYear, workCount } = report;
  const budget = summary?.budgetSummary ?? {};

  return `
    <section class="summary-section">
      <h1>${escapeHtml(tr(i18n, 'export.hybridReportTitle'))}</h1>
      <p class="cover-meta">${escapeHtml(tr(i18n, 'export.financialYearLabel'))}: FY ${escapeHtml(financialYear)}</p>
      <p class="cover-meta">${escapeHtml(tr(i18n, 'export.generatedOnLabel'))}: ${escapeHtml(formatGeneratedTimestamp())}</p>

      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-value">${escapeHtml(String(workCount))}</div>
          <div class="kpi-label">${escapeHtml(tr(i18n, 'stats.totalWorks'))}</div>
        </div>
        <div class="kpi-card kpi-completed">
          <div class="kpi-value">${escapeHtml(String(summary.completed))}</div>
          <div class="kpi-label">${escapeHtml(tr(i18n, 'stats.completed'))}</div>
        </div>
        <div class="kpi-card kpi-progress">
          <div class="kpi-value">${escapeHtml(String(summary.inProgress))}</div>
          <div class="kpi-label">${escapeHtml(tr(i18n, 'stats.inProgress'))}</div>
        </div>
        <div class="kpi-card kpi-pending">
          <div class="kpi-value">${escapeHtml(String(summary.pending))}</div>
          <div class="kpi-label">${escapeHtml(tr(i18n, 'stats.pending'))}</div>
        </div>
      </div>

      <div class="budget-summary">
        <h3>${escapeHtml(tr(i18n, 'export.budgetOverview'))}</h3>
        <table class="field-table">
          ${fieldRowsHtml([
            [tr(i18n, 'budget.totalBudget'), displayMoney(budget.totalBudget, i18n)],
            [tr(i18n, 'budget.totalUsed'), displayMoney(budget.budgetUsed, i18n)],
            [tr(i18n, 'export.budgetRemaining'), displayMoney(budget.remaining, i18n)],
            [tr(i18n, 'export.budgetUtilisation'), `${budget.percent ?? 0}%`],
          ])}
        </table>
        <p class="budget-compact">${escapeHtml(formatRupeesCompact(budget.budgetUsed ?? 0))} / ${escapeHtml(formatRupeesCompact(budget.totalBudget ?? 0))}</p>
      </div>
    </section>`;
};

const buildIndexTableHtml = (indexRows, i18n) => {
  if (!indexRows?.length) return '';

  const header = `
    <tr>
      <th class="col-num">#</th>
      <th class="col-name">${escapeHtml(tr(i18n, 'export.index.workName'))}</th>
      <th>${escapeHtml(tr(i18n, 'export.index.ward'))}</th>
      <th>${escapeHtml(tr(i18n, 'export.index.department'))}</th>
      <th class="col-money">${escapeHtml(tr(i18n, 'export.index.budget'))}</th>
      <th class="col-money">${escapeHtml(tr(i18n, 'export.index.paid'))}</th>
      <th class="col-status">${escapeHtml(tr(i18n, 'export.index.status'))}</th>
      <th class="col-stage">${escapeHtml(tr(i18n, 'export.index.stage'))}</th>
    </tr>`;

  const body = indexRows
    .map((row) => {
      const nameCell = `${escapeHtml(row.workName)}${
        row.workCode ? `<div class="index-sub">${escapeHtml(row.workCode)}</div>` : ''
      }`;
      return `<tr>
        <td class="col-num">${row.index}</td>
        <td class="col-name">${nameCell}</td>
        <td>${escapeHtml(displayText(row.ward, i18n))}</td>
        <td>${escapeHtml(displayText(row.department, i18n))}</td>
        <td class="col-money">${escapeHtml(formatRupeesCompact(row.effectiveBudget))}</td>
        <td class="col-money">${escapeHtml(formatRupeesCompact(row.amountPaid))}</td>
        <td class="col-status">${statusBadgeHtml(row.statusKey, i18n)}</td>
        <td class="col-stage">${escapeHtml(row.stageLabel)}</td>
      </tr>`;
    })
    .join('');

  return `
    <section class="index-section">
      <h2>${escapeHtml(tr(i18n, 'export.index.title'))}</h2>
      <table class="index-table">
        <thead>${header}</thead>
        <tbody>${body}</tbody>
      </table>
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
      <p class="cover-meta">${escapeHtml(tr(i18n, 'export.correspondenceFyNote'))}</p>
      ${blocks}
    </section>`;
};

const REPORT_STYLES = `
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    color: #111827;
    margin: 28px 24px;
    line-height: 1.45;
    font-size: 12px;
  }
  h1 {
    font-size: 22px;
    margin: 0 0 10px;
    color: #062E52;
  }
  h2 {
    font-size: 16px;
    margin: 24px 0 10px;
    color: #062E52;
    page-break-after: avoid;
  }
  h3 {
    font-size: 13px;
    margin: 14px 0 8px;
    color: #1F2937;
    border-bottom: 1px solid #E5E7EB;
    padding-bottom: 4px;
    page-break-after: avoid;
  }
  h4.subheading {
    font-size: 12px;
    margin: 10px 0 6px;
    color: #374151;
  }
  .cover-meta {
    font-size: 12px;
    color: #4B5563;
    margin: 0 0 4px;
  }
  .summary-section {
    margin-bottom: 20px;
    page-break-after: avoid;
  }
  .kpi-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin: 16px 0;
  }
  .kpi-card {
    flex: 1 1 22%;
    min-width: 110px;
    border: 1px solid #D1D5DB;
    border-radius: 8px;
    padding: 10px 8px;
    text-align: center;
    background: #F9FAFB;
  }
  .kpi-value {
    font-size: 20px;
    font-weight: 700;
    color: #062E52;
  }
  .kpi-label {
    font-size: 11px;
    color: #6B7280;
    margin-top: 4px;
  }
  .kpi-completed .kpi-value { color: #2F5E34; }
  .kpi-progress .kpi-value { color: #FF5D00; }
  .kpi-pending .kpi-value { color: #8B2513; }
  .budget-summary {
    margin-top: 12px;
    padding: 12px;
    border: 1px solid #E5E7EB;
    border-radius: 8px;
    background: #FFFFFF;
  }
  .budget-compact {
    margin: 8px 0 0;
    font-size: 11px;
    color: #6B7280;
  }
  .index-section {
    margin-bottom: 24px;
    page-break-inside: avoid;
  }
  .index-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 10px;
  }
  .index-table thead {
    display: table-header-group;
  }
  .index-table th {
    text-align: left;
    background: #062E52;
    color: #FFFFFF;
    padding: 7px 5px;
    font-weight: 600;
    font-size: 9px;
  }
  .index-table td {
    padding: 7px 5px;
    vertical-align: top;
    border-bottom: 1px solid #E5E7EB;
    word-wrap: break-word;
  }
  .index-table tbody tr:nth-child(even) {
    background: #F9FAFB;
  }
  .index-sub {
    font-size: 9px;
    color: #6B7280;
    margin-top: 2px;
  }
  .col-num { width: 24px; }
  .col-name { min-width: 90px; max-width: 120px; }
  .col-money { white-space: nowrap; }
  .col-status { width: 72px; }
  .col-stage { font-size: 9px; }
  .status-badge {
    display: inline-block;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 9px;
    font-weight: 600;
    white-space: nowrap;
  }
  .status-completed { background: #E8F5E9; color: #2F5E34; }
  .status-progress { background: #FFF3E0; color: #FF5D00; }
  .status-pending { background: #FBE9E7; color: #8B2513; }
  .stage-pill {
    display: inline-block;
    margin-left: 6px;
    padding: 2px 8px;
    border-radius: 999px;
    background: #EEF2FF;
    color: #062E52;
    font-size: 10px;
    font-weight: 500;
  }
  .work-block-header {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }
  .work-block-meta {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px;
  }
  .work-divider {
    border-top: 2px solid #062E52;
    margin: 8px 0 12px;
  }
  .detail-block {
    margin-bottom: 28px;
    page-break-before: always;
  }
  .detail-block:first-of-type {
    page-break-before: always;
  }
  .group-section, .step-section {
    margin-bottom: 12px;
    page-break-inside: avoid;
  }
  .field-table, .history-table {
    width: 100%;
    border-collapse: collapse;
  }
  .field-table td, .history-table td, .history-table th {
    padding: 5px 0;
    vertical-align: top;
    border-bottom: 1px solid #E5E7EB;
    word-wrap: break-word;
  }
  .field-table td:first-child {
    width: 40%;
    color: #6B7280;
    font-weight: 600;
    padding-right: 10px;
  }
  .field-table td:last-child {
    color: #111827;
    font-weight: 500;
  }
  .history-table th {
    text-align: left;
    font-size: 11px;
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
    page-break-inside: avoid;
  }
  .thumb {
    width: 140px;
    height: 105px;
    object-fit: cover;
    border: 1px solid #D1D5DB;
    border-radius: 4px;
  }
  .thumb-caption {
    font-size: 9px;
    color: #6B7280;
    margin-top: 4px;
    word-break: break-all;
  }
  .correspondence-section {
    margin-top: 28px;
    page-break-before: always;
  }
  .correspondence-item {
    margin-bottom: 14px;
    padding-bottom: 8px;
    border-bottom: 1px dashed #E5E7EB;
  }
`;

export const buildDetailedReportHtml = (report, i18n, imageCache) => {
  const detailSections = report.works
    .map((workPayload, index) =>
      buildWorkDetailHtml(
        workPayload,
        index,
        report.indexRows[index],
        imageCache,
        i18n,
      ),
    )
    .join('');

  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>${REPORT_STYLES}</style>
  </head>
  <body>
    ${buildSummaryHtml(report, i18n)}
    ${buildIndexTableHtml(report.indexRows, i18n)}
    <section class="detail-intro">
      <h2>${escapeHtml(tr(i18n, 'export.detailAppendixTitle'))}</h2>
    </section>
    ${detailSections}
    ${buildCorrespondenceSection(report.generalCorrespondence, i18n)}
  </body>
</html>`;
};

export default buildDetailedReportHtml;
