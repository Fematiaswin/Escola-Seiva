import { Header } from '@/components/Header';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import CheckoutForm from '@/components/CheckoutForm';
import { PlayCircle, BookOpen, Users, ChevronRight, CheckCircle, Lock } from 'lucide-react';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const course = await prisma.course.findUnique({ where: { slug: params.slug } });
  if (!course) return { title: 'Curso não encontrado' };
  return {
    title: course.title,
    description: course.shortDescription || course.description.slice(0, 160),
  };
}

export default async function CursoDetalhe({ params }: Props) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  const course = await prisma.course.findUnique({
    where: { slug: params.slug, isPublished: true },
    include: {
      modules: {
        orderBy: { orderIndex: 'asc' },
        include: {
          lessons: {
            where: { isPublished: true },
            orderBy: { orderIndex: 'asc' },
          },
        },
      },
      _count: { select: { studentCourses: true } },
    },
  });

  if (!course) notFound();

  const totalLessons = course.modules.reduce((a, m) => a + m.lessons.length, 0);

  // Verifica se já tem acesso
  const hasAccess = userId
    ? !!(await prisma.studentCourse.findFirst({ where: { userId, courseId: course.id, accessStatus: 'ACTIVE' } }))
    : false;

  return (
    <>
      <Header />
      <main>
        {/* Hero */}
        <section style={{
          background: 'linear-gradient(135deg, var(--seiva-dark) 0%, var(--seiva-medium) 100%)',
          padding: '4rem 0',
        }}>
          <div className="container">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '3rem', alignItems: 'start' }} className="course-grid">
              {/* Left */}
              <div>
                <div style={{ display: 'flex', gap: '0.625rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
                  <span className="badge" style={{ background: 'rgba(254,250,224,0.15)', color: 'var(--seiva-cream)', border: '1px solid rgba(254,250,224,0.2)' }}>
                    {totalLessons} aulas
                  </span>
                  <span className="badge" style={{ background: 'rgba(254,250,224,0.15)', color: 'var(--seiva-cream)', border: '1px solid rgba(254,250,224,0.2)' }}>
                    {course._count.studentCourses} alunos
                  </span>
                </div>

                <h1 style={{
                  fontFamily: 'var(--font-display)', fontSize: 'clamp(1.75rem,4vw,2.5rem)',
                  fontWeight: 700, color: 'var(--seiva-cream)', marginBottom: '1rem', lineHeight: 1.2,
                }}>
                  {course.title}
                </h1>

                <p style={{ color: 'rgba(254,250,224,0.78)', fontSize: '1.0625rem', lineHeight: 1.7, maxWidth: 560 }}>
                  {course.shortDescription || course.description}
                </p>
              </div>

              {/* Checkout card */}
              <div className="card" style={{ padding: '1.75rem' }}>
                {course.coverImage && (
                  <div style={{
                    height: 160, borderRadius: 'var(--radius-lg)', marginBottom: '1.25rem', overflow: 'hidden',
                    background: `url(${course.coverImage}) center/cover`,
                  }} />
                )}

                <p style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--seiva-dark)', marginBottom: '1.25rem' }}>
                  R$ {course.price.toFixed(2).replace('.', ',')}
                </p>

                {hasAccess ? (
                  <div>
                    <div className="alert alert-success" style={{ marginBottom: '1rem' }}>
                      <CheckCircle size={16} /> Você já tem acesso a este curso!
                    </div>
                    <a href="/aluno/cursos" className="btn btn-primary" style={{ width: '100%' }}>
                      <PlayCircle size={17} /> Ir para o curso
                    </a>
                  </div>
                ) : (
                  <CheckoutForm
                    courseId={course.id}
                    courseTitle={course.title}
                    price={course.price}
                    userSession={session ? { name: session.user?.name || '', email: session.user?.email || '' } : null}
                  />
                )}

                <div style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {['Acesso imediato após pagamento', 'Conteúdo disponível 24/7', 'Certificado de conclusão'].map(item => (
                    <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: '#6b7280' }}>
                      <CheckCircle size={14} color="var(--seiva-medium)" /> {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Course content */}
        <section style={{ padding: '4rem 0', background: 'white' }}>
          <div className="container">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '3rem', alignItems: 'start' }} className="course-grid">
              <div>
                {/* Description */}
                {course.description && course.shortDescription && (
                  <div style={{ marginBottom: '2.5rem' }}>
                    <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.375rem', fontWeight: 700, color: 'var(--seiva-dark)', marginBottom: '1rem' }}>
                      Sobre o curso
                    </h2>
                    <p style={{ color: '#4b5563', lineHeight: 1.8, fontSize: '1rem' }}>{course.description}</p>
                  </div>
                )}

                {/* Modules */}
                <div>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.375rem', fontWeight: 700, color: 'var(--seiva-dark)', marginBottom: '1.25rem' }}>
                    Conteúdo do curso
                  </h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {course.modules.map((module, mi) => (
                      <div key={module.id} className="card" style={{ overflow: 'hidden' }}>
                        <div style={{
                          padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.875rem',
                          background: 'rgba(96,108,56,0.04)', borderBottom: `1px solid rgba(40,54,24,0.08)`,
                        }}>
                          <span style={{
                            width: 28, height: 28, borderRadius: '50%', background: 'var(--seiva-medium)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.75rem', fontWeight: 700, color: 'white', flexShrink: 0,
                          }}>
                            {String(mi + 1).padStart(2, '0')}
                          </span>
                          <h3 style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--seiva-dark)', flex: 1 }}>
                            {module.title}
                          </h3>
                          <span style={{ fontSize: '0.8125rem', color: '#9ca3af', flexShrink: 0 }}>
                            {module.lessons.length} aulas
                          </span>
                        </div>
                        <div>
                          {module.lessons.map((lesson, li) => (
                            <div key={lesson.id} style={{
                              padding: '0.75rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem',
                              borderBottom: li < module.lessons.length - 1 ? '1px solid #f9f9f7' : 'none',
                            }}>
                              {hasAccess
                                ? <PlayCircle size={15} color="var(--seiva-medium)" />
                                : <Lock size={14} color="#d1d5db" />
                              }
                              <span style={{ fontSize: '0.875rem', color: '#4b5563', flex: 1 }}>{lesson.title}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sticky sidebar stats */}
              <div style={{ position: 'sticky', top: '1.5rem' }}>
                <div className="card" style={{ padding: '1.5rem' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--seiva-dark)', marginBottom: '1rem' }}>
                    O que está incluído
                  </h3>
                  {[
                    { icon: PlayCircle, label: `${totalLessons} aulas em vídeo` },
                    { icon: BookOpen, label: `${course.modules.length} módulos` },
                    { icon: Users, label: `${course._count.studentCourses} alunos matriculados` },
                  ].map(item => (
                    <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem', fontSize: '0.9rem', color: '#4b5563' }}>
                      <item.icon size={17} color="var(--seiva-medium)" /> {item.label}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <style>{`
        @media (max-width: 900px) { .course-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </>
  );
}
