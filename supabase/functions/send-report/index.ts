// ============================================================================
// SentinelAI — send-report edge function
//
// POST {
//   title: string,            // report title, e.g. "Weekly Wellness Summary"
//   dateRange: string,        // human label, e.g. "Last 7 days"
//   filename: string,         // attachment filename, e.g. "wellness.csv"
//   contentBase64: string,    // base64-encoded file contents
//   metrics?: { label: string; value: string }[]
// }
// Authorization: Bearer <caller access token>
//
//   1. Authenticates the caller via their access token.
//   2. Emails the generated report — as an attachment — to the caller's own
//      verified email address (never an arbitrary recipient).
//
// Secrets:
//   RESEND_API_KEY   — Resend API key (required)
//
// Auto-injected by the Supabase runtime:
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
// ============================================================================

import { createClient } from 'jsr:@supabase/supabase-js@2'
import { corsHeaders, jsonResponse } from '../_shared/cors.ts'
import { APP_NAME, sendBrandedEmail, type InfoRow } from '../_shared/email.ts'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405)

  const resendKey = Deno.env.get('RESEND_API_KEY')
  if (!resendKey) return jsonResponse({ error: 'Email service not configured' }, 500)

  let payload: {
    title?: string
    dateRange?: string
    filename?: string
    contentBase64?: string
    metrics?: { label?: string; value?: string }[]
  }
  try {
    payload = await req.json()
  } catch {
    return jsonResponse({ error: 'Invalid JSON body' }, 400)
  }

  const title = (payload.title ?? 'Report').trim()
  const dateRange = (payload.dateRange ?? '').trim()
  const filename = (payload.filename ?? 'report.csv').trim()
  const contentBase64 = payload.contentBase64 ?? ''
  if (!contentBase64) return jsonResponse({ error: 'Report content is required' }, 400)

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  // ---- Authenticate the caller --------------------------------------------
  const token = req.headers.get('Authorization')?.replace(/^Bearer\s+/i, '')
  if (!token) return jsonResponse({ error: 'Authentication required' }, 401)

  const { data: authData, error: authErr } = await supabase.auth.getUser(token)
  if (authErr || !authData?.user?.email) {
    return jsonResponse({ error: 'Authentication required' }, 401)
  }
  const to = authData.user.email

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', authData.user.id)
    .maybeSingle()
  const firstName = (profile?.full_name ?? '').split(' ')[0] || 'there'

  const infoRows: InfoRow[] = (payload.metrics ?? [])
    .filter((m) => m.label && m.value)
    .map((m) => ({ label: m.label as string, value: m.value as string }))

  const sent = await sendBrandedEmail({
    resendKey,
    to,
    subject: `Your ${title} from ${APP_NAME}`,
    attachments: [{ filename, content: contentBase64 }],
    opts: {
      preheader: `Your ${title} is attached.${dateRange ? ` (${dateRange})` : ''}`,
      heading: 'Your report is ready',
      intro: [
        `Hi ${firstName},`,
        `Here's the <strong style="color:#0f172a;">${title}</strong> you generated${dateRange ? ` for <strong>${dateRange}</strong>` : ''}. You'll find it attached to this email as <strong>${filename}</strong>.`,
      ],
      banner: 'pulse-report',
      infoRows: infoRows.length ? infoRows : undefined,
      footnote: 'This report was generated from your SentinelAI wellness data. Keep it confidential.',
    },
  })

  if (!sent) return jsonResponse({ error: 'Could not send the report email' }, 502)
  return jsonResponse({ ok: true, sentTo: to })
})
