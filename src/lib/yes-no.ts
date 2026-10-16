// Yes/no application answers phrased as STATEMENTS — the label itself carries the
// answer ("Laboratory work" / "No laboratory work"), so
// no separate Yes/No is shown. One source for every summary that renders these
// (YesNoStatement.astro), so the wording never drifts between screens.

export interface YesNo { yes: string; no: string }

export const yesNo = {
  personnelInsured: {
    yes: 'All personnel are employed or insured by the institution',
    no: 'Not all personnel are employed or insured by the institution',
  },
  // Activity flags read as short noun phrases — the item itself when present,
  // "No …" when absent.
  specimenCollection: {
    yes: 'Specimen collection',
    no: 'No specimen collection',
  },
  labWork: {
    yes: 'Laboratory work',
    no: 'No laboratory work',
  },
  soilDisturbance: {
    yes: 'Soil disturbance',
    no: 'No soil disturbance',
  },
  additionalPermits: {
    yes: 'Federal, state, local permits required',
    no: 'No federal, state, local permits required',
  },
  beyondSimpleUse: {
    yes: 'Activities beyond simple use involved',
    no: 'No activities beyond simple use involved',
  },
} satisfies Record<string, YesNo>;
