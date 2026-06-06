// Language selector — English / मराठी (UI only; SQLite data unchanged)

import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { changeAppLanguage } from '../i18n';
import { LANGUAGE_OPTIONS } from '../i18n/languages';
import NavigationCard from './Navigationcard';
import theme from '../theme';

const LanguagePicker = () => {
  const { t, i18n } = useTranslation('settings');
  const [changing, setChanging] = useState(false);

  const handleSelect = useCallback(
    async (code) => {
      if (changing || i18n.language === code) return;
      setChanging(true);
      try {
        await changeAppLanguage(code);
      } catch (error) {
        console.warn('[LanguagePicker] change failed:', error);
      } finally {
        setChanging(false);
      }
    },
    [changing, i18n.language],
  );

  return (
    <View style={styles.root}>
      {LANGUAGE_OPTIONS.map((option) => {
        const selected = i18n.language === option.code;
        return (
          <NavigationCard
            key={option.code}
            title={option.label}
            subtitle={selected ? t('language.selected') : null}
            onPress={() => handleSelect(option.code)}
            disabled={changing}
            interactive
            showArrow={false}
            leftIcon={
              <Ionicons
                name="language-outline"
                size={22}
                color={theme.Colors?.textSecondary ?? '#555555'}
              />
            }
            rightIcon={
              selected ? (
                <Ionicons
                  name="checkmark-circle"
                  size={22}
                  color={theme.Colors?.primary ?? '#062E52'}
                />
              ) : (
                <View style={styles.unselectedIcon} />
              )
            }
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  root: {},
  unselectedIcon: {
    width: 22,
    height: 22,
  },
});

export default LanguagePicker;
