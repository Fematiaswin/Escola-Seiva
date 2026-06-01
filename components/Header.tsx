'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useState } from 'react';
import {
  BookOpen, Menu, X, ChevronDown, LogOut, User, LayoutDashboard
} from 'lucide-react';

export function Header() {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <header
      style={{
        background: 'rgba(254,250,224,0.92)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(40,54,24,0.08)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      <div className="container" style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
          <div
            style={{
              width: 34, height: 34,
              background: 'var(--seiva-medium)',
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <BookOpen size={18} color="var(--seiva-cream)" />
          </div>
          <div>
            <span style={{ fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: '1.125rem', color: 'var(--seiva-dark)', lineHeight: 1 }}>
              Escola Seiva
            </span>
          </div>
        </Link>

        {/* Nav desktop */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }} className="hidden md:flex">
          <Link href="/cursos" className="btn btn-ghost btn-sm">Cursos</Link>
          <Link href="/sobre" className="btn btn-ghost btn-sm">Sobre</Link>
        </nav>

        {/* Auth desktop */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }} className="hidden md:flex">
          {session ? (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  background: 'white', border: '1.5px solid rgba(40,54,24,0.15)',
                  borderRadius: 999, cursor: 'pointer', fontSize: '0.875rem',
                  fontWeight: 600, color: 'var(--seiva-dark)',
                  transition: 'all 0.15s',
                }}
              >
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: 'var(--seiva-medium)', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <User size={14} color="white" />
                </div>
                {session.user?.name?.split(' ')[0]}
                <ChevronDown size={14} />
              </button>

              {userMenuOpen && (
                <div
                  style={{
                    position: 'absolute', right: 0, top: 'calc(100% + 8px)',
                    background: 'white', border: '1px solid rgba(40,54,24,0.10)',
                    borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)',
                    minWidth: 200, padding: '0.375rem', zIndex: 100,
                  }}
                  onClick={() => setUserMenuOpen(false)}
                >
                  <Link href="/aluno/dashboard" className="nav-item" style={{ fontSize: '0.875rem' }}>
                    <LayoutDashboard size={16} /> Minha área
                  </Link>
                  {session.user?.role === 'ADMIN' && (
                    <Link href="/admin" className="nav-item" style={{ fontSize: '0.875rem' }}>
                      <LayoutDashboard size={16} /> Painel Admin
                    </Link>
                  )}
                  <hr className="divider" style={{ margin: '0.375rem 0' }} />
                  <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="nav-item"
                    style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', fontSize: '0.875rem' }}
                  >
                    <LogOut size={16} /> Sair
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/login" className="btn btn-secondary btn-sm">Entrar</Link>
              <Link href="/cadastro" className="btn btn-primary btn-sm">Criar conta</Link>
            </>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button
          className="md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem', color: 'var(--seiva-dark)' }}
          aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          style={{
            background: 'var(--seiva-cream)', borderTop: '1px solid rgba(40,54,24,0.08)',
            padding: '1rem 1.25rem 1.25rem',
          }}
          className="animate-fade-in md:hidden"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <Link href="/cursos" className="nav-item" onClick={() => setMenuOpen(false)}>Cursos</Link>
            <Link href="/sobre" className="nav-item" onClick={() => setMenuOpen(false)}>Sobre</Link>
            <hr className="divider" />
            {session ? (
              <>
                <Link href="/aluno/dashboard" className="nav-item" onClick={() => setMenuOpen(false)}>Minha área</Link>
                {session.user?.role === 'ADMIN' && (
                  <Link href="/admin" className="nav-item" onClick={() => setMenuOpen(false)}>Painel Admin</Link>
                )}
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="nav-item"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', textAlign: 'left' }}
                >
                  <LogOut size={16} /> Sair
                </button>
              </>
            ) : (
              <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '0.5rem' }}>
                <Link href="/login" className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={() => setMenuOpen(false)}>
                  Entrar
                </Link>
                <Link href="/cadastro" className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={() => setMenuOpen(false)}>
                  Criar conta
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
