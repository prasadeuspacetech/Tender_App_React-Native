// src/hooks/useWorkflowStepGuard.js
//
// Redirects to Add Work hub when user opens a locked workflow screen
// (step.id > works.workflow_step). Step 1 is always allowed (creates work).

import { useEffect } from 'react';
import useWorkStore from '../store/useWorkStore';
import {
  getStepByRoute,
  WORKFLOW_ROUTES,
} from '../constants/WorkflowSteps';

const useWorkflowStepGuard = (routeName, navigation) => {
  const { currentWorkId, currentWork } = useWorkStore();

  useEffect(() => {
    const check = () => {
      const step = getStepByRoute(routeName);
      if (!step) return;

      if (step.id === 1) return;

      if (!currentWorkId) {
        navigation.replace(WORKFLOW_ROUTES.ADD_WORK);
        return;
      }

      const workflowStep = currentWork?.workflow_step ?? 1;
      if (step.id > workflowStep) {
        navigation.replace(WORKFLOW_ROUTES.ADD_WORK);
      }
    };

    const unsubscribe = navigation.addListener('focus', check);
    check();
    return unsubscribe;
  }, [routeName, navigation, currentWorkId, currentWork?.workflow_step]);
};

export default useWorkflowStepGuard;
