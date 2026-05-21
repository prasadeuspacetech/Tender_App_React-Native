import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

const ReportInfoBanner = ({
  children = '₹58L of ₹160L total budget used (36%). 3 works need urgent follow-up before year-end.',
  style,
}) => (
  <View style={[styles.banner, style]}>
    <View style={styles.iconWrap}>
      <Ionicons name="information-circle" size={22} color="#1A75BF" />
    </View>
    <Text style={styles.text}>{children}</Text>
  </View>
);

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#EDF5FC',
    borderWidth: 1,
    borderColor: '#ADCFED',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  iconWrap: {
    marginRight: 10,
    marginTop: 1,
  },
  text: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    color: '#0A3D6B',
    lineHeight: 19,
  },
});

export default ReportInfoBanner;
