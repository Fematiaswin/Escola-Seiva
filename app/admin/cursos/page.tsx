import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Plus, BookOpen, Users, Edit, Eye, EyeOff } from 'lucide-react';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: 'Cursos' };

export default async function AdminCursos() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') redirect('/login');

  const courses = await prisma.course.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { modules: true, studentCourses: true, payments: true } },
      modules: { include: { _count: { select: { lessons: true } } } },
    },
  });

  const totalLessons = (c: typeof courses[0]) =>
    c.modules.reduce((a, m) => a + m._count.lessons, 0);

  return (
    <div style={{ padding: '2rem 2.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '1.75rem', fontWeight: 700, color: 'var(--seiva-dark)', marginBottom: '0.25rem' }}>
            Cursos
          </h1>
          <p style={{ color: '#6b7280', fontSize: '0.9375rem' }}>
            {courses.length} {courses.length === 1 ? 'curso cadastrado' : 'cursos cadastrados'}
          </p>
        </div>
        <Link href="/admin/cursos/novo" className="btn btn-primary">
          <Plus size={17} /> Novo curso
        </Link>
      </div>

      {courses.length === 0 ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
          <BookOpen size={40} color="var(--seiva-muted)" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--seiva-dark)', marginBottom: '0.5rem' }}>
            Nenhum curso criado ainda
          </h3>
          <p style={{ color: '#9ca3af', marginBottom: '1.5rem' }}>
            Crie seu primeiro curso para começar.
          </p>
          <Link href="/admin/cursos/novo" className="btn btn-primary">
            <Plus size={17} /> Criar primeiro curso
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          {courses.map(course => (
            <div key={course.id} className="card" style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
              {/* Cover thumb */}
              <div style={{
                width: 72, height: 52, borderRadius: 'var(--radius-md)', flexShrink: 0, overflow: 'hidden',
                background: course.coverImage
                  ? `url(${course.coverImage}) center/cover`
                  : 'linear-gradient(135deg, var(--seiva-dark), var(--seiva-medium))',
              }} />

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.25rem' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--seiva-ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {course.title}
                  </h3>
                  <span style={{
                    flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                    padding: '0.15rem 0.5rem', borderRadius: 999, fontSize: '0.7rem', fontWeight: 600,
                    background: course.isPublished ? 'rgba(22,163,74,0.10)' : 'rgba(107,114,128,0.10)',
                    color: course.isPublished ? '#166534' : '#6b7280',
                  }}>
                    {course.isPublished ? <><Eye size={11} /> Publicado</> : <><EyeOff size={11} /> Rascunho</>}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '1.25rem', fontSize: '0.8125rem', color: '#9ca3af' }}>
                  <span>{course._count.modules} módulos</span>
                  <span>{totalLessons(course)} aulas</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Users size={13} /> {course._count.studentCourses} alunos
                  </span>
                  <span style={{ fontWeight: 700, color: 'var(--seiva-medium)' }}>
                    R$ {course.price.toFixed(2).replace('.', ',')}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                <Link href={`/cursos/${course.slug}`} target="_blank"
                  className="btn btn-secondary btn-sm">
                  <Eye size={15} /> Ver
                </Link>
                <Link href={`/admin/cursos/${course.id}/editar`} className="btn btn-primary btn-sm">
                  <Edit size={15} /> Editar
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
