import { Header } from '@/components/Header';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { BookOpen, Users, PlayCircle, Search } from 'lucide-react';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Cursos',
  description: 'Explore todos os cursos disponíveis na Escola Seiva.',
};

export default async function CursosPage() {
  const courses = await prisma.course.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { studentCourses: true } },
      modules: {
        include: { _count: { select: { lessons: true } } },
      },
    },
  });

  const totalLessons = (c: typeof courses[0]) =>
    c.modules.reduce((a, m) => a + m._count.lessons, 0);

  return (
    <>
      <Header />
      <main>
        {/* Hero section */}
        <section style={{
          background: 'linear-gradient(135deg, var(--seiva-dark) 0%, var(--seiva-medium) 100%)',
          padding: '3.5rem 0 3rem',
        }}>
          <div className="container" style={{ textAlign: 'center' }}>
            <h1 style={{
              fontFamily: 'var(--font-display)', fontSize: 'clamp(1.75rem,4vw,2.5rem)',
              fontWeight: 700, color: 'var(--seiva-cream)', marginBottom: '0.75rem',
            }}>
              Todos os cursos
            </h1>
            <p style={{ color: 'rgba(254,250,224,0.72)', fontSize: '1.0625rem', maxWidth: 480, margin: '0 auto' }}>
              {courses.length} {courses.length === 1 ? 'curso disponível' : 'cursos disponíveis'} para sua formação
            </p>
          </div>
        </section>

        <section style={{ padding: '3rem 0' }}>
          <div className="container">
            {courses.length === 0 ? (
              <div className="card" style={{ padding: '4rem', textAlign: 'center' }}>
                <BookOpen size={48} color="var(--seiva-muted)" style={{ margin: '0 auto 1rem' }} />
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--seiva-dark)', marginBottom: '0.5rem' }}>
                  Nenhum curso disponível ainda
                </h2>
                <p style={{ color: '#9ca3af' }}>Volte em breve para ver os novos cursos.</p>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: '1.5rem',
              }}>
                {courses.map((course, i) => (
                  <Link
                    key={course.id}
                    href={`/cursos/${course.slug}`}
                    className={`card card-hover animate-fade-up stagger-${(i % 4) + 1}`}
                    style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
                  >
                    {/* Cover */}
                    <div style={{
                      height: 190,
                      background: course.coverImage
                        ? `url(${course.coverImage}) center/cover`
                        : `linear-gradient(135deg, var(--seiva-dark) 0%, var(--seiva-medium) 100%)`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      position: 'relative',
                    }}>
                      {!course.coverImage && (
                        <PlayCircle size={48} color="rgba(254,250,224,0.5)" />
                      )}
                      <div style={{
                        position: 'absolute', bottom: '0.75rem', right: '0.75rem',
                        background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)',
                        color: 'white', padding: '0.3rem 0.75rem', borderRadius: 999,
                        fontSize: '0.875rem', fontWeight: 700,
                      }}>
                        R$ {course.price.toFixed(2).replace('.', ',')}
                      </div>
                    </div>

                    {/* Content */}
                    <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <h3 style={{
                        fontFamily: 'var(--font-display)', fontSize: '1.125rem', fontWeight: 700,
                        color: 'var(--seiva-dark)', marginBottom: '0.5rem', lineHeight: 1.3,
                      }}>
                        {course.title}
                      </h3>
                      <p style={{
                        fontSize: '0.875rem', color: '#6b7280', lineHeight: 1.6,
                        marginBottom: '1rem', flex: 1,
                      }}>
                        {(course.shortDescription || course.description).slice(0, 110)}
                        {(course.shortDescription || course.description).length > 110 && '...'}
                      </p>

                      <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8125rem', color: 'var(--seiva-muted)', borderTop: '1px solid #f3f4f6', paddingTop: '0.875rem' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <PlayCircle size={13} /> {totalLessons(course)} aulas
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <Users size={13} /> {course._count.studentCourses} alunos
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <BookOpen size={13} /> {course.modules.length} módulos
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </>
  );
}
