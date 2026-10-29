// Shared analysis-team rules for AnalysisTeam.astro's server render AND its
// client-added rows, so both group and label members identically.

/** The review unit a non-Responsible member groups under: their district when
 *  their `detail` names one (district staff of any title), else Headquarters. */
export const teamUnitOf = (detail: string | undefined): string =>
  detail && / District$/.test(detail) ? detail : 'Headquarters';

/** The row's second line ("role · detail"), minus whatever the group heading
 *  already says — a District reviewer under "Mendocino District" reads "District
 *  reviewer"; the Responsible analyst under their heading reads just their division. */
export const roleLine = (role: string, detail: string | undefined, groupLabel: string): string =>
  [role, detail].filter((p): p is string => !!p && p !== groupLabel).join(' · ');
