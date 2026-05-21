// Shared document page icon (Figma) — pure View, no icon library.

import React from 'react';
import { StyleSheet, View } from 'react-native';

const ICON_COLOR = '#666666';

const DocumentFileIcon = ({ size = 18, color = ICON_COLOR }) => {
  const w = size;
  const h = Math.round(size * 1.2);

  return (
    <View style={[styles.wrap, { width: w, height: h }]}>
      <View style={[styles.body, { width: w, height: h, borderColor: color }]} />
      <View style={[styles.corner, { borderColor: color }]} />
      <View style={[styles.line1, { backgroundColor: color, width: w * 0.6 }]} />
      <View style={[styles.line2, { backgroundColor: color, width: w * 0.5 }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    position: 'relative',
  },
  body: {
    borderWidth: 1.5,
    borderRadius: 2,
  },
  corner: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 6,
    height: 6,
    borderLeftWidth: 1.5,
    borderBottomWidth: 1.5,
    borderColor: ICON_COLOR,
    backgroundColor: '#FFFFFF',
  },
  line1: {
    position: 'absolute',
    top: 7,
    left: 3,
    height: 1.5,
    borderRadius: 1,
  },
  line2: {
    position: 'absolute',
    top: 10,
    left: 3,
    height: 1.5,
    borderRadius: 1,
  },
});

export default DocumentFileIcon;
