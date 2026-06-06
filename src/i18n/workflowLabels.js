/**
 * Workflow i18n helpers — UI labels only; SQLite values stay English.
 */

/** Localize dropdown options using optional labelKey → workflow:dropdowns.* */
export const localizeDropdownOptions = (options, t) =>
  (options ?? []).map((opt) => ({
    ...opt,
    label: opt.labelKey
      ? t(`dropdowns.${opt.labelKey}`, { defaultValue: opt.label })
      : opt.label,
  }));

/** Step title for hub cards and progress slots. */
export const getStepTitle = (screenType, t) =>
  t(`steps.${screenType}.title`, { defaultValue: screenType });

/** Progress slot description (may differ from hub card description). */
export const getStepProgressDescription = (screenType, t) =>
  t(`steps.${screenType}.progressDescription`, {
    defaultValue: t(`steps.${screenType}.description`, { defaultValue: '' }),
  });

/** ScreenLayout header title. */
export const getStepScreenTitle = (screenType, t) =>
  t(`steps.${screenType}.screenTitle`, {
    defaultValue: getStepTitle(screenType, t),
  });
