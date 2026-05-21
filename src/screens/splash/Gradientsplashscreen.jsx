// src/screens/splash/GradientSplashScreen.js

import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Layout } from '../../theme';

// ─────────────────────────────────────────────────────────────────────────────
// Figma "Ellipse 45" — measured on 375px design frame:
//   width: 897  height: 1107  top: -96  left: -232
//
// All values are scaled proportionally to the real device width via s()
// so the composition is pixel-correct on every device.
// ─────────────────────────────────────────────────────────────────────────────

const DESIGN_FRAME = 375;
const s = (n) => (Layout.screenWidth / DESIGN_FRAME) * n;

const ELLIPSE_W    = s(897);
const ELLIPSE_H    = s(1107);
const ELLIPSE_TOP  = s(-96);
const ELLIPSE_LEFT = s(-232);

// ─────────────────────────────────────────────────────────────────────────────

const GradientSplashScreen = ({ navigation }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('SplashLoader');
    }, 1000);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      {/*
        The ellipse is intentionally clipped by the container — matches Figma
        where the circle starts from outside the screen on the top-left.
      */}
      <View style={styles.ellipseWrapper}>
        <LinearGradient
          colors={[Colors.surface, Colors.primary]}   // #FFFFFF → #062E52
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={styles.gradient}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,   // Deep navy #062E52
    overflow: 'hidden',
  },

  ellipseWrapper: {
    position:     'absolute',
    top:          ELLIPSE_TOP,
    left:         ELLIPSE_LEFT,
    width:        ELLIPSE_W,
    height:       ELLIPSE_H,
    borderRadius: ELLIPSE_W,           // large enough to make a true ellipse
    overflow:     'hidden',
  },

  gradient: {
    flex: 1,
  },
});

export default GradientSplashScreen;