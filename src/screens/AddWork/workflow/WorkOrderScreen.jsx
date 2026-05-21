// src/screens/AddWork/workflow/WorkOrderScreen.jsx
// Step 8 of 10: Work Order / Start Work  →  renamed header: "Work Progress Tracking"
//
// Figma changes from stub:
//   - Screen title  : "Work Progress Tracking"
//   - ProgressSlot  : description → "Work order issued / Work started"
//   - Form area     : TWO date inputs REMOVED entirely
//   - Added         : Overall progress card (circle ring + linear bar + timestamp)
//   - No new inputs, no new DB fields — display-only card as per Figma

import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';

import ScreenLayout     from '../../../components/layouts/Screenlayout';
import WorkflowProgress from '../../../components/layouts/Workflowprogress';
import ProgressSlot     from '../../../components/layouts/Progressslot';
import PrimaryButton    from '../../../components/PrimaryButton';

import useWorkStore       from '../../../store/useWorkStore';
import useSaveAndContinue from '../../../hooks/useSaveAndContinue';
import { WORKFLOW_ROUTES, TOTAL_WORKFLOW_STEPS } from '../../../constants/WorkflowSteps';
import theme from '../../../theme';

// ─── Colour tokens ────────────────────────────────────────────────────────────
const RING_COLOR    = '#1D6B43';   // dark green — matches Figma ring
const RING_TRACK    = '#D9EDE2';   // light green-gray track
const BAR_COLOR     = '#062E52';   // navy fill — matches Figma linear bar
const BAR_TRACK     = '#D5D5D5';   // gray empty track
const WHITE         = theme.Colors?.white ?? '#FFFFFF';
const TEXT          = theme.Colors?.text  ?? '#1A1A1A';
const SECONDARY     = theme.Colors?.secondary ?? '#777777';

// ─── Circular progress ring (pure View, no SVG, no library) ──────────────────
// Uses the two-half-clip technique standard for React Native.
//
//  How it works:
//   1. Full gray track circle behind everything.
//   2. Right clip container (x: half → size, overflow hidden)
//      → rotated inner circle reveals the RIGHT arc from 0° → min(deg, 180°)
//   3. Left clip container  (x: 0 → half, overflow hidden)
//      → rotated inner circle reveals the LEFT  arc from 180° → deg  (if deg > 180)
const ProgressRing = ({ percent = 0, size = 90, strokeWidth = 9 }) => {
  const half  = size / 2;
  const deg   = (Math.min(Math.max(percent, 0), 100) / 100) * 360;
  const rightDeg = Math.min(deg, 180);
  const leftDeg  = Math.max(0, deg - 180);

  return (
    <View style={{ width: size, height: size }}>
      {/* ── Gray track ──────────────────────────────────────────────────── */}
      <View
        style={{
          position: 'absolute', width: size, height: size,
          borderRadius: half,
          borderWidth: strokeWidth,
          borderColor: RING_TRACK,
        }}
      />

      {/* ── Right half: 0° → min(deg, 180°) ─────────────────────────────── */}
      <View
        style={{
          position: 'absolute', top: 0, left: half,
          width: half, height: size, overflow: 'hidden',
        }}
      >
        <View
          style={{
            position: 'absolute', top: 0, left: -half,
            width: size, height: size,
            borderRadius: half,
            borderWidth: strokeWidth,
            borderColor: RING_COLOR,
            transform: [{ rotate: `${rightDeg - 90}deg` }],
          }}
        />
      </View>

      {/* ── Left half: 180° → deg (only when deg > 180°) ─────────────────── */}
      {leftDeg > 0 && (
        <View
          style={{
            position: 'absolute', top: 0, left: 0,
            width: half, height: size, overflow: 'hidden',
          }}
        >
          <View
            style={{
              position: 'absolute', top: 0, left: 0,
              width: size, height: size,
              borderRadius: half,
              borderWidth: strokeWidth,
              borderColor: RING_COLOR,
              transform: [{ rotate: `${leftDeg - 90}deg` }],
            }}
          />
        </View>
      )}
    </View>
  );
};

// ─── Overall progress card ────────────────────────────────────────────────────
const OverallProgressCard = ({ percent = 0 }) => {
  const now      = new Date();
  const timeStr  = now.toLocaleTimeString('en-IN', {
    hour:   '2-digit',
    minute: '2-digit',
    hour12: true,
  });
  const lastUpdated = `Last updated: today, ${timeStr}`;

  return (
    <View style={cardStyles.card}>
      {/* ── Top row: text left, ring right ─────────────────────────────── */}
      <View style={cardStyles.topRow}>
        <View style={cardStyles.textCol}>
          <Text style={cardStyles.heading}>Overall progress</Text>
          <Text style={cardStyles.percent}>{Math.round(percent)}%</Text>
          <Text style={cardStyles.updated}>{lastUpdated}</Text>
        </View>
        <ProgressRing percent={percent} size={88} strokeWidth={10} />
      </View>

      {/* ── Linear bar ──────────────────────────────────────────────────── */}
      <View style={cardStyles.barTrack}>
        <View style={[cardStyles.barFill, { width: `${Math.round(percent)}%` }]} />
      </View>
    </View>
  );
};

const cardStyles = StyleSheet.create({
  card: {
    borderWidth:   1,
    borderColor:   theme.Colors?.border ?? '#DDDDDD',
    borderRadius:  theme.Radius?.md ?? 12,
    backgroundColor: WHITE,
    padding:       theme.Spacing?.lg ?? 16,
    marginTop:     theme.Spacing?.sm ?? 8,
  },
  topRow: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
    marginBottom:   theme.Spacing?.md ?? 14,
  },
  textCol: {
    flex: 1,
    marginRight: theme.Spacing?.md ?? 12,
  },
  heading: {
    fontSize:      18,
    fontWeight:   '500',
    color:        TEXT,
    marginBottom: 4,
  },
  percent: {
    fontSize:     42,
    fontWeight:   '700',
    color:        TEXT,
    lineHeight:   50,
    letterSpacing: -1,
  },
  updated: {
    fontSize:   theme.FontSize?.xs ?? 11,
    color:      SECONDARY,
    marginTop:  4,
  },

  // ── Linear bar ──────────────────────────────────────────────────────────
  barTrack: {
    height:       13,
    borderRadius: 7,
    backgroundColor: BAR_TRACK,
    overflow:     'hidden',
  },
  barFill: {
    height:       13,
    borderRadius: 7,
    backgroundColor: BAR_COLOR,
  },
});

// ─── Persist stub (no fields to save on this screen) ─────────────────────────
const persistStep = async (workId, _data) => workId;

// ─── Main screen ──────────────────────────────────────────────────────────────
const WorkOrderScreen = ({ navigation }) => {
  const { currentWork } = useWorkStore();

  // Derive progress from workflow_step stored in DB.
  // workflow_step tracks how many steps have been saved; step 8 = 80 %.
  // Clamp to [0, 100] for safety.
  const progressPercent = useMemo(() => {
    const step = currentWork?.workflow_step ?? 8;
    return Math.min(100, Math.round((step / TOTAL_WORKFLOW_STEPS) * 100));
  }, [currentWork]);

  const { saveAndContinue, isSaving } = useSaveAndContinue(
    'workOrder',
    persistStep,
    WORKFLOW_ROUTES.BILL_SUBMISSION,
  );

  return (
    <ScreenLayout
      title="Work Progress Tracking"
      showBack
      showNotification
      scrollable
      keyboardAware
      onBackPress={() => navigation.goBack()}
    >
      <WorkflowProgress
        currentStep={8}
        totalSteps={TOTAL_WORKFLOW_STEPS}
        showPercentage
        style={styles.progress}
      />
      <ProgressSlot
        step={8}
        title="Work Order / Start Work"
        description="Work order issued / Work started"
        screenType="workOrder"
      />

      {/* Overall progress card — no inputs, display-only per Figma */}
      <OverallProgressCard percent={progressPercent} />

      <PrimaryButton
        title="Save & Continue"
        loading={isSaving}
        fullWidth
        style={styles.cta}
        onPress={() =>
          saveAndContinue({}, navigation, {
            onValidationFail: (m) => Alert.alert('Save Failed', m),
          })
        }
      />
    </ScreenLayout>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  progress: { marginBottom: theme.Spacing?.sm ?? 8 },
  cta:      { marginTop: theme.Spacing?.lg ?? 24, marginBottom: theme.Spacing?.xl ?? 32 },
});

export default WorkOrderScreen;