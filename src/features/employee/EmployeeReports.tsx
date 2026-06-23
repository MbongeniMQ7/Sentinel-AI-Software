import { useMemo, useState } from 'react'
import { Check, Download, FileBarChart, FileText, Mail, Printer, Share2, Sparkles } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Field, Select } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { BarSeries } from '@/components/shared/Charts'
import {
  useWeeklyAlerts,
  useEmployees,
  useFatigueTrend,
  useBreakRequests,
  emailReport,
} from '@/lib/api'
import { useAuth } from '@/lib/auth'

const templates = [
  { id: 'wellness', title: 'Weekly Wellness Summary', desc: 'Fatigue, focus and break compliance for the period.' },
  { id: 'fatigue', title: 'Fatigue Trend Report', desc: 'Fatigue and heart-rate readings across the day.' },
  { id: 'attendance', title: 'Attendance & Breaks', desc: 'Breaks taken and alert activity summary.' },
] as const

const rangeLabels: Record<string, string> = {
  '7d': 'Last 7 days',
  '30d': 'Last 30 days',
  quarter: 'This quarter',
}

type Metric = { label: string; value: string }

function avg(nums: number[]): number {
  if (!nums.length) return 0
  return Math.round(nums.reduce((a, b) => a + b, 0) / nums.length)
}

function toBase64(str: string): string {
  return btoa(unescape(encodeURIComponent(str)))
}

function downloadFile(filename: string, mime: string, text: string) {
  const blob = new Blob([text], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

function slug(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

export function EmployeeReports() {
  const { user } = useAuth()
  const [selected, setSelected] = useState<string>('wellness')
  const [range, setRange] = useState('7d')
  const [format, setFormat] = useState<'csv' | 'html'>('csv')
  const [generating, setGenerating] = useState(false)
  const [ready, setReady] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [status, setStatus] = useState<string | null>(null)

  const { data: weeklyAlerts } = useWeeklyAlerts()
  const { data: employees } = useEmployees()
  const { data: trend } = useFatigueTrend(user?.id)
  const { data: breaks } = useBreakRequests()

  const me = employees.find((e) => e.id === user?.id)
  const template = templates.find((t) => t.id === selected) ?? templates[0]

  const metrics = useMemo<Metric[]>(() => {
    const avgFatigue = trend.length ? avg(trend.map((t) => t.fatigue)) : me?.fatigue ?? 0
    const avgFocus = trend.length ? avg(trend.map((t) => t.focus)) : 0
    const avgHeart = trend.length ? avg(trend.map((t) => t.heartRate)) : me?.heartRate ?? 0
    const totalAlerts = weeklyAlerts.reduce((sum, d) => sum + d.fatigue + d.drowsiness + d.distraction, 0)
    const breaksTaken = breaks.filter((b) => b.employee === user?.name && b.status === 'approved').length

    if (selected === 'fatigue') {
      return [
        { label: 'Avg fatigue', value: String(avgFatigue) },
        { label: 'Avg heart rate', value: `${avgHeart} bpm` },
        { label: 'Risk level', value: (me?.riskLevel ?? 'low').toUpperCase() },
        { label: 'Alerts', value: String(totalAlerts) },
      ]
    }
    if (selected === 'attendance') {
      return [
        { label: 'Breaks taken', value: String(breaksTaken) },
        { label: 'Shift', value: me?.shift ?? '—' },
        { label: 'Status', value: me?.status ?? '—' },
        { label: 'Alerts', value: String(totalAlerts) },
      ]
    }
    return [
      { label: 'Avg fatigue', value: String(avgFatigue) },
      { label: 'Avg focus', value: `${avgFocus}%` },
      { label: 'Breaks taken', value: String(breaksTaken) },
      { label: 'Alerts', value: String(totalAlerts) },
    ]
  }, [selected, trend, weeklyAlerts, breaks, me, user?.name])

  const generate = () => {
    setGenerating(true)
    setReady(false)
    setStatus(null)
    // Metrics are derived from live data; brief delay for UX feedback.
    window.setTimeout(() => {
      setGenerating(false)
      setReady(true)
    }, 500)
  }

  const periodLabel = rangeLabels[range] ?? 'Last 7 days'

  const buildCsv = (): string => {
    const lines: string[] = []
    lines.push(`${template.title}`)
    lines.push(`Employee,${user?.name ?? ''}`)
    lines.push(`Period,${periodLabel}`)
    lines.push(`Generated,${new Date().toLocaleString()}`)
    lines.push('')
    lines.push('Metric,Value')
    for (const m of metrics) lines.push(`${m.label},${m.value}`)
    lines.push('')
    lines.push('Day,Fatigue,Drowsiness,Distraction')
    for (const d of weeklyAlerts) lines.push(`${d.day},${d.fatigue},${d.drowsiness},${d.distraction}`)
    return lines.join('\n')
  }

  const buildHtml = (): string => {
    const rows = metrics.map((m) => `<tr><td>${m.label}</td><td><strong>${m.value}</strong></td></tr>`).join('')
    const alertRows = weeklyAlerts
      .map((d) => `<tr><td>${d.day}</td><td>${d.fatigue}</td><td>${d.drowsiness}</td><td>${d.distraction}</td></tr>`)
      .join('')
    return `<!doctype html><html><head><meta charset="utf-8"><title>${template.title}</title>
<style>
  body{font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#0f172a;max-width:720px;margin:32px auto;padding:0 20px}
  h1{font-size:22px;margin:0 0 4px} .sub{color:#64748b;margin:0 0 24px}
  table{width:100%;border-collapse:collapse;margin:12px 0 24px}
  th,td{text-align:left;padding:8px 10px;border-bottom:1px solid #e2e8f0;font-size:14px}
  th{color:#64748b;font-weight:600}
  .brand{color:#2f4156;font-weight:700}
</style></head><body>
  <p class="brand">SentinelAI</p>
  <h1>${template.title}</h1>
  <p class="sub">${user?.name ?? ''} · ${periodLabel} · Generated ${new Date().toLocaleDateString()}</p>
  <table><thead><tr><th>Metric</th><th>Value</th></tr></thead><tbody>${rows}</tbody></table>
  <h3>Alerts by day</h3>
  <table><thead><tr><th>Day</th><th>Fatigue</th><th>Drowsiness</th><th>Distraction</th></tr></thead><tbody>${alertRows}</tbody></table>
</body></html>`
  }

  const buildFile = () => {
    const base = `${slug(template.title)}-${range}`
    if (format === 'html') {
      return { filename: `${base}.html`, mime: 'text/html;charset=utf-8', content: buildHtml() }
    }
    return { filename: `${base}.csv`, mime: 'text/csv;charset=utf-8', content: buildCsv() }
  }

  const exportReport = async () => {
    if (!ready) return
    setExporting(true)
    setStatus(null)
    const file = buildFile()
    // 1) Download locally.
    downloadFile(file.filename, file.mime, file.content)
    // 2) Email the same document to the signed-in user.
    try {
      const sentTo = await emailReport({
        title: template.title,
        dateRange: periodLabel,
        filename: file.filename,
        contentBase64: toBase64(file.content),
        metrics,
      })
      setStatus(sentTo ? `Downloaded and emailed to ${sentTo}.` : 'Downloaded and emailed.')
    } catch (e) {
      setStatus(`Downloaded. Email could not be sent: ${e instanceof Error ? e.message : 'unknown error'}`)
    } finally {
      setExporting(false)
    }
  }

  const printReport = () => {
    if (!ready) return
    const win = window.open('', '_blank', 'noopener,noreferrer,width=820,height=900')
    if (!win) {
      setStatus('Allow pop-ups to print this report.')
      return
    }
    win.document.write(buildHtml())
    win.document.close()
    win.focus()
    win.print()
  }

  const shareReport = async () => {
    if (!ready) return
    const summary = `${template.title} (${periodLabel}) — ${metrics.map((m) => `${m.label}: ${m.value}`).join(', ')}`
    if (navigator.share) {
      try {
        await navigator.share({ title: template.title, text: summary })
        return
      } catch {
        /* user cancelled the share sheet */
        return
      }
    }
    try {
      await navigator.clipboard.writeText(summary)
      setStatus('Report summary copied to clipboard.')
    } catch {
      setStatus('Sharing is not supported on this device.')
    }
  }

  return (
    <div>
      <PageHeader title="Reports" description="Generate, download and email your personal wellness reports." />

      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader title="Generate report" icon={<FileBarChart className="h-4 w-4" />} />
          <CardBody className="space-y-4">
            <div className="space-y-2">
              {templates.map((t) => (
                <button
                  key={t.id}
                  onClick={() => { setSelected(t.id); setReady(false); setStatus(null) }}
                  className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left transition-colors ${selected === t.id ? 'border-brand-500 bg-brand-50/60 dark:bg-brand-950/30' : 'border-line hover:bg-surface-muted'}`}
                >
                  <FileText className={`mt-0.5 h-4 w-4 ${selected === t.id ? 'text-brand-600' : 'text-ink-subtle'}`} />
                  <span>
                    <span className="block text-sm font-medium text-ink">{t.title}</span>
                    <span className="block text-xs text-ink-muted">{t.desc}</span>
                  </span>
                </button>
              ))}
            </div>
            <Field label="Date range">
              <Select value={range} onChange={(e) => { setRange(e.target.value); setReady(false) }}>
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="quarter">This quarter</option>
              </Select>
            </Field>
            <Field label="Format">
              <Select value={format} onChange={(e) => setFormat(e.target.value as 'csv' | 'html')}>
                <option value="csv">CSV (spreadsheet)</option>
                <option value="html">HTML (printable)</option>
              </Select>
            </Field>
            <Button className="w-full" onClick={generate} loading={generating}>
              {!generating && <Sparkles className="h-4 w-4" />} {generating ? 'Generating…' : 'Generate report'}
            </Button>
            <p className="flex items-center gap-1.5 text-xs text-ink-subtle">
              <Mail className="h-3.5 w-3.5" /> Exporting also emails the report to {user?.email}.
            </p>
          </CardBody>
        </Card>

        {/* Preview */}
        <Card className="lg:col-span-2">
          <CardHeader
            title="Preview"
            action={
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={!ready} onClick={printReport}><Printer className="h-3.5 w-3.5" /> Print</Button>
                <Button variant="outline" size="sm" disabled={!ready} onClick={shareReport}><Share2 className="h-3.5 w-3.5" /> Share</Button>
                <Button size="sm" disabled={!ready || exporting} loading={exporting} onClick={exportReport}>
                  {!exporting && <Download className="h-3.5 w-3.5" />} Export
                </Button>
              </div>
            }
          />
          <CardBody>
            {status && (
              <div className="mb-4 flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                <Check className="h-4 w-4" /> {status}
              </div>
            )}
            <div className="rounded-2xl border border-line bg-surface-subtle p-6">
              <div className="mb-6 flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold text-ink">{template.title}</h3>
                  <p className="text-sm text-ink-muted">{user?.name} · {periodLabel}</p>
                </div>
                <Badge tone={ready ? 'success' : 'neutral'}>{ready ? 'Ready' : 'Draft'}</Badge>
              </div>
              <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
                {metrics.map((s) => (
                  <div key={s.label} className="rounded-xl border border-line bg-surface p-3">
                    <p className="text-xl font-bold text-ink">{s.value}</p>
                    <p className="text-xs text-ink-muted">{s.label}</p>
                  </div>
                ))}
              </div>
              <p className="mb-2 text-sm font-semibold text-ink">Alerts by day</p>
              <BarSeries
                data={weeklyAlerts}
                xKey="day"
                series={[
                  { key: 'fatigue', label: 'Fatigue', color: '#f59e0b' },
                  { key: 'drowsiness', label: 'Drowsiness', color: '#f43f5e' },
                  { key: 'distraction', label: 'Distraction', color: '#8b5cf6' },
                ]}
                height={200}
              />
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
