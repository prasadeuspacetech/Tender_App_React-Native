/**
 * Derives OFF-state row text from ON-state label for large workflow toggles.
 * Used when rowLabelOff is not passed explicitly.
 */

export const deriveToggleOffLabel = (onLabel) => {
  if (onLabel == null || typeof onLabel !== 'string') return onLabel ?? '';

  const trimmed = onLabel.trim().replace(/\?+$/, '').trim();
  if (!trimmed) return '';

  if (/\bdone\b/i.test(trimmed)) {
    return trimmed.replace(/\bdone\b/i, 'not done');
  }
  if (/\breleased\b/i.test(trimmed)) {
    return trimmed.replace(/\breleased\b/i, 'not released');
  }
  if (/\brequired\b/i.test(trimmed)) {
    return trimmed.replace(/\brequired\b/i, 'not required');
  }
  if (/\bsubmitted\b/i.test(trimmed)) {
    return trimmed.replace(/\bsubmitted\b/i, 'not submitted');
  }
  if (/\benabled\b/i.test(trimmed)) {
    return trimmed.replace(/\benabled\b/i, 'not enabled');
  }
  if (/^enable\s+/i.test(trimmed)) {
    const rest = trimmed.replace(/^enable\s+/i, '').trim();
    if (!rest) return 'Not enabled';
    const phrase = rest.charAt(0).toUpperCase() + rest.slice(1);
    return `${phrase} not enabled`;
  }

  if (/^not\s/i.test(trimmed)) return trimmed;
  return `Not ${trimmed.charAt(0).toLowerCase()}${trimmed.slice(1)}`;
};

export const resolveToggleRowLabel = (value, { rowLabelOn, rowLabelOff, rowLabel, label }) => {
  const onText = (rowLabelOn ?? rowLabel ?? label ?? '').trim();
  const offText = (rowLabelOff ?? deriveToggleOffLabel(onText)).trim();
  return value ? onText : offText;
};
