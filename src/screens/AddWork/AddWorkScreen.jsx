// src/screens/AddWork/AddWorkScreen.jsx
//
// Entry point of the Tender Workflow System.
// Lists all workflow steps as tappable NavigationCards.
//
// Workflow gating logic:
//   workflow_step in SQLite tracks the highest completed step.
//   Each card derives its state from currentWork.workflow_step:
//     completed → step.id <  workflow_step  (already saved)
//     active    → step.id === workflow_step  (current step)
//     locked    → step.id >  workflow_step  (not yet unlocked)
//
//   NavigationCard receives disabled={locked} to prevent tapping.
//   A status badge (✓ / lock icon) is shown on each card's left side.

import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import ScreenLayout   from '../../components/layouts/Screenlayout';
import NavigationCard from '../../components/Navigationcard';
import SettingsDrawer from '../../components/Settingsdrawer';

import useWorkStore from '../../store/useWorkStore';
import useDraftStore from '../../store/useDraftStore';

import {
  Colors,
  FontFamily,
  FontSize,
  FontWeight,
  Spacing,
} from '../../theme';

import {
  WORKFLOW_STEPS,
  deriveStepStatus,
  WORKFLOW_ALL_COMPLETE_STEP,
} from '../../constants/WorkflowSteps';

// ─── Badge icons (pure Views, no icon lib) ────────────────────────────────────

const CheckBadge = () => (
  <View style={badge.circle}>
    <View style={badge.tick} />
  </View>
);

const LockBadge = () => (
  <View style={badge.lockWrap}>
    <View style={badge.lockBody} />
    <View style={badge.lockShackle} />
  </View>
);

const badge = StyleSheet.create({
  // ── Check badge ──────────────────────────────────────────────────────────
  circle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#1D6B43',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tick: {
    width: 9,
    height: 5,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderColor: '#FFFFFF',
    transform: [{ rotate: '-45deg' }],
    marginTop: -2,
  },

  // ── Lock badge ────────────────────────────────────────────────────────────
  lockWrap: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockBody: {
    width: 11,
    height: 8,
    borderRadius: 2,
    backgroundColor: '#AAAAAA',
    position: 'absolute',
    bottom: 3,
  },
  lockShackle: {
    width: 7,
    height: 6,
    borderWidth: 2,
    borderColor: '#AAAAAA',
    borderBottomWidth: 0,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    position: 'absolute',
    top: 3,
  },
});

// ─────────────────────────────────────────────────────────────────────────────

const AddWorkScreen = ({ navigation }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { currentWork, currentWorkId, refreshCurrentWork, clearCurrentWork } =
    useWorkStore();
  const clearAllDrafts = useDraftStore((state) => state.clearAllDrafts);

  // Refresh currentWork from SQLite every time this screen is focused.
  // Covers the case where user completes a step and presses Back.
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      refreshCurrentWork();
    });
    return unsubscribe;
  }, [navigation, refreshCurrentWork]);

  const workflowStep = currentWork?.workflow_step ?? 1;

  const handleStartNewWork = () => {
    clearCurrentWork();
    clearAllDrafts();
  };

  const handleStepPress = (step, status) => {
    if (status === 'locked') return;
    navigation.navigate(step.route);
  };

  return (
    <>
      <ScreenLayout
        showMenu
        showNotification
        scrollable
        onMenuPress={() => setDrawerOpen(true)}
        contentStyle={styles.scrollContent}
        title="Add Work"
        headerTitleStyle={styles.heroTitle}
      >
        {currentWorkId ? (
          <TouchableOpacity
            onPress={handleStartNewWork}
            accessibilityRole="button"
            accessibilityLabel="Start new work"
            style={styles.newWorkButton}
          >
            <Text style={styles.newWorkText}>Start new work</Text>
          </TouchableOpacity>
        ) : null}

        <View style={styles.cardList}>
          {WORKFLOW_STEPS.map((step) => {
            const effectiveWorkflowStep =
              workflowStep >= WORKFLOW_ALL_COMPLETE_STEP
                ? WORKFLOW_ALL_COMPLETE_STEP
                : workflowStep;
            const status = deriveStepStatus(step.id, effectiveWorkflowStep);
            const isLocked    = status === 'locked';
            const isCompleted = status === 'completed';

            return (
              <NavigationCard
                key={step.id}
                title={step.title}
                disabled={isLocked}
                onPress={() => handleStepPress(step, status)}
                leftIcon={
                  isCompleted ? <CheckBadge /> :
                  isLocked    ? <LockBadge />  :
                  null
                }
              />
            );
          })}
        </View>
      </ScreenLayout>

      <SettingsDrawer
        visible={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  heroTitle: {
    fontFamily: FontFamily.bold,
    fontWeight: FontWeight.bold,
    fontSize:   FontSize.xxl,
    color:      Colors.textInverse,
    letterSpacing: 0.2,
  },
  scrollContent: {
    paddingTop: 0,
  },
  newWorkButton: {
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
    alignSelf: 'flex-start',
  },
  newWorkText: {
    fontSize: FontSize.sm,
    fontFamily: FontFamily.regular,
    color: Colors.primaryLight,
    textDecorationLine: 'underline',
  },
  cardList: {
    marginTop: Spacing.md,
  },
});

export default AddWorkScreen;