'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--seiva-cream)', padding: '2rem', textAlign: 'center',
    }}>
      <div style={{ maxWidth: 480 }}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%', background: 'rgba(239,68,68,0.10)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem',
        }}>
          <AlertTriangle size={28} color="#dc2626" />
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700, color: 'var(--seiva-dark)', marginBottom: '0.75rem' }}>
          Algo deu errado
        </h1>
        <p style={{ color: '#6b7280', marginBottom: '2rem', lineHeight: 1.7 }}>
          Ocorreu um erro inesperado. Nossa equipe foi notificada.
        </p>
        <div style={{ display: 'flex', gap: '0.875rem', justifyContent: 'center' }}>
          <button onClick={reset} className="btn btn-primary">Tentar novamente</button>
          <Link href="/" className="btn btn-secondary">Ir para início</Link>
        </div>
      </div>
    </div>
  );
}
