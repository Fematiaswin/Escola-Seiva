import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { getVideoEmbedUrl } from '@/lib/video';
import VideoPlayer from '@/components/aluno/VideoPlayer';
import { CheckCircle, Circle, ChevronDown, FileText, ExternalLink, BookOpen } from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: 'Meus Cursos' };

export default async function MeusCursos({
  searchParams,
}: {
  searchParams: { courseId?: string; lessonId?: string };
}) {
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
                include: {
                  materials: true,
                  progress: { where: { userId } },
                },
              },
            },
          },
        },
      },
    },
    orderBy: { enrolledAt: 'desc' },
  });

  if (studentCourses.length === 0) {
    return (
      <div style={{ padding: '2rem 2.5rem' }}>
        <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
          <BookOpen size={44} color="var(--seiva-muted)" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--seiva-dark)', marginBottom: '0.5rem' }}>
            Você ainda não tem cursos
          </h3>
          <p style={{ color: '#9ca3af', marginBottom: '1.5rem' }}>
            Adquira um curso para começar a assistir as aulas.
          </p>
          <Link href="/cursos" className="btn btn-primary">
            <BookOpen size={16} /> Ver cursos disponíveis
          </Link>
        </div>
      </div>
    );
  }

  // Seleciona curso ativo
  const activeSC = searchParams.courseId
    ? studentCourses.find(sc => sc.courseId === searchParams.courseId) ?? studentCourses[0]
    : studentCourses[0];

  const course = activeSC.course;
  const allLessons = course.modules.flatMap(m => m.lessons);

  // Seleciona aula ativa
  const activeLesson = searchParams.lessonId
    ? allLessons.find(l => l.id === searchParams.lessonId) ?? allLessons[0]
    : allLessons[0];

  const completedIds = new Set(allLessons.filter(l => l.progress[0]?.completed).map(l => l.id));
  const pct = allLessons.length > 0 ? Math.round((completedIds.size / allLessons.length) * 100) : 0;

  const embedUrl = activeLesson ? getVideoEmbedUrl(activeLesson.videoUrl) : null;

  return (
    <div style={{ display: 'flex', height: '100vh', flexDirection: 'column' }}>
      {/* Top bar */}
      <div style={{
        background: 'var(--seiva-dark)', color: 'var(--seiva-cream)',
        padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0,
      }}>
        <Link href="/aluno/dashboard" style={{ color: 'rgba(254,250,224,0.6)', textDecoration: 'none', fontSize: '0.875rem' }}>
          ← Voltar
        </Link>
        <span style={{ color: 'rgba(254,250,224,0.3)' }}>|</span>
        <h1 style={{ fontSize: '0.9375rem', fontWeight: 600, flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {course.title}
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
          <div style={{ height: 5, width: 120, borderRadius: 999, background: 'rgba(254,250,224,0.15)', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${pct}%`, background: 'var(--seiva-light)', borderRadius: 999, transition: 'width 0.4s' }} />
          </div>
          <span style={{ fontSize: '0.8125rem', color: 'rgba(254,250,224,0.7)', fontWeight: 600 }}>{pct}%</span>
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Sidebar modules */}
        <div style={{
          width: 300, flexShrink: 0, background: 'white',
          borderRight: '1px solid #e5e7eb', overflowY: 'auto',
        }}>
          {/* Course switcher if multiple */}
          {studentCourses.length > 1 && (
            <div style={{ padding: '0.75rem', borderBottom: '1px solid #e5e7eb' }}>
              <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#9ca3af', marginBottom: '0.375rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Trocar curso
              </p>
              {studentCourses.map(sc => (
                <Link
                  key={sc.id}
                  href={`/aluno/cursos?courseId=${sc.courseId}`}
                  style={{
                    display: 'block', padding: '0.5rem 0.625rem', borderRadius: 'var(--radius-md)',
                    textDecoration: 'none', fontSize: '0.85rem', fontWeight: 500,
                    color: sc.courseId === activeSC.courseId ? 'var(--seiva-dark)' : '#6b7280',
                    background: sc.courseId === activeSC.courseId ? 'rgba(96,108,56,0.10)' : 'transparent',
                    marginBottom: '0.125rem',
                  }}
                >
                  {sc.course.title}
                </Link>
              ))}
            </div>
          )}

          {/* Modules & lessons */}
          {course.modules.map(module => (
            <details key={module.id} open style={{ borderBottom: '1px solid #f3f4f6' }}>
              <summary style={{
                padding: '0.875rem 1rem', cursor: 'pointer', listStyle: 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                fontWeight: 700, fontSize: '0.875rem', color: 'var(--seiva-dark)',
                userSelect: 'none',
              }}>
                <span style={{ flex: 1, paddingRight: '0.5rem' }}>{module.title}</span>
                <span style={{ fontSize: '0.75rem', color: '#9ca3af', flexShrink: 0 }}>
                  {module.lessons.filter(l => completedIds.has(l.id)).length}/{module.lessons.length}
                </span>
              </summary>
              <div style={{ paddingBottom: '0.375rem' }}>
                {module.lessons.map(lesson => {
                  const isActive = lesson.id === activeLesson?.id;
                  const isDone = completedIds.has(lesson.id);
                  return (
                    <Link
                      key={lesson.id}
                      href={`/aluno/cursos?courseId=${course.id}&lessonId=${lesson.id}`}
                      style={{
                        display: 'flex', alignItems: 'flex-start', gap: '0.625rem',
                        padding: '0.5rem 1rem 0.5rem 0.875rem', textDecoration: 'none',
                        background: isActive ? 'rgba(96,108,56,0.08)' : 'transparent',
                        borderLeft: `3px solid ${isActive ? 'var(--seiva-medium)' : 'transparent'}`,
                        transition: 'all 0.1s',
                      }}
                    >
                      <div style={{ flexShrink: 0, marginTop: '0.125rem' }}>
                        {isDone
                          ? <CheckCircle size={15} color="#16a34a" />
                          : <Circle size={15} color={isActive ? 'var(--seiva-medium)' : '#d1d5db'} />
                        }
                      </div>
                      <span style={{
                        fontSize: '0.8375rem', lineHeight: 1.4,
                        color: isActive ? 'var(--seiva-dark)' : isDone ? '#6b7280' : '#374151',
                        fontWeight: isActive ? 600 : 400,
                      }}>
                        {lesson.title}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </details>
          ))}
        </div>

        {/* Main video area */}
        <div style={{ flex: 1, overflowY: 'auto', background: '#fafaf8' }}>
          {!activeLesson ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#9ca3af' }}>
              Selecione uma aula para começar.
            </div>
          ) : (
            <div style={{ maxWidth: 900, margin: '0 auto', padding: '2rem' }}>
              {/* Video */}
              {embedUrl ? (
                <div className="aspect-video" style={{ marginBottom: '1.5rem', boxShadow: 'var(--shadow-lg)' }}>
                  <iframe src={embedUrl} title={activeLesson.title} allowFullScreen />
                </div>
              ) : (
                <div style={{
                  marginBottom: '1.5rem', borderRadius: 'var(--radius-lg)',
                  background: 'var(--seiva-dark)', padding: '3rem', textAlign: 'center',
                }}>
                  <a href={activeLesson.videoUrl} target="_blank" rel="noreferrer"
                    className="btn btn-primary" style={{ display: 'inline-flex' }}>
                    <ExternalLink size={16} /> Assistir aula externamente
                  </a>
                </div>
              )}

              {/* Lesson header + progress */}
              <div className="card" style={{ padding: '1.5rem', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                  <div>
                    <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.375rem', fontWeight: 700, color: 'var(--seiva-dark)', marginBottom: '0.5rem' }}>
                      {activeLesson.title}
                    </h2>
                    {activeLesson.description && (
                      <p style={{ color: '#6b7280', fontSize: '0.9375rem', lineHeight: 1.6 }}>
                        {activeLesson.description}
                      </p>
                    )}
                  </div>
                  <VideoPlayer
                    lessonId={activeLesson.id}
                    initialCompleted={completedIds.has(activeLesson.id)}
                  />
                </div>
              </div>

              {/* Materials */}
              {activeLesson.materials.length > 0 && (
                <div className="card" style={{ padding: '1.5rem' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--seiva-dark)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FileText size={17} /> Materiais complementares
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                    {activeLesson.materials.map(mat => (
                      <a
                        key={mat.id}
                        href={mat.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display: 'flex', alignItems: 'center', gap: '0.75rem',
                          padding: '0.75rem 1rem', borderRadius: 'var(--radius-lg)',
                          border: '1px solid rgba(40,54,24,0.10)', textDecoration: 'none',
                          color: 'var(--seiva-dark)', fontWeight: 500, fontSize: '0.9rem',
                          transition: 'background 0.15s',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(96,108,56,0.05)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      >
                        <FileText size={16} color="var(--seiva-medium)" />
                        {mat.title}
                        <ExternalLink size={13} color="#9ca3af" style={{ marginLeft: 'auto' }} />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
