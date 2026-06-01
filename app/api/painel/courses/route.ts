import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import type { Session } from 'next-auth';

function requireAdmin(session: Session | null) {
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
  }
  return null;
}

function slugify(value: string) {
  return value
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

const courseSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(10).max(5000),
  shortDescription: z.string().max(300).optional(),
  price: z.number().min(0),
  isPublished: z.boolean().default(false),
  coverImage: z.string().url().optional().or(z.literal('')),
  asaasPaymentLink: z.string().url().optional().or(z.literal('')),
});

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  const deny = requireAdmin(session);
  if (deny) return deny;

  try {
    const courses = await prisma.course.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { modules: true, studentCourses: true, payments: true } },
      },
    });
    return NextResponse.json(courses);
  } catch (err) {
    console.error('[Admin Courses GET]', err);
    return NextResponse.json({ error: 'Erro ao buscar cursos' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const deny = requireAdmin(session);
  if (deny) return deny;

  try {
    let data: Record<string, unknown>;
    const contentType = req.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      data = await req.json();
    } else {
      const form = await req.formData();
      data = {
        title: String(form.get('title') || ''),
        description: String(form.get('description') || ''),
        shortDescription: String(form.get('shortDescription') || ''),
        price: Number(String(form.get('price') || '0').replace(',', '.')),
        isPublished: form.get('isPublished') === 'on' || form.get('isPublished') === 'true',
        coverImage: String(form.get('coverImage') || ''),
        asaasPaymentLink: String(form.get('asaasPaymentLink') || ''),
      };
    }

    const parsed = courseSchema.safeParse(data);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0]?.message }, { status: 400 });
    }

    const { title, description, shortDescription, price, isPublished, coverImage, asaasPaymentLink } = parsed.data;

    let slug = slugify(title);
    const exists = await prisma.course.findUnique({ where: { slug } });
    if (exists) slug = `${slug}-${Date.now()}`;

    const course = await prisma.course.create({
      data: {
        title, slug, description,
        shortDescription: shortDescription || null,
        price, isPublished,
        coverImage: coverImage || null,
        asaasPaymentLink: asaasPaymentLink || null,
      },
    });

    return NextResponse.json(course, { status: 201 });
  } catch (err) {
    console.error('[Admin Courses POST]', err);
    return NextResponse.json({ error: 'Erro ao criar curso' }, { status: 500 });
  }
}
