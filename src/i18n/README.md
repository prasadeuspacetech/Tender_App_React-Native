# Translations (i18n)

UI-only multilingual support for Tender Tracking. **SQLite values and user-entered data are never translated.**

## Languages

| Code | UI label |
|------|----------|
| `en` | English (default on first launch) |
| `mr` | मराठी |

Preference key: `@tender_app/language` (AsyncStorage).

## Namespaces

| Namespace | Purpose |
|-----------|---------|
| `common` | Shared labels, status chips |
| `navigation` | Tab bar, drawer |
| `settings` | Settings screen |
| `dashboard` | Dashboard |
| `works` | Works list |
| `reports` | Reports |
| `correspondence` | General Correspondence |
| `auth` | Activation / splash |
| `workflow` | Add Work hub + all workflow steps |
| `errors` | Validation, upload alerts, generic save failures |
| `help` | Field help tooltip bodies (`helpKey` → `workflow.<screen>.<field>`) |

## Adding or updating strings

1. Add the key to **both** `locales/en/<namespace>.json` and `locales/mr/<namespace>.json`.
2. Register a new namespace in `index.js` if needed (`resources` + `NAMESPACES`).
3. In React components: `const { t } = useTranslation('namespace');` then `t('key')`.
4. In services / hooks: `import i18n from '../i18n'` or helpers in `alertMessages.js` / `persistErrors.js`.
5. Run the key-parity check (see below) before merging.

### Dropdowns and statuses

- **Stored value** (SQLite): keep English/stable (`Ward 4`, `Pending`, `above`).
- **Display label**: translate via `labelKey` + `localizeDropdownOptions()` or `statusLabels.js`.

### Field help tooltips

- **Labels / placeholders**: `workflow.json` (via form components).
- **Tooltip explanations**: `help.json` — pass `helpKey` to form components or `FormFieldLabel`.
- Example: `helpKey="workflow.workDetails.workName"` → `help.workflow.workDetails.workName`.

#### Form components with optional `helpKey`

| Component | Props |
|-----------|--------|
| `Inputboxfield` | `helpKey`, `helpText`, `helpTooltipId` |
| `NativeDateField` | same (forwarded to `Inputboxfield`) |
| `FormDropdown` | same |
| `FormToggleField` | same (header label row only) |
| `UploadDocument` | `sectionHelpKey`, `sectionHelpText`, `sectionHelpTooltipId` |

Example:

```tsx
<Inputboxfield
  label={t('steps.workDetails.fields.workName.label')}
  helpKey="workflow.workDetails.workName"
  ...
/>
```

Add matching keys to `locales/en/help.json` and `locales/mr/help.json` before shipping.

### Do not translate

- Work names, notes, correspondence subjects, contractor names
- Uploaded filenames
- `route.name` / `screenType` / workflow step ids

## Dev tooling

In `__DEV__`, missing translation keys are logged to the console. Add the key to both locale files when you see:

```text
[i18n] missing key: ...
```

## Key parity check

```bash
node -e "
const en = require('./locales/en/errors.json');
const mr = require('./locales/mr/errors.json');
const keys = (o,p='') => Object.entries(o).flatMap(([k,v]) =>
  typeof v==='object' && v ? keys(v,p+k+'.') : [p+k]);
const ek=new Set(keys(en)), mk=new Set(keys(mr));
console.log('missing in mr:', [...ek].filter(k=>!mk.has(k)));
console.log('extra in mr:', [...mk].filter(k=>!ek.has(k)));
"
```

Replace `errors` with any namespace.

## Manual QA checklist (Phase 5)

- [ ] EN → MR → EN switch mid-session (Settings)
- [ ] SQLite rows unchanged after language switch (work name, contractor, correspondence)
- [ ] Marathi UI + Marathi user input in text fields
- [ ] English UI + Marathi user input in text fields
- [ ] Long Marathi tab labels / workflow buttons (no clipping)
- [ ] Date storage (`formatDateForStorage`) and currency (`formatRupee`) unchanged
- [ ] Upload / save-failed alerts in both languages
