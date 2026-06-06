import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import FormFieldLabel from './FormFieldLabel';
import FormToggleField from '../FormToggleField';
import Inputboxfield from '../Inputboxfield';
import { HelpTooltipScope } from './helpTooltipScope';
import { Colors, FontSize, Spacing } from '../../theme';
import { formFieldStyles } from '../../theme/formFieldStyles';

/**
 * Settings preview — demonstrates helpKey on shared form components.
 */
const HelpTooltipDemo = () => {
  const { t } = useTranslation('settings');
  const [estimateDone, setEstimateDone] = useState(false);

  const labelSamples = [
    {
      id: 'demo-work-name',
      label: t('tooltipDemo.workName.label'),
      helpKey: 'workflow.workDetails.workName',
    },
    {
      id: 'demo-tender-amount',
      label: t('tooltipDemo.tenderAmount.label'),
      helpKey: 'workflow.tenderCreation.tenderAmount',
    },
    {
      id: 'demo-finance-committee',
      label: t('tooltipDemo.financeCommittee.label'),
      helpKey: 'workflow.pmcApproval.financeCommittee',
    },
  ];

  return (
    <HelpTooltipScope>
      <Text style={styles.hint}>{t('tooltipDemo.hint')}</Text>

      {labelSamples.map((sample) => (
        <View key={sample.id} style={styles.sampleBlock}>
          <FormFieldLabel
            label={sample.label}
            helpKey={sample.helpKey}
            helpTooltipId={sample.id}
          />
          <View style={styles.fakeField}>
            <Text style={styles.fakePlaceholder}>{t('tooltipDemo.samplePlaceholder')}</Text>
          </View>
        </View>
      ))}

      <View style={styles.sampleBlock}>
        <Inputboxfield
          label={t('tooltipDemo.budgetCode.label')}
          helpKey="workflow.workDetails.budgetCode"
          helpTooltipId="demo-budget-code"
          placeholder={t('tooltipDemo.samplePlaceholder')}
          value=""
          editable={false}
        />
      </View>

      <View style={styles.sampleBlock}>
        <FormToggleField
          label={t('tooltipDemo.estimationDone.label')}
          helpKey="workflow.estimation.estimationDone"
          helpTooltipId="demo-estimation-done"
          rowLabelOn={t('tooltipDemo.estimationDone.rowOn')}
          rowLabelOff={t('tooltipDemo.estimationDone.rowOff')}
          value={estimateDone}
          onToggle={() => setEstimateDone((v) => !v)}
        />
      </View>
    </HelpTooltipScope>
  );
};

const styles = StyleSheet.create({
  hint: {
    fontSize: FontSize.sm ?? 13,
    color: Colors.textSecondary ?? '#666666',
    marginBottom: Spacing.md,
    lineHeight: 18,
  },
  sampleBlock: {
    marginBottom: Spacing.md,
  },
  fakeField: {
    ...formFieldStyles.control,
    justifyContent: 'center',
    backgroundColor: '#FAFAFA',
  },
  fakePlaceholder: {
    fontSize: 15,
    color: Colors.textSecondary ?? '#AAAAAA',
  },
});

export default HelpTooltipDemo;
