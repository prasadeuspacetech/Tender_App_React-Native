import { Directory, File, Paths } from 'expo-file-system';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

import { getFinancialYearDetailedReport } from '../db/repositories/workReportExportRepository';
import i18n from '../i18n';
import { buildDetailedReportHtml } from './reportsPdfHtmlBuilder';

const savePdfCopy = (sourceUri, financialYear) => {
  const reportsDir = new Directory(Paths.document, 'app_reports');
  if (!reportsDir.exists) {
    reportsDir.create({ intermediates: true });
  }

  const safeFy = String(financialYear).replace(/[^a-zA-Z0-9-]/g, '_');
  const fileName = `Work_Report_FY_${safeFy}_${Date.now()}.pdf`;
  const destination = new File(reportsDir, fileName);
  const source = new File(sourceUri);

  if (destination.exists) {
    destination.delete();
  }

  source.copy(destination);
  return destination.uri;
};

/**
 * Generate detailed FY work report PDF, save locally, and open share sheet when available.
 * Labels follow the current i18n language at export time.
 * @returns {Promise<{ noData: true } | { noData: false, filePath: string, shared: boolean }>}
 */
export const exportFinancialYearReportPdf = async ({
  financialYear,
  works,
  labels = {},
}) => {
  const report = getFinancialYearDetailedReport(financialYear, works, i18n);
  if (!report.workCount) {
    return { noData: true };
  }

  const html = buildDetailedReportHtml(report, i18n);
  const { uri } = await Print.printToFileAsync({ html });
  const filePath = savePdfCopy(uri, financialYear);

  let shared = false;
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(filePath, {
      mimeType: 'application/pdf',
      dialogTitle: labels.shareTitle ?? i18n.t('export.shareTitle', { ns: 'reports' }),
      UTI: 'com.adobe.pdf',
    });
    shared = true;
  }

  return { noData: false, filePath, shared };
};
