// src/navigation/WorkflowNavigator.jsx
//
// Stack for Add Work tab — FINAL 9-step workflow (no Work Order / Progress).

import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import { WORKFLOW_ROUTES } from '../constants/WorkflowSteps.js';
import { Colors } from '../theme';

import AddWorkScreen from '../screens/AddWork/AddWorkScreen';
import BillSubmissionScreen from '../screens/AddWork/workflow/BillSubmissionScreen';
import CompletionClosureScreen from '../screens/AddWork/workflow/CompletionClosureScreen';
import ContractorAssignmentScreen from '../screens/AddWork/workflow/ContractorAssignmentScreen';
import EstimationScreen from '../screens/AddWork/workflow/EstimationScreen';
import PmcApprovalScreen from '../screens/AddWork/workflow/PmcApprovalScreen';
import ReTenderScreen from '../screens/AddWork/workflow/ReTenderScreen';
import SanctionApprovalScreen from '../screens/AddWork/workflow/SanctionApprovalScreen';
import TenderCreationScreen from '../screens/AddWork/workflow/TenderCreationScreen';
import WorkDetailsScreen from '../screens/AddWork/workflow/WorkDetailsScreen';

const Stack = createNativeStackNavigator();

const SCREEN_OPTIONS = {
  headerShown: false,
  animation: 'slide_from_right',
  contentStyle: { backgroundColor: Colors.bgScreen },
};

const WorkflowNavigator = () => (
  <Stack.Navigator screenOptions={SCREEN_OPTIONS}>
    <Stack.Screen
      name={WORKFLOW_ROUTES.ADD_WORK}
      component={AddWorkScreen}
    />
    <Stack.Screen
      name={WORKFLOW_ROUTES.WORK_DETAILS}
      component={WorkDetailsScreen}
    />
    <Stack.Screen
      name={WORKFLOW_ROUTES.PMC_APPROVAL}
      component={PmcApprovalScreen}
    />
    <Stack.Screen
      name={WORKFLOW_ROUTES.ESTIMATION}
      component={EstimationScreen}
    />
    <Stack.Screen
      name={WORKFLOW_ROUTES.TENDER_CREATION}
      component={TenderCreationScreen}
    />
    <Stack.Screen
      name={WORKFLOW_ROUTES.RE_TENDER}
      component={ReTenderScreen}
    />
    <Stack.Screen
      name={WORKFLOW_ROUTES.CONTRACTOR_ASSIGNMENT}
      component={ContractorAssignmentScreen}
    />
    <Stack.Screen
      name={WORKFLOW_ROUTES.SANCTION_APPROVAL}
      component={SanctionApprovalScreen}
    />
    <Stack.Screen
      name={WORKFLOW_ROUTES.PAYMENT_STATUS}
      component={BillSubmissionScreen}
    />
    <Stack.Screen
      name={WORKFLOW_ROUTES.COMPLETION_CLOSURE}
      component={CompletionClosureScreen}
    />
  </Stack.Navigator>
);

export default WorkflowNavigator;
