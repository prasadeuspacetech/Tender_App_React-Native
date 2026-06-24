import {
  getStepById,
  WORKFLOW_ALL_COMPLETE_STEP,
  WORKFLOW_STEPS,
} from '../constants/WorkflowSteps';

const SCREEN_TYPE_I18N = {
  workDetails: 'steps.workDetails.title',
  pmcApproval: 'steps.pmcApproval.title',
  estimation: 'steps.estimation.title',
  tenderCreation: 'steps.tenderCreation.title',
  reTender: 'steps.reTender.title',
  contractorAssignment: 'steps.contractorAssignment.title',
  sanctionApproval: 'steps.sanctionApproval.title',
  workOrder: 'steps.workOrder.title',
  workProgress: 'steps.workProgress.title',
  paymentStatus: 'steps.paymentStatus.title',
  billSubmission: 'steps.billSubmission.title',
};

/** Localized workflow step title for PDF / reports. */
export const getWorkflowStepTitle = (i18n, workflowStep, { allCompleteKey } = {}) => {
  const stepNum = Number(workflowStep) || 1;

  if (stepNum >= WORKFLOW_ALL_COMPLETE_STEP) {
    return allCompleteKey
      ? i18n.t(allCompleteKey, { ns: 'reports' })
      : WORKFLOW_STEPS[WORKFLOW_STEPS.length - 1]?.title ?? '';
  }

  const step = getStepById(stepNum) ?? WORKFLOW_STEPS[0];
  const i18nKey = SCREEN_TYPE_I18N[step.screenType];
  if (i18nKey) {
    return i18n.t(i18nKey, { ns: 'workflow', defaultValue: step.title });
  }
  return step.title;
};
