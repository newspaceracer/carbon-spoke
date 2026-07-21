// Invented, deterministic mock incident for the triage prototype.
// Domain-credible (internal platform on-call), never real client data.

export const incident = {
  id: 'INC-2087',
  title: 'Elevated 5xx errors on the checkout API',
  summary:
    'The checkout API is returning 5xx responses for ~8% of requests in us-east. ' +
    'Errors began shortly after the 14:32 deploy of payments-service v3.14.0.',
  severity: { label: 'Sev 1', tone: 'red' as const },
  status: { label: 'Investigating', tone: 'magenta' as const },

  // At-a-glance facts (rendered as tiles).
  facts: [
    { label: 'Severity', value: 'Sev 1' },
    { label: 'Duration', value: '38 min' },
    { label: 'Affected users', value: '~4,200' },
    { label: 'Error rate', value: '8.1%' },
  ],

  // Key/value metadata (rendered as a structured list).
  metadata: [
    { key: 'Affected service', value: 'checkout-api' },
    { key: 'Environment', value: 'production · us-east-1' },
    { key: 'Detected', value: 'Today, 14:36 by Datadog monitor' },
    { key: 'Reporter', value: 'PagerDuty (auto)' },
    { key: 'Assignee', value: 'Unassigned' },
    { key: 'Runbook', value: 'RB-014 — API 5xx spike' },
  ],

  // Activity timeline (rendered as a contained list).
  activity: [
    { time: '14:36', text: 'Datadog monitor "checkout 5xx" triggered; incident auto-created at Sev 2.' },
    { time: '14:41', text: 'A. Rivera acknowledged the page and joined the bridge.' },
    { time: '14:48', text: 'Severity raised to Sev 1 — error rate crossed 8% and paging expanded.' },
    { time: '14:55', text: 'Correlated with payments-service v3.14.0 deploy at 14:32; rollback proposed.' },
    { time: '15:02', text: 'Awaiting triage decision: rollback vs. forward-fix.' },
  ],

  // Options offered in the triage (resolve) modal.
  resolutions: [
    { value: 'rollback', text: 'Roll back payments-service to v3.13.2' },
    { value: 'forward-fix', text: 'Hold for forward-fix from payments team' },
    { value: 'mitigated', text: 'Mark mitigated — traffic shifted away from us-east' },
    { value: 'false-positive', text: 'Resolve as false positive' },
  ],
};
