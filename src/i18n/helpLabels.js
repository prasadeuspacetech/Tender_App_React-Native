/**
 * Resolve help tooltip copy from the `help` namespace (UI only).
 */

import i18n from './index';

/** @param {string} helpKey — e.g. workflow.workDetails.workName */
export const getHelpText = (helpKey) => {
  if (!helpKey) return '';
  return i18n.t(helpKey, { ns: 'help', defaultValue: '' }).trim();
};
