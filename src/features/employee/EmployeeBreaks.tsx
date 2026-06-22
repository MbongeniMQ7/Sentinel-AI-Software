import { useEffect, useState } from 'react'
import { Coffee, Pause, Play, Plus, RotateCcw, History } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Field, Select, Textarea } from '@/components/ui/Input'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { StatusBadge } from '@/components/shared/Badges'
import { breakRequests, type BreakRequest } from '@/lib/mockData'

const columns: Column<BreakRequest>[] = [
  { key: 'id', header: 'ID', render: (r) => <span className="font-mono text-xs text-ink-muted">{r.id}</span> },
  { key: 'reason', header: 'Reason', render: (r) => <span className="font-medium text-ink">{r.reason}</span> },
  { key: 'duration', header: 'Duration', render: (r) => `${r.duration} min`, hideOnMobile: true },
  { key: 'requestedAt', header: 'Requested', render: (r) => r.requestedAt, hideOnMobile: true },
  { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
]

export function EmployeeBreaks() {
  const [open, setOpen] = useState(false)
  const [running, setRunning] = useState(false)
  const [seconds, setSeconds] = useState(15 * 60)

  useEffect(() => {
    if (!running) return
    const id = setInterval(() => setSeconds((s) => (s > 0 ? s - 1 : 0)), 1000)
    return () => clearInterval(id)
  }, [running])

  const mm = String(Math.floor(seconds / 60)).padStart(2, '0')
  const ss = String(seconds % 60).padStart(2, '0')
  const pct = (1 - seconds / (15 * 60)) * 100
  const circ = 2 * Math.PI * 70

  return (
    <div>
      <PageHeader
        title="Break Management"
        description="Request, time and review your wellness breaks."
        actions={
          <Button size="sm" onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4" /> Request break
          </Button>
        }
      />

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Timer */}
        <Card className="lg:col-span-1">
          <CardHeader title="Break timer" subtitle="15-minute rest period" icon={<Coffee className="h-4 w-4" />} />
          <CardBody className="flex flex-col items-center">
            <div className="relative flex h-44 w-44 items-center justify-center">
              <svg className="h-44 w-44 -rotate-90">
                <circle cx="88" cy="88" r="70" fill="none" stroke="currentColor" className="text-surface-muted" strokeWidth="12" />
                <circle
                  cx="88"
                  cy="88"
                  r="70"
                  fill="none"
                  stroke="#3563ff"
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray={circ}
                  strokeDashoffset={circ * (1 - pct / 100)}
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute text-center">
                <p className="text-3xl font-bold tabular-nums text-ink">{mm}:{ss}</p>
                <p className="text-xs text-ink-subtle">remaining</p>
              </div>
            </div>
            <div className="mt-6 flex gap-2">
              <Button variant={running ? 'outline' : 'primary'} onClick={() => setRunning((r) => !r)}>
                {running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {running ? 'Pause' : 'Start'}
              </Button>
              <Button variant="ghost" size="icon" onClick={() => { setSeconds(15 * 60); setRunning(false) }} aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </CardBody>
        </Card>

        {/* Stats + presets */}
        <div className="space-y-5 lg:col-span-2">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: 'Breaks today', value: '2' },
              { label: 'Total time', value: '35m' },
              { label: 'This week', value: '11' },
              { label: 'Compliance', value: '100%' },
            ].map((s) => (
              <Card key={s.label} className="p-4">
                <p className="text-2xl font-bold text-ink">{s.value}</p>
                <p className="text-xs text-ink-muted">{s.label}</p>
              </Card>
            ))}
          </div>
          <Card>
            <CardHeader title="Quick presets" />
            <CardBody className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[5, 10, 15, 30].map((m) => (
                <button
                  key={m}
                  onClick={() => { setSeconds(m * 60); setRunning(false) }}
                  className="rounded-xl border border-line p-4 text-center transition-colors hover:border-brand-300 hover:bg-surface-muted"
                >
                  <p className="text-lg font-semibold text-ink">{m}m</p>
                  <p className="text-xs text-ink-subtle">{m <= 10 ? 'Micro' : m <= 15 ? 'Rest' : 'Meal'}</p>
                </button>
              ))}
            </CardBody>
          </Card>
        </div>
      </div>

      <Card className="mt-5">
        <CardHeader title="Break history" icon={<History className="h-4 w-4" />} />
        <CardBody className="p-0">
          <DataTable columns={columns} data={breakRequests} rowKey={(r) => r.id} />
        </CardBody>
      </Card>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Request a break"
        description="Your manager will be notified instantly."
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => setOpen(false)}>Submit request</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Break reason" required>
            <Select defaultValue="Fatigue recovery">
              <option>Fatigue recovery</option>
              <option>Meal break</option>
              <option>Rest period</option>
              <option>Hydration</option>
              <option>Stretch break</option>
            </Select>
          </Field>
          <Field label="Duration" required>
            <Select defaultValue="15">
              <option value="5">5 minutes</option>
              <option value="10">10 minutes</option>
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
            </Select>
          </Field>
          <Field label="Note (optional)">
            <Textarea rows={3} placeholder="Add any context for your manager…" />
          </Field>
        </div>
      </Modal>
    </div>
  )
}
