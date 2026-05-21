// src/components/DropdownModal.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Reusable bottom-sheet–style dropdown modal.
// Pure UI — zero business logic.
//
// Props
//   visible       boolean            controls modal open/close
//   title         string             heading shown at top of sheet
//   options       { label, value }[] list to render
//   selectedValue string             currently selected value (highlights row)
//   onSelect      (option) => void   called when user taps a row
//   onClose       () => void         called when backdrop or ✕ is tapped
//   searchable    boolean (default false)  show search bar inside modal
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useMemo, useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import theme from '../theme';

// ─── Tick icon (pure View, no library) ───────────────────────────────────────
const Tick = ({ color }) => (
  <View style={{ width: 18, height: 18, justifyContent: 'center', alignItems: 'center' }}>
    <View
      style={{
        width: 10,
        height: 5,
        borderLeftWidth: 2,
        borderBottomWidth: 2,
        borderColor: color,
        transform: [{ rotate: '-45deg' }],
        marginTop: -3,
      }}
    />
  </View>
);

// ─── Separator ────────────────────────────────────────────────────────────────
const Separator = () => <View style={styles.separator} />;

// ─── Single option row ────────────────────────────────────────────────────────
const OptionRow = React.memo(({ item, isSelected, onSelect }) => {
  const handlePress = useCallback(() => onSelect(item), [item, onSelect]);

  return (
    <TouchableOpacity
      style={[styles.optionRow, isSelected && styles.optionRowSelected]}
      onPress={handlePress}
      activeOpacity={0.65}
      accessibilityRole="radio"
      accessibilityState={{ selected: isSelected }}
      accessibilityLabel={item.label}
    >
      <Text
        style={[styles.optionLabel, isSelected && styles.optionLabelSelected]}
        numberOfLines={1}
      >
        {item.label}
      </Text>
      {isSelected && (
        <Tick color={theme.Colors?.primary ?? '#2563EB'} />
      )}
    </TouchableOpacity>
  );
});

// ─── Main Component ───────────────────────────────────────────────────────────
const DropdownModal = ({
  visible = false,
  title = 'Select',
  options = [],
  selectedValue,
  onSelect,
  onClose,
  searchable = false,
}) => {
  const [query, setQuery] = useState('');

  // Filter options by search query
  const filteredOptions = useMemo(() => {
    if (!searchable || !query.trim()) return options;
    const lower = query.toLowerCase();
    return options.filter((o) => o.label.toLowerCase().includes(lower));
  }, [options, query, searchable]);

  const handleSelect = useCallback(
    (option) => {
      onSelect?.(option);
      setQuery('');   // reset search on selection
    },
    [onSelect],
  );

  const handleClose = useCallback(() => {
    setQuery('');
    onClose?.();
  }, [onClose]);

  const renderItem = useCallback(
    ({ item }) => (
      <OptionRow
        item={item}
        isSelected={item.value === selectedValue}
        onSelect={handleSelect}
      />
    ),
    [selectedValue, handleSelect],
  );

  const keyExtractor = useCallback((item) => item.value, []);

  const emptyComponent = useMemo(
    () => (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No options found</Text>
      </View>
    ),
    [],
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      {/* ── Backdrop ── */}
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={handleClose}
        accessible={false}
      />

      {/* ── Sheet ── */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.sheetWrapper}
        pointerEvents="box-none"
      >
        <View style={styles.sheet}>

          {/* Handle */}
          <View style={styles.handle} />

          {/* Header row */}
          <View style={styles.header}>
            <Text style={styles.headerTitle} numberOfLines={1}>{title}</Text>
            <TouchableOpacity
              onPress={handleClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityRole="button"
              accessibilityLabel="Close"
            >
              <CloseIcon />
            </TouchableOpacity>
          </View>

          {/* Optional search bar */}
          {searchable && (
            <View style={styles.searchWrapper}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search…"
                placeholderTextColor={theme.Colors?.inputPlaceholder ?? '#AAAAAA'}
                value={query}
                onChangeText={setQuery}
                autoCorrect={false}
                clearButtonMode="while-editing"
                returnKeyType="search"
              />
            </View>
          )}

          {/* Options list */}
          <FlatList
            data={filteredOptions}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            ItemSeparatorComponent={Separator}
            ListEmptyComponent={emptyComponent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            style={styles.list}
          />

        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

// ─── Close icon (×) ───────────────────────────────────────────────────────────
const CloseIcon = () => {
  const color = theme.Colors?.textSecondary ?? '#888888';
  const size  = 14;
  return (
    <View style={{ width: 28, height: 28, justifyContent: 'center', alignItems: 'center' }}>
      {/* \ */}
      <View style={{
        position: 'absolute',
        width: size,
        height: 1.8,
        backgroundColor: color,
        transform: [{ rotate: '45deg' }],
      }} />
      {/* / */}
      <View style={{
        position: 'absolute',
        width: size,
        height: 1.8,
        backgroundColor: color,
        transform: [{ rotate: '-45deg' }],
      }} />
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const RADIUS    = theme.Radius?.xl  ?? 20;
const H_PAD     = theme.Spacing?.lg ?? 16;
const ITEM_H    = 50;
const MAX_H     = 480;  // sheet never taller than this

const styles = StyleSheet.create({
  // Backdrop sits behind the sheet; tapping it closes the modal
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },

  // Wrapper ensures sheet sticks to the bottom of the screen
  sheetWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },

  sheet: {
    backgroundColor: theme.Colors?.white ?? '#FFFFFF',
    borderTopLeftRadius: RADIUS,
    borderTopRightRadius: RADIUS,
    maxHeight: MAX_H,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,   // safe-area buffer
    // Elevation / shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 16,
  },

  handle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.Colors?.borderDefault ?? '#DDDDDD',
    marginTop: 10,
    marginBottom: 4,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: H_PAD,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.Colors?.borderDefault ?? '#EEEEEE',
  },

  headerTitle: {
    flex: 1,
    fontSize: theme.FontSize?.md ?? 16,
    fontWeight: theme.FontWeight?.semiBold ?? '500',
    fontFamily: theme.FontFamily?.regular ?? undefined,
    color: theme.Colors?.textPrimary ?? '#1A1A1A',
    marginRight: 8,
  },

  searchWrapper: {
    paddingHorizontal: H_PAD,
    paddingTop: 12,
    paddingBottom: 4,
  },

  searchInput: {
    height: 40,
    borderRadius: theme.Radius?.md ?? 10,
    borderWidth: 1,
    borderColor: theme.Colors?.borderDefault ?? '#CCCCCC',
    backgroundColor: theme.Colors?.white ?? '#FFFFFF',
    paddingHorizontal: 12,
    fontSize: theme.FontSize?.sm ?? 14,
    fontFamily: theme.FontFamily?.regular ?? undefined,
    color: theme.Colors?.textPrimary ?? '#1A1A1A',
  },

  list: {
    flexGrow: 0,
  },

  listContent: {
    paddingHorizontal: H_PAD,
    paddingTop: 4,
    paddingBottom: 8,
  },

  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: ITEM_H,
    paddingHorizontal: 4,
  },

  optionRowSelected: {
    // Subtle highlight on the selected row
  },

  optionLabel: {
    flex: 1,
    fontSize: theme.FontSize?.sm ?? 14,
    fontFamily: theme.FontFamily?.regular ?? undefined,
    color: theme.Colors?.textPrimary ?? '#1A1A1A',
    marginRight: 8,
  },

  optionLabelSelected: {
    color: theme.Colors?.primary ?? '#2563EB',
    fontWeight: theme.FontWeight?.semiBold ?? '600',
  },

  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: theme.Colors?.borderDefault ?? '#EEEEEE',
    marginHorizontal: 4,
  },

  emptyContainer: {
    paddingVertical: 32,
    alignItems: 'center',
  },

  emptyText: {
    fontSize: theme.FontSize?.sm ?? 14,
    color: theme.Colors?.textSecondary ?? '#888888',
    fontFamily: theme.FontFamily?.regular ?? undefined,
  },
});

export default DropdownModal;