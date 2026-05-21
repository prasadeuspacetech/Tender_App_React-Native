// Document type keys — aligned with SQLite columns + documents.type registry (Technical Guide §6, §11)

export const DOCUMENT_TYPES = {
  PMC_LETTER: 'pmc_letter',
  ESTIMATION_FILE: 'estimation_file',
  TENDER_ADVERTISEMENT: 'tender_advertisement',
  TENDER_NOTICE: 'tender_notice',
  CONTRACTOR_DETAILS: 'contractor_details',
  SANCTION_LETTER: 'sanction_letter',
  PAYMENT_RECEIPT: 'payment_receipt',
  COMPLETION_CERTIFICATE: 'completion_certificate',
  SITE_PHOTOS: 'site_photos',
};

/** Default basename (without extension) when storing under app_documents/work_{id}/ */
export const DOCUMENT_DEFAULT_BASENAMES = {
  [DOCUMENT_TYPES.PMC_LETTER]: 'pmc_letter',
  [DOCUMENT_TYPES.ESTIMATION_FILE]: 'estimation_file',
  [DOCUMENT_TYPES.TENDER_ADVERTISEMENT]: 'newspaper_advertisement',
  [DOCUMENT_TYPES.TENDER_NOTICE]: 'tender_notice',
  [DOCUMENT_TYPES.CONTRACTOR_DETAILS]: 'contractor_details',
  [DOCUMENT_TYPES.SANCTION_LETTER]: 'sanction_letter',
  [DOCUMENT_TYPES.PAYMENT_RECEIPT]: 'payment_receipt',
  [DOCUMENT_TYPES.COMPLETION_CERTIFICATE]: 'completion_certificate',
  [DOCUMENT_TYPES.SITE_PHOTOS]: 'site_photos',
};
