import React, { forwardRef, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Platform,
  StyleSheet,
} from 'react-native';
import FormFieldLabel from './help/FormFieldLabel';
import theme from '../theme';
import {
  formFieldStyles,
  FORM_FIELD_HEIGHT,
  FORM_FIELD_BORDER_WIDTH,
} from '../theme/formFieldStyles';
import { dismissKeyboardBeforeOverlay } from '../utils/keyboardDismiss';
import { sanitizeForInputType } from '../utils/inputSanitize';

const ChevronDown = ({ size = 11, color = '#888888' }) => (
  <View style={{ width: size * 1.4, height: size, justifyContent: 'center', alignItems: 'center' }}>
    <View
      style={{
        width: size,
        height: size,
        borderRightWidth: 2,
        borderBottomWidth: 2,
        borderColor: color,
        transform: [{ rotate: '45deg' }],
        marginTop: -size * 0.35,
      }}
    />
  </View>
);

const KEYBOARD_MAP = {
  text:           'default',
  textOnly:       'default',
  alphanumeric:   'default',
  number:         'numeric',
  decimal:        'decimal-pad',
  email:          'email-address',
  phone:          'phone-pad',
  date:           'default',
  dropdown:       'default',
};

const SINGLE_LINE_INPUT_HEIGHT =
  FORM_FIELD_HEIGHT - FORM_FIELD_BORDER_WIDTH * 2;

const InputBoxField = forwardRef(({
  label,
  value,
  placeholder,
  onChangeText,
  type = 'text',
  keyboardType,
  secureTextEntry = false,
  editable = true,
  disabled = false,
  leftIcon  = null,
  rightIcon,
  error,
  required = false,
  helpKey,
  helpText,
  helpTooltipId,
  multiline = false,
  numberOfLines = 1,
  onPress,
  style,
  inputStyle,
  containerStyle,
}, ref) => {
  const inputRef = useRef(null);

  const isDropdown  = type === 'dropdown';
  const isDate      = type === 'date';
  const isTouchable = isDropdown || isDate || typeof onPress === 'function';
  const isDisabled  = disabled || !editable;

  const resolvedRightIcon =
    rightIcon !== undefined
      ? rightIcon
      : isDropdown
      ? <ChevronDown color={theme.Colors?.textSecondary ?? '#888888'} />
      : null;

  const resolvedKeyboard = keyboardType ?? KEYBOARD_MAP[type] ?? 'default';

  const handleChangeText = (text) => {
    if (!onChangeText) return;
    const next =
      isTouchable || isDate
        ? text
        : sanitizeForInputType(type, text);
    onChangeText(next);
  };

  const controlStyle = [
    formFieldStyles.control,
    error ? formFieldStyles.controlError : null,
    isDisabled && formFieldStyles.controlDisabled,
    multiline && {
      height: undefined,
      minHeight: FORM_FIELD_HEIGHT * (numberOfLines || 2),
      paddingTop: 12,
      alignItems: 'flex-start',
    },
    !multiline && !isTouchable && { alignItems: 'stretch' },
    style,
  ];

  const textInputElement = (
    <TextInput
      ref={inputRef}
      style={[
        formFieldStyles.controlText,
        !multiline && localStyles.singleLineInput,
        multiline && localStyles.multilineInput,
        leftIcon ? { marginLeft: 0 } : null,
        resolvedRightIcon ? { marginRight: 0 } : null,
        inputStyle,
      ]}
      value={value}
      placeholder={placeholder}
      placeholderTextColor={theme.Colors?.inputPlaceholder ?? '#AAAAAA'}
      onChangeText={handleChangeText}
      keyboardType={resolvedKeyboard}
      secureTextEntry={secureTextEntry}
      editable={!isTouchable && !isDisabled}
      pointerEvents={isTouchable ? 'none' : 'auto'}
      multiline={multiline}
      numberOfLines={multiline ? numberOfLines : 1}
      accessibilityLabel={label}
      accessibilityHint={placeholder}
      underlineColorAndroid="transparent"
    />
  );

  const controlBody = (
    <>
      {leftIcon ? <View style={formFieldStyles.leftIcon}>{leftIcon}</View> : null}
      {textInputElement}
      {resolvedRightIcon ? (
        <View style={formFieldStyles.rightIcon}>{resolvedRightIcon}</View>
      ) : null}
    </>
  );

  const controlElement = isTouchable ? (
    <TouchableOpacity
      onPress={() => {
        if (isDisabled) return;
        dismissKeyboardBeforeOverlay();
        onPress?.();
      }}
      activeOpacity={isDisabled ? 1 : 0.75}
      accessible
      accessibilityRole={isDropdown ? 'combobox' : 'button'}
      accessibilityLabel={label}
      accessibilityState={{ disabled: isDisabled }}
    >
      <View style={controlStyle}>{controlBody}</View>
    </TouchableOpacity>
  ) : (
    <View style={controlStyle}>{controlBody}</View>
  );

  return (
    <View style={[formFieldStyles.container, containerStyle]}>
      {label ? (
        <FormFieldLabel
          label={label}
          required={required}
          helpKey={helpKey}
          helpText={helpText}
          helpTooltipId={helpTooltipId}
        />
      ) : null}

      <View ref={ref} collapsable={false}>
        {controlElement}
      </View>

      {error ? <Text style={formFieldStyles.errorText}>{error}</Text> : null}
    </View>
  );
});

InputBoxField.displayName = 'InputBoxField';

const localStyles = StyleSheet.create({
  singleLineInput: {
    flex: 1,
    alignSelf: 'stretch',
    height: SINGLE_LINE_INPUT_HEIGHT,
    minHeight: SINGLE_LINE_INPUT_HEIGHT,
    paddingVertical: 0,
    margin: 0,
    ...Platform.select({
      android: {
        includeFontPadding: false,
        textAlignVertical: 'center',
      },
      default: {},
    }),
  },
  multilineInput: {
    flex: 1,
    alignSelf: 'stretch',
    width: '100%',
    textAlignVertical: 'top',
    paddingVertical: 0,
  },
});

export default InputBoxField;
