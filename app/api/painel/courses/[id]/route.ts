import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

function deny() { return NextResponse.json({ error: 'Acesso negado' }, { status: 403 }); }

const updateSchema = z.object({
  title:              z.string().min(3).max(200).optional(),
  description:        z.string().min(10).max(5000).optional(),
  shortDescription:   z.string().max(300).optional(),
  price:              z.number().min(0).optional(),
  isPublished:        z.boolean().optional(),
  coverImage:         z.string().url().optional().or(z.literal('')),
  asaasPaymentLink:   z.string().url().optional().or(z.literal('')),
});

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') return deny();

  try {
    const course = await prisma.course.findUnique({
      where: { id: params.id },
      include: {
        modules: {
          orderBy: { orderIndex: 'asc' },
          include: {
            lessons: {
              orderBy: { orderIndex: 'asc' },
              include: { materials: true },
            },
          },
        },
        _count: { select: { studentCourses: true, payments: true } },
      },
    });
    if (!course) return NextResponse.json({ error: 'Curso não encontrado' }, { status: 404 });
    return NextResponse.json(course);
  } catch (err) {
    return NextResponse.json({ error: 'Erro ao buscar curso' }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') return deny();

  try {
    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0]?.message }, { status: 400 });

    const course = await prisma.course.update({
      where: { id: params.id },
      data: parsed.data,
    });
    return NextResponse.json(course);
  } catch (err) {
    console.error('[Admin Course PATCH]', err);
    return NextResponse.json({ error: 'Erro ao atualizar curso' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') return deny();

  try {
    await prisma.course.delete({ where: { id: params.id } });
    return NextResponse.json({ deleted: true });
  } catch (err) {
    return NextResponse.json({ error: 'Erro ao remover curso' }, { status: 500 });
  }
}
