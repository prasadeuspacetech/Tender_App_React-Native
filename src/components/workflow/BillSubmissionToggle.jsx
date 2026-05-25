import React from 'react';

import FormToggleField from '../FormToggleField';

/**
 * Bill submitted toggle — Step 11.
 */
const BillSubmissionToggle = ({ value = false, onToggle, disabled = false }) => (
  <FormToggleField
    label="Bill submitted?"
    rowLabelOn="Bill submitted"
    rowLabelOff="Bill not submitted"
    value={value}
    onToggle={onToggle}
    disabled={disabled}
  />
);

export default BillSubmissionToggle;
