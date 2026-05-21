// src/components/CalendarPicker.jsx
//
// Reusable INLINE date picker — renders as a labeled input with a dropdown calendar.
// Zero external dependencies — built from View/Text/TouchableOpacity only.
//
// Props:
//   label?        string               Field label shown above the input
//   value?        Date | string        Currently selected date (Date object or 'DD/MM/YYYY')
//   onDateChange  (date: Date) => void Called when the user picks a day
//   placeholder?  string               Shown when no date selected (default: 'Select date')
//   minimumDate?  Date                 Dates before this are disabled
//   maximumDate?  Date                 Dates after this are disabled
//   error?        string               Error message — applies error border (message shown by parent)
//   required?     boolean              Shows required asterisk on label

import Feather from '@expo/vector-icons/Feather';
import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import theme from '../theme';
import {
  formFieldStyles,
  FORM_FIELD_BORDER_COLOR,
  FORM_FIELD_BORDER_RADIUS,
  FORM_FIELD_FONT_SIZE,
  FORM_FIELD_H_PADDING,
  FORM_FIELD_HEIGHT,
  FORM_FIELD_PLACEHOLDER_COLOR,
  FORM_FIELD_TEXT_COLOR,
} from '../theme/formFieldStyles';

const PRIMARY = theme.Colors?.primary ?? '#062E52';
const TEXT = theme.Colors?.text ?? '#1A1A1A';
const SECONDARY = theme.Colors?.secondary ?? '#777777';
const ICON_COLOR = '#555555';

// ─── Constants ────────────────────────────────────────────────────────────────
const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const normaliseDate = (value) => {
  if (value == null || value === '') return null;
  if (value instanceof Date) {
    return isNaN(value.getTime()) ? null : value;
  }

  const raw = String(value).trim();
  if (!raw || raw === '{}' || raw === '[object Object]') return null;

  const slashParts = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (slashParts) {
    const d = Number(slashParts[1]);
    const m = Number(slashParts[2]);
    const y = Number(slashParts[3]);
    const date = new Date(y, m - 1, d);
    return isNaN(date.getTime()) ? null : date;
  }

  const legacyParts = raw.split('/').map(Number);
  if (legacyParts.length === 3 && legacyParts.every((n) => !Number.isNaN(n))) {
    const [d, m, y] = legacyParts;
    if (d && m && y) {
      const date = new Date(y, m - 1, d);
      return isNaN(date.getTime()) ? null : date;
    }
  }

  const parsed = new Date(raw);
  return isNaN(parsed.getTime()) ? null : parsed;
};

const formatDisplay = (date) => {
  if (!date) return '';
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
};

const isSameDay = (a, b) =>
  a &&
  b &&
  a.getDate() === b.getDate() &&
  a.getMonth() === b.getMonth() &&
  a.getFullYear() === b.getFullYear();

const buildCalendarDays = (year, month) => {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  return cells;
};

// ─── Memoised day cell ────────────────────────────────────────────────────────
const DayCell = memo(({ day, isSelected, isToday, isDisabled, onPress }) => {
  if (day === null) return <View style={styles.dayCell} />;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.dayCell,
        isSelected && styles.dayCellSelected,
        isToday && !isSelected && styles.dayCellToday,
        isDisabled && styles.dayCellDisabled,
        pressed && !isDisabled && { opacity: 0.7 },
      ]}
      onPress={isDisabled ? undefined : onPress}
      disabled={isDisabled}
    >
      <Text
        style={[
          styles.dayText,
          isSelected && styles.dayTextSelected,
          isToday && !isSelected && styles.dayTextToday,
          isDisabled && styles.dayTextDisabled,
        ]}
      >
        {day}
      </Text>
    </Pressable>
  );
});

// ─── Chevron (pure View) ──────────────────────────────────────────────────────
const Chevron = ({ direction = 'left', color = PRIMARY, size = 10 }) => (
  <View
    style={{
      width: size,
      height: size,
      borderTopWidth: 2,
      borderLeftWidth: 2,
      borderColor: color,
      transform: [{ rotate: direction === 'left' ? '-45deg' : '135deg' }],
      marginLeft: direction === 'right' ? 2 : 0,
      marginRight: direction === 'left' ? 2 : 0,
    }}
  />
);

// ─── Main component ───────────────────────────────────────────────────────────
const CalendarPicker = ({
  label,
  value,
  onDateChange,
  placeholder = 'Select date',
  minimumDate,
  maximumDate,
  error,
  required = false,
}) => {
  const today = useMemo(() => new Date(), []);
  const parsedValue = useMemo(() => normaliseDate(value), [value]);
  const hasValue = parsedValue != null;
  const displayText = hasValue ? formatDisplay(parsedValue) : placeholder;

  const [showCalendar, setShowCalendar] = useState(false);
  const [viewYear, setViewYear] = useState(
    () => parsedValue?.getFullYear() ?? today.getFullYear(),
  );
  const [viewMonth, setViewMonth] = useState(
    () => parsedValue?.getMonth() ?? today.getMonth(),
  );

  useEffect(() => {
    if (parsedValue) {
      setViewYear(parsedValue.getFullYear());
      setViewMonth(parsedValue.getMonth());
    }
  }, [parsedValue]);

  const prevMonth = useCallback(() => {
    setViewMonth((m) => {
      if (m === 0) {
        setViewYear((y) => y - 1);
        return 11;
      }
      return m - 1;
    });
  }, []);

  const nextMonth = useCallback(() => {
    setViewMonth((m) => {
      if (m === 11) {
        setViewYear((y) => y + 1);
        return 0;
      }
      return m + 1;
    });
  }, []);

  const handleDayPress = useCallback(
    (day) => {
      const selected = new Date(viewYear, viewMonth, day);
      setShowCalendar(false);
      onDateChange?.(selected);
    },
    [viewYear, viewMonth, onDateChange],
  );

  const isDisabledDay = (day) => {
    const d = new Date(viewYear, viewMonth, day);
    if (minimumDate instanceof Date && d < minimumDate) return true;
    if (maximumDate instanceof Date && d > maximumDate) return true;
    return false;
  };

  const cells = buildCalendarDays(viewYear, viewMonth);

  return (
    <View style={formFieldStyles.container}>
      {!!label && (
        <Text style={formFieldStyles.label}>
          {label}
          {required ? <Text style={formFieldStyles.requiredMark}> *</Text> : null}
        </Text>
      )}

      <View style={styles.inputStack}>
        <Pressable
          style={({ pressed }) => [
            formFieldStyles.control,
            styles.inputTrigger,
            error ? formFieldStyles.controlError : null,
            showCalendar && styles.inputTriggerOpen,
            pressed && styles.inputPressed,
          ]}
          onPress={() => setShowCalendar((v) => !v)}
        >
          <View style={styles.valueSlot}>
            <Text
              style={[
                styles.valueText,
                !hasValue && styles.valuePlaceholder,
              ]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {displayText}
            </Text>
          </View>

          <View style={formFieldStyles.rightIcon}>
            <Feather name="calendar" size={18} color={ICON_COLOR} />
          </View>
        </Pressable>

        {showCalendar && (
          <View style={styles.calendarPanel}>
            <View style={styles.monthRow}>
              <Pressable
                onPress={prevMonth}
                style={styles.monthArrow}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Chevron direction="left" />
              </Pressable>

              <Text style={styles.monthLabel}>
                {MONTH_NAMES[viewMonth]} {viewYear}
              </Text>

              <Pressable
                onPress={nextMonth}
                style={styles.monthArrow}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Chevron direction="right" />
              </Pressable>
            </View>

            <View style={styles.dayLabelRow}>
              {DAY_LABELS.map((l) => (
                <Text key={l} style={styles.dayLabelText}>
                  {l}
                </Text>
              ))}
            </View>

            <View style={styles.grid}>
              {cells.map((day, idx) => (
                <DayCell
                  key={idx}
                  day={day}
                  isSelected={
                    day !== null &&
                    isSameDay(new Date(viewYear, viewMonth, day), parsedValue)
                  }
                  isToday={
                    day !== null &&
                    isSameDay(new Date(viewYear, viewMonth, day), today)
                  }
                  isDisabled={day !== null && isDisabledDay(day)}
                  onPress={() => day !== null && handleDayPress(day)}
                />
              ))}
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  inputStack: {
    width: '100%',
  },
  inputTrigger: {
    overflow: 'visible',
    zIndex: 1,
  },
  inputTriggerOpen: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  inputPressed: {
    opacity: 0.8,
  },
  valueSlot: {
    flex: 1,
    justifyContent: 'center',
    height: FORM_FIELD_HEIGHT - 4,
    minHeight: FORM_FIELD_HEIGHT - 4,
  },
  valueText: {
    fontSize: FORM_FIELD_FONT_SIZE,
    color: FORM_FIELD_TEXT_COLOR,
    lineHeight: FORM_FIELD_FONT_SIZE + 4,
    paddingVertical: 0,
    margin: 0,
    includeFontPadding: false,
  },
  valuePlaceholder: {
    color: FORM_FIELD_PLACEHOLDER_COLOR,
  },

  calendarPanel: {
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: FORM_FIELD_BORDER_COLOR,
    borderBottomLeftRadius: FORM_FIELD_BORDER_RADIUS,
    borderBottomRightRadius: FORM_FIELD_BORDER_RADIUS,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: FORM_FIELD_H_PADDING,
    paddingTop: theme.Spacing?.sm ?? 10,
    paddingBottom: theme.Spacing?.md ?? 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },

  monthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.Spacing?.sm ?? 10,
  },
  monthArrow: {
    padding: theme.Spacing?.xs ?? 6,
  },
  monthLabel: {
    fontSize: theme.FontSize?.md ?? 15,
    fontWeight: '600',
    color: TEXT,
    flex: 1,
    textAlign: 'center',
  },

  dayLabelRow: {
    flexDirection: 'row',
    marginBottom: theme.Spacing?.xs ?? 4,
  },
  dayLabelText: {
    flex: 1,
    textAlign: 'center',
    fontSize: theme.FontSize?.xs ?? 11,
    fontWeight: '600',
    color: SECONDARY,
    letterSpacing: 0.3,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 2,
  },
  dayCellSelected: {
    backgroundColor: PRIMARY,
    borderRadius: 999,
  },
  dayCellToday: {
    borderWidth: 1.5,
    borderColor: PRIMARY,
    borderRadius: 999,
  },
  dayCellDisabled: {
    opacity: 0.3,
  },
  dayText: {
    fontSize: theme.FontSize?.sm ?? 13,
    color: TEXT,
  },
  dayTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  dayTextToday: {
    color: PRIMARY,
    fontWeight: '600',
  },
  dayTextDisabled: {
    color: SECONDARY,
  },
});

export default CalendarPicker;
