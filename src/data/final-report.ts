// Mock FINAL REPORT for permit 26-635-017 — what the researcher submits through
// the portal once fieldwork is done (the HQ reporting condition asks for survey
// effort: park units, dates, locations, method, number of samples; plus data
// products). INVENTED and deterministic, like all mock data here; quantities stay
// within the permitted allotments in permit.ts.
//
// The application-record prototype shows it in a "Final report" tab only when a
// report is on file — permit-final-report-${id} in storage, or `?report=1` to
// preview this mock.

export interface SurveyEffort {
  park: string;
  dates: string;
  site: string;
  coords: string;
  method: string;
  samples: number;
}
export interface CollectedTaxon { species: string; permitted: number; collected: number }

export const finalReport = {
  submittedAt: 'Aug 24, 2027',
  submittedBy: 'Dr. Alena Reyes',
  summary:
    'Thirteen field sessions surveyed coralline algae at four sites in four park units, ' +
    'including two subtidal dives at Van Damme SP. Molecular identification confirmed 11 coralline taxa, ' +
    'including the first sequence-verified record of Lithophyllum dispar north of Point Arena. ' +
    'Corallina vancouveriensis was reproductive from December through March, peaking in January.',
  effort: [
    { park: 'Del Norte Coast Redwoods SP', dates: 'Jul 30, 2026 – Jun 7, 2027 (9 sessions)', site: 'False Klamath Cove', coords: '41.603, -124.102', method: 'Haphazard quadrats along 30 m transects', samples: 54 },
    { park: 'Prairie Creek Redwoods SP', dates: 'Aug 13 – 15, 2026', site: 'Gold Bluffs Beach reef', coords: '41.384, -124.073', method: 'Haphazard quadrats along 30 m transects', samples: 12 },
    { park: 'Van Damme SP', dates: 'Sep 29, 2026; Apr 10, 2027', site: 'Van Damme cove (subtidal, to 10 m)', coords: '39.274, -123.792', method: 'SCUBA belt transects', samples: 9 },
    { park: 'MacKerricher SP', dates: 'Dec 30, 2026 – Jan 2, 2027', site: 'Laguna Point', coords: '39.489, -123.806', method: 'Haphazard quadrats along 30 m transects', samples: 14 },
  ] as SurveyEffort[],
  collected: [
    { species: 'Bossiella chiloensis', permitted: 5, collected: 5 },
    { species: 'Bossiella dichotoma', permitted: 5, collected: 4 },
    { species: 'Bossiella orbigniana', permitted: 5, collected: 5 },
    { species: 'Calliarthron tuberculosum', permitted: 5, collected: 5 },
    { species: 'Corallina chilensis', permitted: 5, collected: 3 },
    { species: 'Corallina vancouveriensis', permitted: 50, collected: 46 },
    { species: 'Lithophyllum dispar', permitted: 5, collected: 5 },
    { species: 'Lithophyllum impressum', permitted: 5, collected: 5 },
    { species: 'Lithothamnion phymatodium', permitted: 5, collected: 2 },
    { species: 'Melobesia mediocris', permitted: 5, collected: 5 },
    { species: 'Mesophyllum conchatum', permitted: 5, collected: 4 },
    { species: 'Neopolyporolithon reclinatum', permitted: 5, collected: 0 },
  ] as CollectedTaxon[],
  dataProducts: [
    { name: 'Coralline survey effort and quadrat data (CSV)', where: 'Dryad' },
    { name: 'COI and psbA sequences, 89 specimens', where: 'GenBank' },
    { name: 'Voucher specimens, 89 sheets', where: 'HSU Cryptogamic Herbarium' },
    { name: 'Site maps and transect GPS points (GIS)', where: 'Submitted with this report' },
  ],
};
