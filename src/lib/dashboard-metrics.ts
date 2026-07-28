// Program-metrics engine for the administrator dashboard. PURE + framework-free
// on purpose: the page frontmatter imports it to render initial counts SERVER-side,
// and the page's client script imports the very same functions to RECOMPUTE every
// metric when a filter changes — one source of truth, so the server render and the
// live filtered view can never drift.
//
// Scope of what's computable here is Tier 1 only (volume / intake / on-hand). The
// register records a `submitted` date and a signed-permit FLAG, but NOT the date a
// permit was approved/signed — so total-processing-time (Tier 2) has no data to
// stand on. That gap is surfaced honestly in the UI, never shown as a zero. See
// `TIER2_METRICS` at the bottom.
import type { PermitRow, StatusEvent } from '../data/permits';

// ── Status vocabulary ────────────────────────────────────────────────────────
// The register's own Status labels, grouped into lifecycle PHASES. Labels are the
// system's terminology verbatim (never paraphrased report wording). `kind` is the
// cds-icon-indicator kind so a status reads by icon+label, never colour alone
// (mirrors permits.ts — keep the two in sync).
export type Phase = 'draft' | 'in-process' | 'approved' | 'denied' | 'withdrawn';

export interface StatusMeta {
  label: string;
  kind: string;
  phase: Phase;
}

export const STATUS_META: readonly StatusMeta[] = [
  { label: 'Draft', kind: 'not-started', phase: 'draft' },
  { label: 'Under review', kind: 'in-progress', phase: 'in-process' },
  { label: 'Out for signature', kind: 'pending', phase: 'in-process' },
  { label: 'Returned to submitter', kind: 'caution-minor', phase: 'in-process' },
  { label: 'Active', kind: 'succeeded', phase: 'approved' },
  { label: 'Expired', kind: 'unknown', phase: 'approved' },
  { label: 'Rejected', kind: 'failed', phase: 'denied' },
  { label: 'Withdrawn', kind: 'undefined', phase: 'withdrawn' },
] as const;

const PHASE_OF = new Map(STATUS_META.map((s) => [s.label, s.phase] as const));
const KIND_OF = new Map(STATUS_META.map((s) => [s.label, s.kind] as const));
export const kindForStatus = (label: string) => KIND_OF.get(label) ?? 'unknown';

/** The in-process ("on hand") statuses, in queue order — a permit actively being
 *  worked or awaiting an action from the applicant/signer. */
export const IN_PROCESS_STATUSES = STATUS_META.filter((s) => s.phase === 'in-process').map(
  (s) => s.label,
);

// ── Slim record ──────────────────────────────────────────────────────────────
// Only the fields the dashboard reads, projected so the array serialized into the
// page (for client recompute) stays small — 960 rows × a handful of strings.
export interface SlimPermit {
  submitted: string; // ISO YYYY-MM-DD — "Date submitted"
  status: string;
  district: string;
  category: string; // "Resource Category"
  park: string; // "Park unit"
  organization: string; // applicant entity
  permitStart: string; // ISO — "Permit start date"
  recordType: string;
  permitType: string; // permit classification (Scientific Research & Collection, …)
  renewalType: string; // New / Renewal / Amendment / Reissuance
  annualReportSubmitted: string; // 'Yes' | 'No'
  annualReportDue: string; // ISO — when the annual report is due (for delinquency-over-time)
  responsibleAnalyst: string; // for Tier 2 "processing time by analyst"
  // ── Decision (from the transition history) — for the monthly time series ──
  /** ISO date the permit was approved (→ Active) or denied (→ Rejected); null if undecided. */
  decidedAt: string | null;
  decision: 'approved' | 'rejected' | null;
  // ── Tier 2 scalars, derived from the transition history (see deriveTimeline) ──
  /** Days from Date submitted to the approved/signed OR denied decision; null when
   *  the permit hasn't reached a decision yet (still in process) or was withdrawn. */
  processingDays: number | null;
  /** Days spent in each CLOSED status instance (the current open status isn't counted). */
  stageDays: Record<string, number>;
  /** Count of "Returned to submitter" transitions — inquiries back to the applicant. */
  returns: number;
}

// Whole-day difference between two ISO dates (UTC math — TZ-safe).
const daysBetween = (fromISO: string, toISO: string): number => {
  const p = (s: string) => {
    const [y, m, d] = s.split('-').map(Number);
    return Date.UTC(y, m - 1, d);
  };
  return Math.round((p(toISO) - p(fromISO)) / 86400000);
};

// Fold a permit's transition history into the Tier 2 scalars. The decision is the
// first transition into a terminal DECIDED status (Active = signed, Rejected =
// denied); in-process and withdrawn permits have no decision, so processingDays is
// null and they're excluded from completed-processing-time figures downstream.
function deriveTimeline(history: readonly StatusEvent[], submitted: string) {
  const stageDays: Record<string, number> = {};
  let decisionAt: string | null = null;
  let decision: 'approved' | 'rejected' | null = null;
  let returns = 0;
  for (let k = 0; k < history.length; k++) {
    const ev = history[k];
    if (ev.to === 'Returned to submitter') returns++;
    if (decisionAt === null && (ev.to === 'Active' || ev.to === 'Rejected')) {
      decisionAt = ev.at;
      decision = ev.to === 'Active' ? 'approved' : 'rejected';
    }
    const next = history[k + 1];
    if (next) stageDays[ev.to] = (stageDays[ev.to] ?? 0) + Math.max(0, daysBetween(ev.at, next.at));
  }
  return {
    processingDays: decisionAt ? Math.max(0, daysBetween(submitted, decisionAt)) : null,
    stageDays,
    returns,
    // Decision date + outcome — for the monthly approved/rejected time series.
    decidedAt: decisionAt,
    decision,
  };
}

export const toSlim = (rows: readonly PermitRow[]): SlimPermit[] =>
  rows.map((p) => ({
    submitted: p.submitted,
    status: p.status,
    district: p.district,
    category: p.category,
    park: p.park,
    organization: p.organization,
    permitStart: p.permitStart,
    recordType: p.recordType,
    permitType: p.permitType,
    renewalType: p.renewalType,
    annualReportSubmitted: p.annualReportSubmitted,
    annualReportDue: p.annualReportDue,
    responsibleAnalyst: p.responsibleAnalyst,
    ...deriveTimeline(p.history, p.submitted),
  }));

// ── Filter ───────────────────────────────────────────────────────────────────
export interface DashboardFilter {
  /** ISO YYYY-MM-DD; '' = open-ended. Applied to "Date submitted". */
  from: string;
  to: string;
  /** Selected values; [] = all. */
  districts: string[];
  categories: string[];
}

export const EMPTY_FILTER: DashboardFilter = { from: '', to: '', districts: [], categories: [] };

/** Dimension scope: District + Resource Category + the house draft-exclusion rule.
 *  Deliberately DOES NOT apply the date range — the per-year chart works off Permit
 *  start date and needs the full time span (the date range scopes intake, not it). */
export function scopeByDimensions(
  permits: readonly SlimPermit[],
  filter: DashboardFilter,
  { includeDrafts = false } = {},
): SlimPermit[] {
  const dset = new Set(filter.districts);
  const cset = new Set(filter.categories);
  return permits.filter((p) => {
    if (!includeDrafts && p.status === 'Draft') return false;
    if (dset.size && !dset.has(p.district)) return false;
    if (cset.size && !cset.has(p.category)) return false;
    return true;
  });
}

/** Apply the "Date submitted" range. ISO dates compare correctly as strings, so no
 *  Date parsing (which would risk a timezone day-shift). */
export function scopeByDate(rows: readonly SlimPermit[], filter: DashboardFilter): SlimPermit[] {
  if (!filter.from && !filter.to) return rows.slice();
  return rows.filter((p) => {
    if (filter.from && p.submitted < filter.from) return false;
    if (filter.to && p.submitted > filter.to) return false;
    return true;
  });
}

/** The fully-scoped working set for the volume/on-hand metrics. */
export const applyFilter = (permits: readonly SlimPermit[], filter: DashboardFilter): SlimPermit[] =>
  scopeByDate(scopeByDimensions(permits, filter), filter);

// ── Metric primitives ────────────────────────────────────────────────────────
const phaseOf = (status: string): Phase => PHASE_OF.get(status) ?? 'in-process';

/** Count rows whose status is in the given set. */
const countByStatuses = (rows: readonly SlimPermit[], statuses: readonly string[]) => {
  const set = new Set(statuses);
  return rows.filter((r) => set.has(r.status)).length;
};

/** One tabular bucket for a Carbon bar/donut chart, plus the raw group value so a
 *  click-through can build its query. */
export interface Bucket {
  group: string;
  value: number;
}

/** Count rows per value of a dimension, descending. `top` caps the result; by
 *  default the tail folds into a named "Other" bucket (never a silent truncation).
 *  Pass `other: false` for a "top-N" ranking where the chart title already states
 *  the cap and an "Other" bar would only dwarf the ranked items. */
export function byDimension(
  rows: readonly SlimPermit[],
  key: keyof SlimPermit,
  { top = Infinity, other = true }: { top?: number; other?: boolean } = {},
): Bucket[] {
  const counts = new Map<string, number>();
  for (const r of rows) counts.set(r[key], (counts.get(r[key]) ?? 0) + 1);
  const sorted = [...counts.entries()]
    .map(([group, value]) => ({ group, value }))
    .sort((a, b) => b.value - a.value || a.group.localeCompare(b.group));
  if (sorted.length <= top) return sorted;
  const head = sorted.slice(0, top);
  if (!other) return head;
  const tail = sorted.slice(top).reduce((s, b) => s + b.value, 0);
  return tail > 0 ? [...head, { group: 'Other', value: tail }] : head;
}

/** Status breakdown as chart buckets, in the register's own status order. */
export function statusBreakdown(rows: readonly SlimPermit[]): Bucket[] {
  return STATUS_META.filter((s) => s.phase !== 'draft')
    .map((s) => ({ group: s.label, value: countByStatuses(rows, [s.label]) }))
    .filter((b) => b.value > 0);
}

/** On-hand permits broken out by their in-process status (for a bar chart). */
export const onHandByStatus = (rows: readonly SlimPermit[]): Bucket[] =>
  IN_PROCESS_STATUSES.map((label) => ({ group: label, value: countByStatuses(rows, [label]) })).filter(
    (b) => b.value > 0,
  );

/** Distinct applicant entities + their permit counts (by Organization). */
export function applicantEntities(rows: readonly SlimPermit[]): { count: number; list: Bucket[] } {
  const list = byDimension(rows, 'organization');
  return { count: list.length, list };
}

/** Permits per year over the trailing `span` years, keyed on Permit START date.
 *  Years are derived from the data (max permit-start year and the prior span-1),
 *  so the axis is honest even as the seed's date window moves. */
export function perYearByPermitStart(rows: readonly SlimPermit[], span = 5): Bucket[] {
  let maxYear = 0;
  const perYear = new Map<number, number>();
  for (const r of rows) {
    const y = Number(r.permitStart.slice(0, 4));
    if (!y) continue;
    perYear.set(y, (perYear.get(y) ?? 0) + 1);
    if (y > maxYear) maxYear = y;
  }
  if (!maxYear) return [];
  const years: Bucket[] = [];
  for (let y = maxYear - (span - 1); y <= maxYear; y++) {
    years.push({ group: String(y), value: perYear.get(y) ?? 0 });
  }
  return years;
}

// ── Time-series (monthly) ──────────────────────────────────────────────────────
// Multi-series charts use Carbon's { group, key, value } tabular shape: `group` is
// the series name (legend), `key` is the month on the domain axis, `value` the count.
// These charts show a FIXED trailing window (not the date-range filter) so the trend
// stays readable; District + Resource Category still scope them (scopeByDimensions).

/** A month key from an ISO date — 'YYYY-MM'. String order == chronological order. */
const monthKey = (iso: string) => iso.slice(0, 7);

/** Contiguous 'YYYY-MM' list of length `n` ending at `endMonth` (inclusive), so
 *  gap months render as zero instead of collapsing the axis. */
function monthsEndingAt(endMonth: string, n: number): string[] {
  const [y, mo] = endMonth.split('-').map(Number);
  const out: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(y, mo - 1 - i, 1));
    out.push(`${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`);
  }
  return out;
}

export interface MonthlyIntake {
  months: string[];
  received: Record<string, number>;
  approved: Record<string, number>;
  rejected: Record<string, number>;
}

/** Applications received, permits approved, and permits rejected — counted per
 *  MONTH over the trailing `n` months. Received is bucketed by Date submitted;
 *  approved/rejected by the decision date carried from the transition history. */
export function monthlyIntakeDecisions(rows: readonly SlimPermit[], n = 18): MonthlyIntake {
  let end = '';
  for (const r of rows) {
    const sm = monthKey(r.submitted);
    if (sm > end) end = sm;
    if (r.decidedAt) { const dm = monthKey(r.decidedAt); if (dm > end) end = dm; }
  }
  const months = end ? monthsEndingAt(end, n) : [];
  const idx = new Set(months);
  const received: Record<string, number> = {};
  const approved: Record<string, number> = {};
  const rejected: Record<string, number> = {};
  for (const mm of months) { received[mm] = 0; approved[mm] = 0; rejected[mm] = 0; }
  for (const r of rows) {
    const sm = monthKey(r.submitted);
    if (idx.has(sm)) received[sm]++;
    if (r.decidedAt && r.decision) {
      const dm = monthKey(r.decidedAt);
      if (idx.has(dm)) (r.decision === 'approved' ? approved : rejected)[dm]++;
    }
  }
  return { months, received, approved, rejected };
}

/** Carbon combo tabular data for the intake/decisions chart: Approved + Rejected as
 *  a STACKED bar (the two outcomes partition each month's decisions), and Received
 *  as a LINE (intake). Bar height = decisions made that month; line = applications
 *  received that month — kept as distinct measures because a decision lands on an
 *  application received earlier, so they are not a breakdown of one cohort. */
export function intakeDecisionsComboData(mi: MonthlyIntake): { group: string; key: string; value: number }[] {
  const data: { group: string; key: string; value: number }[] = [];
  for (const mm of mi.months) {
    data.push({ group: 'Approved', key: mm, value: mi.approved[mm] });
    data.push({ group: 'Rejected', key: mm, value: mi.rejected[mm] });
    data.push({ group: 'Received', key: mm, value: mi.received[mm] });
  }
  return data;
}

/** New delinquencies per MONTH: an issued permit whose annual report came due that
 *  month and is still not submitted becomes delinquent then. A falling line means
 *  fewer permits are newly missing their deadline — the backlog is being curbed. */
export function monthlyNewDelinquencies(
  rows: readonly SlimPermit[],
  n = 18,
): { group: string; key: string; value: number }[] {
  let end = '';
  for (const r of rows) {
    if (r.annualReportDue) { const dm = monthKey(r.annualReportDue); if (dm > end) end = dm; }
  }
  const months = end ? monthsEndingAt(end, n) : [];
  const idx = new Set(months);
  const counts: Record<string, number> = {};
  for (const mm of months) counts[mm] = 0;
  for (const r of rows) {
    if (phaseOf(r.status) !== 'approved') continue; // issued (Active / Expired)
    if (r.annualReportSubmitted === 'Yes') continue;
    if (!r.annualReportDue) continue;
    const dm = monthKey(r.annualReportDue);
    if (idx.has(dm)) counts[dm]++;
  }
  return months.map((mm) => ({ group: 'New delinquencies', key: mm, value: counts[mm] }));
}

// ── Workload & review health ────────────────────────────────────────────────

/** The latest submission date across a set — the "as of" reference for aging. */
export const asOfDate = (rows: readonly SlimPermit[]): string =>
  rows.reduce((mx, r) => (r.submitted > mx ? r.submitted : mx), '');

/** Open (in-process) permits bucketed by how long they've been open — days from
 *  Date submitted to `asOf`. The last bucket is everything past the 90-day target,
 *  so a growing "Over 90 days" bar flags a stalling queue. Buckets stay in order. */
export function openBacklogAging(rows: readonly SlimPermit[], asOf: string): Bucket[] {
  const labels = ['0–30 days', '31–60 days', '61–90 days', 'Over 90 days'];
  const counts = [0, 0, 0, 0];
  const open = new Set(IN_PROCESS_STATUSES);
  for (const r of rows) {
    if (!open.has(r.status)) continue;
    const age = daysBetween(r.submitted, asOf);
    if (age <= 30) counts[0]++;
    else if (age <= 60) counts[1]++;
    else if (age <= 90) counts[2]++;
    else counts[3]++;
  }
  return labels.map((group, i) => ({ group, value: counts[i] }));
}

/** How many permits needed 0, 1, or 2+ inquiry round-trips ("Returned to
 *  submitter"). The inquiry-rate KPI says how often; this shows the spread. */
export function inquiryRoundsDistribution(rows: readonly SlimPermit[]): Bucket[] {
  const c = [0, 0, 0];
  for (const r of rows) c[r.returns <= 0 ? 0 : r.returns === 1 ? 1 : 2]++;
  return [
    { group: 'No inquiries', value: c[0] },
    { group: '1 inquiry', value: c[1] },
    { group: '2+ inquiries', value: c[2] },
  ];
}

// ── Composition & outcomes ────────────────────────────────────────────────────
const RENEWAL_ORDER = ['New', 'Renewal', 'Amendment', 'Reissuance'] as const;

/** Permit-type composition split by renewal type — a stacked bar ({ group, key,
 *  value }: group = renewal type, key = permit type). Types ordered by volume. */
export function permitTypeByRenewal(rows: readonly SlimPermit[]): { group: string; key: string; value: number }[] {
  const byType = new Map<string, Map<string, number>>();
  for (const r of rows) {
    if (!byType.has(r.permitType)) byType.set(r.permitType, new Map());
    const inner = byType.get(r.permitType)!;
    inner.set(r.renewalType, (inner.get(r.renewalType) ?? 0) + 1);
  }
  const total = (inner: Map<string, number>) => [...inner.values()].reduce((a, b) => a + b, 0);
  const types = [...byType.entries()].sort((a, b) => total(b[1]) - total(a[1]) || a[0].localeCompare(b[0]));
  const data: { group: string; key: string; value: number }[] = [];
  for (const [type, inner] of types) {
    for (const rt of RENEWAL_ORDER) {
      const v = inner.get(rt) ?? 0;
      if (v > 0) data.push({ group: rt, key: type, value: v });
    }
  }
  return data;
}

/** Approved vs rejected DECIDED permits per resource category — a stacked bar
 *  ({ group: 'Approved' | 'Rejected', key: category }). Categories by volume. */
export function decisionsByCategory(rows: readonly SlimPermit[]): { group: string; key: string; value: number }[] {
  const byCat = new Map<string, { approved: number; rejected: number }>();
  for (const r of rows) {
    if (!r.decision) continue;
    if (!byCat.has(r.category)) byCat.set(r.category, { approved: 0, rejected: 0 });
    const o = byCat.get(r.category)!;
    if (r.decision === 'approved') o.approved++;
    else o.rejected++;
  }
  const cats = [...byCat.entries()].sort(
    (a, b) => b[1].approved + b[1].rejected - (a[1].approved + a[1].rejected) || a[0].localeCompare(b[0]),
  );
  const data: { group: string; key: string; value: number }[] = [];
  for (const [cat, o] of cats) {
    data.push({ group: 'Approved', key: cat, value: o.approved });
    data.push({ group: 'Rejected', key: cat, value: o.rejected });
  }
  return data;
}

// ── The headline metric set ──────────────────────────────────────────────────
export interface Metrics {
  /** Non-draft applications in the working set (intake within the date range). */
  received: number;
  active: number; // status Active
  underReview: number; // status Under review
  rejected: number; // status Rejected — the "denied" outcome
  onHand: number; // all in-process statuses
  pendingAnnualReport: number; // approved/issued AND annual report not yet submitted
  applicantEntityCount: number;
}

export function computeMetrics(rows: readonly SlimPermit[]): Metrics {
  return {
    received: rows.length,
    active: countByStatuses(rows, ['Active']),
    underReview: countByStatuses(rows, ['Under review']),
    rejected: countByStatuses(rows, ['Rejected']),
    onHand: countByStatuses(rows, IN_PROCESS_STATUSES),
    pendingAnnualReport: rows.filter(
      (r) => phaseOf(r.status) === 'approved' && r.annualReportSubmitted === 'No',
    ).length,
    applicantEntityCount: new Set(rows.map((r) => r.organization)).size,
  };
}

// ── Click-through query ──────────────────────────────────────────────────────
// Click-through uses the register's QUICK FILTER (`/permits?q=…`): AG Grid ANDs the
// space-separated terms across all columns, so a district name + a status label
// narrows to exactly that intersection. Its one limit is that quick filter can't
// express an OR (two districts) or a date range — so a click-through carries the
// SINGLE-valued parts of the active filter plus the metric's own term. Multi-select
// dimensions and the date range stay on the dashboard (which owns the exact counts);
// the register link lands on the honest superset. Terms with internal spaces are
// fine — every word must match, and they all co-occur in the one cell.
export function buildQuery(filter: DashboardFilter, ...terms: string[]): string {
  const parts: string[] = [];
  if (filter.districts.length === 1) parts.push(filter.districts[0]);
  if (filter.categories.length === 1) parts.push(filter.categories[0]);
  parts.push(...terms.filter(Boolean));
  const q = parts.join(' ').trim();
  return q ? `?q=${encodeURIComponent(q)}` : '';
}

// ── Tier 2: processing & timing ──────────────────────────────────────────────
// Computed from the status-transition history (deriveTimeline). All figures cover
// only DECIDED permits (reached Active/signed or Rejected/denied); in-process and
// withdrawn permits carry processingDays = null and are excluded, so a completed-
// time figure never includes a permit that hasn't completed.

/** The target processing window (days). Permits over this are the "exceeded" set. */
export const TARGET_DAYS = 90;

const median = (xs: readonly number[]): number | null => {
  if (!xs.length) return null;
  const s = [...xs].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
};
const mean = (xs: readonly number[]): number | null =>
  xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null;

const decidedDays = (rows: readonly SlimPermit[]): number[] =>
  rows.filter((r) => r.processingDays != null).map((r) => r.processingDays as number);

export interface ProcessingStats {
  /** Permits with a decision (the population all timing figures use). */
  decided: number;
  total: number;
  /** Days. Median is the headline (robust to stalled outliers); average is skewed. */
  median: number | null;
  average: number | null;
  /** Permits over TARGET_DAYS, and that as a % of decided. */
  overTarget: number;
  overTargetPct: number | null;
}

export function processingStats(rows: readonly SlimPermit[]): ProcessingStats {
  const ds = decidedDays(rows);
  const over = ds.filter((d) => d > TARGET_DAYS).length;
  const avg = mean(ds);
  return {
    decided: ds.length,
    total: rows.length,
    median: median(ds),
    average: avg == null ? null : Math.round(avg),
    overTarget: over,
    overTargetPct: ds.length ? Math.round((over / ds.length) * 100) : null,
  };
}

/** Median processing time (days) per value of a dimension — for category / analyst. */
export function medianDaysByDimension(rows: readonly SlimPermit[], key: keyof SlimPermit): Bucket[] {
  const groups = new Map<string, number[]>();
  for (const r of rows) {
    if (r.processingDays == null) continue;
    const g = String(r[key]);
    (groups.get(g) ?? groups.set(g, []).get(g)!).push(r.processingDays);
  }
  return [...groups.entries()]
    .map(([group, xs]) => ({ group, value: Math.round(median(xs) as number) }))
    .sort((a, b) => b.value - a.value || a.group.localeCompare(b.group));
}

/** The internal workflow stages, in lifecycle order (Draft = pre-submission, excluded). */
export const WORKFLOW_STAGES = ['Under review', 'Returned to submitter', 'Out for signature'] as const;

/** Mean days spent in each workflow stage, across permits that have left it. */
export function stageAverages(rows: readonly SlimPermit[]): Bucket[] {
  return WORKFLOW_STAGES.map((stage) => {
    const xs = rows.map((r) => r.stageDays[stage]).filter((v): v is number => v != null && v > 0);
    const m = mean(xs);
    return { group: stage, value: m == null ? 0 : Math.round(m) };
  }).filter((b) => b.value > 0);
}

/** Permits that required at least one inquiry back to the applicant. */
export function inquiryStats(rows: readonly SlimPermit[]): { withInquiries: number; total: number; pct: number } {
  const withInquiries = rows.filter((r) => r.returns > 0).length;
  return { withInquiries, total: rows.length, pct: rows.length ? Math.round((withInquiries / rows.length) * 100) : 0 };
}
