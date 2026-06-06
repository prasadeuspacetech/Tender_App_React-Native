import React from 'react';
import { useTranslation } from 'react-i18next';

import FormToggleField from '../FormToggleField';

/**
 * Bill submitted toggle — Step 11.
 */
const BillSubmissionToggle = ({
  value = false,
  onToggle,
  disabled = false,
  helpKey,
  helpText,
  helpTooltipId,
}) => {
  const { t } = useTranslation('workflow');

  return (
    <FormToggleField
      label={t('steps.billSubmission.toggles.label')}
      rowLabelOn={t('steps.billSubmission.toggles.on')}
      rowLabelOff={t('steps.billSubmission.toggles.off')}
      value={value}
      onToggle={onToggle}
      disabled={disabled}
      helpKey={helpKey}
      helpText={helpText}
      helpTooltipId={helpTooltipId}
    />
  );
};

export default BillSubmissionToggle;
