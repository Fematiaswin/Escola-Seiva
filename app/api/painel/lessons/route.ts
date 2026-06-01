import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { parseVideoUrl } from '@/lib/video';

function deny() { return NextResponse.json({ error: 'Acesso negado' }, { status: 403 }); }

const lessonSchema = z.object({
  title:       z.string().min(2).max(300),
  description: z.string().max(2000).optional(),
  videoUrl:    z.string().url('URL de vídeo inválida'),
  duration:    z.number().int().min(0).default(0),
  orderIndex:  z.number().int().min(0).default(0),
  isPublished: z.boolean().default(true),
});

// GET /api/painel/lessons?moduleId=xxx
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') return deny();

  const { searchParams } = new URL(req.url);
  const moduleId = searchParams.get('moduleId');
  if (!moduleId) return NextResponse.json({ error: 'moduleId obrigatório' }, { status: 400 });

  try {
    const lessons = await prisma.lesson.findMany({
      where: { moduleId },
      orderBy: { orderIndex: 'asc' },
      include: { materials: true, _count: { select: { progress: true } } },
    });
    return NextResponse.json(lessons);
  } catch (err) {
    return NextResponse.json({ error: 'Erro ao buscar aulas' }, { status: 500 });
  }
}

// POST /api/painel/lessons
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') return deny();

  try {
    const body = await req.json();
    const parsed = lessonSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0]?.message }, { status: 400 });

    const { moduleId } = body;
    if (!moduleId) return NextResponse.json({ error: 'moduleId obrigatório' }, { status: 400 });

    const module = await prisma.module.findUnique({ where: { id: moduleId } });
    if (!module) return NextResponse.json({ error: 'Módulo não encontrado' }, { status: 404 });

    const videoInfo = parseVideoUrl(parsed.data.videoUrl);
    const videoProvider = videoInfo?.provider ?? 'external';

    const lesson = await prisma.lesson.create({
      data: { moduleId, videoProvider, ...parsed.data },
    });
    return NextResponse.json(lesson, { status: 201 });
  } catch (err) {
    console.error('[Admin Lessons POST]', err);
    return NextResponse.json({ error: 'Erro ao criar aula' }, { status: 500 });
  }
}

// PATCH /api/painel/lessons  (body: { id, ...fields })
export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') return deny();

  try {
    const body = await req.json();
    const { id, ...rest } = body;
    if (!id) return NextResponse.json({ error: 'id obrigatório' }, { status: 400 });

    const parsed = lessonSchema.partial().safeParse(rest);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0]?.message }, { status: 400 });

    const update: any = { ...parsed.data };
    if (update.videoUrl) {
      const videoInfo = parseVideoUrl(update.videoUrl);
      update.videoProvider = videoInfo?.provider ?? 'external';
    }

    const lesson = await prisma.lesson.update({ where: { id }, data: update });
    return NextResponse.json(lesson);
  } catch (err) {
    console.error('[Admin Lessons PATCH]', err);
    return NextResponse.json({ error: 'Erro ao atualizar aula' }, { status: 500 });
  }
}

// DELETE /api/painel/lessons?id=xxx
export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') return deny();

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id obrigatório' }, { status: 400 });

  try {
    await prisma.lesson.delete({ where: { id } });
    return NextResponse.json({ deleted: true });
  } catch (err) {
    return NextResponse.json({ error: 'Erro ao remover aula' }, { status: 500 });
  }
}
