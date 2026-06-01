import type { Metadata } from 'next';
import AlunoSidebar from '@/components/aluno/AlunoSidebar';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: { default: 'Minha Área', template: '%s | Escola Seiva' },
};

export default function AlunoLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8f7f4' }}>
      <AlunoSidebar />
      <main style={{ flex: 1, overflow: 'auto' }}>
        {children}
      </main>
    </div>
  );
}
