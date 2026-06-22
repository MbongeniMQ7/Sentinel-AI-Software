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

export function ReportsBuilder({ templates, previewTitle, previewSubtitle, kpis, chart }: ReportsBuilderProps) {
  const [selected, setSelected] = useState(templates[0]?.id)
  const [generating, setGenerating] = useState(false)
  const [ready, setReady] = useState(false)

  const generate = () => {
    setGenerating(true)
    setReady(false)
    setTimeout(() => {
      setGenerating(false)
      setReady(true)
    }, 1100)
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
            <Select defaultValue="30d"><option value="7d">Last 7 days</option><option value="30d">Last 30 days</option><option value="quarter">This quarter</option><option value="year">This year</option></Select>
          </Field>
          <Field label="Format">
            <Select defaultValue="pdf"><option value="pdf">PDF</option><option value="csv">CSV</option><option value="xlsx">Excel</option></Select>
          </Field>
          <Button className="w-full" onClick={generate} loading={generating}>
            {!generating && <Sparkles className="h-4 w-4" />} {generating ? 'Generating…' : 'Generate report'}
          </Button>
        </CardBody>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader
          title="Preview"
          action={
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={!ready}><Printer className="h-3.5 w-3.5" /> Print</Button>
              <Button variant="outline" size="sm" disabled={!ready}><Share2 className="h-3.5 w-3.5" /> Share</Button>
              <Button size="sm" disabled={!ready}><Download className="h-3.5 w-3.5" /> Export</Button>
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
