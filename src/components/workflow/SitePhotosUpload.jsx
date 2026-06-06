import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import Feather from '@expo/vector-icons/Feather';
import { useTranslation } from 'react-i18next';

import { MAX_SITE_PHOTOS } from '../../db/repositories/workProgressRepository';
import {
  deleteSitePhotoFile,
  pickAndStoreSitePhoto,
} from '../../services/sitePhotosUploadService';

const PRIMARY = '#062E52';
const PHOTO_SIZE = 103;

const CameraIcon = () => (
  <Feather name="camera" size={22} color="#6B7280" />
);

const PhotoThumbnail = ({ uri, label, onRemove, removeAccessibilityLabel }) => (
  <View style={styles.photoCard}>
    <Image source={{ uri }} style={styles.photoImage} contentFit="cover" />
    {label ? (
      <View style={styles.photoBadge}>
        <Text style={styles.photoBadgeText}>{label}</Text>
      </View>
    ) : null}
    <Pressable
      style={styles.removeBtn}
      onPress={onRemove}
      accessibilityRole="button"
      accessibilityLabel={removeAccessibilityLabel}
      hitSlop={8}
    >
      <Feather name="x" size={12} color="#FFFFFF" />
    </Pressable>
  </View>
);

const AddPhotoCard = ({ onPress, loading, label }) => (
  <Pressable
    style={styles.addCard}
    onPress={onPress}
    disabled={loading}
    accessibilityRole="button"
    accessibilityLabel={label}
  >
    {loading ? (
      <ActivityIndicator color={PRIMARY} />
    ) : (
      <>
        <CameraIcon />
        <Text style={styles.addText}>{label}</Text>
      </>
    )}
  </Pressable>
);

/**
 * Site photos upload row — JPG/PNG only, max 10, controlled URIs array.
 */
const SitePhotosUpload = ({
  workId,
  photos = [],
  onChange,
  style,
  sectionLabel,
  maxPhotos = MAX_SITE_PHOTOS,
  storageSubfolder = 'work_progress_photos',
  filePrefix = 'site_photo',
  addPhotoLabel,
  removeConfirmTitle,
  removeConfirmMessage,
}) => {
  const { t } = useTranslation('workflow');
  const [uploading, setUploading] = useState(false);
  const count = photos.length;
  const canAddMore = count < maxPhotos;

  const resolvedSectionLabel = sectionLabel ?? t('site.photos');
  const resolvedAddLabel = addPhotoLabel ?? t('site.addPhoto');
  const resolvedRemoveTitle = removeConfirmTitle ?? t('alerts.removePhotoTitle');
  const resolvedRemoveMessage =
    removeConfirmMessage ?? t('alerts.removePhotoMessage');

  const photoLabels = useMemo(
    () => [t('site.photoBefore'), t('site.photoProgress')],
    [t],
  );

  const handleAddPhoto = useCallback(async () => {
    if (!workId) {
      Alert.alert(
        t('alerts.uploadFailedTitle'),
        t('alerts.uploadFailedNoWorkId'),
      );
      return;
    }
    if (!canAddMore) return;

    setUploading(true);
    try {
      const uri = await pickAndStoreSitePhoto(workId, count, {
        subfolder: storageSubfolder,
        filePrefix,
        maxPhotos,
      });
      if (uri) {
        onChange?.([...photos, uri]);
      }
    } finally {
      setUploading(false);
    }
  }, [workId, canAddMore, count, photos, onChange, maxPhotos, storageSubfolder, filePrefix, t]);

  const handleRemove = useCallback(
    (index) => {
      const uri = photos[index];
      Alert.alert(resolvedRemoveTitle, resolvedRemoveMessage, [
        { text: t('alerts.cancel'), style: 'cancel' },
        {
          text: t('alerts.remove'),
          style: 'destructive',
          onPress: () => {
            deleteSitePhotoFile(uri);
            onChange?.(photos.filter((_, i) => i !== index));
          },
        },
      ]);
    },
    [photos, onChange, resolvedRemoveTitle, resolvedRemoveMessage, t],
  );

  return (
    <View style={[styles.section, style]}>
      <View style={styles.headerRow}>
        <Text style={styles.label}>{resolvedSectionLabel}</Text>
        {count > 0 ? (
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>
              {t('site.uploadedCount', { count })}
            </Text>
          </View>
        ) : null}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.photoRow}
      >
        {photos.map((uri, index) => (
          <PhotoThumbnail
            key={`${uri}-${index}`}
            uri={uri}
            label={photoLabels[index] ?? null}
            onRemove={() => handleRemove(index)}
            removeAccessibilityLabel={t('site.removePhotoAccessibility')}
          />
        ))}
        {canAddMore ? (
          <AddPhotoCard
            onPress={handleAddPhoto}
            loading={uploading}
            label={resolvedAddLabel}
          />
        ) : null}
      </ScrollView>

      <View style={styles.helperRow}>
        <Feather name="info" size={12} color="#9CA3AF" />
        <Text style={styles.helperText}>{t('site.photoHelper')}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  label: {
    fontSize: 15,
    fontWeight: '400',
    color: '#000000',
    lineHeight: 18,
  },
  countBadge: {
    backgroundColor: PRIMARY,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  countBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    lineHeight: 16,
  },
  photoRow: {
    paddingVertical: 2,
    gap: 10,
  },
  photoCard: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  photoBadge: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#1D6B43',
    paddingVertical: 4,
    alignItems: 'center',
  },
  photoBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
    lineHeight: 14,
  },
  removeBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addCard: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#D0D5DD',
    borderStyle: 'dashed',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  addText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
    lineHeight: 16,
  },
  helperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
  },
  helperText: {
    fontSize: 12,
    fontWeight: '400',
    color: '#9CA3AF',
    lineHeight: 16,
  },
});

export default SitePhotosUpload;
