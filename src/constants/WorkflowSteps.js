// src/constants/workflowSteps.js
//
// Single source of truth for:
//   - Route name strings (never type them anywhere else)
//   - Workflow step metadata (title, screenType, description)
//   - Step order (id drives WorkflowProgress currentStep)
//
// FINAL workflow: 9 steps (see WORKFLOW_STEPS).

// ─── Route name constants ─────────────────────────────────────────────────────
export const WORKFLOW_ROUTES = {
  ADD_WORK: 'AddWork',
  WORK_DETAILS: 'WorkDetails',
  PMC_APPROVAL: 'PmcApproval',
  ESTIMATION: 'Estimation',
  TENDER_CREATION: 'TenderCreation',
  RE_TENDER: 'ReTender',
  CONTRACTOR_ASSIGNMENT: 'ContractorAssignment',
  SANCTION_APPROVAL: 'SanctionApproval',
  // Step 8 — Payment Status (screen file: BillSubmissionScreen.jsx)
  PAYMENT_STATUS: 'BillSubmission',
  BILL_SUBMISSION: 'BillSubmission',
  COMPLETION_CLOSURE: 'CompletionClosure',
};

// ─── Ordered step definitions (9 steps) ───────────────────────────────────────
// id        → step number shown in WorkflowProgress / ProgressSlot
// route     → stack screen name
// workflow_step in SQLite = id of the active step (1–9); 10 = all steps completed
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
    route: WORKFLOW_ROUTES.PAYMENT_STATUS,
    title: 'Payment Status',
    screenType: 'paymentStatus',
    description: 'Track payment release and amount paid',
    optional: false,
  },
  {
    id: 9,
    route: WORKFLOW_ROUTES.COMPLETION_CLOSURE,
    title: 'Completion & Closure',
    screenType: 'completionClosure',
    description: 'Mark work completion and close workflow',
    optional: false,
  },
];

export const TOTAL_WORKFLOW_STEPS = WORKFLOW_STEPS.length;

// workflow_step after step 9 is saved — all hub cards show completed
export const WORKFLOW_ALL_COMPLETE_STEP = TOTAL_WORKFLOW_STEPS + 1;

export const getStepByRoute = (route) =>
  WORKFLOW_STEPS.find((s) => s.route === route) ?? null;

export const getNextRoute = (currentRoute) => {
  const idx = WORKFLOW_STEPS.findIndex((s) => s.route === currentRoute);
  if (idx === -1 || idx === WORKFLOW_STEPS.length - 1) return null;
  return WORKFLOW_STEPS[idx + 1].route;
};

// Hub gating: workflow_step = next active step id (1–9); 10 = finished
export const deriveStepStatus = (stepId, workflowStep) => {
  if (stepId < workflowStep) return 'completed';
  if (stepId === workflowStep) return 'active';
  return 'locked';
};

export const isStepLocked = (stepId, workflowStep) =>
  deriveStepStatus(stepId, workflowStep) === 'locked';
