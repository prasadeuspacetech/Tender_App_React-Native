// src/navigation/WorkflowNavigator.jsx — 11-step workflow stack

import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import { WORKFLOW_ROUTES } from '../constants/WorkflowSteps';
import { Colors } from '../theme';

import AddWorkScreen from '../screens/AddWork/AddWorkScreen';
import BillSubmissionWorkflowScreen from '../screens/AddWork/workflow/BillSubmissionWorkflowScreen';
import ContractorAssignmentScreen from '../screens/AddWork/workflow/ContractorAssignmentScreen';
import EstimationScreen from '../screens/AddWork/workflow/EstimationScreen';
import PaymentStatusScreen from '../screens/AddWork/workflow/PaymentStatusScreen';
import PmcApprovalScreen from '../screens/AddWork/workflow/PmcApprovalScreen';
import ReTenderScreen from '../screens/AddWork/workflow/ReTenderScreen';
import SanctionApprovalScreen from '../screens/AddWork/workflow/SanctionApprovalScreen';
import TenderCreationScreen from '../screens/AddWork/workflow/TenderCreationScreen';
import WorkDetailsScreen from '../screens/AddWork/workflow/WorkDetailsScreen';
import WorkOrderScreen from '../screens/AddWork/workflow/WorkOrderScreen';
import WorkProgressTrackingScreen from '../screens/AddWork/workflow/WorkProgressTrackingScreen';

const Stack = createNativeStackNavigator();

const SCREEN_OPTIONS = {
  headerShown: false,
  animation: 'slide_from_right',
  contentStyle: { backgroundColor: Colors.bgScreen },
};

const WorkflowNavigator = () => (
  <Stack.Navigator screenOptions={SCREEN_OPTIONS}>
    <Stack.Screen name={WORKFLOW_ROUTES.ADD_WORK} component={AddWorkScreen} />
    <Stack.Screen name={WORKFLOW_ROUTES.WORK_DETAILS} component={WorkDetailsScreen} />
    <Stack.Screen name={WORKFLOW_ROUTES.PMC_APPROVAL} component={PmcApprovalScreen} />
    <Stack.Screen name={WORKFLOW_ROUTES.ESTIMATION} component={EstimationScreen} />
    <Stack.Screen name={WORKFLOW_ROUTES.TENDER_CREATION} component={TenderCreationScreen} />
    <Stack.Screen name={WORKFLOW_ROUTES.RE_TENDER} component={ReTenderScreen} />
    <Stack.Screen
      name={WORKFLOW_ROUTES.CONTRACTOR_ASSIGNMENT}
      component={ContractorAssignmentScreen}
    />
    <Stack.Screen
      name={WORKFLOW_ROUTES.SANCTION_APPROVAL}
      component={SanctionApprovalScreen}
    />
    <Stack.Screen name={WORKFLOW_ROUTES.WORK_ORDER} component={WorkOrderScreen} />
    <Stack.Screen
      name={WORKFLOW_ROUTES.WORK_PROGRESS}
      component={WorkProgressTrackingScreen}
    />
    <Stack.Screen
      name={WORKFLOW_ROUTES.PAYMENT_STATUS}
      component={PaymentStatusScreen}
    />
    <Stack.Screen
      name={WORKFLOW_ROUTES.BILL_SUBMISSION}
      component={BillSubmissionWorkflowScreen}
    />
  </Stack.Navigator>
);

export default WorkflowNavigator;
