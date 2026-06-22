import { useState } from 'react'
import { Download, FileBarChart, FileText, Printer, Share2, Sparkles } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Field, Select } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { BarSeries } from '@/components/shared/Charts'
import { useWeeklyAlerts } from '@/lib/api'

const templates = [
  { id: 'wellness', title: 'Weekly Wellness Summary', desc: 'Fatigue, focus and break compliance for the week.' },
  { id: 'fatigue', title: 'Fatigue Trend Report', desc: 'Daily fatigue index with peak-risk windows.' },
  { id: 'attendance', title: 'Attendance & Breaks', desc: 'Shift attendance, breaks and leave summary.' },
]

export function EmployeeReports() {
  const [selected, setSelected] = useState('wellness')
  const [generating, setGenerating] = useState(false)
  const [ready, setReady] = useState(false)
  const { data: weeklyAlerts } = useWeeklyAlerts()

  const generate = () => {
    setGenerating(true)
    setReady(false)
    setTimeout(() => {
      setGenerating(false)
      setReady(true)
    }, 1100)
  }

  return (
    <div>
      <PageHeader title="Reports" description="Generate and export your personal wellness reports." />

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
              <Select defaultValue="7d">
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="quarter">This quarter</option>
              </Select>
            </Field>
            <Field label="Format">
              <Select defaultValue="pdf">
                <option value="pdf">PDF</option>
                <option value="csv">CSV</option>
                <option value="xlsx">Excel</option>
              </Select>
            </Field>
            <Button className="w-full" onClick={generate} loading={generating}>
              {!generating && <Sparkles className="h-4 w-4" />} {generating ? 'Generating…' : 'Generate report'}
            </Button>
          </CardBody>
        </Card>

        {/* Preview */}
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
                  <h3 className="text-lg font-bold text-ink">Weekly Wellness Summary</h3>
                  <p className="text-sm text-ink-muted">Alex Mercer · Jun 16–22, 2026</p>
                </div>
                <Badge tone={ready ? 'success' : 'neutral'}>{ready ? 'Ready' : 'Draft'}</Badge>
              </div>
              <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
                {[
                  { l: 'Avg fatigue', v: '38' },
                  { l: 'Avg focus', v: '86%' },
                  { l: 'Breaks taken', v: '11' },
                  { l: 'Alerts', v: '3' },
                ].map((s) => (
                  <div key={s.l} className="rounded-xl border border-line bg-surface p-3">
                    <p className="text-xl font-bold text-ink">{s.v}</p>
                    <p className="text-xs text-ink-muted">{s.l}</p>
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
