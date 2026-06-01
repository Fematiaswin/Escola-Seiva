'use client';

import { useState } from 'react';
import { ShoppingCart, AlertCircle, Loader2 } from 'lucide-react';

interface Props {
  courseId: string;
  courseTitle: string;
  price: number;
  userSession: { name: string; email: string } | null;
}

export default function CheckoutForm({ courseId, courseTitle, price, userSession }: Props) {
  const [name, setName]   = useState(userSession?.name  || '');
  const [email, setEmail] = useState(userSession?.email || '');
  const [loading, setLoading] = useState(false);
  const [error, setError]    = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/checkout/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ courseId, name: name.trim(), email: email.trim().toLowerCase() }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Erro ao iniciar pagamento.'); return; }
      if (data.paymentUrl) window.location.href = data.paymentUrl;
    } catch {
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
      {error && (
        <div className="alert alert-error">
          <AlertCircle size={16} style={{ flexShrink: 0 }} /> {error}
        </div>
      )}
      {!userSession && (
        <>
          <div>
            <label htmlFor="co-name">Seu nome</label>
            <input id="co-name" className="field" type="text" required minLength={2}
              placeholder="Nome completo" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div>
            <label htmlFor="co-email">Seu e-mail</label>
            <input id="co-email" className="field" type="email" required
              placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
        </>
      )}
      <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ width: '100%' }}>
        {loading
          ? <><Loader2 size={18} style={{ animation: 'spin 0.6s linear infinite' }} /> Processando...</>
          : <><ShoppingCart size={18} /> Comprar agora</>
        }
      </button>
      <style>{`@keyframes spin { to { transform:rotate(360deg); } }`}</style>
    </form>
  );
}
