import { useState } from 'react'
import { ChevronDown, LifeBuoy, Mail, MessageSquare, Phone, Search, Send } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Field, Input, Select, Textarea } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { useFaqs, submitSupportTicket } from '@/lib/api'
import { useAuth } from '@/lib/auth'
import { cn } from '@/lib/utils'

export function EmployeeSupport() {
  const [openFaq, setOpenFaq] = useState<number | null>(0)
  const [query, setQuery] = useState('')
  const [sent, setSent] = useState(false)
  const { data: faqs } = useFaqs()
  const { user } = useAuth()
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
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not submit ticket')
    } finally {
      setSubmitting(false)
    }
  }

  const filtered = faqs.filter((f) => f.q.toLowerCase().includes(query.toLowerCase()))

  return (
    <div>
      <PageHeader title="Support" description="Find answers fast or reach our team." />

      <div className="mb-5 grid gap-4 sm:grid-cols-3">
        {[
          { icon: MessageSquare, title: 'Live chat', desc: 'Avg reply < 2 min', tone: 'bg-brand-50 text-brand-600 dark:bg-brand-950/40' },
          { icon: Mail, title: 'Email us', desc: 'support@sentinel.ai', tone: 'bg-violet-50 text-violet-600 dark:bg-violet-950/40' },
          { icon: Phone, title: 'Call', desc: '+1 (800) 555-0100', tone: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40' },
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
          <CardHeader title="Submit a ticket" subtitle="We'll get back within 24 hours" />
          <CardBody className="space-y-4">
            {sent ? (
              <div className="rounded-xl bg-emerald-50 p-4 text-center dark:bg-emerald-950/30">
                <Badge tone="success" className="mb-2">Ticket created</Badge>
                <p className="text-sm text-ink-muted">Thanks! Our team will reply to your email shortly.</p>
                <Button variant="outline" size="sm" className="mt-3" onClick={() => setSent(false)}>Submit another</Button>
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
                <Button className="w-full" onClick={submit} disabled={submitting}><Send className="h-4 w-4" /> {submitting ? 'Submitting…' : 'Submit ticket'}</Button>
              </>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
