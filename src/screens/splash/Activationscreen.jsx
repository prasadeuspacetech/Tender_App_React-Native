// src/screens/splash/ActivationScreen.jsx

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  Colors,
  FontFamily,
  FontWeight,
  Spacing,
  Radius,
  Shadow,
  Layout,
  Typography,
  Input as InputTheme,
} from '../../theme';

// ─────────────────────────────────────────────────────────────────────────────
// Figma measurements (375px design frame)
//   Card    : width 286 | height 408 | radius 39 | border 0.7px
//   Avatar  : width 74  | height 75  | top −21 relative to card | right −30
//   Curves  : two large circle arcs, top-right and bottom-left
// ─────────────────────────────────────────────────────────────────────────────

const DESIGN_FRAME = 375;
const s = (n) => (Layout.screenWidth / DESIGN_FRAME) * n;

const CARD_WIDTH   = s(286);
const CARD_RADIUS  = s(39);
const AVATAR_SIZE  = s(74);
const AVATAR_TOP   = s(-21);   // avatar sits 21px above card top
const AVATAR_RIGHT = s(-30);   // avatar overflows 30px beyond card right edge

// Decorative arc sizes
const ARC_LG = Layout.screenWidth * 1.55;
const ARC_MD = Layout.screenWidth * 1.25;

// ─────────────────────────────────────────────────────────────────────────────

const ActivationScreen = ({ navigation }) => {
  const [mobileNumber, setMobileNumber] = useState('');
  const [subscriptionKey, setSubscriptionKey] = useState('');

  // Strip non-numeric chars and cap at 10 digits
  const handleMobileChange = (text) => {
    const numeric = text.replace(/[^0-9]/g, '').slice(0, 10);
    setMobileNumber(numeric);
  };

  const handleActivate = () => {
    if (mobileNumber.length !== 10) {
      Alert.alert(
        'Invalid Mobile Number',
        'Please enter a valid 10-digit mobile number.',
        [{ text: 'OK' }],
      );
      return;
    }
    // Mock auth — navigate directly to Dashboard (no API, no token)
    navigation.replace('MainApp');
  };

  return (
    <View style={styles.container}>

      {/* ── Decorative background arc — top-right ──────────────────────────── */}
      <View style={styles.arcTopRight} />

      {/* ── Decorative background arc — bottom-left ────────────────────────── */}
      <View style={styles.arcBottomLeft} />

      {/* ── Main content — keyboard-aware centered layout ───────────────────── */}
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {/*
          cardWrapper is a relative container so the avatar can be positioned
          absolutely relative to it, overlapping the card corner.
        */}
        <View style={styles.cardWrapper}>

          {/* ── Glass card ──────────────────────────────────────────────────── */}
          <View style={styles.card}>

            <Text style={styles.welcomeText}>Welcome</Text>

            {/* Mobile Number field */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Mobile Number</Text>
              <TextInput
                style={styles.input}
                value={mobileNumber}
                onChangeText={handleMobileChange}
                keyboardType="phone-pad"
                maxLength={10}
                returnKeyType="next"
                placeholderTextColor={Colors.textPlaceholder}
              />
            </View>

            {/* Subscription Key field */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Subscription Key</Text>
              <TextInput
                style={styles.input}
                value={subscriptionKey}
                onChangeText={setSubscriptionKey}
                keyboardType="default"
                returnKeyType="done"
                onSubmitEditing={handleActivate}
                placeholderTextColor={Colors.textPlaceholder}
              />
            </View>

            {/* Activate App button */}
            <TouchableOpacity
              style={styles.activateButton}
              onPress={handleActivate}
              activeOpacity={0.82}
            >
              <Text style={styles.activateButtonText}>Activate App</Text>
            </TouchableOpacity>

          </View>
          {/* ── END card ──────────────────────────────────────────────────── */}

          {/* ── Avatar — overlaps card top-right corner ─────────────────────
              Positioned absolute relative to cardWrapper.
              Matches Figma Group 35: 74×75, top −21, right −30 (scaled).
          ─────────────────────────────────────────────────────────────────── */}
          {/* <View style={styles.avatarCircle}>
            <Ionicons
              name="person"
              size={AVATAR_SIZE * 0.52}
              color={Colors.primary}
            />
          </View> */}

        </View>
        {/* ── END cardWrapper ─────────────────────────────────────────────── */}

      </KeyboardAvoidingView>

    </View>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({

  // ── Full-screen navy container ──────────────────────────────────────────────
  container: {
    flex: 1,
    backgroundColor: Colors.primary,   // #062E52
    overflow: 'hidden',
  },

  // ── Background decorative arcs ─────────────────────────────────────────────
  //    Large circles placed partially off-screen, stroke only, low opacity.
  //    Matches the curved lines visible in Figma login screen.
  arcTopRight: {
    position:     'absolute',
    width:        ARC_LG,
    height:       ARC_LG,
    borderRadius: ARC_LG / 2,
    borderWidth:  1,
    borderColor:  'rgba(255, 255, 255, 0.14)',
    top:          -(ARC_LG * 0.42),
    right:        -(ARC_LG * 0.38),
  },

  arcBottomLeft: {
    position:     'absolute',
    width:        ARC_MD,
    height:       ARC_MD,
    borderRadius: ARC_MD / 2,
    borderWidth:  1,
    borderColor:  'rgba(255, 255, 255, 0.09)',
    bottom:       -(ARC_MD * 0.52),
    left:         -(ARC_MD * 0.28),
  },

  // ── Keyboard-aware flex wrapper ─────────────────────────────────────────────
  keyboardAvoid: {
    flex: 1,
    justifyContent: 'center',
    alignItems:     'center',
    paddingVertical: Spacing.xxl,
  },

  // ── Card wrapper (relative so avatar can use absolute positioning) ──────────
  cardWrapper: {
    width:    CARD_WIDTH,
    position: 'relative',
    // Extra top margin so the avatar (which sits above the card) is visible
    marginTop: AVATAR_SIZE / 2,
  },

  // ── Semi-transparent glass card ─────────────────────────────────────────────
  //    Figma: fill #EBECED at 20% opacity, border 0.7px gradient #062E52→#FFFFFF
  //    RN can't do gradient borders natively → approximate with white at 35% alpha
  card: {
    width:            '100%',
    borderRadius:     CARD_RADIUS,
    backgroundColor:  'rgba(235, 236, 237, 0.18)',  // #EBECED at ~18–20%
    borderWidth:      0.7,
    borderColor:      'rgba(255, 255, 255, 0.35)',
    paddingHorizontal: Spacing.lg,
    paddingTop:        Spacing.xxl,                 // headroom for "Welcome" text
    paddingBottom:     Spacing.xl,
    alignItems:        'center',
  },

  // ── Welcome title ───────────────────────────────────────────────────────────
  welcomeText: {
    fontFamily:  FontFamily.bold,
    fontWeight:  FontWeight.bold,
    fontSize:    Typography.h3.fontSize,            // 28 — closest to Figma
    lineHeight:  Typography.h3.lineHeight,
    color:       Colors.textInverse,                // white
    textAlign:   'center',
    marginBottom: Spacing.lg,
  },

  // ── Input field group ───────────────────────────────────────────────────────
  fieldGroup: {
    width:        '100%',
    marginBottom:  Spacing.md,
  },

  fieldLabel: {
    fontFamily:   FontFamily.regular,
    fontSize:     Typography.bodySm.fontSize,       // 12
    color:        Colors.textInverse,               // white
    marginBottom:  Spacing.xs,
  },

  input: {
    width:            '100%',
    height:            InputTheme.heightSm,          // 44
    backgroundColor:   Colors.surface,              // white fill
    borderRadius:      Radius.input,                // 10
    borderWidth:       InputTheme.borderWidth,       // 1.5
    borderColor:       Colors.borderDefault,
    paddingHorizontal: InputTheme.paddingH,          // 12
    fontFamily:        FontFamily.regular,
    fontSize:          Typography.inputText.fontSize,
    color:             Colors.inputText,
  },

  // ── Activate App button — white capsule ────────────────────────────────────
  activateButton: {
    marginTop:      Spacing.lg,
    width:          '100%',
    height:          Layout.buttonHeight,            // 48
    borderRadius:    Radius.full,                   // full capsule — 9999
    backgroundColor: Colors.surface,               // white
    alignItems:      'center',
    justifyContent:  'center',
    ...Shadow.button,
  },

  activateButtonText: {
    fontFamily:  FontFamily.semiBold,
    fontWeight:  FontWeight.semiBold,
    fontSize:    Typography.buttonText.fontSize,    // 14
    letterSpacing: Typography.buttonText.letterSpacing,
    color:       Colors.primary,                    // navy text on white button
  },

  // ── Avatar circle — overlaps card top-right corner ─────────────────────────
  //    Figma: 74×75, fill #D8CCB6 at 50% — warm beige/tan
  avatarCircle: {
    position:        'absolute',
    top:              AVATAR_TOP,
    right:            AVATAR_RIGHT,
    width:            AVATAR_SIZE,
    height:           AVATAR_SIZE,
    borderRadius:     Radius.avatar,               // full circle — 9999
    backgroundColor:  'rgba(216, 204, 182, 0.85)', // #D8CCB6 at ~50%
    alignItems:       'center',
    justifyContent:   'center',
  },
});

export default ActivationScreen;