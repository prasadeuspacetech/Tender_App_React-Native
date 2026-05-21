import React, { useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import theme from '../theme';
import {
  formFieldStyles,
  FORM_FIELD_HEIGHT,
  FORM_FIELD_H_PADDING,
} from '../theme/formFieldStyles';

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
  text:     'default',
  number:   'numeric',
  email:    'email-address',
  phone:    'phone-pad',
  date:     'default',
  dropdown: 'default',
};

const InputBoxField = ({
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
  multiline = false,
  numberOfLines = 1,
  onPress,
  style,
  inputStyle,
  containerStyle,
}) => {
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

  const inputFieldElement = (
    <View
      style={[
        formFieldStyles.control,
        error ? formFieldStyles.controlError : null,
        isDisabled && formFieldStyles.controlDisabled,
        multiline && {
          height: undefined,
          minHeight: FORM_FIELD_HEIGHT * (numberOfLines || 2),
          paddingTop: 12,
          alignItems: 'flex-start',
        },
        style,
      ]}
    >
      {leftIcon ? <View style={formFieldStyles.leftIcon}>{leftIcon}</View> : null}

      <TextInput
        ref={inputRef}
        style={[
          formFieldStyles.controlText,
          leftIcon ? { marginLeft: 0 } : null,
          resolvedRightIcon ? { marginRight: 0 } : null,
          multiline && { textAlignVertical: 'top' },
          inputStyle,
        ]}
        value={value}
        placeholder={placeholder}
        placeholderTextColor={theme.Colors?.inputPlaceholder ?? '#AAAAAA'}
        onChangeText={onChangeText}
        keyboardType={resolvedKeyboard}
        secureTextEntry={secureTextEntry}
        editable={!isTouchable && !isDisabled}
        pointerEvents={isTouchable ? 'none' : 'auto'}
        multiline={multiline}
        numberOfLines={multiline ? numberOfLines : 1}
        accessibilityLabel={label}
        accessibilityHint={placeholder}
      />

      {resolvedRightIcon ? (
        <View style={formFieldStyles.rightIcon}>{resolvedRightIcon}</View>
      ) : null}
    </View>
  );

  return (
    <View style={[formFieldStyles.container, containerStyle]}>
      {label ? (
        <Text style={formFieldStyles.label}>
          {label}
          {required && <Text style={formFieldStyles.required}> *</Text>}
        </Text>
      ) : null}

      {isTouchable ? (
        <TouchableOpacity
          onPress={isDisabled ? undefined : (onPress ?? (() => inputRef.current?.focus()))}
          activeOpacity={isDisabled ? 1 : 0.75}
          accessible
          accessibilityRole={isDropdown ? 'combobox' : 'button'}
          accessibilityLabel={label}
          accessibilityState={{ disabled: isDisabled }}
        >
          {inputFieldElement}
        </TouchableOpacity>
      ) : (
        inputFieldElement
      )}

      {error ? <Text style={formFieldStyles.errorText}>{error}</Text> : null}
    </View>
  );
};

export default InputBoxField;
