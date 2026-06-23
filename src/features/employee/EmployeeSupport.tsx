import { useState } from 'react'
import { ChevronDown, Inbox, LifeBuoy, MessageSquare, Search, Send, ShieldCheck } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Field, Input, Select, Textarea } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { useFaqs, submitSupportTicket, useMyTickets } from '@/lib/api'
import { useAuth } from '@/lib/auth'
import { cn } from '@/lib/utils'

const ticketTone: Record<'open' | 'pending' | 'resolved' | 'closed', 'info' | 'warning' | 'success' | 'neutral'> = {
  open: 'info',
  pending: 'warning',
  resolved: 'success',
  closed: 'neutral',
}

const ticketStatusLabel: Record<'open' | 'pending' | 'resolved' | 'closed', string> = {
  open: 'Open',
  pending: 'In progress',
  resolved: 'Resolved',
  closed: 'Closed',
}

export function EmployeeSupport() {
  const [openFaq, setOpenFaq] = useState<number | null>(0)
  const [query, setQuery] = useState('')
  const [sent, setSent] = useState(false)
  const { data: faqs } = useFaqs()
  const { user } = useAuth()
  const { data: myTickets, refetch: refetchTickets } = useMyTickets(user?.id)
  const [openTicket, setOpenTicket] = useState<string | null>(null)
  const [subject, setSubject] = useState('')
  const [category, setCategory] = useState('technical')
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async () => {
    if (!user) return
    if (!subject.trim() || !message.trim()) {
      setError('Subject and message are required.')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      await submitSupportTicket({
        openedBy: user.id,
        companyId: user.companyId,
        subject,
        category,
        priority,
        message,
      })
      setSubject('')
      setMessage('')
      setSent(true)
      refetchTickets()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not submit ticket')
    } finally {
      setSubmitting(false)
    }
  }

  const filtered = faqs.filter((f) => f.q.toLowerCase().includes(query.toLowerCase()))

  return (
    <div>
      <PageHeader title="Support" description="Find answers fast or report an issue to your manager." />

      <div className="mb-5 grid gap-4 sm:grid-cols-3">
        {[
          { icon: MessageSquare, title: 'Report to your manager', desc: 'Submit a ticket below', tone: 'bg-brand-50 text-brand-600 dark:bg-brand-950/40' },
          { icon: LifeBuoy, title: 'Help center', desc: 'Browse common answers', tone: 'bg-violet-50 text-violet-600 dark:bg-violet-950/40' },
          { icon: ShieldCheck, title: 'Escalation', desc: 'Your manager forwards technical issues to SentinelAI', tone: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40' },
        ].map((c) => (
          <Card key={c.title} className="p-5">
            <span className={cn('flex h-10 w-10 items-center justify-center rounded-xl', c.tone)}>
              <c.icon className="h-5 w-5" />
            </span>
            <p className="mt-3 text-sm font-semibold text-ink">{c.title}</p>
            <p className="text-sm text-ink-muted">{c.desc}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Frequently asked questions" icon={<LifeBuoy className="h-4 w-4" />} />
          <CardBody className="space-y-3">
            <Input icon={<Search className="h-4 w-4" />} placeholder="Search the help center…" value={query} onChange={(e) => setQuery(e.target.value)} />
            <div className="divide-y divide-line">
              {filtered.map((f, i) => (
                <div key={f.q}>
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="flex w-full items-center justify-between gap-4 py-3.5 text-left"
                  >
                    <span className="text-sm font-medium text-ink">{f.q}</span>
                    <ChevronDown className={cn('h-4 w-4 shrink-0 text-ink-subtle transition-transform', openFaq === i && 'rotate-180')} />
                  </button>
                  {openFaq === i && <p className="pb-4 text-sm text-ink-muted">{f.a}</p>}
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader title="Report an issue" subtitle="Your manager will review and respond" />
          <CardBody className="space-y-4">
            {sent ? (
              <div className="rounded-xl bg-emerald-50 p-4 text-center dark:bg-emerald-950/30">
                <Badge tone="success" className="mb-2">Ticket sent</Badge>
                <p className="text-sm text-ink-muted">Your manager has received this issue and will follow up.</p>
                <Button variant="outline" size="sm" className="mt-3" onClick={() => setSent(false)}>Report another</Button>
              </div>
            ) : (
              <>
                {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600 dark:bg-rose-950/40">{error}</p>}
                <Field label="Subject" required><Input placeholder="Briefly describe the issue" value={subject} onChange={(e) => setSubject(e.target.value)} /></Field>
                <Field label="Category">
                  <Select value={category} onChange={(e) => setCategory(e.target.value)}>
                    <option value="technical">Technical issue</option>
                    <option value="account">Account & access</option>
                    <option value="device">Device & monitoring</option>
                    <option value="billing">Billing</option>
                  </Select>
                </Field>
                <Field label="Priority">
                  <Select value={priority} onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high' | 'urgent')}><option value="low">Low</option><option value="medium">Normal</option><option value="high">High</option><option value="urgent">Urgent</option></Select>
                </Field>
                <Field label="Message" required><Textarea rows={4} placeholder="Tell us what's happening…" value={message} onChange={(e) => setMessage(e.target.value)} /></Field>
                <Button className="w-full" onClick={submit} disabled={submitting}><Send className="h-4 w-4" /> {submitting ? 'Sending…' : 'Send to manager'}</Button>
              </>
            )}
          </CardBody>
        </Card>
      </div>

      <Card className="mt-5">
        <CardHeader title="My tickets" subtitle="Track the status of issues you've reported" icon={<Inbox className="h-4 w-4" />} />
        <CardBody>
          {myTickets.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-10 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface-muted text-ink-subtle"><Inbox className="h-6 w-6" /></span>
              <p className="text-sm font-medium text-ink">No tickets yet</p>
              <p className="text-sm text-ink-muted">Issues you report will appear here so you can follow their progress.</p>
            </div>
          ) : (
            <div className="divide-y divide-line">
              {myTickets.map((t) => (
                <div key={t.id} className="py-3">
                  <button
                    onClick={() => setOpenTicket(openTicket === t.id ? null : t.id)}
                    className="flex w-full items-center gap-3 text-left"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm font-medium text-ink">{t.subject}</span>
                        {t.escalated && <Badge tone="warning">Escalated</Badge>}
                      </div>
                      <p className="mt-0.5 text-xs text-ink-subtle">{t.number} · {t.created}</p>
                    </div>
                    <Badge tone={ticketTone[t.status]}>{ticketStatusLabel[t.status]}</Badge>
                    <ChevronDown className={cn('h-4 w-4 shrink-0 text-ink-subtle transition-transform', openTicket === t.id && 'rotate-180')} />
                  </button>
                  {openTicket === t.id && (
                    <div className="mt-3 space-y-3 rounded-xl bg-surface-subtle p-3">
                      {t.replies.length === 0 ? (
                        <p className="text-sm text-ink-muted">No messages yet.</p>
                      ) : (
                        t.replies.map((r) => (
                          <div key={r.id} className={cn('flex flex-col', r.mine ? 'items-end' : 'items-start')}>
                            <div className={cn('max-w-[85%] rounded-xl px-3 py-2 text-sm', r.mine ? 'bg-brand-600 text-white' : 'bg-surface text-ink ring-1 ring-line')}>
                              {r.body}
                            </div>
                            <span className="mt-1 text-[11px] text-ink-subtle">{r.author} · {r.created}</span>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  )
}
