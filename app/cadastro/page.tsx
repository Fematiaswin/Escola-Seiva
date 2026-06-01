'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BookOpen, Eye, EyeOff, UserPlus, AlertCircle } from 'lucide-react';

export default function CadastroPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function update(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
    setError('');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }
    if (form.password.length < 6) {
      setError('A senha deve ter ao menos 6 caracteres.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name.trim(), email: form.email.trim().toLowerCase(), password: form.password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Erro ao criar conta. Tente novamente.');
      } else {
        router.push('/login?registered=1');
      }
    } catch {
      setError('Erro de conexão. Verifique sua internet.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, var(--seiva-dark) 0%, var(--seiva-medium) 100%)',
      padding: '1.5rem',
    }}>
      <div className="animate-fade-up" style={{ width: '100%', maxWidth: 440 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%', background: 'var(--seiva-cream)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem',
          }}>
            <BookOpen size={26} color="var(--seiva-dark)" />
          </div>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '1.75rem', fontWeight: 700, color: 'var(--seiva-cream)' }}>
            Escola Seiva
          </h1>
          <p style={{ color: 'rgba(254,250,224,0.65)', fontSize: '0.9375rem', marginTop: '0.375rem' }}>
            Crie sua conta gratuitamente
          </p>
        </div>

        <div className="card" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--seiva-dark)', marginBottom: '1.5rem' }}>
            Criar conta
          </h2>

          {error && (
            <div className="alert alert-error" style={{ marginBottom: '1.25rem' }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
            <div>
              <label htmlFor="name">Nome completo</label>
              <input id="name" type="text" className="field" placeholder="Seu nome" value={form.name}
                onChange={e => update('name', e.target.value)} required minLength={2} autoFocus />
            </div>
            <div>
              <label htmlFor="email">E-mail</label>
              <input id="email" type="email" className="field" placeholder="seu@email.com" value={form.email}
                onChange={e => update('email', e.target.value)} required autoComplete="email" />
            </div>
            <div>
              <label htmlFor="password">Senha</label>
              <div style={{ position: 'relative' }}>
                <input id="password" type={showPass ? 'text' : 'password'} className="field"
                  placeholder="Mínimo 6 caracteres" value={form.password}
                  onChange={e => update('password', e.target.value)} required minLength={6}
                  style={{ paddingRight: '3rem' }} />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  style={{ position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--seiva-muted)', padding: '0.25rem' }}>
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div>
              <label htmlFor="confirm">Confirmar senha</label>
              <input id="confirm" type="password" className="field" placeholder="Repita sua senha"
                value={form.confirmPassword} onChange={e => update('confirmPassword', e.target.value)} required />
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', marginTop: '0.375rem' }}>
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span className="spinner" /> Criando conta...
                </span>
              ) : (
                <><UserPlus size={17} /> Criar conta</>
              )}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: '#666' }}>
            Já tem conta?{' '}
            <Link href="/login" style={{ color: 'var(--seiva-medium)', fontWeight: 600 }}>Entrar</Link>
          </p>
        </div>

        <p style={{ textAlign: 'center', marginTop: '1.25rem' }}>
          <Link href="/" style={{ color: 'rgba(254,250,224,0.65)', fontSize: '0.875rem', textDecoration: 'none' }}>
            ← Voltar ao início
          </Link>
        </p>
      </div>
      <style>{`
        .spinner { display: inline-block; width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 0.6s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
