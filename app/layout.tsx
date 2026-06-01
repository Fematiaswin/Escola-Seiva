import './globals.css';
import type { Metadata, Viewport } from 'next';
import Providers from '@/components/Providers';

export const metadata: Metadata = {
  title: {
    default: 'Escola Seiva — Cursos Online',
    template: '%s | Escola Seiva',
  },
  description: 'Plataforma de formação da Igreja Seiva. Cursos online com área exclusiva para alunos, certificados e suporte.',
  keywords: ['cursos online', 'escola seiva', 'formação cristã', 'EAD', 'igreja seiva'],
  authors: [{ name: 'Igreja Seiva' }],
  creator: 'Igreja Seiva',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://escola.igrejaseiva.com.br'),
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    siteName: 'Escola Seiva',
    title: 'Escola Seiva — Cursos Online',
    description: 'Plataforma de formação da Igreja Seiva. Conhecimento que cria raízes e gera crescimento.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Escola Seiva' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Escola Seiva — Cursos Online',
    description: 'Plataforma de formação da Igreja Seiva.',
    images: ['/og-image.png'],
  },
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: '#606c38',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
