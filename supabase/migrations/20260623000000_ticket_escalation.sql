-- Support ticket escalation flow.
-- Employees report issues to their manager; managers escalate selected tickets
-- to the platform owner (SentinelAI). Owners only see escalated tickets.

alter table support_tickets
  add column if not exists escalated boolean not null default false;

create index if not exists support_tickets_escalated_idx
  on support_tickets (escalated);
