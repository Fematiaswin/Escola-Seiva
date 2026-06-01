import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const users = await prisma.user.count();
    const courses = await prisma.course.count();

    return NextResponse.json({
      ok: true,
      database: 'connected',
      users,
      courses,
      hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
    });
  } catch (err: any) {
    console.error('[DB Health]', err);

    return NextResponse.json(
      {
        ok: false,
        database: 'error',
        code: err?.code || 'UNKNOWN',
        name: err?.name || 'UnknownError',
        detail: typeof err?.message === 'string'
          ? err.message.replace(process.env.DATABASE_URL || '', '[DATABASE_URL]').slice(0, 500)
          : null,
        message:
          err?.code === 'P2021'
            ? 'Tabelas não encontradas. Rode o SQL do schema no Supabase.'
            : err?.code === 'P1001' || err?.code === 'P1000'
              ? 'Falha de conexão. Verifique DATABASE_URL na Vercel.'
              : 'Erro ao consultar o banco. Verifique os logs da Vercel.',
        hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
      },
      { status: 500 }
    );
  }
}
