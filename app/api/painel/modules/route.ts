import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

function deny() { return NextResponse.json({ error: 'Acesso negado' }, { status: 403 }); }

const moduleSchema = z.object({
  title:       z.string().min(2).max(200),
  description: z.string().max(1000).optional(),
  orderIndex:  z.number().int().min(0).default(0),
});

// GET /api/painel/modules?courseId=xxx
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') return deny();

  const { searchParams } = new URL(req.url);
  const courseId = searchParams.get('courseId');
  if (!courseId) return NextResponse.json({ error: 'courseId obrigatório' }, { status: 400 });

  try {
    const modules = await prisma.module.findMany({
      where: { courseId },
      orderBy: { orderIndex: 'asc' },
      include: {
        lessons: {
          where: { isPublished: true },
          orderBy: { orderIndex: 'asc' },
          select: { id: true, title: true, orderIndex: true, duration: true },
        },
        _count: { select: { lessons: true } },
      },
    });
    return NextResponse.json(modules);
  } catch (err) {
    console.error('[Admin Modules GET]', err);
    return NextResponse.json({ error: 'Erro ao buscar módulos' }, { status: 500 });
  }
}

// POST /api/painel/modules
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') return deny();

  try {
    const body = await req.json();
    const parsed = moduleSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0]?.message }, { status: 400 });

    const { courseId } = body;
    if (!courseId) return NextResponse.json({ error: 'courseId obrigatório' }, { status: 400 });

    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) return NextResponse.json({ error: 'Curso não encontrado' }, { status: 404 });

    const module = await prisma.module.create({
      data: { courseId, ...parsed.data },
    });
    return NextResponse.json(module, { status: 201 });
  } catch (err) {
    console.error('[Admin Modules POST]', err);
    return NextResponse.json({ error: 'Erro ao criar módulo' }, { status: 500 });
  }
}
