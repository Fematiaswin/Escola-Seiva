import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import {
  Users, BookOpen, DollarSign, TrendingUp,
  Clock, CheckCircle, AlertCircle, BookMarked
} from 'lucide-react';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: 'Dashboard' };

async function getDashboardData() {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [
    totalStudents,
    totalCourses,
    revenue,
    newStudents7d,
    pendingPayments,
    topCourses,
    recentPayments,
    recentEnrollments,
  ] = await Promise.all([
    prisma.user.count({ where: { role: 'STUDENT' } }),
    prisma.course.count({ where: { isPublished: true } }),
    prisma.payment.aggregate({ where: { status: 'CONFIRMED' }, _sum: { value: true }, _count: true }),
    prisma.user.count({ where: { role: 'STUDENT', createdAt: { gte: sevenDaysAgo } } }),
    prisma.payment.count({ where: { status: 'PENDING' } }),
    prisma.course.findMany({
      where: { isPublished: true },
      include: { _count: { select: { studentCourses: true } } },
      orderBy: { studentCourses: { _count: 'desc' } },
      take: 5,
    }),
    prisma.payment.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      include: {
        user: { select: { name: true, email: true } },
        course: { select: { title: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 8,
    }),
    prisma.studentCourse.findMany({
      where: { enrolledAt: { gte: sevenDaysAgo } },
      include: {
        user: { select: { name: true, email: true } },
        course: { select: { title: true } },
      },
      orderBy: { enrolledAt: 'desc' },
      take: 5,
    }),
  ]);

  return {
    totalStudents, totalCourses,
    totalRevenue: revenue._sum.value || 0,
    totalSales: revenue._count,
    newStudents7d, pendingPayments,
    topCourses, recentPayments, recentEnrollments,
  };
}

const statusLabel: Record<string, { label: string; color: string; bg: string }> = {
  CONFIRMED: { label: 'Confirmado', color: '#166534', bg: 'rgba(22,163,74,0.10)' },
  PENDING:   { label: 'Pendente',   color: '#854d0e', bg: 'rgba(234,179,8,0.10)' },
  OVERDUE:   { label: 'Vencido',    color: '#991b1b', bg: 'rgba(239,68,68,0.10)' },
  ERROR:     { label: 'Erro',       color: '#991b1b', bg: 'rgba(239,68,68,0.10)' },
  CANCELLED: { label: 'Cancelado',  color: '#6b7280', bg: 'rgba(107,114,128,0.10)' },
};

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') redirect('/login');

  const data = await getDashboardData();

  const stats = [
    {
      label: 'Total de alunos',
      value: data.totalStudents,
      sub: `+${data.newStudents7d} nos últimos 7 dias`,
      icon: Users,
      color: '#606c38',
      bg: 'rgba(96,108,56,0.08)',
    },
    {
      label: 'Cursos publicados',
      value: data.totalCourses,
      sub: 'cursos disponíveis',
      icon: BookOpen,
      color: '#2563eb',
      bg: 'rgba(37,99,235,0.08)',
    },
    {
      label: 'Receita total',
      value: `R$ ${data.totalRevenue.toFixed(2).replace('.', ',')}`,
      sub: `${data.totalSales} vendas confirmadas`,
      icon: DollarSign,
      color: '#16a34a',
      bg: 'rgba(22,163,74,0.08)',
    },
    {
      label: 'Pagamentos pendentes',
      value: data.pendingPayments,
      sub: 'aguardando confirmação',
      icon: Clock,
      color: '#d97706',
      bg: 'rgba(217,119,6,0.08)',
    },
  ];

  return (
    <div style={{ padding: '2rem 2.5rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 700,
          color: 'var(--seiva-dark)', marginBottom: '0.25rem',
        }}>
          Dashboard
        </h1>
        <p style={{ color: '#6b7280', fontSize: '0.9375rem' }}>
          Visão geral da plataforma — bem-vindo, {session.user?.name?.split(' ')[0]}!
        </p>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem', marginBottom: '2rem' }}
        className="stats-grid">
        {stats.map((s, i) => (
          <div key={s.label} className="card animate-fade-up" style={{ padding: '1.5rem', animationDelay: `${i * 0.06}s` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#9ca3af', letterSpacing: '0.03em', textTransform: 'uppercase' }}>
                  {s.label}
                </p>
                <p style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--seiva-ink)', lineHeight: 1.2, marginTop: '0.375rem' }}>
                  {s.value}
                </p>
              </div>
              <div style={{
                width: 44, height: 44, borderRadius: 'var(--radius-lg)',
                background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <s.icon size={20} color={s.color} />
              </div>
            </div>
            <p style={{ fontSize: '0.8125rem', color: '#9ca3af' }}>{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Two columns */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}
        className="two-col">

        {/* Top Courses */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--seiva-dark)', marginBottom: '1.25rem' }}>
            Cursos mais populares
          </h2>
          {data.topCourses.length === 0 ? (
            <p style={{ color: '#9ca3af', fontSize: '0.9rem' }}>Nenhum curso ainda.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              {data.topCourses.map((c, i) => (
                <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                  <span style={{
                    width: 28, height: 28, borderRadius: '50%', background: 'rgba(96,108,56,0.10)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.75rem', fontWeight: 700, color: 'var(--seiva-medium)', flexShrink: 0,
                  }}>{i + 1}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--seiva-ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {c.title}
                    </p>
                    <div style={{ height: 4, background: '#e5e7eb', borderRadius: 999, marginTop: '0.375rem', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', borderRadius: 999,
                        background: 'linear-gradient(90deg, var(--seiva-medium), var(--seiva-dark))',
                        width: `${Math.min(100, (c._count.studentCourses / (data.totalStudents || 1)) * 100 + 10)}%`,
                      }} />
                    </div>
                  </div>
                  <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--seiva-medium)', flexShrink: 0 }}>
                    {c._count.studentCourses}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Enrollments */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--seiva-dark)', marginBottom: '1.25rem' }}>
            Matrículas recentes (7 dias)
          </h2>
          {data.recentEnrollments.length === 0 ? (
            <p style={{ color: '#9ca3af', fontSize: '0.9rem' }}>Nenhuma matrícula recente.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {data.recentEnrollments.map(e => (
                <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                    background: 'var(--seiva-medium)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.8125rem', fontWeight: 700, color: 'white',
                  }}>
                    {e.user.name.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--seiva-ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {e.user.name}
                    </p>
                    <p style={{ fontSize: '0.75rem', color: '#9ca3af', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {e.course.title}
                    </p>
                  </div>
                  <CheckCircle size={16} color="#16a34a" style={{ flexShrink: 0 }} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Payments */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--seiva-dark)' }}>
            Pagamentos recentes (30 dias)
          </h2>
        </div>
        {data.recentPayments.length === 0 ? (
          <p style={{ color: '#9ca3af', fontSize: '0.9rem' }}>Nenhum pagamento no período.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                  {['Aluno', 'Curso', 'Valor', 'Status', 'Data'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '0.5rem 0.75rem', color: '#6b7280', fontWeight: 600, fontSize: '0.8125rem', whiteSpace: 'nowrap' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.recentPayments.map(p => {
                  const st = statusLabel[p.status] || { label: p.status, color: '#6b7280', bg: '#f3f4f6' };
                  return (
                    <tr key={p.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '0.75rem' }}>
                        <p style={{ fontWeight: 600, color: 'var(--seiva-ink)' }}>{p.user.name}</p>
                        <p style={{ color: '#9ca3af', fontSize: '0.75rem' }}>{p.user.email}</p>
                      </td>
                      <td style={{ padding: '0.75rem', color: '#4b5563', maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {p.course.title}
                      </td>
                      <td style={{ padding: '0.75rem', fontWeight: 700, color: 'var(--seiva-dark)', whiteSpace: 'nowrap' }}>
                        R$ {p.value.toFixed(2).replace('.', ',')}
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        <span style={{
                          display: 'inline-block', padding: '0.25rem 0.625rem',
                          borderRadius: 999, fontSize: '0.75rem', fontWeight: 600,
                          color: st.color, background: st.bg,
                        }}>
                          {st.label}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem', color: '#6b7280', whiteSpace: 'nowrap', fontSize: '0.8125rem' }}>
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
        @media (max-width: 1100px) { .stats-grid { grid-template-columns: repeat(2,1fr) !important; } }
        @media (max-width: 768px)  { .stats-grid { grid-template-columns: 1fr !important; } .two-col { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
}
