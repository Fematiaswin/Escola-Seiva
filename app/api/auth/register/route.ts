import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const registerSchema = z.object({
  name: z.string().min(2, 'Nome deve ter ao menos 2 caracteres').max(100),
  email: z.string().email('E-mail inválido').max(200),
  password: z.string().min(6, 'Senha deve ter ao menos 6 caracteres').max(128),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || 'Dados inválidos' },
        { status: 400 }
      );
    }

    const { name, email, password } = parsed.data;

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      return NextResponse.json({ error: 'Este e-mail já está cadastrado.' }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    await prisma.user.create({
      data: { name, email, passwordHash, role: 'STUDENT' },
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err: any) {
    console.error('[API Register]', err);
    if (err?.code === 'P2021') {
      return NextResponse.json({ error: 'Banco de dados ainda não está preparado. Verifique as tabelas no Supabase.' }, { status: 500 });
    }
    if (err?.code === 'P1001' || err?.code === 'P1000') {
      return NextResponse.json({ error: 'Não foi possível conectar ao banco de dados. Verifique a DATABASE_URL na Vercel.' }, { status: 500 });
    }
    return NextResponse.json({ error: 'Erro interno. Verifique os logs da Vercel.' }, { status: 500 });
  }
}
