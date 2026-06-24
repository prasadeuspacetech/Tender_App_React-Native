/**
 * Unified document upload UI — single source of truth for all workflow screens.
 *
 * layout="stack"  → each document: [label] then [upload box] OR [uploaded file row]
 * layout="grid"   → all labels stacked, then upload boxes / uploaded rows in one row
 */

import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import { useTranslation } from 'react-i18next';
import FormFieldLabel from './help/FormFieldLabel';
import DocumentFileIcon from './DocumentFileIcon';
import useAttachmentPreview from '../hooks/useAttachmentPreview';
import theme from '../theme';
import {
  formFieldStyles,
  FORM_FIELD_FONT_SIZE,
  FORM_FIELD_TEXT_COLOR,
  FORM_FIELD_TEXT_LINE_HEIGHT,
} from '../theme/formFieldStyles';

const SECTION = {
  marginTop: 4,
  marginBottom: 10,
  fontSize: 15,
  lineHeight: FORM_FIELD_TEXT_LINE_HEIGHT,
  fontWeight: '400',
  color: '#000000',
};

const DOCUMENT_FIELD_GAP = 9;
const DOCUMENT_FIELD_MARGIN_BOTTOM = 6;

const UPLOAD_BOX = {
  fill: '#EEECEC',
  borderColor: '#666565',
  borderWidth: 2,
  borderRadius: 5,
  minHeight: 71,
  horizontalInset: 10,
  iconSize: 18,
  labelSize: 15,
  labelLineHeight: FORM_FIELD_TEXT_LINE_HEIGHT,
  labelColor: 'rgba(0, 0, 0, 0.8)',
  gridGap: 12,
  shadow: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 2,
  },
};

const PRIMARY = theme.Colors?.primary ?? '#062E52';
const SUCCESS = theme.Colors?.status?.success?.icon ?? '#2F5E34';

const defaultUploadText = (title) => `Upload ${title}`;

/** Static document-type label shown before upload. */
const DocumentTypeLabel = ({ title, style }) => (
  <View
    style={[
      formFieldStyles.controlShell,
      formFieldStyles.controlAutoHeight,
      styles.documentTypeLabel,
      style,
    ]}
  >
    <DocumentFileIcon size={18} color="#666666" />
    <Text style={styles.fieldLabel} numberOfLines={2}>
      {title}
    </Text>
  </View>
);

/** Single uploaded-file row — replaces the label + dashed box after upload. */
const UploadedFileRow = ({
  fileName,
  filePath,
  onPreview,
  onReplace,
  showReplace = false,
  loading = false,
  inset = true,
  flex,
  style,
}) => {
  const { t } = useTranslation('errors');
  const uploadLabel = t('uploadDocument.upload');

  const sizeStyle = [
    inset && styles.uploadedRowInset,
    flex != null && { flex },
    !inset && !flex && styles.uploadedRowFull,
  ];

  return (
    <View
      style={[
        styles.uploadedRow,
        UPLOAD_BOX.shadow,
        sizeStyle,
        loading && styles.uploadedRowLoading,
        style,
      ]}
    >
      <TouchableOpacity
        style={styles.uploadedRowMain}
        onPress={() => onPreview?.(filePath)}
        disabled={loading || !filePath}
        activeOpacity={0.75}
        accessibilityRole="button"
        accessibilityLabel={t('uploadDocument.accessibilityPreview', { name: fileName })}
      >
        <DocumentFileIcon size={20} color={SUCCESS} />
        <View style={styles.uploadedRowText}>
          <Text style={styles.uploadedFileName} numberOfLines={1}>
            {fileName}
          </Text>
          <Text style={styles.uploadedHint}>{t('uploadDocument.tapToPreview')}</Text>
        </View>
      </TouchableOpacity>

      {loading ? (
        <ActivityIndicator size="small" color={PRIMARY} style={styles.uploadedRowSpinner} />
      ) : showReplace && onReplace ? (
        <TouchableOpacity
          onPress={onReplace}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={uploadLabel}
          style={styles.replaceButton}
        >
          <Text style={styles.fieldUploadAction}>{uploadLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

/** Dashed upload target — empty state only. */
const DashedUploadBox = ({
  uploadText,
  onPress,
  inset = true,
  flex,
  disabled = false,
  loading = false,
  style,
}) => {
  const sizeStyle = [
    inset && styles.uploadBoxInset,
    flex != null && { flex },
    !inset && !flex && styles.uploadBoxFull,
    { minHeight: UPLOAD_BOX.minHeight },
  ];

  return (
    <TouchableOpacity
      onPress={disabled || loading ? undefined : onPress}
      activeOpacity={disabled || loading ? 1 : 0.72}
      accessibilityRole="button"
      accessibilityLabel={uploadText}
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      style={[
        styles.uploadBox,
        UPLOAD_BOX.shadow,
        sizeStyle,
        disabled && styles.uploadBoxDisabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={UPLOAD_BOX.borderColor} />
      ) : (
        <View style={styles.uploadInner}>
          <Feather name="upload" size={UPLOAD_BOX.iconSize} color={UPLOAD_BOX.borderColor} />
          <Text style={styles.uploadLabel}>{uploadText}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const UploadDocument = ({
  sectionLabel = 'Documents',
  sectionHelpKey,
  sectionHelpText,
  sectionHelpTooltipId,
  documents = [],
  layout = 'stack',
  style,
}) => {
  const { previewAttachment, AttachmentPreviewModals } = useAttachmentPreview();
  const isGrid = layout === 'grid' && documents.length > 1;

  const renderDocumentSlot = (doc, { inset = true, flex } = {}) => {
    const uploadHandler = doc.onPress ?? doc.onUploadPress;

    if (doc.fileUploaded) {
      return (
        <UploadedFileRow
          fileName={doc.fileName}
          filePath={doc.filePath}
          onPreview={previewAttachment}
          onReplace={doc.onUploadPress}
          showReplace={doc.showUploadAction}
          loading={doc.loading}
          inset={inset}
          flex={flex}
        />
      );
    }

    return (
      <DashedUploadBox
        uploadText={doc.uploadText ?? defaultUploadText(doc.title)}
        onPress={uploadHandler}
        inset={inset}
        flex={flex}
        disabled={doc.disabled}
        loading={doc.loading}
      />
    );
  };

  return (
    <View style={[styles.section, style]}>
      {sectionLabel ? (
        <FormFieldLabel
          label={sectionLabel}
          helpKey={sectionHelpKey}
          helpText={sectionHelpText}
          helpTooltipId={sectionHelpTooltipId}
          labelStyle={styles.sectionLabelText}
          style={styles.sectionLabelRow}
        />
      ) : null}

      {isGrid ? (
        <>
          {documents
            .filter((doc) => doc.showDocumentField !== false)
            .map((doc, index) => (
              <DocumentTypeLabel key={`field-${doc.title}-${index}`} title={doc.title} />
            ))}
          <View style={styles.uploadGrid}>
            {documents.map((doc, index) => (
              <React.Fragment key={`upload-${doc.title}-${index}`}>
                {renderDocumentSlot(doc, { inset: false, flex: 1 })}
              </React.Fragment>
            ))}
          </View>
        </>
      ) : (
        documents.map((doc, index) => (
          <View key={`group-${doc.title}-${index}`} style={styles.stackGroup}>
            {!doc.fileUploaded && doc.showDocumentField !== false ? (
              <DocumentTypeLabel title={doc.title} />
            ) : null}
            {renderDocumentSlot(doc, {
              inset: doc.showDocumentField !== false,
            })}
          </View>
        ))
      )}
      <AttachmentPreviewModals />
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    width: '100%',
  },
  sectionLabelRow: {
    marginTop: SECTION.marginTop,
    marginBottom: SECTION.marginBottom,
  },
  sectionLabelText: {
    fontSize: SECTION.fontSize,
    lineHeight: SECTION.lineHeight,
    fontWeight: SECTION.fontWeight,
    fontFamily: theme.FontFamily?.regular ?? undefined,
    color: SECTION.color,
    letterSpacing: 0.1,
  },
  stackGroup: {
    width: '100%',
  },
  documentTypeLabel: {
    gap: DOCUMENT_FIELD_GAP,
    marginBottom: DOCUMENT_FIELD_MARGIN_BOTTOM,
    paddingVertical: 10,
  },
  fieldLabel: {
    flex: 1,
    minWidth: 0,
    fontSize: FORM_FIELD_FONT_SIZE,
    lineHeight: FORM_FIELD_TEXT_LINE_HEIGHT,
    fontWeight: '400',
    fontFamily: theme.FontFamily?.regular ?? undefined,
    color: FORM_FIELD_TEXT_COLOR,
  },
  fieldUploadAction: {
    fontSize: FORM_FIELD_FONT_SIZE,
    fontWeight: '600',
    fontFamily: theme.FontFamily?.regular ?? undefined,
    color: PRIMARY,
  },
  uploadGrid: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: UPLOAD_BOX.gridGap,
    marginHorizontal: UPLOAD_BOX.horizontalInset,
    marginBottom: DOCUMENT_FIELD_MARGIN_BOTTOM,
  },
  uploadBox: {
    backgroundColor: UPLOAD_BOX.fill,
    borderWidth: UPLOAD_BOX.borderWidth,
    borderColor: UPLOAD_BOX.borderColor,
    borderStyle: 'dashed',
    borderRadius: UPLOAD_BOX.borderRadius,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 10,
    marginBottom: DOCUMENT_FIELD_MARGIN_BOTTOM,
  },
  uploadBoxInset: {
    alignSelf: 'stretch',
    marginHorizontal: UPLOAD_BOX.horizontalInset,
  },
  uploadBoxFull: {
    alignSelf: 'stretch',
    width: '100%',
  },
  uploadBoxDisabled: {
    opacity: 0.5,
  },
  uploadInner: {
    width: '100%',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 4,
  },
  uploadLabel: {
    fontSize: UPLOAD_BOX.labelSize,
    lineHeight: UPLOAD_BOX.labelLineHeight,
    fontWeight: '400',
    fontFamily: theme.FontFamily?.regular ?? undefined,
    color: UPLOAD_BOX.labelColor,
    textAlign: 'center',
    flexShrink: 1,
  },
  uploadedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: UPLOAD_BOX.minHeight,
    backgroundColor: '#EEF6EF',
    borderWidth: 1,
    borderColor: SUCCESS,
    borderRadius: UPLOAD_BOX.borderRadius,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: DOCUMENT_FIELD_MARGIN_BOTTOM,
  },
  uploadedRowInset: {
    alignSelf: 'stretch',
    marginHorizontal: UPLOAD_BOX.horizontalInset,
  },
  uploadedRowFull: {
    alignSelf: 'stretch',
    width: '100%',
  },
  uploadedRowLoading: {
    opacity: 0.85,
  },
  uploadedRowMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minWidth: 0,
  },
  uploadedRowText: {
    flex: 1,
    minWidth: 0,
  },
  uploadedFileName: {
    fontSize: FORM_FIELD_FONT_SIZE,
    fontWeight: '600',
    fontFamily: theme.FontFamily?.regular ?? undefined,
    color: '#1F2937',
    lineHeight: 20,
  },
  uploadedHint: {
    marginTop: 2,
    fontSize: 12,
    lineHeight: 16,
    color: theme.Colors?.textSecondary ?? '#6B7280',
  },
  replaceButton: {
    marginLeft: 8,
    paddingVertical: 4,
    paddingLeft: 8,
  },
  uploadedRowSpinner: {
    marginLeft: 8,
  },
});

export default UploadDocument;
