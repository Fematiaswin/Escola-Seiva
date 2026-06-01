'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Save, Plus, Trash2, ChevronDown, ChevronRight,
  AlertCircle, CheckCircle, GripVertical, Eye, EyeOff
} from 'lucide-react';

interface Lesson { id: string; title: string; videoUrl: string; description?: string; orderIndex: number; isPublished: boolean; }
interface Module  { id: string; title: string; orderIndex: number; lessons: Lesson[]; }
interface Course  {
  id: string; title: string; description: string; shortDescription?: string;
  price: number; coverImage?: string; asaasPaymentLink?: string; isPublished: boolean;
  modules: Module[];
}

export default function EditarCurso() {
  const { id } = useParams<{ id: string }>();
  const router  = useRouter();

  const [course, setCourse]   = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [msg, setMsg]         = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Module / Lesson modal state
  const [showModModal, setShowModModal] = useState(false);
  const [newModTitle, setNewModTitle]   = useState('');
  const [addingMod, setAddingMod]       = useState(false);

  const [showLessonModal, setShowLessonModal] = useState<string | null>(null); // moduleId
  const [newLesson, setNewLesson] = useState({ title: '', videoUrl: '', description: '' });
  const [addingLesson, setAddingLesson] = useState(false);

  // Load course
  useEffect(() => {
    fetch(`/api/painel/courses/${id}`)
      .then(r => r.json())
      .then(data => { setCourse(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  async function saveCourse() {
    if (!course) return;
    setSaving(true); setMsg(null);
    try {
      const res = await fetch(`/api/painel/courses/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: course.title, description: course.description,
          shortDescription: course.shortDescription, price: Number(course.price),
          coverImage: course.coverImage, asaasPaymentLink: course.asaasPaymentLink,
          isPublished: course.isPublished,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setMsg({ type: 'error', text: data.error || 'Erro ao salvar.' }); }
      else setMsg({ type: 'success', text: 'Curso salvo com sucesso!' });
    } catch { setMsg({ type: 'error', text: 'Erro de conexão.' }); }
    finally { setSaving(false); }
  }

  async function addModule() {
    if (!newModTitle.trim()) return;
    setAddingMod(true);
    try {
      const res = await fetch('/api/painel/modules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId: id, title: newModTitle.trim(), orderIndex: (course?.modules.length ?? 0) + 1 }),
      });
      const data = await res.json();
      if (res.ok) {
        setCourse(c => c ? { ...c, modules: [...c.modules, { ...data, lessons: [] }] } : c);
        setNewModTitle(''); setShowModModal(false);
      }
    } finally { setAddingMod(false); }
  }

  async function addLesson(moduleId: string) {
    if (!newLesson.title.trim() || !newLesson.videoUrl.trim()) return;
    setAddingLesson(true);
    try {
      const mod = course?.modules.find(m => m.id === moduleId);
      const res = await fetch('/api/painel/lessons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          moduleId, title: newLesson.title.trim(), videoUrl: newLesson.videoUrl.trim(),
          description: newLesson.description, orderIndex: (mod?.lessons.length ?? 0) + 1,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setCourse(c => c ? {
          ...c,
          modules: c.modules.map(m =>
            m.id === moduleId ? { ...m, lessons: [...m.lessons, data] } : m
          ),
        } : c);
        setNewLesson({ title: '', videoUrl: '', description: '' });
        setShowLessonModal(null);
      }
    } finally { setAddingLesson(false); }
  }

  async function deleteLesson(moduleId: string, lessonId: string) {
    if (!confirm('Remover esta aula?')) return;
    await fetch(`/api/painel/lessons?id=${lessonId}`, { method: 'DELETE' });
    setCourse(c => c ? {
      ...c,
      modules: c.modules.map(m =>
        m.id === moduleId ? { ...m, lessons: m.lessons.filter(l => l.id !== lessonId) } : m
      ),
    } : c);
  }

  if (loading) return (
    <div style={{ padding: '2rem 2.5rem' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 56, borderRadius: 'var(--radius-lg)' }} />)}
      </div>
    </div>
  );

  if (!course) return (
    <div style={{ padding: '2rem 2.5rem' }}>
      <div className="alert alert-error"><AlertCircle size={16} /> Curso não encontrado.</div>
    </div>
  );

  return (
    <div style={{ padding: '2rem 2.5rem', maxWidth: 860 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <Link href="/admin/cursos" className="btn btn-secondary btn-sm">
          <ArrowLeft size={15} /> Voltar
        </Link>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700, color: 'var(--seiva-dark)' }}>
            Editar curso
          </h1>
        </div>
        <button onClick={saveCourse} className="btn btn-primary" disabled={saving}>
          {saving ? 'Salvando...' : <><Save size={16} /> Salvar</>}
        </button>
      </div>

      {msg && (
        <div className={`alert ${msg.type === 'success' ? 'alert-success' : 'alert-error'}`} style={{ marginBottom: '1.5rem' }}>
          {msg.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {msg.text}
        </div>
      )}

      {/* Course Fields */}
      <div className="card" style={{ padding: '1.75rem', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--seiva-dark)', marginBottom: '1.25rem' }}>
          Informações do curso
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
          <div>
            <label>Título</label>
            <input className="field" value={course.title} onChange={e => setCourse(c => c ? { ...c, title: e.target.value } : c)} />
          </div>
          <div>
            <label>Descrição curta</label>
            <input className="field" value={course.shortDescription || ''} placeholder="Resumo em uma linha"
              onChange={e => setCourse(c => c ? { ...c, shortDescription: e.target.value } : c)} />
          </div>
          <div>
            <label>Descrição completa</label>
            <textarea className="field" rows={4} value={course.description} style={{ resize: 'vertical' }}
              onChange={e => setCourse(c => c ? { ...c, description: e.target.value } : c)} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label>Preço (R$)</label>
              <input className="field" type="number" step="0.01" min="0" value={course.price}
                onChange={e => setCourse(c => c ? { ...c, price: parseFloat(e.target.value) || 0 } : c)} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', paddingBottom: 2 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', cursor: 'pointer', marginBottom: 0 }}>
                <div onClick={() => setCourse(c => c ? { ...c, isPublished: !c.isPublished } : c)}
                  style={{ width: 44, height: 24, borderRadius: 999, cursor: 'pointer', background: course.isPublished ? 'var(--seiva-medium)' : '#d1d5db', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
                  <div style={{ position: 'absolute', top: 2, left: course.isPublished ? 22 : 2, width: 20, height: 20, borderRadius: '50%', background: 'white', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                </div>
                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--seiva-dark)', marginBottom: 0 }}>Publicado</span>
              </label>
            </div>
          </div>
          <div>
            <label>URL da imagem de capa</label>
            <input className="field" type="url" placeholder="https://..." value={course.coverImage || ''}
              onChange={e => setCourse(c => c ? { ...c, coverImage: e.target.value } : c)} />
          </div>
        </div>
      </div>

      {/* Modules */}
      <div className="card" style={{ padding: '1.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--seiva-dark)' }}>
            Módulos e Aulas
          </h2>
          <button onClick={() => setShowModModal(true)} className="btn btn-primary btn-sm">
            <Plus size={15} /> Novo módulo
          </button>
        </div>

        {course.modules.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#9ca3af', border: '2px dashed #e5e7eb', borderRadius: 'var(--radius-lg)' }}>
            Nenhum módulo ainda. Clique em "Novo módulo" para começar.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {course.modules.map((mod, mi) => (
              <details key={mod.id} open style={{ border: '1px solid rgba(40,54,24,0.10)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
                <summary style={{
                  padding: '0.875rem 1.125rem', cursor: 'pointer', listStyle: 'none',
                  background: 'rgba(96,108,56,0.04)', display: 'flex', alignItems: 'center',
                  justifyContent: 'space-between', userSelect: 'none',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{
                      width: 26, height: 26, borderRadius: '50%', background: 'var(--seiva-medium)',
                      color: 'white', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>{mi + 1}</span>
                    <span style={{ fontWeight: 700, color: 'var(--seiva-dark)', fontSize: '0.9375rem' }}>{mod.title}</span>
                    <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>{mod.lessons.length} aulas</span>
                  </div>
                </summary>
                <div style={{ padding: '0.875rem 1.125rem' }}>
                  {mod.lessons.length === 0 ? (
                    <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '0.75rem' }}>Nenhuma aula ainda.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.75rem' }}>
                      {mod.lessons.map((lesson, li) => (
                        <div key={lesson.id} style={{
                          display: 'flex', alignItems: 'center', gap: '0.75rem',
                          padding: '0.625rem 0.875rem', background: '#fafaf8',
                          borderRadius: 'var(--radius-md)', border: '1px solid #f3f4f6',
                        }}>
                          <span style={{ fontSize: '0.8rem', color: '#9ca3af', minWidth: 20, textAlign: 'center', fontWeight: 600 }}>
                            {String(li + 1).padStart(2, '0')}
                          </span>
                          <span style={{ flex: 1, fontSize: '0.875rem', color: 'var(--seiva-ink)', fontWeight: 500 }}>
                            {lesson.title}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: '#9ca3af', fontFamily: 'monospace', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {lesson.videoUrl.replace('https://', '')}
                          </span>
                          <button onClick={() => deleteLesson(mod.id, lesson.id)} style={{
                            background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem',
                            color: '#d1d5db', borderRadius: 'var(--radius-sm)', flexShrink: 0,
                          }}
                            onMouseEnter={e => (e.currentTarget.style.color = '#dc2626')}
                            onMouseLeave={e => (e.currentTarget.style.color = '#d1d5db')}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <button onClick={() => setShowLessonModal(mod.id)} className="btn btn-secondary btn-sm">
                    <Plus size={14} /> Adicionar aula
                  </button>
                </div>
              </details>
            ))}
          </div>
        )}
      </div>

      {/* Modal: novo módulo */}
      {showModModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, padding: '1rem' }}>
          <div className="card animate-fade-up" style={{ padding: '1.75rem', width: '100%', maxWidth: 420 }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--seiva-dark)', marginBottom: '1.25rem' }}>Novo módulo</h3>
            <div style={{ marginBottom: '1.25rem' }}>
              <label>Título do módulo</label>
              <input className="field" autoFocus value={newModTitle} onChange={e => setNewModTitle(e.target.value)}
                placeholder="Ex: Módulo 1 — Introdução" onKeyDown={e => e.key === 'Enter' && addModule()} />
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={addModule} className="btn btn-primary" disabled={addingMod || !newModTitle.trim()} style={{ flex: 1 }}>
                {addingMod ? 'Criando...' : 'Criar módulo'}
              </button>
              <button onClick={() => { setShowModModal(false); setNewModTitle(''); }} className="btn btn-secondary">Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: nova aula */}
      {showLessonModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, padding: '1rem' }}>
          <div className="card animate-fade-up" style={{ padding: '1.75rem', width: '100%', maxWidth: 480 }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--seiva-dark)', marginBottom: '1.25rem' }}>Nova aula</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <label>Título da aula</label>
                <input className="field" autoFocus value={newLesson.title} onChange={e => setNewLesson(l => ({ ...l, title: e.target.value }))} placeholder="Ex: Introdução ao tema" />
              </div>
              <div>
                <label>URL do vídeo (YouTube ou Vimeo)</label>
                <input className="field" type="url" value={newLesson.videoUrl} onChange={e => setNewLesson(l => ({ ...l, videoUrl: e.target.value }))} placeholder="https://www.youtube.com/watch?v=..." />
              </div>
              <div>
                <label>Descrição (opcional)</label>
                <textarea className="field" rows={3} value={newLesson.description} onChange={e => setNewLesson(l => ({ ...l, description: e.target.value }))} style={{ resize: 'vertical' }} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={() => addLesson(showLessonModal!)} className="btn btn-primary" disabled={addingLesson || !newLesson.title.trim() || !newLesson.videoUrl.trim()} style={{ flex: 1 }}>
                {addingLesson ? 'Criando...' : 'Criar aula'}
              </button>
              <button onClick={() => { setShowLessonModal(null); setNewLesson({ title: '', videoUrl: '', description: '' }); }} className="btn btn-secondary">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
