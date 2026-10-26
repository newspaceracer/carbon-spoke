// The permit's FINAL REPORT obligation — one report, due 30 days after the permit
// ends. Every surface that talks about the report (the researcher Overview, the
// /report page, the Final report tab, the delinquency rules) reads it from here so
// they never disagree on the due date or the state.
//
// States, in order:
//   not-due    — the permit hasn't ended; the report is due later
//   due        — the permit has ended; the report is due by the due date
//   delinquent — the due date passed with no report. Set AUTOMATICALLY; blocks any
//                new application / renewal / amendment where the same person is
//                the principal investigator. The responsible reviewer can CLEAR it
//                (lifts the block — the report is still owed).
//   submitted  — a report is on file (clears delinquency immediately)
//
// Storage (prototype): permit-final-report-${id} = the submitted report;
// permit-delinquency-cleared-${id} = { by, at } when a reviewer lifted the block.
// `?report=1` previews a submitted report; `?today=YYYY-MM-DD` moves the demo clock.
import { permit } from '../data/permit';

export type ReportState = 'not-due' | 'due' | 'delinquent' | 'submitted';
export interface DelinquencyClearance { by: string; at: string }

const DAY = 86_400_000;
const parseISO = (iso: string) => new Date(`${iso}T00:00:00`);
const toISO = (d: Date) => d.toISOString().slice(0, 10);
export const formatDate = (iso: string) =>
  parseISO(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

/** Due 30 days after the permit's window ends. */
export const reportDueISO = (endISO: string = permit.activeWindow.endISO) =>
  toISO(new Date(parseISO(endISO).getTime() + 30 * DAY));

/** The demo clock: `?today=` overrides the permit's seeded demo date. */
export const todayISO = (): string => {
  const q = typeof location !== 'undefined' ? new URLSearchParams(location.search).get('today') : null;
  return q && /^\d{4}-\d{2}-\d{2}$/.test(q) ? q : permit.projectInfo.demoTodayISO;
};

/** Whole days from today to `iso` (negative once it has passed). */
export const daysUntil = (iso: string) => Math.round((parseISO(iso).getTime() - parseISO(todayISO()).getTime()) / DAY);

const read = <T>(key: string): T | null => {
  try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch { return null; }
};

export const reportKey = (id: string) => `permit-final-report-${id}`;
export const clearanceKey = (id: string) => `permit-delinquency-cleared-${id}`;

export const reportOnFile = (id: string = permit.id): boolean =>
  new URLSearchParams(location.search).get('report') === '1' || !!localStorage.getItem(reportKey(id));

export const delinquencyClearance = (id: string = permit.id) => read<DelinquencyClearance>(clearanceKey(id));

/** The report state for a permit with the given status. Only issued permits owe one. */
export const reportState = (status: string, id: string = permit.id): ReportState | null => {
  // (Not 'Waiting for final report' — that's a RENEWAL held for its predecessor's report.)
  if (!['Active', 'Expired'].includes(status)) return null;
  if (reportOnFile(id)) return 'submitted';
  const ended = status !== 'Active' || daysUntil(permit.activeWindow.endISO) < 0;
  if (!ended) return 'not-due';
  return daysUntil(reportDueISO()) < 0 ? 'delinquent' : 'due';
};

/** Delinquent AND not cleared by a reviewer → renewals are blocked. */
export const renewalBlocked = (status: string, id: string = permit.id): boolean =>
  reportState(status, id) === 'delinquent' && !delinquencyClearance(id);
