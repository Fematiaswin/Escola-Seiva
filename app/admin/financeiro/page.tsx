import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { DollarSign, Clock, CheckCircle, XCircle } from 'lucide-react';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: 'Financeiro' };

const statusMap: Record<string, { label: string; color: string; bg: string; icon: typeof CheckCircle }> = {
  CONFIRMED: { label: 'Confirmado', color: '#166534', bg: 'rgba(22,163,74,0.10)', icon: CheckCircle },
  PENDING:   { label: 'Pendente',   color: '#854d0e', bg: 'rgba(234,179,8,0.10)',  icon: Clock },
  OVERDUE:   { label: 'Vencido',    color: '#991b1b', bg: 'rgba(239,68,68,0.10)',  icon: XCircle },
  ERROR:     { label: 'Erro',       color: '#991b1b', bg: 'rgba(239,68,68,0.10)',  icon: XCircle },
  CANCELLED: { label: 'Cancelado',  color: '#6b7280', bg: 'rgba(107,114,128,0.10)', icon: XCircle },
  REFUNDED:  { label: 'Estornado',  color: '#1d4ed8', bg: 'rgba(37,99,235,0.10)',  icon: XCircle },
};

export default async function AdminFinanceiro() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') redirect('/login');

  const [payments, stats] = await Promise.all([
    prisma.payment.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: {
        user: { select: { name: true, email: true } },
        course: { select: { title: true } },
      },
    }),
    prisma.payment.groupBy({
      by: ['status'],
      _sum: { value: true },
      _count: true,
    }),
  ]);

  const confirmed = stats.find(s => s.status === 'CONFIRMED');
  const pending   = stats.find(s => s.status === 'PENDING');
  const total = stats.reduce((a, s) => a + (s._sum.value || 0), 0);

  const summaryCards = [
    { label: 'Receita confirmada', value: `R$ ${(confirmed?._sum.value || 0).toFixed(2).replace('.', ',')}`, count: confirmed?._count || 0, icon: DollarSign, color: '#16a34a', bg: 'rgba(22,163,74,0.08)' },
    { label: 'Aguardando pagamento', value: `R$ ${(pending?._sum.value || 0).toFixed(2).replace('.', ',')}`, count: pending?._count || 0, icon: Clock, color: '#d97706', bg: 'rgba(217,119,6,0.08)' },
    { label: 'Total movimentado', value: `R$ ${total.toFixed(2).replace('.', ',')}`, count: payments.length, icon: DollarSign, color: '#2563eb', bg: 'rgba(37,99,235,0.08)' },
  ];

  return (
    <div style={{ padding: '2rem 2.5rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '1.75rem', fontWeight: 700, color: 'var(--seiva-dark)', marginBottom: '0.25rem' }}>
          Financeiro
        </h1>
        <p style={{ color: '#6b7280', fontSize: '0.9375rem' }}>Histórico de pagamentos e receitas</p>
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1.25rem', marginBottom: '2rem' }} className="fin-grid">
        {summaryCards.map(c => (
          <div key={c.label} className="card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-lg)', background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <c.icon size={22} color={c.color} />
            </div>
            <div>
              <p style={{ fontSize: '0.8rem', color: '#9ca3af', fontWeight: 600 }}>{c.label}</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--seiva-ink)', lineHeight: 1.2 }}>{c.value}</p>
              <p style={{ fontSize: '0.78rem', color: '#9ca3af' }}>{c.count} transações</p>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e5e7eb' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--seiva-dark)' }}>
            Todas as transações
          </h2>
        </div>
        {payments.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#9ca3af' }}>Nenhuma transação ainda.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ background: '#fafaf8', borderBottom: '1px solid #e5e7eb' }}>
                  {['Aluno', 'Curso', 'Valor', 'Status', 'ID Asaas', 'Data'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '0.75rem 1rem', color: '#6b7280', fontWeight: 600, fontSize: '0.8125rem', whiteSpace: 'nowrap' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {payments.map(p => {
                  const st = statusMap[p.status] || { label: p.status, color: '#6b7280', bg: '#f3f4f6', icon: Clock };
                  const Icon = st.icon;
                  return (
                    <tr key={p.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <p style={{ fontWeight: 600, color: 'var(--seiva-ink)' }}>{p.user.name}</p>
                        <p style={{ color: '#9ca3af', fontSize: '0.75rem' }}>{p.user.email}</p>
                      </td>
                      <td style={{ padding: '0.75rem 1rem', color: '#4b5563', maxWidth: 180, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {p.course.title}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--seiva-dark)', whiteSpace: 'nowrap' }}>
                        R$ {p.value.toFixed(2).replace('.', ',')}
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.2rem 0.6rem', borderRadius: 999, fontSize: '0.75rem', fontWeight: 600, color: st.color, background: st.bg }}>
                          <Icon size={11} /> {st.label}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem 1rem', color: '#9ca3af', fontSize: '0.8rem', fontFamily: 'monospace' }}>
                        {p.asaasPaymentId ? p.asaasPaymentId.slice(0, 16) + '...' : '—'}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', color: '#6b7280', fontSize: '0.8125rem', whiteSpace: 'nowrap' }}>
                        {new Date(p.createdAt).toLocaleDateString('pt-BR')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <style>{`
        @media (max-width: 900px) { .fin-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
}
