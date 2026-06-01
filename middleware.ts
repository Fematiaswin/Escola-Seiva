import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // Rotas admin: apenas ADMIN
    if (pathname.startsWith('/admin') && token?.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/login?callbackUrl=' + pathname, req.url));
    }

    // Rotas aluno: ADMIN ou STUDENT
    if (pathname.startsWith('/aluno') && !['ADMIN', 'STUDENT'].includes(token?.role as string)) {
      return NextResponse.redirect(new URL('/login?callbackUrl=' + pathname, req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ['/admin/:path*', '/aluno/:path*'],
};
