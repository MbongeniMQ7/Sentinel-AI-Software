import { useState, type ReactNode } from 'react'
import { Download, FileBarChart, FileText, Printer, Share2, Sparkles } from 'lucide-react'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Field, Select } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'

export interface ReportTemplate {
  id: string
  title: string
  desc: string
}

interface ReportsBuilderProps {
  templates: ReportTemplate[]
  previewTitle: string
  previewSubtitle: string
  kpis: { label: string; value: string }[]
  chart: ReactNode
}

type Format = 'pdf' | 'csv' | 'xlsx'

const RANGE_LABELS: Record<string, string> = {
  '7d': 'Last 7 days',
  '30d': 'Last 30 days',
  quarter: 'This quarter',
  year: 'This year',
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function downloadBlob(content: BlobPart, mime: string, filename: string) {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function ReportsBuilder({ templates, previewTitle, previewSubtitle, kpis, chart }: ReportsBuilderProps) {
  const [selected, setSelected] = useState(templates[0]?.id)
  const [format, setFormat] = useState<Format>('pdf')
  const [range, setRange] = useState('30d')
  const [generating, setGenerating] = useState(false)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const selectedTemplate = templates.find((t) => t.id === selected) ?? templates[0]
  const reportTitle = selectedTemplate?.title ?? previewTitle
  const rangeLabel = RANGE_LABELS[range] ?? range
  const generatedAt = new Date().toLocaleString()

  const meta: [string, string][] = [
    ['Report', reportTitle],
    ['Scope', previewSubtitle],
    ['Date range', rangeLabel],
    ['Generated', generatedAt],
  ]

  const baseFilename = `${slugify(reportTitle)}-${new Date().toISOString().slice(0, 10)}`

  // Branded documents (PDF / Excel / CSV) are produced by the Python
  // serverless function at /api/reports using the logo and brand theme.
  const exportReport = async (fmt: Format = format) => {
    setGenerating(true)
    setError(null)
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: reportTitle,
          subtitle: previewSubtitle,
          range: rangeLabel,
          format: fmt,
          generatedAt,
          meta,
          kpis,
        }),
      })
      if (!res.ok) throw new Error(`Report service error (${res.status})`)
      const blob = await res.blob()
      const disposition = res.headers.get('Content-Disposition') ?? ''
      const match = /filename="?([^"]+)"?/.exec(disposition)
      const ext = fmt === 'xlsx' ? 'xlsx' : fmt
      const filename = match?.[1] ?? `${baseFilename}.${ext}`
      downloadBlob(blob, blob.type || 'application/octet-stream', filename)
      setReady(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not generate the report')
    } finally {
      setGenerating(false)
    }
  }

  const buildPrintHtml = (): string => {
    const metaRows = meta
      .map(([k, v]) => `<tr><th>${escapeHtml(k)}</th><td>${escapeHtml(v)}</td></tr>`)
      .join('')
    const kpiCards = kpis
      .map(
        (k) =>
          `<div class="kpi"><div class="kpi-value">${escapeHtml(k.value)}</div><div class="kpi-label">${escapeHtml(k.label)}</div></div>`,
      )
      .join('')
    return `<!DOCTYPE html><html><head><meta charset="utf-8" /><title>${escapeHtml(reportTitle)}</title>
      <style>
        *{box-sizing:border-box;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;}
        body{margin:0;padding:40px;color:#0f172a;}
        h1{margin:0 0 4px;font-size:24px;}
        .sub{color:#64748b;margin:0 0 24px;font-size:14px;}
        table{border-collapse:collapse;margin-bottom:24px;}
        th,td{text-align:left;padding:6px 16px 6px 0;font-size:13px;color:#475569;}
        th{color:#0f172a;font-weight:600;}
        .kpis{display:flex;flex-wrap:wrap;gap:16px;margin-bottom:24px;}
        .kpi{border:1px solid #e2e8f0;border-radius:12px;padding:16px 20px;min-width:140px;}
        .kpi-value{font-size:22px;font-weight:700;}
        .kpi-label{font-size:12px;color:#64748b;margin-top:2px;}
        .brand{display:flex;align-items:center;gap:8px;margin-bottom:24px;font-weight:700;color:#1f43f5;}
        @media print{body{padding:24px;}}
      </style></head><body>
      <div class="brand">SentinelAI</div>
      <h1>${escapeHtml(reportTitle)}</h1>
      <p class="sub">${escapeHtml(previewSubtitle)} · ${escapeHtml(rangeLabel)}</p>
      <table>${metaRows}</table>
      <div class="kpis">${kpiCards}</div>
      <p class="sub">Generated by SentinelAI on ${escapeHtml(generatedAt)}</p>
    </body></html>`
  }

  const printReport = () => {
    const w = window.open('', '_blank', 'width=900,height=700')
    if (!w) return
    w.document.write(buildPrintHtml())
    w.document.close()
    w.focus()
    w.onload = () => {
      w.print()
    }
    // Fallback in case onload doesn't fire for the written document.
    setTimeout(() => {
      try {
        w.print()
      } catch {
        /* noop */
      }
    }, 400)
  }

  const shareReport = async () => {
    const summary = `${reportTitle}\n${previewSubtitle} · ${rangeLabel}\n\n${kpis
      .map((k) => `${k.label}: ${k.value}`)
      .join('\n')}\n\nGenerated by SentinelAI on ${generatedAt}`
    try {
      if (navigator.share) {
        await navigator.share({ title: reportTitle, text: summary })
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(summary)
      }
    } catch {
      /* user dismissed the share sheet */
    }
  }

  const generate = () => {
    void exportReport()
  }

  return (
    <div className="grid gap-5 lg:grid-cols-3">
      <Card className="lg:col-span-1">
        <CardHeader title="Generate report" icon={<FileBarChart className="h-4 w-4" />} />
        <CardBody className="space-y-4">
          <div className="space-y-2">
            {templates.map((t) => (
              <button
                key={t.id}
                onClick={() => { setSelected(t.id); setReady(false) }}
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
            <Select value={range} onChange={(e) => { setRange(e.target.value); setReady(false) }}><option value="7d">Last 7 days</option><option value="30d">Last 30 days</option><option value="quarter">This quarter</option><option value="year">This year</option></Select>
          </Field>
          <Field label="Format">
            <Select value={format} onChange={(e) => setFormat(e.target.value as Format)}><option value="pdf">PDF</option><option value="csv">CSV</option><option value="xlsx">Excel</option></Select>
          </Field>
          <Button className="w-full" onClick={generate} loading={generating}>
            {!generating && <Sparkles className="h-4 w-4" />} {generating ? 'Generating…' : 'Generate report'}
          </Button>
          {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-600 dark:bg-rose-950/40">{error}</p>}
        </CardBody>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader
          title="Preview"
          action={
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={!ready} onClick={printReport}><Printer className="h-3.5 w-3.5" /> Print</Button>
              <Button variant="outline" size="sm" disabled={!ready} onClick={shareReport}><Share2 className="h-3.5 w-3.5" /> Share</Button>
              <Button size="sm" disabled={!ready} onClick={() => exportReport()}><Download className="h-3.5 w-3.5" /> Export</Button>
            </div>
          }
        />
        <CardBody>
          <div className="rounded-2xl border border-line bg-surface-subtle p-6">
            <div className="mb-6 flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-ink">{previewTitle}</h3>
                <p className="text-sm text-ink-muted">{previewSubtitle}</p>
              </div>
              <Badge tone={ready ? 'success' : 'neutral'}>{ready ? 'Ready' : 'Draft'}</Badge>
            </div>
            <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {kpis.map((s) => (
                <div key={s.label} className="rounded-xl border border-line bg-surface p-3">
                  <p className="text-xl font-bold text-ink">{s.value}</p>
                  <p className="text-xs text-ink-muted">{s.label}</p>
                </div>
              ))}
            </div>
            {chart}
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
