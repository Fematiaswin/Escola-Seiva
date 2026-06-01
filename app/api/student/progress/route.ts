import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const progressSchema = z.object({
  lessonId: z.string().min(1),
  completed: z.boolean().optional(),
  watchedSecs: z.number().int().min(0).optional(),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });

  const userId = session.user.id;

  try {
    const body = await req.json();
    const parsed = progressSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 });

    const { lessonId, completed, watchedSecs } = parsed.data;

    const progress = await prisma.lessonProgress.upsert({
      where: { userId_lessonId: { userId, lessonId } },
      update: {
        ...(completed !== undefined && { completed }),
        ...(watchedSecs !== undefined && { watchedSecs }),
        ...(completed && { completedAt: new Date() }),
      },
      create: {
        userId, lessonId,
        completed: completed ?? false,
        watchedSecs: watchedSecs ?? 0,
        ...(completed && { completedAt: new Date() }),
      },
    });

    return NextResponse.json(progress);
  } catch (err) {
    console.error('[Progress API]', err);
    return NextResponse.json({ error: 'Erro ao atualizar progresso' }, { status: 500 });
  }
}
