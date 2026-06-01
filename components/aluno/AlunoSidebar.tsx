'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { BookOpen, LayoutDashboard, LogOut } from 'lucide-react';

const NAV = [
  { href: '/aluno/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/aluno/cursos',    icon: BookOpen,         label: 'Meus Cursos' },
];

export default function AlunoSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <aside style={{
      width: 220, flexShrink: 0,
      background: 'var(--seiva-dark)',
      minHeight: '100vh', padding: '1.5rem 0',
      display: 'flex', flexDirection: 'column',
    }}>
      <div style={{ padding: '0 1.25rem 1.5rem', borderBottom: '1px solid rgba(254,250,224,0.10)' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', textDecoration: 'none' }}>
          <div style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img className="brand-mark" src="/brand/seiva-mark-cream.png" alt="" />
          </div>
          <span className="brand-wordmark" style={{ color: 'var(--seiva-cream)', fontSize: '1rem' }}>
            Escola Seiva
          </span>
        </Link>
      </div>

      {session?.user && (
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid rgba(254,250,224,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%', background: 'rgba(254,250,224,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.9rem', fontWeight: 700, color: 'var(--seiva-cream)', flexShrink: 0,
            }}>
              {session.user.name?.charAt(0).toUpperCase()}
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ color: 'var(--seiva-cream)', fontSize: '0.875rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {session.user.name}
              </p>
              <p style={{ color: 'rgba(254,250,224,0.45)', fontSize: '0.75rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {session.user.email}
              </p>
            </div>
          </div>
        </div>
      )}

      <nav style={{ flex: 1, padding: '1rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
        {NAV.map(item => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.625rem 0.875rem', borderRadius: 'var(--radius-lg)',
                textDecoration: 'none', fontSize: '0.9rem', fontWeight: active ? 600 : 500,
                color: active ? 'var(--seiva-cream)' : 'rgba(254,250,224,0.55)',
                background: active ? 'rgba(254,250,224,0.12)' : 'transparent',
                transition: 'all 0.15s',
              }}
            >
              <item.icon size={17} /> {item.label}
            </Link>
          );
        })}
      </nav>

      <div style={{ padding: '1rem 0.75rem', borderTop: '1px solid rgba(254,250,224,0.10)' }}>
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.75rem',
            width: '100%', padding: '0.625rem 0.875rem', borderRadius: 'var(--radius-lg)',
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'rgba(254,250,224,0.45)', fontSize: '0.9rem', fontWeight: 500, transition: 'all 0.15s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#fca5a5'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(220,38,38,0.12)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(254,250,224,0.45)'; (e.currentTarget as HTMLButtonElement).style.background = 'none'; }}
        >
          <LogOut size={17} /> Sair
        </button>
      </div>
    </aside>
  );
}
