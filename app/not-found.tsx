import Link from 'next/link';
import { BookOpen } from 'lucide-react';

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--seiva-cream)', padding: '2rem', textAlign: 'center',
    }}>
      <div style={{ maxWidth: 480 }}>
        <p style={{ fontSize: '6rem', fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--seiva-light)', lineHeight: 1 }}>
          404
        </p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700, color: 'var(--seiva-dark)', margin: '1rem 0 0.75rem' }}>
          Página não encontrada
        </h1>
        <p style={{ color: '#6b7280', marginBottom: '2rem', lineHeight: 1.7 }}>
          A página que você procura não existe ou foi movida.
        </p>
        <Link href="/" className="btn btn-primary">
          <BookOpen size={17} /> Voltar para o início
        </Link>
      </div>
    </div>
  );
}
