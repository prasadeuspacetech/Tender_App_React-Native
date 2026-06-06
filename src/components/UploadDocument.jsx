/**
 * Unified document upload UI — single source of truth for all workflow screens.
 *
 * layout="stack"  → each document: [field] then [upload box] (single or sequential groups)
 * layout="grid"   → all fields stacked, then upload boxes in one row (Tender Creation, etc.)
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
import theme from '../theme';
import {
  formFieldStyles,
  FORM_FIELD_FONT_SIZE,
  FORM_FIELD_TEXT_COLOR,
} from '../theme/formFieldStyles';

// ─── Figma tokens ─────────────────────────────────────────────────────────────

const SECTION = {
  marginTop: 4,
  marginBottom: 10,
  fontSize: 15,
  lineHeight: 15,
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
  height: 71,
  horizontalInset: 10,
  iconSize: 18,
  labelSize: 15,
  labelLineHeight: 15,
  labelColor: 'rgba(0, 0, 0, 0.8)',
  gap: 6,
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

const defaultUploadText = (title) => `Upload ${title}`;

// ─── Icons ────────────────────────────────────────────────────────────────────

const TickIcon = ({ size = 16, color = '#2F5E34' }) => (
  <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
    <View
      style={{
        width: size * 0.55,
        height: size * 0.3,
        borderLeftWidth: 2,
        borderBottomWidth: 2,
        borderColor: color,
        transform: [{ rotate: '-45deg' }],
        marginTop: -size * 0.1,
      }}
    />
  </View>
);

// ─── Document field (upper row) ─────────────────────────────────────────────

const DocumentField = ({
  title,
  displayName,
  showUploadAction = false,
  onUploadPress,
  style,
}) => {
  const { t } = useTranslation('errors');
  const label = displayName || title;
  const uploadLabel = t('uploadDocument.upload');

  const content = (
    <>
      <DocumentFileIcon size={18} color="#666666" />
      <Text style={styles.fieldLabel} numberOfLines={1}>
        {label}
      </Text>
      {showUploadAction ? (
        <Text style={styles.fieldUploadAction}>{uploadLabel}</Text>
      ) : null}
    </>
  );

  if (showUploadAction && onUploadPress) {
    return (
      <TouchableOpacity
        style={[formFieldStyles.control, styles.documentField, style]}
        onPress={onUploadPress}
        activeOpacity={0.75}
        accessibilityRole="button"
        accessibilityLabel={t('uploadDocument.accessibilityUploadField', { title })}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return <View style={[formFieldStyles.control, styles.documentField, style]}>{content}</View>;
};

// ─── Dashed upload box (lower row) ────────────────────────────────────────────

const DashedUploadBox = ({
  uploadText,
  onPress,
  inset = true,
  flex,
  disabled = false,
  loading = false,
  fileUploaded = false,
  fileName,
  style,
}) => {
  const { t } = useTranslation('errors');
  const showSuccess = fileUploaded && !loading;

  const sizeStyle = [
    inset && styles.uploadBoxInset,
    flex != null && { flex },
    !inset && !flex && styles.uploadBoxFull,
    { height: UPLOAD_BOX.height, minHeight: UPLOAD_BOX.height },
  ];

  return (
    <TouchableOpacity
      onPress={disabled || loading ? undefined : onPress}
      activeOpacity={disabled || loading ? 1 : 0.72}
      accessibilityRole="button"
      accessibilityLabel={
        fileUploaded
          ? t('uploadDocument.accessibilityUploaded', {
              name: fileName ?? uploadText,
            })
          : uploadText
      }
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      style={[
        styles.uploadBox,
        UPLOAD_BOX.shadow,
        sizeStyle,
        showSuccess && styles.uploadBoxSuccess,
        disabled && styles.uploadBoxDisabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={UPLOAD_BOX.borderColor} />
      ) : showSuccess ? (
        <View style={styles.uploadInner}>
          <TickIcon size={16} color={theme.Colors?.status?.success?.icon ?? '#2F5E34'} />
          <Text style={styles.uploadedLabel}>{t('uploadDocument.fileUploaded')}</Text>
          {fileName ? (
            <Text style={styles.fileName} numberOfLines={1}>
              {fileName}
            </Text>
          ) : null}
        </View>
      ) : (
        <View style={styles.uploadInner}>
          <Feather name="upload" size={UPLOAD_BOX.iconSize} color={UPLOAD_BOX.borderColor} />
          <Text style={styles.uploadLabel} numberOfLines={2}>
            {uploadText}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────

/**
 * @param {Object} props
 * @param {string} [props.sectionLabel] — e.g. "Documents"
 * @param {Array<{
 *   title: string,
 *   uploadText?: string,
 *   showDocumentField?: boolean,
 *   showUploadAction?: boolean,
 *   onUploadPress?: () => void,
 *   onPress?: () => void,
 *   fileUploaded?: boolean,
 *   displayName?: string,
 *   fileName?: string,
 *   loading?: boolean,
 *   disabled?: boolean,
 * }>} props.documents
 * @param {'stack'|'grid'} [props.layout='stack']
 */
const UploadDocument = ({
  sectionLabel = 'Documents',
  sectionHelpKey,
  sectionHelpText,
  sectionHelpTooltipId,
  documents = [],
  layout = 'stack',
  style,
}) => {
  const isGrid = layout === 'grid' && documents.length > 1;

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

      {isGrid
        ? documents
            .filter((doc) => doc.showDocumentField !== false)
            .map((doc, index) => (
              <DocumentField
                key={`field-${doc.title}-${index}`}
                title={doc.title}
                displayName={doc.displayName}
                showUploadAction={doc.showUploadAction}
                onUploadPress={doc.onUploadPress}
              />
            ))
        : null}

      {isGrid ? (
        <View style={styles.uploadGrid}>
          {documents.map((doc, index) => (
            <DashedUploadBox
              key={`upload-${doc.title}-${index}`}
              uploadText={doc.uploadText ?? defaultUploadText(doc.title)}
              onPress={doc.onPress}
              inset={false}
              flex={1}
              disabled={doc.disabled}
              loading={doc.loading}
              fileUploaded={doc.fileUploaded}
              fileName={doc.fileName}
            />
          ))}
        </View>
      ) : (
        documents.map((doc, index) => (
          <View key={`group-${doc.title}-${index}`} style={styles.stackGroup}>
            {layout === 'stack' && doc.showDocumentField !== false ? (
              <DocumentField
                title={doc.title}
                displayName={doc.displayName}
                showUploadAction={doc.showUploadAction}
                onUploadPress={doc.onUploadPress}
              />
            ) : null}
            <DashedUploadBox
              uploadText={doc.uploadText ?? defaultUploadText(doc.title)}
              onPress={doc.onPress}
              inset={doc.showDocumentField !== false}
              disabled={doc.disabled}
              loading={doc.loading}
              fileUploaded={doc.fileUploaded}
              fileName={doc.fileName}
            />
          </View>
        ))
      )}
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
  documentField: {
    gap: DOCUMENT_FIELD_GAP,
    marginBottom: DOCUMENT_FIELD_MARGIN_BOTTOM,
  },
  fieldLabel: {
    flex: 1,
    fontSize: FORM_FIELD_FONT_SIZE,
    lineHeight: FORM_FIELD_FONT_SIZE,
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
    overflow: 'hidden',
    paddingHorizontal: 8,
    paddingVertical: 6,
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
  uploadBoxSuccess: {
    borderColor: theme.Colors?.status?.success?.icon ?? '#2F5E34',
    backgroundColor: '#EEF6EF',
    borderStyle: 'solid',
  },
  uploadBoxDisabled: {
    opacity: 0.5,
  },
  uploadInner: {
    flex: 1,
    width: '100%',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: UPLOAD_BOX.gap,
    paddingHorizontal: 6,
  },
  uploadLabel: {
    fontSize: UPLOAD_BOX.labelSize,
    lineHeight: UPLOAD_BOX.labelLineHeight,
    fontWeight: '400',
    fontFamily: theme.FontFamily?.regular ?? undefined,
    color: UPLOAD_BOX.labelColor,
    textAlign: 'center',
  },
  uploadedLabel: {
    fontSize: UPLOAD_BOX.labelSize,
    fontWeight: '600',
    color: theme.Colors?.status?.success?.icon ?? '#2F5E34',
    textAlign: 'center',
  },
  fileName: {
    fontSize: 11,
    color: theme.Colors?.textSecondary ?? '#555555',
    textAlign: 'center',
    maxWidth: '100%',
  },
});

export default UploadDocument;
