import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { BookOpen, PlayCircle, CheckCircle, ChevronRight, Trophy } from 'lucide-react';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: 'Dashboard' };

export default async function AlunoDashboard() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const userId = session.user.id;

  const studentCourses = await prisma.studentCourse.findMany({
    where: { userId, accessStatus: 'ACTIVE' },
    include: {
      course: {
        include: {
          modules: {
            orderBy: { orderIndex: 'asc' },
            include: {
              lessons: {
                where: { isPublished: true },
                orderBy: { orderIndex: 'asc' },
                include: { progress: { where: { userId } } },
              },
            },
          },
        },
      },
    },
    orderBy: { enrolledAt: 'desc' },
  });

  // Calcular progresso
  const coursesWithProgress = studentCourses.map(sc => {
    const allLessons = sc.course.modules.flatMap(m => m.lessons);
    const completed = allLessons.filter(l => l.progress[0]?.completed).length;
    const total = allLessons.length;
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

    // Próxima aula não completada
    const nextLesson = allLessons.find(l => !l.progress[0]?.completed);
    const nextModule = nextLesson
      ? sc.course.modules.find(m => m.lessons.some(l => l.id === nextLesson.id))
      : null;

    return { ...sc, completed, total, pct, nextLesson, nextModule };
  });

  const totalCompleted = coursesWithProgress.reduce((a, c) => a + c.completed, 0);
  const totalLessons   = coursesWithProgress.reduce((a, c) => a + c.total, 0);
  const finishedCourses = coursesWithProgress.filter(c => c.pct === 100).length;

  return (
    <div style={{ padding: '2rem 2.5rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 700, color: 'var(--seiva-dark)', marginBottom: '0.25rem' }}>
          Olá, {session.user?.name?.split(' ')[0]}! 👋
        </h1>
        <p style={{ color: '#6b7280', fontSize: '0.9375rem' }}>Continue sua jornada de aprendizado.</p>
      </div>

      {/* Summary stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1rem', marginBottom: '2rem' }} className="dash-stats">
        {[
          { label: 'Cursos matriculados', value: studentCourses.length, icon: BookOpen, color: '#606c38', bg: 'rgba(96,108,56,0.08)' },
          { label: 'Aulas concluídas',    value: totalCompleted,        icon: CheckCircle, color: '#16a34a', bg: 'rgba(22,163,74,0.08)' },
          { label: 'Cursos concluídos',   value: finishedCourses,        icon: Trophy,      color: '#d97706', bg: 'rgba(217,119,6,0.08)' },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-lg)', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <s.icon size={20} color={s.color} />
            </div>
            <div>
              <p style={{ fontSize: '1.625rem', fontWeight: 800, color: 'var(--seiva-ink)', lineHeight: 1 }}>{s.value}</p>
              <p style={{ fontSize: '0.8125rem', color: '#9ca3af', marginTop: '0.2rem' }}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Empty state */}
      {studentCourses.length === 0 ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
          <BookOpen size={44} color="var(--seiva-muted)" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--seiva-dark)', marginBottom: '0.5rem' }}>
            Você ainda não tem cursos
          </h3>
          <p style={{ color: '#9ca3af', marginBottom: '1.5rem', maxWidth: 360, margin: '0 auto 1.5rem' }}>
            Explore nossa biblioteca de cursos e comece sua jornada de crescimento.
          </p>
          <Link href="/cursos" className="btn btn-primary">
            <BookOpen size={16} /> Explorar cursos
          </Link>
        </div>
      ) : (
        <>
          {/* Continue studying */}
          {coursesWithProgress.some(c => c.nextLesson && c.pct < 100) && (
            <div style={{ marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--seiva-dark)', marginBottom: '1rem' }}>
                Continue de onde parou
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                {coursesWithProgress
                  .filter(c => c.nextLesson && c.pct < 100)
                  .slice(0, 2)
                  .map(c => (
                    <Link
                      key={c.id}
                      href={`/aluno/cursos?courseId=${c.courseId}&lessonId=${c.nextLesson?.id}`}
                      className="card card-hover"
                      style={{
                        padding: '1.25rem', display: 'flex', alignItems: 'center',
                        gap: '1.25rem', textDecoration: 'none',
                      }}
                    >
                      <div style={{
                        width: 48, height: 48, borderRadius: '50%', flexShrink: 0,
                        background: 'linear-gradient(135deg, var(--seiva-dark), var(--seiva-medium))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <PlayCircle size={24} color="white" />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: '0.8125rem', color: 'var(--seiva-medium)', fontWeight: 600, marginBottom: '0.125rem' }}>
                          {c.course.title}
                        </p>
                        <p style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--seiva-ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: '0.5rem' }}>
                          {c.nextLesson?.title}
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div className="progress" style={{ flex: 1, height: 5 }}>
                            <div className="progress-fill" style={{ width: `${c.pct}%` }} />
                          </div>
                          <span style={{ fontSize: '0.78rem', color: '#9ca3af', flexShrink: 0 }}>
                            {c.completed}/{c.total} aulas
                          </span>
                        </div>
                      </div>
                      <ChevronRight size={18} color="var(--seiva-muted)" style={{ flexShrink: 0 }} />
                    </Link>
                  ))}
              </div>
            </div>
          )}

          {/* All courses */}
          <div>
            <h2 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--seiva-dark)', marginBottom: '1rem' }}>
              Todos os meus cursos
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px,1fr))', gap: '1.25rem' }}>
              {coursesWithProgress.map(c => (
                <Link
                  key={c.id}
                  href={`/aluno/cursos?courseId=${c.courseId}`}
                  className="card card-hover"
                  style={{ textDecoration: 'none', overflow: 'hidden' }}
                >
                  <div style={{
                    height: 120,
                    background: c.course.coverImage
                      ? `url(${c.course.coverImage}) center/cover`
                      : 'linear-gradient(135deg, var(--seiva-dark), var(--seiva-medium))',
                    position: 'relative',
                  }}>
                    {c.pct === 100 && (
                      <div style={{
                        position: 'absolute', top: '0.75rem', right: '0.75rem',
                        background: '#16a34a', color: 'white', borderRadius: 999,
                        padding: '0.2rem 0.6rem', fontSize: '0.75rem', fontWeight: 700,
                        display: 'flex', alignItems: 'center', gap: '0.25rem',
                      }}>
                        <Trophy size={11} /> Concluído
                      </div>
                    )}
                  </div>
                  <div style={{ padding: '1.25rem' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--seiva-dark)', marginBottom: '0.875rem', lineHeight: 1.3 }}>
                      {c.course.title}
                    </h3>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.8125rem', color: '#6b7280' }}>
                        {c.completed} de {c.total} aulas
                      </span>
                      <span style={{ fontSize: '0.875rem', fontWeight: 700, color: c.pct === 100 ? '#16a34a' : 'var(--seiva-medium)' }}>
                        {c.pct}%
                      </span>
                    </div>
                    <div className="progress">
                      <div className="progress-fill" style={{ width: `${c.pct}%` }} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </>
      )}

      <style>{`
        @media (max-width: 700px) { .dash-stats { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
}
