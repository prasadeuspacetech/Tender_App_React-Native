// // src/screens/AddWork/workflow/WorkProgressTrackingScreen.jsx
// // Step 9 of 10: Work Progress Tracking

// import React, { useState } from 'react';
// import { View, StyleSheet, Alert } from 'react-native';

// import ScreenLayout     from '../../../components/layouts/Screenlayout';     // ✅
// import WorkflowProgress from '../../../components/layouts/Workflowprogress'; // ✅
// import ProgressSlot     from '../../../components/layouts/Progressslot';     // ✅
// import Inputboxfield    from '../../../components/Inputboxfield';              // ✅
// import PrimaryButton    from '../../../components/PrimaryButton';              // ✅

// import useDraftStore      from '../../../store/useDraftStore';
// import useSaveAndContinue from '../../../hooks/useSaveAndContinue';
// import { WORKFLOW_ROUTES, TOTAL_WORKFLOW_STEPS } from '../../../constants/WorkflowSteps'; // ✅
// import theme from '../../../theme';

// const persistStep = async (workId, _data) => workId;

// const WorkProgressTrackingScreen = ({ navigation }) => {
//   const { setDraft } = useDraftStore();
//   const [form, setForm] = useState({ progress_percentage: '', progress_notes: '' });

//   const update = (key, val) => {
//     setForm((p) => { const u = { ...p, [key]: val }; setDraft('workProgressTracking', u); return u; });
//   };

//   const { saveAndContinue, isSaving } = useSaveAndContinue(
//     'workProgressTracking', persistStep, WORKFLOW_ROUTES.BILL_SUBMISSION,
//   );

//   return (
//     <ScreenLayout title="Work Progress Tracking" showBack showNotification scrollable keyboardAware
//       onBackPress={() => navigation.goBack()}>
//       <WorkflowProgress currentStep={9} totalSteps={TOTAL_WORKFLOW_STEPS}
//         showPercentage style={styles.progress} />
//       <ProgressSlot step={9} title="Work Progress Tracking"
//         description="Track work completion progress" screenType="workProgress" />

//       <View style={styles.form}>
//         <Inputboxfield label="Progress (%)" placeholder="0 - 100" type="number"
//           value={form.progress_percentage} onChangeText={(v) => update('progress_percentage', v)} />
//         <Inputboxfield label="Progress Notes" placeholder="Describe current status"
//           value={form.progress_notes} onChangeText={(v) => update('progress_notes', v)}
//           multiline numberOfLines={3} />
//       </View>

//       <PrimaryButton title="Save & Continue" loading={isSaving} fullWidth style={styles.cta}
//         onPress={() => saveAndContinue(form, navigation, {
//           onValidationFail: (m) => Alert.alert('Save Failed', m),
//         })} />
//     </ScreenLayout>
//   );
// };

// const styles = StyleSheet.create({
//   progress: { marginBottom: theme.Spacing?.sm ?? 8  },
//   form:     { marginTop:    theme.Spacing?.sm ?? 8  },
//   cta:      { marginTop:    theme.Spacing?.lg ?? 24, marginBottom: theme.Spacing?.xl ?? 32 },
// });

// export default WorkProgressTrackingScreen;