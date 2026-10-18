// What a reviewer must look at closely on an application — shared by every view of
// the record (the application-record prototype and the review wizard's record), so
// they flag the same things in the same words.
//
// Each compliance flag on the permit maps to the screening answer that raised it;
// that answer carries an anchor id (answer-*) so "Needs a closer look" can link
// straight to it. Uninsured personnel adds one more item, anchored on the research
// team's insurance statement (team-insurance).
import { permit, type MetaRow } from '../data/permit';

export const FLAG_FACT: Record<string, { key: string; id: string }> = {
  'Soil disturbance': { key: 'Involves soil disturbance', id: 'answer-soil' },
  'Beyond simple use': { key: 'Activities beyond simple use (aircraft/drones, diving, trapping, etc.)', id: 'answer-beyond' },
  'Additional permit required': { key: 'Requires additional federal/state/local permits', id: 'answer-permits' },
};
export const INSURANCE_ANCHOR = 'team-insurance';

/** The anchor id of the screening answer behind a flag, if any. */
export const answerIdFor = (factKey: string) => Object.values(FLAG_FACT).find((f) => f.key === factKey)?.id;

export interface AttentionItem { title: string; detail: string; href: string; linkLabel: string }

const facts = permit.additionalDocs.facts as readonly MetaRow[];
const waiver = permit.additionalDocs.files.find((f) => /DPR65B/i.test(f.type));

export const recordAttention: AttentionItem[] = [
  ...permit.flagTags.map((f) => {
    const fact = facts.find((r) => r.key === FLAG_FACT[f.label]?.key);
    return { title: f.label, detail: fact?.detail ?? '', href: `#${FLAG_FACT[f.label]?.id}`, linkLabel: 'Go to the answer' };
  }),
  ...(!permit.researchTeam.personnelInsured ? [{
    title: 'Not all personnel insured',
    detail: `At least one team member isn't employed or insured by the institution.${waiver ? ' A signed liability waiver addendum (DPR65B) is attached.' : ''}`,
    href: `#${INSURANCE_ANCHOR}`,
    linkLabel: 'Go to the research team',
  }] : []),
];
