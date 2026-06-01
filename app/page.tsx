import { Header } from '@/components/Header';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { ArrowRight, BookOpen, Users, Award, PlayCircle, CheckCircle2, ChevronRight } from 'lucide-react';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Escola Seiva — Conhecimento que Cria Raízes',
  description: 'Plataforma de formação cristã. Cursos online com área exclusiva para alunos, certificados e muito mais.',
};

async function getPublishedCourses() {
  try {
    return await prisma.course.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: 'desc' },
      take: 3,
      include: {
        _count: { select: { modules: true, studentCourses: true } },
        modules: {
          include: { _count: { select: { lessons: true } } }
        }
      }
    });
  } catch { return []; }
}

async function getStats() {
  try {
    const [courses, students] = await Promise.all([
      prisma.course.count({ where: { isPublished: true } }),
      prisma.user.count({ where: { role: 'STUDENT' } }),
    ]);
    return { courses, students };
  } catch { return { courses: 0, students: 0 }; }
}

export default async function Home() {
  const [courses, stats] = await Promise.all([getPublishedCourses(), getStats()]);

  const totalLessons = courses.reduce((acc, c) =>
    acc + c.modules.reduce((ma, m) => ma + m._count.lessons, 0), 0
  );

  return (
    <>
      <Header />
      <main>
        {/* ——— HERO ——— */}
        <section
          style={{
            background: 'linear-gradient(135deg, var(--seiva-dark) 0%, var(--seiva-medium) 100%)',
            padding: '5rem 0 4rem',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Decorative circles */}
          <div style={{
            position: 'absolute', top: -80, right: -80,
            width: 360, height: 360, borderRadius: '50%',
            background: 'rgba(254,250,224,0.05)',
          }} />
          <div style={{
            position: 'absolute', bottom: -60, left: '30%',
            width: 240, height: 240, borderRadius: '50%',
            background: 'rgba(254,250,224,0.04)',
          }} />

          <div className="container" style={{ position: 'relative' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'center' }}
              className="grid-hero">
              <div className="animate-fade-up">
                <span
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
                    background: 'rgba(254,250,224,0.12)', color: 'var(--seiva-cream)',
                    padding: '0.375rem 0.875rem', borderRadius: 999,
                    fontSize: '0.8125rem', fontWeight: 600, marginBottom: '1.25rem',
                    border: '1px solid rgba(254,250,224,0.20)',
                  }}
                >
                  <PlayCircle size={13} /> Cursos online disponíveis
                </span>

                <h1
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'clamp(2rem, 4vw, 3.25rem)',
                    fontWeight: 700,
                    color: 'var(--seiva-cream)',
                    lineHeight: 1.15,
                    marginBottom: '1.25rem',
                    letterSpacing: 0,
                    maxWidth: 640,
                    textWrap: 'balance',
                  }}
                >
                  Conhecimento que cria raízes e gera crescimento.
                </h1>

                <p style={{ color: 'rgba(254,250,224,0.78)', fontSize: '1.0625rem', lineHeight: 1.7, marginBottom: '2rem', maxWidth: 460 }}>
                  A Escola Seiva é uma plataforma de formação cristã, com cursos online,
                  para contribuir com a formação daqueles que desejam seguir a Cristo.
                </p>

                <div style={{ display: 'flex', gap: '0.875rem', flexWrap: 'wrap' }}>
                  <Link href="/cursos" className="btn btn-lg" style={{ background: 'var(--seiva-cream)', color: 'var(--seiva-dark)', fontWeight: 700 }}>
                    Conhecer cursos <ArrowRight size={18} />
                  </Link>
                  <Link href="/cadastro" className="btn btn-lg" style={{ background: 'rgba(254,250,224,0.12)', color: 'var(--seiva-cream)', border: '1.5px solid rgba(254,250,224,0.30)' }}>
                    Criar conta grátis
                  </Link>
                </div>
              </div>

              {/* Stats card */}
              <div className="animate-fade-up stagger-2" style={{ display: 'flex', justifyContent: 'center' }}>
                <div style={{
                  background: 'rgba(254,250,224,0.08)',
                  border: '1px solid rgba(254,250,224,0.15)',
                  borderRadius: 'var(--radius-2xl)',
                  backdropFilter: 'blur(16px)',
                  padding: '2rem',
                  maxWidth: 340,
                  width: '100%',
                }}>
                  <p style={{ color: 'rgba(254,250,224,0.6)', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '1.25rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                    Como funciona
                  </p>
                  {[
                    { num: '01', text: 'Escolha um curso da plataforma' },
                    { num: '02', text: 'Faça o pagamento seguro pelo Asaas' },
                    { num: '03', text: 'Acesso liberado' },
                    { num: '04', text: 'Assista as aulas pela área exclusiva de alunos' },
                  ].map(step => (
                    <div key={step.num} style={{ display: 'flex', gap: '0.875rem', alignItems: 'flex-start', marginBottom: '1rem' }}>
                      <span style={{
                        flexShrink: 0, width: 28, height: 28, borderRadius: '50%',
                        background: 'rgba(254,250,224,0.15)',
                        color: 'var(--seiva-cream)', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700,
                      }}>
                        {step.num}
                      </span>
                      <p style={{ color: 'rgba(254,250,224,0.82)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                        {step.text}
                      </p>
                    </div>
                  ))}

                  <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(254,250,224,0.12)' }}>
                    {[
                      { value: stats.courses.toString(), label: 'cursos' },
                      { value: stats.students.toString(), label: 'alunos' },
                      { value: totalLessons.toString(), label: 'aulas' },
                    ].map(s => (
                      <div key={s.label} style={{ flex: 1, textAlign: 'center' }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--seiva-cream)', lineHeight: 1 }}>
                          {s.value || '—'}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'rgba(254,250,224,0.55)', marginTop: '0.25rem' }}>
                          {s.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ——— CURSOS EM DESTAQUE ——— */}
        {courses.length > 0 && (
          <section style={{ padding: '5rem 0', background: 'white' }}>
            <div className="container">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem' }}>
                <div>
                  <p style={{ color: 'var(--seiva-medium)', fontWeight: 600, fontSize: '0.875rem', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                    Formação
                  </p>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', fontWeight: 700, color: 'var(--seiva-dark)', lineHeight: 1.2 }}>
                    Cursos disponíveis
                  </h2>
                </div>
                <Link href="/cursos" className="btn btn-ghost btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  Ver todos <ChevronRight size={16} />
                </Link>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                {courses.map((course, i) => {
                  const totalLessonsC = course.modules.reduce((a, m) => a + m._count.lessons, 0);
                  return (
                    <Link
                      key={course.id}
                      href={`/cursos/${course.slug}`}
                      className={`card card-hover animate-fade-up stagger-${i + 1}`}
                      style={{ textDecoration: 'none', display: 'block', overflow: 'hidden' }}
                    >
                      {/* Cover */}
                      <div style={{
                        height: 180,
                        background: course.coverImage
                          ? `url(${course.coverImage}) center/cover`
                          : `linear-gradient(135deg, var(--seiva-dark) 0%, var(--seiva-medium) 100%)`,
                        display: 'flex', alignItems: 'flex-end',
                        padding: '1rem',
                      }}>
                        <span className="badge badge-cream" style={{ fontSize: '0.8125rem', fontWeight: 700 }}>
                          R$ {course.price.toFixed(2).replace('.', ',')}
                        </span>
                      </div>

                      {/* Content */}
                      <div style={{ padding: '1.25rem' }}>
                        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.125rem', fontWeight: 700, color: 'var(--seiva-dark)', marginBottom: '0.5rem', lineHeight: 1.3 }}>
                          {course.title}
                        </h3>
                        <p style={{ fontSize: '0.875rem', color: '#666', lineHeight: 1.6, marginBottom: '1rem' }}>
                          {course.shortDescription || course.description.slice(0, 100)}
                          {course.description.length > 100 && '...'}
                        </p>
                        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8125rem', color: 'var(--seiva-muted)' }}>
                          <span>{course._count.modules} módulos</span>
                          <span>·</span>
                          <span>{totalLessonsC} aulas</span>
                          <span>·</span>
                          <span>{course._count.studentCourses} alunos</span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* ——— FEATURES ——— */}
        <section style={{ padding: '5rem 0', background: 'var(--seiva-cream)' }}>
          <div className="container">
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', fontWeight: 700, color: 'var(--seiva-dark)', marginBottom: '1rem' }}>
                Uma plataforma completa para seu crescimento
              </h2>
              <p style={{ color: '#666', fontSize: '1.0625rem', maxWidth: 520, margin: '0 auto' }}>
                Tudo o que você precisa para aprender de forma organizada, com qualidade e no seu ritmo.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
              {[
                { icon: PlayCircle, title: 'Aulas em vídeo', desc: 'Conteúdo assistível a qualquer hora e dispositivo.' },
                { icon: BookOpen, title: 'Materiais complementares', desc: 'Arquivos, PDFs e links de apoio organizados por aula.' },
                { icon: Users, title: 'Área exclusiva', desc: 'Dashboard personalizado com progresso, histórico e próximas aulas.' },
                { icon: Award, title: 'Certificados', desc: 'Certificado digital ao concluir cada curso. Comprovação permanente.' },
              ].map((f, i) => (
                <div key={f.title} className={`card animate-fade-up stagger-${i + 1}`} style={{ padding: '1.5rem' }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 'var(--radius-lg)',
                    background: 'rgba(96,108,56,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: '1rem',
                  }}>
                    <f.icon size={22} color="var(--seiva-medium)" />
                  </div>
                  <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--seiva-dark)', marginBottom: '0.5rem' }}>
                    {f.title}
                  </h3>
                  <p style={{ fontSize: '0.9rem', color: '#666', lineHeight: 1.6 }}>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ——— CTA FINAL ——— */}
        <section style={{
          background: 'linear-gradient(135deg, var(--seiva-dark) 0%, var(--seiva-medium) 100%)',
          padding: '5rem 0', textAlign: 'center',
        }}>
          <div className="container">
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.5rem, 3vw, 2.5rem)', fontWeight: 700, color: 'var(--seiva-cream)', marginBottom: '1rem' }}>
              Pronto para começar?
            </h2>
            <p style={{ color: 'rgba(254,250,224,0.75)', fontSize: '1.0625rem', marginBottom: '2rem', maxWidth: 480, margin: '0 auto 2rem' }}>
              Crie sua conta gratuitamente e explore todos os cursos disponíveis da Escola Seiva.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/cadastro" className="btn btn-xl" style={{ background: 'var(--seiva-cream)', color: 'var(--seiva-dark)', fontWeight: 700 }}>
                Criar conta grátis <ArrowRight size={20} />
              </Link>
              <Link href="/cursos" className="btn btn-xl" style={{ background: 'rgba(254,250,224,0.12)', color: 'var(--seiva-cream)', border: '1.5px solid rgba(254,250,224,0.25)' }}>
                Ver cursos
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* ——— FOOTER ——— */}
      <footer style={{
        background: 'var(--seiva-dark)', color: 'rgba(254,250,224,0.65)',
        padding: '2.5rem 0', textAlign: 'center',
      }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <div style={{ width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img className="brand-mark" src="/brand/seiva-mark-cream.png" alt="" />
            </div>
            <span className="brand-wordmark" style={{ color: 'var(--seiva-cream)', fontSize: '1rem' }}>
              Escola Seiva
            </span>
          </div>
          <p style={{ fontSize: '0.875rem', marginBottom: '0.75rem' }}>
            Plataforma de formação cristã.
          </p>
          <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', fontSize: '0.875rem' }}>
            <Link href="/cursos" style={{ color: 'rgba(254,250,224,0.65)', textDecoration: 'none' }}>Cursos</Link>
            <Link href="/sobre" style={{ color: 'rgba(254,250,224,0.65)', textDecoration: 'none' }}>Sobre</Link>
            <Link href="/login" style={{ color: 'rgba(254,250,224,0.65)', textDecoration: 'none' }}>Login</Link>
          </div>
          <p style={{ fontSize: '0.8125rem', marginTop: '1.5rem', opacity: 0.45 }}>
            © {new Date().getFullYear()} Escola Seiva. Todos os direitos reservados.
          </p>
        </div>
      </footer>

      <style>{`
        @media (max-width: 768px) {
          .grid-hero { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  );
}
