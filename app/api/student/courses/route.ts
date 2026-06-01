import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });

  const userId = session.user.id;

  try {
    const studentCourses = await prisma.studentCourse.findMany({
      where: { userId, accessStatus: 'ACTIVE' },
      include: {
        course: {
          include: {
            modules: {
              orderBy: { orderIndex: 'asc' },
              include: {
                lessons: {
                  where: { isPublished: true },
                  orderBy: { orderIndex: 'asc' },
                  include: {
                    materials: true,
                    progress: { where: { userId } },
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { enrolledAt: 'desc' },
    });

    return NextResponse.json(studentCourses);
  } catch (err) {
    console.error('[Student Courses]', err);
    return NextResponse.json({ error: 'Erro ao buscar cursos' }, { status: 500 });
  }
}
