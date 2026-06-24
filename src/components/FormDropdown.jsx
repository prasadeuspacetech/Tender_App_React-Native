import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useCallback, useRef, useState } from 'react';
import { Dimensions, Platform, StyleSheet, Text, View } from 'react-native';
import {
  Dropdown as ElementDropdown,
  MultiSelect,
} from 'react-native-element-dropdown';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import FormFieldLabel from './help/FormFieldLabel';
import theme from '../theme';
import {
  FORM_FIELD_BORDER_COLOR,
  FORM_FIELD_BORDER_COLOR_ERROR,
  FORM_FIELD_BORDER_RADIUS,
  FORM_FIELD_BORDER_WIDTH,
  FORM_FIELD_FONT_SIZE,
  FORM_FIELD_HEIGHT,
  FORM_FIELD_H_PADDING,
  FORM_FIELD_PLACEHOLDER_COLOR,
  FORM_FIELD_TEXT_COLOR,
  formFieldStyles,
} from '../theme/formFieldStyles';
import {
  dismissKeyboardAfterClose,
  dismissKeyboardBeforeOverlay,
} from '../utils/keyboardDismiss';
import {
  getTabBarObstructionHeight,
  resolveDropdownPlacement,
} from '../utils/dropdownPlacement';

const CHEVRON_COLOR = theme.Colors?.textSecondary ?? '#888888';
const ACTIVE_ITEM_BG = theme.Colors?.primaryFaint ?? '#EDF5FC';
const PRIMARY = theme.Colors?.primary ?? '#062E52';
const DROPDOWN_MAX_HEIGHT = 280;

const safeData = (data) => {
  if (!data) return [];
  if (Array.isArray(data)) return data.filter((item) => item != null);
  return [];
};

const DropdownItemRow = ({ item, labelField, isSelected, multiple }) => (
  <View style={styles.itemRow}>
    {multiple ? (
      <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
        {isSelected ? (
          <Ionicons name="checkmark" size={14} color="#FFFFFF" />
        ) : null}
      </View>
    ) : null}
    <Text
      style={[
        styles.itemText,
        !multiple && isSelected && styles.itemTextSelected,
      ]}
      numberOfLines={1}
    >
      {item[labelField]}
    </Text>
  </View>
);

/**
 * Workflow form dropdown — react-native-element-dropdown (no modal).
 * Intended for fixed-option fields only; use Inputboxfield for free text.
 */
const FormDropdown = ({
  label,
  data = [],
  value,
  onChange,
  onClose,
  placeholder = 'Select',
  labelField = 'label',
  valueField = 'value',
  dropdownPosition = 'auto',
  disabled = false,
  error,
  required = false,
  helpKey,
  helpText,
  helpTooltipId,
  emptyMessage = 'No options available',
  searchable = false,
  searchPlaceholder = 'Search...',
  multiple = false,
  maxSelect,
  style,
  fieldStyle,
  maxHeight = DROPDOWN_MAX_HEIGHT,
  bottomObstruction,
}) => {
  const items = safeData(data);
  const hasError = Boolean(error);
  const insets = useSafeAreaInsets();
  const fieldRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [computedPlacement, setComputedPlacement] = useState('bottom');

  const resolvedBottomObstruction =
    bottomObstruction ?? getTabBarObstructionHeight(insets);

  const updatePlacement = useCallback(() => {
    if (dropdownPosition !== 'auto') return;

    fieldRef.current?.measureInWindow((_, pageY, __, height) => {
      const placement = resolveDropdownPlacement({
        fieldY: pageY,
        fieldHeight: height,
        windowHeight: Dimensions.get('window').height,
        menuMaxHeight: maxHeight,
        optionCount: items.length,
        searchable,
        bottomObstruction: resolvedBottomObstruction,
        topInset: insets.top,
      });
      setComputedPlacement(placement);
    });
  }, [
    dropdownPosition,
    maxHeight,
    items.length,
    searchable,
    resolvedBottomObstruction,
    insets.top,
  ]);

  const resolvedDropdownPosition =
    dropdownPosition === 'auto' ? computedPlacement : dropdownPosition;

  const handleFocus = useCallback(() => {
    updatePlacement();
    setIsOpen(true);
    dismissKeyboardBeforeOverlay();
  }, [updatePlacement]);

  const handleBlur = useCallback(() => {
    setIsOpen(false);
    dismissKeyboardAfterClose();
    onClose?.();
  }, [onClose]);

  const renderRightIcon = useCallback(
    (open) => (
      <Ionicons
        name={open ? 'chevron-up' : 'chevron-down'}
        size={18}
        color={CHEVRON_COLOR}
      />
    ),
    [],
  );

  const renderItem = useCallback(
    (item, selected) => (
      <DropdownItemRow
        item={item}
        labelField={labelField}
        isSelected={selected}
        multiple={multiple}
      />
    ),
    [labelField, multiple],
  );

  const sharedProps = {
    style: [
      styles.dropdown,
      fieldStyle,
      hasError && styles.dropdownError,
      disabled && styles.dropdownDisabled,
    ],
    containerStyle: [
      styles.menuContainer,
      resolvedDropdownPosition === 'top'
        ? styles.menuContainerAbove
        : styles.menuContainerBelow,
    ],
    itemContainerStyle: styles.itemContainer,
    selectedTextStyle: styles.selectedText,
    placeholderStyle: styles.placeholderText,
    activeColor: ACTIVE_ITEM_BG,
    data: items,
    labelField,
    valueField,
    dropdownPosition: resolvedDropdownPosition,
    maxHeight,
    zIndex: isOpen ? 3000 : 1,
    iconStyle: styles.hiddenIcon,
    renderRightIcon,
    renderItem,
    flatListProps: {
      nestedScrollEnabled: true,
      keyboardShouldPersistTaps: 'handled',
      ListEmptyComponent: (
        <View style={styles.itemRow}>
          <Text style={[styles.itemText, styles.emptyText]}>{emptyMessage}</Text>
        </View>
      ),
    },
    onFocus: handleFocus,
    onBlur: handleBlur,
    disable: disabled,
    ...(searchable && {
      search: true,
      searchPlaceholder,
      inputSearchStyle: styles.searchInput,
    }),
  };

  const fieldControl = multiple ? (
    <MultiSelect
      {...sharedProps}
      search={searchable}
      disableLocalSearch={!searchable}
      value={Array.isArray(value) ? value : []}
      onChange={(selected) => {
        if (maxSelect && selected.length > maxSelect) return;
        onChange?.(selected);
        dismissKeyboardAfterClose();
      }}
      placeholder={placeholder}
      visibleSelectedItem={false}
    />
  ) : (
    <ElementDropdown
      {...sharedProps}
      value={value ?? null}
      placeholder={placeholder}
      onChange={(item) => {
        onChange?.(item);
        dismissKeyboardAfterClose();
      }}
    />
  );

  return (
    <View
      style={[
        formFieldStyles.container,
        isOpen && styles.containerOpen,
        style,
      ]}
    >
      {label ? (
        <FormFieldLabel
          label={label}
          required={required}
          helpKey={helpKey}
          helpText={helpText}
          helpTooltipId={helpTooltipId}
        />
      ) : null}
      <View ref={fieldRef} collapsable={false} onLayout={updatePlacement}>
        {fieldControl}
      </View>
      {error ? <Text style={formFieldStyles.errorText}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  containerOpen: {
    zIndex: 3000,
    ...Platform.select({
      android: { elevation: 12 },
      default: {},
    }),
  },
  dropdown: {
    height: FORM_FIELD_HEIGHT,
    borderWidth: FORM_FIELD_BORDER_WIDTH,
    borderColor: FORM_FIELD_BORDER_COLOR,
    borderRadius: FORM_FIELD_BORDER_RADIUS,
    paddingHorizontal: FORM_FIELD_H_PADDING,
    backgroundColor: '#FFFFFF',
  },
  dropdownError: {
    borderColor: FORM_FIELD_BORDER_COLOR_ERROR,
  },
  dropdownDisabled: {
    backgroundColor: theme.Colors?.inputBgDisabled ?? '#F7FAFC',
    opacity: 0.65,
  },
  menuContainer: {
    borderWidth: 1,
    borderColor: FORM_FIELD_BORDER_COLOR,
    borderRadius: FORM_FIELD_BORDER_RADIUS,
    backgroundColor: '#FFFFFF',
    paddingVertical: 4,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 6,
      },
      android: { elevation: 8 },
      default: {},
    }),
  },
  menuContainerBelow: {
    marginTop: 4,
  },
  menuContainerAbove: {
    marginBottom: 4,
  },
  itemContainer: {
    borderRadius: 8,
  },
  itemRow: {
    paddingVertical: 12,
    paddingHorizontal: FORM_FIELD_H_PADDING,
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemText: {
    flex: 1,
    fontSize: FORM_FIELD_FONT_SIZE,
    fontFamily: theme.FontFamily?.regular ?? undefined,
    color: FORM_FIELD_TEXT_COLOR,
  },
  itemTextSelected: {
    color: PRIMARY,
    fontWeight: '600',
  },
  emptyText: {
    color: FORM_FIELD_PLACEHOLDER_COLOR,
  },
  selectedText: {
    fontSize: FORM_FIELD_FONT_SIZE,
    fontFamily: theme.FontFamily?.regular ?? undefined,
    color: FORM_FIELD_TEXT_COLOR,
  },
  placeholderText: {
    fontSize: FORM_FIELD_FONT_SIZE,
    fontFamily: theme.FontFamily?.regular ?? undefined,
    color: FORM_FIELD_PLACEHOLDER_COLOR,
  },
  searchInput: {
    height: 44,
    paddingHorizontal: 12,
    fontSize: FORM_FIELD_FONT_SIZE,
    fontFamily: theme.FontFamily?.regular ?? undefined,
    color: FORM_FIELD_TEXT_COLOR,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: FORM_FIELD_BORDER_COLOR,
    marginHorizontal: 8,
    marginBottom: 4,
  },
  hiddenIcon: {
    width: 0,
    height: 0,
  },
  checkbox: {
    width: 17,
    height: 17,
    borderRadius: 2,
    borderWidth: 1.5,
    borderColor: PRIMARY,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: PRIMARY,
    borderColor: PRIMARY,
  },
});

export default FormDropdown;
