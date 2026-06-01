'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
  LayoutDashboard, BookOpen, Users, CreditCard, Settings, LogOut, ChevronRight, BookMarked
} from 'lucide-react';

const NAV = [
  { href: '/admin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { href: '/admin/cursos', icon: BookOpen, label: 'Cursos' },
  { href: '/admin/alunos', icon: Users, label: 'Alunos' },
  { href: '/admin/financeiro', icon: CreditCard, label: 'Financeiro' },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  function isActive(href: string, exact?: boolean) {
    return exact ? pathname === href : pathname.startsWith(href) && href !== '/admin';
  }

  return (
    <aside style={{
      width: 240, flexShrink: 0,
      background: 'var(--seiva-dark)',
      minHeight: '100vh', padding: '1.5rem 0',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Logo */}
      <div style={{ padding: '0 1.25rem 1.5rem', borderBottom: '1px solid rgba(254,250,224,0.10)' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', textDecoration: 'none' }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(254,250,224,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BookMarked size={16} color="var(--seiva-cream)" />
          </div>
          <div>
            <div style={{ color: 'var(--seiva-cream)', fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: '1rem', lineHeight: 1 }}>Escola Seiva</div>
            <div style={{ color: 'rgba(254,250,224,0.45)', fontSize: '0.6875rem', marginTop: '0.125rem' }}>Painel Admin</div>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '1rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
        {NAV.map(item => {
          const active = isActive(item.href, item.exact);
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
              <item.icon size={17} />
              {item.label}
              {active && <ChevronRight size={14} style={{ marginLeft: 'auto', opacity: 0.6 }} />}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={{ padding: '1rem 0.75rem', borderTop: '1px solid rgba(254,250,224,0.10)' }}>
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.75rem',
            width: '100%', padding: '0.625rem 0.875rem', borderRadius: 'var(--radius-lg)',
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'rgba(254,250,224,0.45)', fontSize: '0.9rem', fontWeight: 500,
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#fca5a5'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(220,38,38,0.12)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(254,250,224,0.45)'; (e.currentTarget as HTMLButtonElement).style.background = 'none'; }}
        >
          <LogOut size={17} />
          Sair
        </button>
      </div>
    </aside>
  );
}
