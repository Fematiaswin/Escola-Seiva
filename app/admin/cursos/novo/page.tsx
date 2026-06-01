'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, AlertCircle, CheckCircle } from 'lucide-react';

export default function NovoCurso() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', shortDescription: '',
    price: '', coverImage: '', asaasPaymentLink: '', isPublished: false,
  });

  function update(field: string, value: string | boolean) {
    setForm(prev => ({ ...prev, [field]: value }));
    setError('');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/painel/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          price: parseFloat(form.price.replace(',', '.')) || 0,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Erro ao criar curso.'); return; }
      setSuccess(true);
      setTimeout(() => router.push('/admin/cursos'), 1200);
    } catch {
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: '2rem 2.5rem', maxWidth: 720 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <Link href="/admin/cursos" className="btn btn-secondary btn-sm">
          <ArrowLeft size={15} /> Voltar
        </Link>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700, color: 'var(--seiva-dark)' }}>
            Novo curso
          </h1>
        </div>
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
          <AlertCircle size={16} style={{ flexShrink: 0 }} /> {error}
        </div>
      )}
      {success && (
        <div className="alert alert-success" style={{ marginBottom: '1.5rem' }}>
          <CheckCircle size={16} style={{ flexShrink: 0 }} /> Curso criado! Redirecionando...
        </div>
      )}

      <div className="card" style={{ padding: '2rem' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label htmlFor="title">Título do curso *</label>
            <input id="title" className="field" type="text" required minLength={3}
              placeholder="Ex: Fundamentos da Fé"
              value={form.title} onChange={e => update('title', e.target.value)} />
          </div>

          <div>
            <label htmlFor="shortDescription">Descrição curta</label>
            <input id="shortDescription" className="field" type="text" maxLength={300}
              placeholder="Resumo em uma linha (aparece na listagem)"
              value={form.shortDescription} onChange={e => update('shortDescription', e.target.value)} />
            <p style={{ fontSize: '0.78rem', color: '#9ca3af', marginTop: '0.25rem' }}>
              {form.shortDescription.length}/300 caracteres
            </p>
          </div>

          <div>
            <label htmlFor="description">Descrição completa *</label>
            <textarea id="description" className="field" required minLength={10} rows={5}
              placeholder="Descreva o conteúdo do curso, o que o aluno vai aprender, pré-requisitos..."
              value={form.description} onChange={e => update('description', e.target.value)}
              style={{ resize: 'vertical' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label htmlFor="price">Preço (R$) *</label>
              <input id="price" className="field" type="text" required inputMode="decimal"
                placeholder="0,00"
                value={form.price} onChange={e => update('price', e.target.value)} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', paddingBottom: '2px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', cursor: 'pointer', marginBottom: 0 }}>
                <div
                  onClick={() => update('isPublished', !form.isPublished)}
                  style={{
                    width: 44, height: 24, borderRadius: 999, cursor: 'pointer',
                    background: form.isPublished ? 'var(--seiva-medium)' : '#d1d5db',
                    position: 'relative', transition: 'background 0.2s', flexShrink: 0,
                  }}
                >
                  <div style={{
                    position: 'absolute', top: 2, left: form.isPublished ? 22 : 2,
                    width: 20, height: 20, borderRadius: '50%', background: 'white',
                    transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                  }} />
                </div>
                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--seiva-dark)', marginBottom: 0 }}>
                  Publicar imediatamente
                </span>
              </label>
            </div>
          </div>

          <div>
            <label htmlFor="coverImage">URL da imagem de capa</label>
            <input id="coverImage" className="field" type="url"
              placeholder="https://exemplo.com/imagem.jpg"
              value={form.coverImage} onChange={e => update('coverImage', e.target.value)} />
          </div>

          <div>
            <label htmlFor="asaasPaymentLink">Link de pagamento Asaas (opcional)</label>
            <input id="asaasPaymentLink" className="field" type="url"
              placeholder="https://..."
              value={form.asaasPaymentLink} onChange={e => update('asaasPaymentLink', e.target.value)} />
            <p style={{ fontSize: '0.78rem', color: '#9ca3af', marginTop: '0.25rem' }}>
              Se não informado, o pagamento será gerado automaticamente via API.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.875rem', paddingTop: '0.5rem' }}>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ minWidth: 140 }}>
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span className="spinner" /> Criando...
                </span>
              ) : (
                <><Save size={16} /> Criar curso</>
              )}
            </button>
            <Link href="/admin/cursos" className="btn btn-secondary">Cancelar</Link>
          </div>
        </form>
      </div>

      <style>{`
        .spinner { display:inline-block; width:14px; height:14px; border:2px solid rgba(255,255,255,0.3); border-top-color:white; border-radius:50%; animation:spin 0.6s linear infinite; }
        @keyframes spin { to { transform:rotate(360deg); } }
      `}</style>
    </div>
  );
}
