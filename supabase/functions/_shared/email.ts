// ============================================================================
// SentinelAI — shared branded email template
//
// Every transactional email in the platform is rendered through
// `renderBrandedEmail` so they all share the same professional layout:
//   • full-width SentinelAI banner at the top,
//   • a clear heading + intro,
//   • optional highlighted detail rows,
//   • a primary call-to-action button linking to the app,
//   • a support footer (24/7 contact) + copyright.
//
// Env (optional, sensible defaults baked in):
//   APP_URL            — product URL the CTA + links point to
//   EMAIL_BANNER_URL   — hosted banner image
//   OTP_APP_NAME       — branding label
//   OTP_FROM_EMAIL     — verified Resend sender
//   OTP_REPLY_TO       — monitored reply mailbox
//   SUPPORT_EMAIL      — shown in the footer
//   SUPPORT_PHONE      — shown in the footer
// ============================================================================

export const APP_URL = Deno.env.get('APP_URL') ?? 'https://agent.sentinelai-software.co.za'
export const APP_NAME = Deno.env.get('OTP_APP_NAME') ?? 'SentinelAI'
export const BANNER_URL =
  Deno.env.get('EMAIL_BANNER_URL') ?? `${APP_URL}/banner.png`
export const FROM_EMAIL = Deno.env.get('OTP_FROM_EMAIL') ?? 'info@sentinelai-software.co.za'
export const REPLY_TO = Deno.env.get('OTP_REPLY_TO') ?? 'info@sentinelai-software.co.za'
export const SUPPORT_EMAIL = Deno.env.get('SUPPORT_EMAIL') ?? 'info@sentinelai-software.co.za'
export const SUPPORT_PHONE = Deno.env.get('SUPPORT_PHONE') ?? '+27 (0) 10 020 0000'

export interface InfoRow {
  label: string
  value: string
}

export interface BrandedEmailOptions {
  /** Hidden preview text shown in the inbox list. */
  preheader: string
  /** Main heading under the banner. */
  heading: string
  /** Intro paragraphs (rendered in order). Plain text or safe inline HTML. */
  intro: string | string[]
  /** Optional labelled detail rows rendered in a highlight card. */
  infoRows?: InfoRow[]
  /** Optional emphasis line shown above the CTA (e.g. a status). */
  highlight?: string
  /** Optional primary button. Defaults to "Open SentinelAI" → APP_URL. */
  cta?: { label: string; url: string } | null
  /** Optional closing note (smaller, muted). */
  footnote?: string
  /** Banner slug (file in /public/banners/<slug>.png) for this email's theme. */
  banner?: string
}

/** Resolve the banner image URL for an email (themed slug or default). */
export function bannerUrl(slug?: string): string {
  return slug ? `${APP_URL}/banners/${slug}.png` : BANNER_URL
}

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

/** Build the full, responsive, banner-branded HTML email. */
export function renderBrandedEmail(opts: BrandedEmailOptions): string {
  const year = new Date().getFullYear()
  const intros = Array.isArray(opts.intro) ? opts.intro : [opts.intro]
  const cta =
    opts.cta === null
      ? null
      : (opts.cta ?? { label: `Open ${APP_NAME}`, url: APP_URL })

  const introHtml = intros
    .map(
      (p) =>
        `<p style="margin:0 0 18px;font-size:15.5px;line-height:1.7;color:#475569;">${p}</p>`,
    )
    .join('')

  const highlightHtml = opts.highlight
    ? `<div style="margin:6px 0 26px;font-size:16px;line-height:1.5;font-weight:700;color:#1f43f5;">${opts.highlight}</div>`
    : ''

  const rowsHtml =
    opts.infoRows && opts.infoRows.length
      ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:6px 0 30px;background:#f7f9ff;border:1px solid #e6ecfb;border-radius:16px;">
           ${opts.infoRows
             .map(
               (r, i) => `<tr>
                 <td style="padding:14px 22px;font-size:13.5px;color:#64748b;${i ? 'border-top:1px solid #ebf0fc;' : ''}">${esc(r.label)}</td>
                 <td align="right" style="padding:14px 22px;font-size:13.5px;font-weight:600;color:#0f172a;${i ? 'border-top:1px solid #ebf0fc;' : ''}">${esc(r.value)}</td>
               </tr>`,
             )
             .join('')}
         </table>`
      : ''

  const ctaHtml = cta
    ? `<table role="presentation" align="center" cellpadding="0" cellspacing="0" style="margin:10px auto 6px;">
         <tr>
           <td style="border-radius:14px;background:linear-gradient(135deg,#1f43f5 0%,#3563ff 100%);box-shadow:0 8px 22px rgba(31,67,245,0.32);">
             <a href="${cta.url}" target="_blank" style="display:inline-block;padding:15px 40px;font-size:15.5px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:14px;">${esc(cta.label)}</a>
           </td>
         </tr>
       </table>`
    : ''

  const footnoteHtml = opts.footnote
    ? `<p style="margin:26px 0 0;font-size:13px;line-height:1.55;color:#94a3b8;">${opts.footnote}</p>`
    : ''

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light only" />
  <title>${esc(opts.heading)}</title>
</head>
<body style="margin:0;padding:0;background:#e9eef9;-webkit-font-smoothing:antialiased;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <span style="display:none!important;visibility:hidden;opacity:0;height:0;width:0;overflow:hidden;mso-hide:all;">${esc(opts.preheader)}</span>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#e9eef9;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:22px;overflow:hidden;box-shadow:0 18px 50px rgba(15,23,42,0.12);">
          <!-- Banner -->
          <tr>
            <td style="padding:0;line-height:0;">
              <a href="${APP_URL}" target="_blank" style="text-decoration:none;">
                <img src="${bannerUrl(opts.banner)}" alt="${esc(APP_NAME)} — ${esc(opts.heading)}" width="600" style="display:block;width:100%;max-width:600px;height:auto;border:0;outline:none;text-decoration:none;" />
              </a>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px 46px 12px;text-align:center;">
              <h1 style="margin:0 0 16px;font-size:25px;font-weight:800;color:#0f172a;letter-spacing:-0.5px;">${esc(opts.heading)}</h1>
              <div style="width:46px;height:4px;border-radius:99px;background:linear-gradient(90deg,#1f43f5,#3563ff);margin:0 auto 24px;"></div>
              ${introHtml}
              ${highlightHtml}
              <div style="text-align:left;">${rowsHtml}</div>
              ${ctaHtml}
              ${footnoteHtml}
            </td>
          </tr>
          <!-- Divider -->
          <tr>
            <td style="padding:32px 46px 0;">
              <div style="border-top:1px solid #edf1fa;"></div>
            </td>
          </tr>
          <!-- Support footer -->
          <tr>
            <td style="padding:24px 46px 8px;text-align:center;">
              <p style="margin:0 0 6px;font-size:13px;font-weight:700;color:#334155;letter-spacing:0.2px;">24/7 Support</p>
              <p style="margin:0;font-size:13px;color:#64748b;">
                ${esc(SUPPORT_PHONE)} &nbsp;&middot;&nbsp;
                <a href="mailto:${SUPPORT_EMAIL}" style="color:#1f43f5;text-decoration:none;font-weight:600;">${esc(SUPPORT_EMAIL)}</a>
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:16px 46px 36px;text-align:center;">
              <p style="margin:0 0 4px;font-size:12px;color:#94a3b8;">
                Sent by <a href="${APP_URL}" target="_blank" style="color:#94a3b8;text-decoration:underline;">${esc(APP_NAME)}</a> &middot; Workforce Fatigue &amp; Wellness Platform
              </p>
              <p style="margin:0;font-size:12px;color:#cbd5e1;">© ${year} ${esc(APP_NAME)}. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

/** Plain-text fallback so the email renders cleanly without HTML. */
export function renderBrandedText(opts: BrandedEmailOptions): string {
  const year = new Date().getFullYear()
  const intros = Array.isArray(opts.intro) ? opts.intro : [opts.intro]
  const strip = (s: string) => s.replace(/<[^>]+>/g, '')
  const cta =
    opts.cta === null ? null : (opts.cta ?? { label: `Open ${APP_NAME}`, url: APP_URL })
  const lines: string[] = [`${APP_NAME} — ${opts.heading}`, '']
  for (const p of intros) lines.push(strip(p), '')
  if (opts.highlight) lines.push(strip(opts.highlight), '')
  if (opts.infoRows?.length) {
    for (const r of opts.infoRows) lines.push(`${r.label}: ${r.value}`)
    lines.push('')
  }
  if (cta) lines.push(`${cta.label}: ${cta.url}`, '')
  if (opts.footnote) lines.push(strip(opts.footnote), '')
  lines.push(
    `24/7 Support — ${SUPPORT_PHONE} | ${SUPPORT_EMAIL}`,
    `© ${year} ${APP_NAME} · Workforce Fatigue & Wellness Platform`,
  )
  return lines.join('\n')
}

/** Send a branded email via Resend. Returns true on success. */
export async function sendBrandedEmail(input: {
  resendKey: string
  to: string | string[]
  subject: string
  opts: BrandedEmailOptions
  /** Optional file attachments. `content` must be base64-encoded. */
  attachments?: { filename: string; content: string }[]
}): Promise<boolean> {
  const to = Array.isArray(input.to) ? input.to : [input.to]
  if (!to.length) return false

  const body: Record<string, unknown> = {
    from: `${APP_NAME} <${FROM_EMAIL}>`,
    reply_to: REPLY_TO,
    to,
    subject: input.subject,
    html: renderBrandedEmail(input.opts),
    text: renderBrandedText(input.opts),
    headers: {
      // Bulk-sender signals that help inbox placement (Gmail/Yahoo guidelines).
      'List-Unsubscribe': `<mailto:${REPLY_TO}?subject=unsubscribe>`,
      'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
    },
  }
  if (input.attachments?.length) body.attachments = input.attachments

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${input.resendKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    console.error('Resend error', res.status, await res.text())
    return false
  }
  return true
}
