import { CreditCard, Download, DollarSign, FileText, Plus, Receipt, TrendingUp } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { KpiCard } from '@/components/shared/KpiCard'
import { StatusBadge } from '@/components/shared/Badges'
import { companies } from '@/lib/mockData'
import { formatCurrency } from '@/lib/utils'

interface Invoice {
  id: string
  company: string
  amount: number
  plan: string
  date: string
  status: 'paid' | 'pending' | 'failed'
}

const invoices: Invoice[] = companies.slice(0, 10).map((c, i) => ({
  id: `INV-${7000 + i}`,
  company: c.name,
  amount: c.mrr,
  plan: c.plan,
  date: `Jun ${1 + i * 2}, 2026`,
  status: (['paid', 'paid', 'paid', 'pending', 'failed'] as const)[i % 5],
}))

const invoiceTone = { paid: 'success', pending: 'warning', failed: 'danger' } as const

export function OwnerBilling() {
  const columns: Column<Invoice>[] = [
    { key: 'id', header: 'Invoice', render: (i) => <span className="font-mono text-xs text-ink-muted">{i.id}</span> },
    {
      key: 'company',
      header: 'Company',
      render: (i) => (
        <div className="flex items-center gap-3"><Avatar name={i.company} size="sm" /><span className="font-medium text-ink">{i.company}</span></div>
      ),
    },
    { key: 'plan', header: 'Plan', render: (i) => <Badge tone="neutral">{i.plan}</Badge>, hideOnMobile: true },
    { key: 'date', header: 'Date', render: (i) => i.date, hideOnMobile: true },
    { key: 'amount', header: 'Amount', render: (i) => <span className="font-semibold text-ink">{formatCurrency(i.amount)}</span> },
    { key: 'status', header: 'Status', render: (i) => <Badge tone={invoiceTone[i.status]} dot className="capitalize">{i.status}</Badge> },
    { key: 'action', header: '', render: () => <Button variant="ghost" size="icon"><Download className="h-4 w-4" /></Button> },
  ]

  const totalCollected = invoices.filter((i) => i.status === 'paid').reduce((s, i) => s + i.amount, 0)
  const outstanding = invoices.filter((i) => i.status !== 'paid').reduce((s, i) => s + i.amount, 0)

  return (
    <div>
      <PageHeader
        title="Billing"
        description="Subscriptions, invoices and payment management."
        actions={<><Button variant="outline" size="sm"><FileText className="h-4 w-4" /> Statements</Button><Button size="sm"><Plus className="h-4 w-4" /> New invoice</Button></>}
      />

      <div className="mb-5 grid gap-4 sm:grid-cols-4">
        <KpiCard label="Collected (MTD)" value={formatCurrency(totalCollected)} icon={<DollarSign className="h-5 w-5" />} tone="success" delta={9} />
        <KpiCard label="Outstanding" value={formatCurrency(outstanding)} icon={<Receipt className="h-5 w-5" />} tone="warning" />
        <KpiCard label="Active subscriptions" value={companies.filter((c) => c.status === 'active').length} icon={<CreditCard className="h-5 w-5" />} tone="brand" />
        <KpiCard label="Avg revenue / co." value={formatCurrency(Math.round(companies.reduce((s, c) => s + c.mrr, 0) / companies.length))} icon={<TrendingUp className="h-5 w-5" />} tone="purple" />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader title="Subscription plans" icon={<CreditCard className="h-4 w-4" />} />
          <CardBody className="space-y-3">
            {[
              { name: 'Starter', price: '$12', per: 'seat/mo', companies: companies.filter((c) => c.plan === 'Starter').length, tone: 'info' as const },
              { name: 'Growth', price: '$9', per: 'seat/mo', companies: companies.filter((c) => c.plan === 'Growth').length, tone: 'brand' as const },
              { name: 'Enterprise', price: '$7', per: 'seat/mo', companies: companies.filter((c) => c.plan === 'Enterprise').length, tone: 'purple' as const },
            ].map((p) => (
              <div key={p.name} className="rounded-xl border border-line p-4">
                <div className="flex items-center justify-between"><Badge tone={p.tone}>{p.name}</Badge><span className="text-sm text-ink-muted">{p.companies} companies</span></div>
                <p className="mt-3 text-2xl font-bold text-ink">{p.price}<span className="text-sm font-normal text-ink-subtle"> / {p.per}</span></p>
              </div>
            ))}
          </CardBody>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader title="Recent invoices" action={<Button variant="outline" size="sm"><Download className="h-3.5 w-3.5" /> Export all</Button>} />
          <CardBody className="p-0">
            <DataTable columns={columns} data={invoices} rowKey={(i) => i.id} />
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
