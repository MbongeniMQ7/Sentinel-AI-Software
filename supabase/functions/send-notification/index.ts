// ============================================================================
// SentinelAI — send-notification edge function
//
// A single, branded notification dispatcher for every activity in the
// platform. The frontend fires `{ type, data }` and this function:
//   1. resolves the right recipients server-side (service role),
//   2. renders a professional, banner-branded email for that activity,
//   3. sends it via Resend.
//
// All emails share the same template (supabase/functions/_shared/email.ts)
// and link back to the product at APP_URL.
//
// POST { type: string, data: object }
//
// Secrets (set with `supabase secrets set`):
//   RESEND_API_KEY   — Resend API key (required)
//   OTP_FROM_EMAIL / OTP_REPLY_TO / OTP_APP_NAME / APP_URL / EMAIL_BANNER_URL
//   SUPPORT_EMAIL / SUPPORT_PHONE
//
// Auto-injected by the Supabase runtime:
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
// ============================================================================

import { createClient, type SupabaseClient } from 'jsr:@supabase/supabase-js@2'
import { corsHeaders, jsonResponse } from '../_shared/cors.ts'
import { APP_URL, sendBrandedEmail, type BrandedEmailOptions } from '../_shared/email.ts'

interface Profile {
  id: string
  full_name: string | null
  email: string | null
  company_id: string | null
  role: string | null
}

const LEAVE_LABEL: Record<string, string> = {
  annual: 'Annual leave',
  sick: 'Sick leave',
  personal: 'Personal leave',
  emergency: 'Emergency leave',
}

const PRIORITY_LABEL: Record<string, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent',
}

function fmtDate(value?: string | null): string {
  if (!value) return '—'
  const d = new Date(value)
  if (isNaN(d.getTime())) return String(value)
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

function titleCase(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

async function profileById(db: SupabaseClient, id?: string | null): Promise<Profile | null> {
  if (!id) return null
  const { data } = await db
    .from('profiles')
    .select('id, full_name, email, company_id, role')
    .eq('id', id)
    .maybeSingle()
  return (data as Profile) ?? null
}

async function companyName(db: SupabaseClient, id?: string | null): Promise<string | null> {
  if (!id) return null
  const { data } = await db.from('companies').select('name').eq('id', id).maybeSingle()
  return (data as { name?: string } | null)?.name ?? null
}

async function emailsByRole(
  db: SupabaseClient,
  roles: string[],
  companyId?: string | null,
): Promise<string[]> {
  let query = db.from('profiles').select('email').in('role', roles)
  if (companyId) query = query.eq('company_id', companyId)
  const { data } = await query
  return ((data as { email: string | null }[]) ?? [])
    .map((r) => r.email)
    .filter((e): e is string => !!e)
}

/** Resolve recipients + the branded email for a given activity type. */
async function buildNotification(
  db: SupabaseClient,
  type: string,
  data: Record<string, unknown>,
): Promise<{ to: string[]; subject: string; opts: BrandedEmailOptions } | null> {
  const str = (k: string) => (data[k] == null ? '' : String(data[k]))
  const num = (k: string) => Number(data[k] ?? 0)

  switch (type) {
    // ---- Leave -------------------------------------------------------------
    case 'leave_submitted': {
      const employee = await profileById(db, str('employeeId'))
      if (!employee) return null
      const company = await companyName(db, employee.company_id)
      const to = await emailsByRole(db, ['manager', 'owner'], employee.company_id)
      const leave = LEAVE_LABEL[str('type')] ?? titleCase(str('type') || 'Leave')
      return {
        to,
        subject: `New leave request — ${employee.full_name ?? 'A team member'}`,
        opts: {
          preheader: `${employee.full_name ?? 'A team member'} requested ${leave}.`,
          heading: 'New leave request',
          intro: `<strong style="color:#0f172a;">${employee.full_name ?? 'A team member'}</strong> has submitted a leave request that needs your review.`,
          infoRows: [
            { label: 'Employee', value: employee.full_name ?? employee.email ?? '—' },
            ...(company ? [{ label: 'Company', value: company }] : []),
            { label: 'Type', value: leave },
            { label: 'From', value: fmtDate(str('startDate')) },
            { label: 'To', value: fmtDate(str('endDate')) },
            ...(str('reason') ? [{ label: 'Reason', value: str('reason') }] : []),
          ],
          cta: { label: 'Review request', url: `${APP_URL}/admin/approvals` },
        },
      }
    }
    case 'leave_reviewed': {
      const employee = await profileById(db, str('employeeId'))
      if (!employee?.email) return null
      const status = str('status')
      const approved = status === 'approved'
      const leave = LEAVE_LABEL[str('type')] ?? titleCase(str('type') || 'Leave')
      return {
        to: [employee.email],
        subject: `Your leave request was ${approved ? 'approved' : 'declined'}`,
        opts: {
          preheader: `Your ${leave} request was ${approved ? 'approved' : 'declined'}.`,
          heading: approved ? 'Leave approved' : 'Leave request declined',
          intro: `Hi ${employee.full_name ?? 'there'}, your leave request has been reviewed by your manager.`,
          highlight: approved ? '✓ Approved' : 'Declined',
          infoRows: [
            { label: 'Type', value: leave },
            { label: 'From', value: fmtDate(str('startDate')) },
            { label: 'To', value: fmtDate(str('endDate')) },
            { label: 'Decision', value: approved ? 'Approved' : 'Declined' },
          ],
          cta: { label: 'View in SentinelAI', url: `${APP_URL}/me/leave` },
        },
      }
    }

    // ---- Breaks ------------------------------------------------------------
    case 'break_submitted': {
      const employee = await profileById(db, str('employeeId'))
      if (!employee) return null
      const company = await companyName(db, employee.company_id)
      const to = await emailsByRole(db, ['manager', 'owner'], employee.company_id)
      return {
        to,
        subject: `New break request — ${employee.full_name ?? 'A team member'}`,
        opts: {
          preheader: `${employee.full_name ?? 'A team member'} requested a break.`,
          heading: 'New break request',
          intro: `<strong style="color:#0f172a;">${employee.full_name ?? 'A team member'}</strong> has requested a break and is awaiting your approval.`,
          infoRows: [
            { label: 'Employee', value: employee.full_name ?? employee.email ?? '—' },
            ...(company ? [{ label: 'Company', value: company }] : []),
            { label: 'Duration', value: `${num('durationMin')} min` },
            ...(str('reason') ? [{ label: 'Reason', value: str('reason') }] : []),
          ],
          cta: { label: 'Review request', url: `${APP_URL}/admin/approvals` },
        },
      }
    }
    case 'break_reviewed': {
      const employee = await profileById(db, str('employeeId'))
      if (!employee?.email) return null
      const approved = str('status') === 'approved'
      return {
        to: [employee.email],
        subject: `Your break request was ${approved ? 'approved' : 'declined'}`,
        opts: {
          preheader: `Your break request was ${approved ? 'approved' : 'declined'}.`,
          heading: approved ? 'Break approved' : 'Break request declined',
          intro: `Hi ${employee.full_name ?? 'there'}, your break request has been reviewed.`,
          highlight: approved ? '✓ Approved' : 'Declined',
          infoRows: [
            { label: 'Duration', value: `${num('durationMin')} min` },
            { label: 'Decision', value: approved ? 'Approved' : 'Declined' },
          ],
          cta: { label: 'View in SentinelAI', url: `${APP_URL}/me/breaks` },
        },
      }
    }

    // ---- Support tickets ---------------------------------------------------
    case 'ticket_submitted': {
      const opener = await profileById(db, str('openedById'))
      const companyId = str('companyId') || opener?.company_id || null
      const company = await companyName(db, companyId)
      const to = await emailsByRole(db, ['manager', 'owner'], companyId)
      const priority = PRIORITY_LABEL[str('priority')] ?? titleCase(str('priority') || 'Medium')
      return {
        to,
        subject: `New support ticket — ${str('subject')}`,
        opts: {
          preheader: `${opener?.full_name ?? 'A team member'} reported: ${str('subject')}`,
          heading: 'New support ticket',
          intro: `<strong style="color:#0f172a;">${opener?.full_name ?? 'A team member'}</strong> has reported an issue that needs attention.`,
          infoRows: [
            ...(str('number') ? [{ label: 'Ticket', value: str('number') }] : []),
            { label: 'Subject', value: str('subject') },
            { label: 'Category', value: str('category') || '—' },
            { label: 'Priority', value: priority },
            ...(company ? [{ label: 'Company', value: company }] : []),
          ],
          cta: { label: 'Open ticket', url: `${APP_URL}/admin/support` },
        },
      }
    }
    case 'ticket_escalated': {
      const to = await emailsByRole(db, ['owner'])
      return {
        to,
        subject: `Escalated ticket — ${str('subject')}`,
        opts: {
          preheader: `A ticket was escalated to SentinelAI: ${str('subject')}`,
          heading: 'Ticket escalated to SentinelAI',
          intro: `A support ticket has been escalated and requires platform-level attention.`,
          infoRows: [
            ...(str('number') ? [{ label: 'Ticket', value: str('number') }] : []),
            { label: 'Subject', value: str('subject') },
            ...(str('companyName') ? [{ label: 'Company', value: str('companyName') }] : []),
            ...(str('priority') ? [{ label: 'Priority', value: PRIORITY_LABEL[str('priority')] ?? str('priority') }] : []),
          ],
          cta: { label: 'Review escalation', url: `${APP_URL}/owner/issues` },
        },
      }
    }
    case 'ticket_resolved': {
      const opener = await profileById(db, str('openedById'))
      if (!opener?.email) return null
      return {
        to: [opener.email],
        subject: `Your ticket was resolved — ${str('subject')}`,
        opts: {
          preheader: `Good news — your ticket "${str('subject')}" was resolved.`,
          heading: 'Your ticket was resolved',
          intro: `Hi ${opener.full_name ?? 'there'}, the issue you reported has been marked resolved. If anything still isn't right, just reply and we'll reopen it.`,
          highlight: '✓ Resolved',
          infoRows: [
            ...(str('number') ? [{ label: 'Ticket', value: str('number') }] : []),
            { label: 'Subject', value: str('subject') },
          ],
          cta: { label: 'View in SentinelAI', url: `${APP_URL}/me/support` },
        },
      }
    }

    // ---- Alerts ------------------------------------------------------------
    case 'alert_status': {
      const employee = await profileById(db, str('employeeId'))
      if (!employee?.email) return null
      const status = str('status')
      return {
        to: [employee.email],
        subject: `Alert update — ${titleCase(status || 'updated')}`,
        opts: {
          preheader: `Your wellness alert was marked ${status}.`,
          heading: 'Wellness alert update',
          intro: `Hi ${employee.full_name ?? 'there'}, there's an update on a wellness alert linked to your account.`,
          highlight: titleCase(status || 'Updated'),
          infoRows: [
            ...(str('alertType') ? [{ label: 'Alert', value: str('alertType') }] : []),
            { label: 'Status', value: titleCase(status || '—') },
            ...(str('note') ? [{ label: 'Note', value: str('note') }] : []),
          ],
          cta: { label: 'View alerts', url: `${APP_URL}/me/alerts` },
        },
      }
    }

    // ---- Companies / billing ----------------------------------------------
    case 'company_created': {
      const to = await emailsByRole(db, ['owner'])
      return {
        to,
        subject: `New company onboarded — ${str('companyName')}`,
        opts: {
          preheader: `${str('companyName')} was added to SentinelAI.`,
          heading: 'New company onboarded',
          intro: `A new company has been added to the platform.`,
          infoRows: [
            { label: 'Company', value: str('companyName') },
            ...(str('plan') ? [{ label: 'Plan', value: str('plan') }] : []),
            ...(data.seats != null ? [{ label: 'Seats', value: String(num('seats')) }] : []),
            ...(str('status') ? [{ label: 'Status', value: titleCase(str('status')) }] : []),
          ],
          cta: { label: 'View companies', url: `${APP_URL}/owner/companies` },
        },
      }
    }
    case 'billing_updated': {
      const companyId = str('companyId') || null
      const company = (await companyName(db, companyId)) ?? str('companyName')
      const managerEmails = await emailsByRole(db, ['manager', 'owner'], companyId)
      const ownerEmails = await emailsByRole(db, ['owner'])
      const to = Array.from(new Set([...managerEmails, ...ownerEmails]))
      return {
        to,
        subject: `Billing updated — ${company || 'your company'}`,
        opts: {
          preheader: `The subscription for ${company || 'your company'} was updated.`,
          heading: 'Billing updated',
          intro: `The subscription details for <strong style="color:#0f172a;">${company || 'your company'}</strong> have been updated.`,
          infoRows: [
            ...(str('plan') ? [{ label: 'Plan', value: str('plan') }] : []),
            ...(data.seats != null ? [{ label: 'Seats', value: String(num('seats')) }] : []),
            ...(str('status') ? [{ label: 'Status', value: titleCase(str('status')) }] : []),
          ],
          cta: { label: 'View billing', url: `${APP_URL}/owner/billing` },
        },
      }
    }

    // ---- Devices -----------------------------------------------------------
    case 'device_assigned': {
      const employee = await profileById(db, str('assignedToId'))
      if (!employee?.email) return null
      return {
        to: [employee.email],
        subject: `A device was assigned to you — ${str('deviceName')}`,
        opts: {
          preheader: `${str('deviceName')} was assigned to you.`,
          heading: 'A device was assigned to you',
          intro: `Hi ${employee.full_name ?? 'there'}, a monitoring device has been assigned to your account.`,
          infoRows: [
            { label: 'Device', value: str('deviceName') },
            ...(str('type') ? [{ label: 'Type', value: str('type') }] : []),
            ...(str('location') ? [{ label: 'Location', value: str('location') }] : []),
          ],
          cta: { label: 'Open SentinelAI', url: APP_URL },
        },
      }
    }

    default:
      return null
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405)

  const resendKey = Deno.env.get('RESEND_API_KEY')
  if (!resendKey) return jsonResponse({ error: 'Email service not configured' }, 500)

  let payload: { type?: string; data?: Record<string, unknown> }
  try {
    payload = await req.json()
  } catch {
    return jsonResponse({ error: 'Invalid JSON body' }, 400)
  }

  const type = (payload.type ?? '').trim()
  if (!type) return jsonResponse({ error: 'A notification type is required' }, 400)

  const db = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  let built: Awaited<ReturnType<typeof buildNotification>>
  try {
    built = await buildNotification(db, type, payload.data ?? {})
  } catch (err) {
    console.error('buildNotification error', err)
    return jsonResponse({ error: 'Could not build notification' }, 500)
  }

  // Unknown type, or nobody to notify — succeed quietly so callers never break.
  if (!built || built.to.length === 0) {
    return jsonResponse({ success: true, skipped: true })
  }

  const recipients = Array.from(new Set(built.to.map((e) => e.toLowerCase())))
  const sent = await sendBrandedEmail({
    resendKey,
    to: recipients,
    subject: built.subject,
    opts: built.opts,
  })

  if (!sent) return jsonResponse({ error: 'Could not send notification' }, 502)
  return jsonResponse({ success: true, recipients: recipients.length })
})
