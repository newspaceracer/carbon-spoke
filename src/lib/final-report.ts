// The permit's ANNUAL REPORT obligation — one report, due 30 days after the permit
// ends. The report is a DOCUMENT the researcher uploads (not a form). Every upload
// is a new VERSION of that one document; the newest version is current and decides
// the state — one standing version completes the requirement, unless the
// Responsible Agent sends it back with "Request changes", which reopens it. Only the
// Responsible Agent or an admin can remove a version (the previous one becomes
// current again). Every surface that talks about the report
// (the researcher Overview, the staff notice, the Annual report tab, the
// delinquency rules, /apply's renewal block) reads it from here so they never
// disagree on the due date or the state.
//
// States, in order:
//   not-due           — the permit hasn't ended and nothing is on file yet
//   due               — the permit has ended; the report is due by the due date
//   changes-requested — the Responsible Agent sent the latest upload back
//   delinquent        — past the due date with no accepted upload (none, or sent
//                       back). Set AUTOMATICALLY; blocks any new application /
//                       renewal / amendment where the same person is the principal
//                       investigator. The Responsible Agent or an admin can LIFT the
//                       block — the report is still owed.
//   submitted         — the latest upload stands (clears delinquency immediately)
//
// Uploads are accepted any time the permit is Active or Expired — from the
// researcher, the Responsible Agent, or an admin.
//
// Storage (prototype): permit-report-uploads-${id} = ReportUpload[] (oldest first);
// permit-delinquency-cleared-${id} = { by, at } when a reviewer lifted the block.
// `?report=1` seeds a mock upload; `?today=YYYY-MM-DD` moves the demo clock.
import { permit } from '../data/permit';

export type ReportState = 'not-due' | 'due' | 'changes-requested' | 'delinquent' | 'submitted';
export interface DelinquencyClearance { by: string; at: string }
export interface ReportSendBack { by: string; at: string; message: string }
/** One version of the report. `version` is assigned at upload and never reused. */
export interface ReportUpload { version: number; name: string; by: string; at: string; sentBack?: ReportSendBack }

/** Statuses in which the owner can upload the report. */
export const REPORT_STATUSES = ['Active', 'Expired'];

/** Fired on window whenever an upload or a send-back changes the report. */
export const REPORT_EVENT = 'annual-report-changed';

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

export const uploadsKey = (id: string) => `permit-report-uploads-${id}`;
export const clearanceKey = (id: string) => `permit-delinquency-cleared-${id}`;

// `?report=1` preview: one upload from the PI, a week after the permit ended.
const mockUpload = (): ReportUpload => ({
  version: 1,
  name: `${permit.id}_annual-report.pdf`,
  by: permit.researchTeam.principalInvestigator?.name ?? 'Principal investigator',
  at: formatDate(toISO(new Date(parseISO(permit.activeWindow.endISO).getTime() + 7 * DAY))),
});

/** Every upload for the permit, oldest first. */
export const readUploads = (id: string = permit.id): ReportUpload[] => {
  const stored = read<ReportUpload[]>(uploadsKey(id));
  // An empty stored list means every version was removed — don't re-seed the mock.
  if (Array.isArray(stored)) return stored.map((u, i) => ({ ...u, version: u.version ?? i + 1 }));
  return new URLSearchParams(location.search).get('report') === '1' ? [mockUpload()] : [];
};

const writeUploads = (id: string, list: ReportUpload[]) => {
  localStorage.setItem(uploadsKey(id), JSON.stringify(list));
  window.dispatchEvent(new CustomEvent(REPORT_EVENT, { detail: { id } }));
};

/** The upload under review — the newest one. */
export const latestUpload = (id: string = permit.id): ReportUpload | null => readUploads(id).at(-1) ?? null;

/** An upload stands (wasn't sent back) → the requirement is complete. */
export const reportOnFile = (id: string = permit.id): boolean => {
  const latest = latestUpload(id);
  return !!latest && !latest.sentBack;
};

/** Record a new version. It becomes the current one. */
export const addUpload = (id: string, name: string, by: string): ReportUpload => {
  const list = readUploads(id);
  const version = Math.max(0, ...list.map((u) => u.version)) + 1;
  const up: ReportUpload = { version, name, by, at: formatDate(todayISO()) };
  writeUploads(id, [...list, up]);
  return up;
};

/** Remove one version (Responsible Agent / admin). The previous one becomes current. */
export const removeUpload = (id: string, version: number) => {
  writeUploads(id, readUploads(id).filter((u) => u.version !== version));
};

/** Send the latest upload back with a message; the requirement reopens. */
export const requestReportChanges = (id: string, by: string, message: string) => {
  const list = readUploads(id);
  const latest = list.at(-1);
  if (!latest) return;
  latest.sentBack = { by, at: formatDate(todayISO()), message };
  writeUploads(id, list);
};

export const delinquencyClearance = (id: string = permit.id) => read<DelinquencyClearance>(clearanceKey(id));

/** The report state for a permit with the given status. Only issued permits owe one. */
export const reportState = (status: string, id: string = permit.id): ReportState | null => {
  // (Not 'Waiting for annual report' — that's a RENEWAL held for its predecessor's report.)
  if (!REPORT_STATUSES.includes(status)) return null;
  if (reportOnFile(id)) return 'submitted';
  const ended = status !== 'Active' || daysUntil(permit.activeWindow.endISO) < 0;
  if (ended && daysUntil(reportDueISO()) < 0) return 'delinquent';
  if (latestUpload(id)?.sentBack) return 'changes-requested';
  return ended ? 'due' : 'not-due';
};

/** Delinquent AND not cleared by a reviewer → renewals are blocked. */
export const renewalBlocked = (status: string, id: string = permit.id): boolean =>
  reportState(status, id) === 'delinquent' && !delinquencyClearance(id);
