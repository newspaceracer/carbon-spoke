// Yes/no application answers phrased as STATEMENTS — the label itself carries the
// answer ("Does involve soil disturbance" / "Does NOT involve soil disturbance"), so
// no separate Yes/No is shown. One source for every summary that renders these
// (YesNoStatement.astro), so the wording never drifts between screens.

export interface YesNo { yes: string; no: string }

export const yesNo = {
  personnelInsured: {
    yes: 'All personnel are employed or insured by the institution',
    no: 'Not all personnel are employed or insured by the institution',
  },
  specimenCollection: {
    yes: 'Does involve specimen collection',
    no: 'Does NOT involve specimen collection',
  },
  labWork: {
    yes: 'Does involve laboratory work',
    no: 'Does NOT involve laboratory work',
  },
  soilDisturbance: {
    yes: 'Does involve soil disturbance',
    no: 'Does NOT involve soil disturbance',
  },
  additionalPermits: {
    yes: 'Does require additional federal, state, or local permits',
    no: 'Does NOT require additional federal, state, or local permits',
  },
  beyondSimpleUse: {
    // Kept ≤ 75 characters — the record's desktop line-length cap.
    yes: 'Does involve activities beyond simple use (drones, diving, trapping)',
    no: 'Does NOT involve activities beyond simple use (drones, diving, trapping)',
  },
} satisfies Record<string, YesNo>;
