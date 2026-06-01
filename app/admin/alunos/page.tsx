import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { Users, BookOpen, CreditCard } from 'lucide-react';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: 'Alunos' };

export default async function AdminAlunos() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') redirect('/login');

  const students = await prisma.user.findMany({
    where: { role: 'STUDENT' },
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { studentCourses: true, payments: true } },
    },
  });

  return (
    <div style={{ padding: '2rem 2.5rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 700, color: 'var(--seiva-dark)', marginBottom: '0.25rem' }}>
          Alunos
        </h1>
        <p style={{ color: '#6b7280', fontSize: '0.9375rem' }}>
          {students.length} {students.length === 1 ? 'aluno cadastrado' : 'alunos cadastrados'}
        </p>
      </div>

      {students.length === 0 ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
          <Users size={40} color="var(--seiva-muted)" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--seiva-dark)', marginBottom: '0.5rem' }}>
            Nenhum aluno cadastrado
          </h3>
          <p style={{ color: '#9ca3af' }}>Os alunos aparecerão aqui após se cadastrarem.</p>
        </div>
      ) : (
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ background: '#fafaf8', borderBottom: '1px solid #e5e7eb' }}>
                  {['Aluno', 'E-mail', 'Cursos', 'Pagamentos', 'Cadastro'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '0.75rem 1rem', color: '#6b7280', fontWeight: 600, fontSize: '0.8125rem', whiteSpace: 'nowrap' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {students.map(student => (
                  <tr key={student.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                          width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                          background: 'var(--seiva-medium)', display: 'flex', alignItems: 'center',
                          justifyContent: 'center', fontSize: '0.875rem', fontWeight: 700, color: 'white',
                        }}>
                          {student.name.charAt(0).toUpperCase()}
                        </div>
                        <span style={{ fontWeight: 600, color: 'var(--seiva-ink)' }}>{student.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '0.875rem 1rem', color: '#4b5563' }}>{student.email}</td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', color: 'var(--seiva-medium)', fontWeight: 600 }}>
                        <BookOpen size={13} /> {student._count.studentCourses}
                      </span>
                    </td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', color: '#6b7280' }}>
                        <CreditCard size={13} /> {student._count.payments}
                      </span>
                    </td>
                    <td style={{ padding: '0.875rem 1rem', color: '#9ca3af', fontSize: '0.8125rem' }}>
                      {new Date(student.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
