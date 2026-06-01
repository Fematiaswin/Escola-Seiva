import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const courses = await prisma.course.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, title: true, slug: true, description: true,
        shortDescription: true, coverImage: true, price: true,
        _count: { select: { modules: true, studentCourses: true } },
      },
    });
    return NextResponse.json(courses);
  } catch (err) {
    console.error('[API Courses]', err);
    return NextResponse.json({ error: 'Erro ao buscar cursos' }, { status: 500 });
  }
}
