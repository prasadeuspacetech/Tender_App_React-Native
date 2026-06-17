// // src/constants/dropdownOptions.js
// // ─────────────────────────────────────────────────────────────────────────────
// // Centralised dropdown option lists and dependent-field maps.
// // All values are stored as plain strings so SQLite WHERE-clause filtering
// // remains trivial:   WHERE financial_year = '2025-26'
// // ─────────────────────────────────────────────────────────────────────────────

// // ─── Financial Year ───────────────────────────────────────────────────────────
// // Label === value intentionally – keeps SQLite filtering simple.
// export const FINANCIAL_YEAR_OPTIONS = [
//   { label: '2023-24', value: '2023-24' },
//   { label: '2024-25', value: '2024-25' },
//   { label: '2025-26', value: '2025-26' },
//   { label: '2026-27', value: '2026-27' },
//   { label: '2027-28', value: '2027-28' },
// ];

// // ─── Ward ─────────────────────────────────────────────────────────────────────
// export const WARD_OPTIONS = [
//   { label: 'Ward 1',  value: 'ward_1'  },
//   { label: 'Ward 2',  value: 'ward_2'  },
//   { label: 'Ward 3',  value: 'ward_3'  },
//   { label: 'Ward 4',  value: 'ward_4'  },
//   { label: 'Ward 5',  value: 'ward_5'  },
//   { label: 'Ward 6',  value: 'ward_6'  },
//   { label: 'Ward 7',  value: 'ward_7'  },
//   { label: 'Ward 8',  value: 'ward_8'  },
//   { label: 'Ward 9',  value: 'ward_9'  },
//   { label: 'Ward 10', value: 'ward_10' },
// ];

// // ─── Department ───────────────────────────────────────────────────────────────
// export const DEPARTMENT_OPTIONS = [
//   { label: 'Engineering',          value: 'engineering'          },
//   { label: 'Health & Sanitation',  value: 'health_sanitation'    },
//   { label: 'Water Supply',         value: 'water_supply'         },
//   { label: 'Solid Waste Management', value: 'solid_waste'        },
//   { label: 'Urban Planning',       value: 'urban_planning'       },
//   { label: 'Accounts & Finance',   value: 'accounts_finance'     },
//   { label: 'Administration',       value: 'administration'       },
// ];

// // ─── Sub Department (dependent on Department) ─────────────────────────────────
// // Key   → department.value
// // Value → array of sub-department options for that department
// export const SUB_DEPARTMENT_MAP = {
//   engineering: [
//     { label: 'Roads',           value: 'roads'         },
//     { label: 'Drainage',        value: 'drainage'      },
//     { label: 'Civil Works',     value: 'civil_works'   },
//     { label: 'Electrical',      value: 'electrical'    },
//     { label: 'Bridges',         value: 'bridges'       },
//   ],
//   health_sanitation: [
//     { label: 'Public Health',   value: 'public_health' },
//     { label: 'Sanitation',      value: 'sanitation'    },
//     { label: 'Pest Control',    value: 'pest_control'  },
//   ],
//   water_supply: [
//     { label: 'Distribution',   value: 'distribution'  },
//     { label: 'Treatment Plant', value: 'treatment'     },
//     { label: 'Pumping Station', value: 'pumping'       },
//   ],
//   solid_waste: [
//     { label: 'Collection',      value: 'collection'    },
//     { label: 'Disposal',        value: 'disposal'      },
//     { label: 'Recycling',       value: 'recycling'     },
//   ],
//   urban_planning: [
//     { label: 'Zoning',          value: 'zoning'        },
//     { label: 'Development Plan',value: 'dev_plan'      },
//     { label: 'Building Approvals', value: 'building'   },
//   ],
//   accounts_finance: [
//     { label: 'Budget',          value: 'budget'        },
//     { label: 'Audit',           value: 'audit'         },
//     { label: 'Payroll',         value: 'payroll'       },
//   ],
//   administration: [
//     { label: 'HR',              value: 'hr'            },
//     { label: 'Legal',           value: 'legal'         },
//     { label: 'IT & Systems',    value: 'it_systems'    },
//   ],
// };

// /**
//  * Helper — get sub-department options for a given department value.
//  * Returns an empty array if departmentValue is blank or unmapped.
//  *
//  * Usage:
//  *   const subOptions = getSubDepartmentOptions(form.department);
//  */
// export const getSubDepartmentOptions = (departmentValue) => {
//   if (!departmentValue) return [];
//   return SUB_DEPARTMENT_MAP[departmentValue] ?? [];
// };

// // ─── Officer ──────────────────────────────────────────────────────────────────
// export const OFFICER_OPTIONS = [
//   { label: 'Rajesh Kumar',   value: 'rajesh_kumar'   },
//   { label: 'Priya Sharma',   value: 'priya_sharma'   },
//   { label: 'Amit Patil',     value: 'amit_patil'     },
//   { label: 'Suresh Jadhav',  value: 'suresh_jadhav'  },
//   { label: 'Meena Desai',    value: 'meena_desai'    },
//   { label: 'Vinod Kulkarni', value: 'vinod_kulkarni' },
//   { label: 'Sunita Rao',     value: 'sunita_rao'     },
// ];

// src/constants/dropdownOptions.js
//
// Centralized dropdown option arrays for all workflow screens.
// Add new option sets here — never inline them in screen files.
//
// Note: Financial Year uses label === value so SQLite queries stay simple:
//   WHERE financial_year = '2025-26'

// ─── Work Details ─────────────────────────────────────────────────────────────

export const FINANCIAL_YEAR_OPTIONS = [
  { label: '2023-24', value: '2023-24' },
  { label: '2024-25', value: '2024-25' },
  { label: '2025-26', value: '2025-26' },
  { label: '2026-27', value: '2026-27' },
  { label: '2027-28', value: '2027-28' },
];

/** Dashboard / Reports header dropdown — newest FY first, display prefix only. */
export const FINANCIAL_YEAR_HEADER_OPTIONS = [...FINANCIAL_YEAR_OPTIONS]
  .reverse()
  .map((opt) => ({ label: `FY ${opt.value}`, value: opt.value }));

export const WARD_OPTIONS = [
  { label: 'Ward 1',  value: 'Ward 1'  },
  { label: 'Ward 2',  value: 'Ward 2'  },
  { label: 'Ward 3',  value: 'Ward 3'  },
  { label: 'Ward 4',  value: 'Ward 4'  },
  { label: 'Ward 5',  value: 'Ward 5'  },
  { label: 'Ward 6',  value: 'Ward 6'  },
  { label: 'Ward 7',  value: 'Ward 7'  },
  { label: 'Ward 8',  value: 'Ward 8'  },
  { label: 'Ward 9',  value: 'Ward 9'  },
  { label: 'Ward 10', value: 'Ward 10' },
  { label: 'Ward 11', value: 'Ward 11' },
  { label: 'Ward 12', value: 'Ward 12' },
];

export const DEPARTMENT_OPTIONS = [
  { label: 'Road Dept',        value: 'Road Dept'        },
  { label: 'Water Dept',       value: 'Water Dept'       },
  { label: 'Sanitation Dept',  value: 'Sanitation Dept'  },
  { label: 'Garden Dept',      value: 'Garden Dept'      },
  { label: 'Electric Dept',    value: 'Electric Dept'    },
];

export const SUB_DEPARTMENT_MAP = {
  'Road Dept':       [{ label: 'Road Construction', value: 'Road Construction' }, { label: 'Road Repair', value: 'Road Repair' }],
  'Water Dept':      [{ label: 'Pipeline',           value: 'Pipeline'           }, { label: 'Water Supply', value: 'Water Supply' }],
  'Sanitation Dept': [{ label: 'Drainage',           value: 'Drainage'           }, { label: 'Waste Mgmt',  value: 'Waste Mgmt'  }],
  'Garden Dept':     [{ label: 'Parks',              value: 'Parks'              }, { label: 'Nursery',     value: 'Nursery'     }],
  'Electric Dept':   [{ label: 'Street Lights',      value: 'Street Lights'      }, { label: 'Maintenance', value: 'Maintenance' }],
};

export const getSubDepartmentOptions = (departmentValue) =>
  SUB_DEPARTMENT_MAP[departmentValue] ?? [];

export const OFFICER_OPTIONS = [
  { label: 'Officer A', value: 'Officer A' },
  { label: 'Officer B', value: 'Officer B' },
  { label: 'Officer C', value: 'Officer C' },
];

// ─── PMC Approval ─────────────────────────────────────────────────────────────

export const FINANCE_APPROVAL_STATUS_OPTIONS = [
  { label: 'Pending',  value: 'Pending'  },
  { label: 'Approved', value: 'Approved' },
  { label: 'Rejected', value: 'Rejected' },
];

export const WORK_COMPLETED_OPTIONS = [
  { label: 'Pending',     value: 'Pending'     },
  { label: 'In Progress', value: 'In Progress' },
  { label: 'Completed',   value: 'Completed'   },
];

// ─── Contractor Assignment ──────────────────────────────────────────────────────

export const CONTRACTOR_ESTIMATE_OPTIONS = [
  { label: 'Above', value: 'above', labelKey: 'above' },
  { label: 'Below', value: 'below', labelKey: 'below' },
];