// src/constants/workflowSteps.js
//
// Single source of truth: routes, step order (11 steps), hub gating.

export const WORKFLOW_ROUTES = {
  ADD_WORK: 'AddWork',
  WORK_DETAILS: 'WorkDetails',
  PMC_APPROVAL: 'PmcApproval',
  ESTIMATION: 'Estimation',
  TENDER_CREATION: 'TenderCreation',
  RE_TENDER: 'ReTender',
  CONTRACTOR_ASSIGNMENT: 'ContractorAssignment',
  SANCTION_APPROVAL: 'SanctionApproval',
  WORK_ORDER: 'WorkOrder',
  WORK_PROGRESS: 'WorkProgress',
  PAYMENT_STATUS: 'PaymentStatus',
  BILL_SUBMISSION: 'BillSubmission',
};

export const WORKFLOW_STEPS = [
  {
    id: 1,
    route: WORKFLOW_ROUTES.WORK_DETAILS,
    title: 'Work Details',
    screenType: 'workDetails',
    description: 'Enter basic work information',
    optional: false,
  },
  {
    id: 2,
    route: WORKFLOW_ROUTES.PMC_APPROVAL,
    title: 'PMC Approval',
    screenType: 'pmcApproval',
    description: 'Upload PMC letter and get approval',
    optional: false,
  },
  {
    id: 3,
    route: WORKFLOW_ROUTES.ESTIMATION,
    title: 'Estimation',
    screenType: 'estimation',
    description: 'Confirm estimation status',
    optional: false,
  },
  {
    id: 4,
    route: WORKFLOW_ROUTES.TENDER_CREATION,
    title: 'Tender Creation',
    screenType: 'tenderCreation',
    description: 'Create the tender for this work',
    optional: false,
  },
  {
    id: 5,
    route: WORKFLOW_ROUTES.RE_TENDER,
    title: 'Re-Tender (Optional)',
    screenType: 'reTender',
    description: 'Re-tender if original tender failed',
    optional: true,
  },
  {
    id: 6,
    route: WORKFLOW_ROUTES.CONTRACTOR_ASSIGNMENT,
    title: 'Contractor Assignment',
    screenType: 'contractorAssignment',
    description: 'Assign contractor for the work',
    optional: false,
  },
  {
    id: 7,
    route: WORKFLOW_ROUTES.SANCTION_APPROVAL,
    title: 'Sanction Approval',
    screenType: 'sanctionApproval',
    description: 'Get sanction approval for work order',
    optional: false,
  },
  {
    id: 8,
    route: WORKFLOW_ROUTES.WORK_ORDER,
    title: 'Work Order',
    screenType: 'workOrder',
    description: 'Work order issued / work started',
    optional: false,
  },
  {
    id: 9,
    route: WORKFLOW_ROUTES.WORK_PROGRESS,
    title: 'Work Progress',
    screenType: 'workProgress',
    description: 'Track work completion progress',
    optional: false,
  },
  {
    id: 10,
    route: WORKFLOW_ROUTES.PAYMENT_STATUS,
    title: 'Payment Status',
    screenType: 'paymentStatus',
    description: 'Track payment release and amount paid',
    optional: false,
  },
  {
    id: 11,
    route: WORKFLOW_ROUTES.BILL_SUBMISSION,
    title: 'Bill Submission',
    screenType: 'billSubmission',
    description: 'Submit bill details and documents',
    optional: false,
  },
];

export const TOTAL_WORKFLOW_STEPS = WORKFLOW_STEPS.length;

/** workflow_step value when all steps are saved */
export const WORKFLOW_ALL_COMPLETE_STEP = TOTAL_WORKFLOW_STEPS + 1;

export const getStepByRoute = (route) =>
  WORKFLOW_STEPS.find((s) => s.route === route) ?? null;

export const getStepById = (id) =>
  WORKFLOW_STEPS.find((s) => s.id === id) ?? null;

export const getNextRoute = (currentRoute) => {
  const idx = WORKFLOW_STEPS.findIndex((s) => s.route === currentRoute);
  if (idx === -1 || idx === WORKFLOW_STEPS.length - 1) return null;
  return WORKFLOW_STEPS[idx + 1].route;
};

/**
 * Card state for Add Work hub from works.workflow_step:
 *   completed — Save & Continue done for that step (step.id < workflow_step)
 *   pending   — current unlocked step, not yet advanced (step.id === workflow_step)
 *   locked    — not reachable yet (step.id > workflow_step)
 */
export const deriveStepStatus = (stepId, workflowStep) => {
  const current = Number(workflowStep) || 1;
  if (stepId < current) return 'completed';
  if (stepId === current) return 'pending';
  return 'locked';
};

export const isStepLocked = (stepId, workflowStep) =>
  deriveStepStatus(stepId, workflowStep) === 'locked';
