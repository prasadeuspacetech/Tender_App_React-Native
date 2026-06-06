// src/screens/AddWork/AddWorkScreen.jsx
//
// Entry point of the Tender Workflow System.
// Lists all workflow steps as tappable NavigationCards.
//
// Card state from works.workflow_step (see deriveStepStatus):
//   completed — step saved via Save & Continue (green check)
//   pending   — current step, not yet advanced (yellow indicator)
//   locked    — future steps (grey lock, not tappable)

import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import ScreenLayout from '../../components/layouts/Screenlayout';
import NavigationCard from '../../components/Navigationcard';
import SettingsDrawer from '../../components/Settingsdrawer';
import WorkflowStepBadge from '../../components/workflow/WorkflowStepBadge';

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
import { getStepTitle } from '../../i18n/workflowLabels';

const AddWorkScreen = ({ navigation }) => {
  const { t } = useTranslation('workflow');
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { currentWork, currentWorkId, refreshCurrentWork, clearCurrentWork } =
    useWorkStore();
  const clearAllDrafts = useDraftStore((state) => state.clearAllDrafts);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      refreshCurrentWork();
    });
    return unsubscribe;
  }, [navigation, refreshCurrentWork]);

  const workflowStep = currentWork?.workflow_step ?? 1;
  const effectiveWorkflowStep =
    workflowStep >= WORKFLOW_ALL_COMPLETE_STEP
      ? WORKFLOW_ALL_COMPLETE_STEP
      : workflowStep;

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
        title={t('hub.title')}
        headerTitleStyle={styles.heroTitle}
      >
        {currentWorkId ? (
          <TouchableOpacity
            onPress={handleStartNewWork}
            accessibilityRole="button"
            accessibilityLabel={t('hub.startNewWorkAccessibility')}
            style={styles.newWorkButton}
          >
            <Text style={styles.newWorkText}>{t('hub.startNewWork')}</Text>
          </TouchableOpacity>
        ) : null}

        <View style={styles.cardList}>
          {WORKFLOW_STEPS.map((step) => {
            const status = deriveStepStatus(step.id, effectiveWorkflowStep);
            const isLocked = status === 'locked';
            const isPending = status === 'pending';

            return (
              <NavigationCard
                key={step.id}
                title={getStepTitle(step.screenType, t)}
                disabled={isLocked}
                emphasis={isPending ? 'pending' : 'none'}
                onPress={() => handleStepPress(step, status)}
                leftIcon={<WorkflowStepBadge status={status} />}
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

const styles = StyleSheet.create({
  heroTitle: {
    fontFamily: FontFamily.bold,
    fontWeight: FontWeight.bold,
    fontSize: 18,
    color: Colors.textInverse,
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
