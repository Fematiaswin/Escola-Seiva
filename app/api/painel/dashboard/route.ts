import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
  }

  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [
      totalStudents,
      totalCourses,
      totalPaymentsConfirmed,
      recentPayments,
      newStudents7d,
      pendingPayments,
      topCourses,
      recentEnrollments,
    ] = await Promise.all([
      prisma.user.count({ where: { role: 'STUDENT' } }),
      prisma.course.count({ where: { isPublished: true } }),
      prisma.payment.aggregate({ where: { status: 'CONFIRMED' }, _sum: { value: true }, _count: true }),
      prisma.payment.findMany({
        where: { createdAt: { gte: thirtyDaysAgo } },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: { user: { select: { name: true, email: true } }, course: { select: { title: true } } },
      }),
      prisma.user.count({ where: { role: 'STUDENT', createdAt: { gte: sevenDaysAgo } } }),
      prisma.payment.count({ where: { status: 'PENDING' } }),
      prisma.course.findMany({
        where: { isPublished: true },
        include: { _count: { select: { studentCourses: true } } },
        orderBy: { studentCourses: { _count: 'desc' } },
        take: 5,
      }),
      prisma.studentCourse.findMany({
        where: { enrolledAt: { gte: sevenDaysAgo } },
        include: { user: { select: { name: true, email: true } }, course: { select: { title: true } } },
        orderBy: { enrolledAt: 'desc' },
        take: 8,
      }),
    ]);

    return NextResponse.json({
      totalStudents,
      totalCourses,
      totalRevenue: totalPaymentsConfirmed._sum.value || 0,
      totalSales: totalPaymentsConfirmed._count,
      newStudents7d,
      pendingPayments,
      recentPayments,
      topCourses: topCourses.map(c => ({ id: c.id, title: c.title, students: c._count.studentCourses })),
      recentEnrollments,
    });
  } catch (err) {
    console.error('[Admin Dashboard]', err);
    return NextResponse.json({ error: 'Erro ao buscar dados' }, { status: 500 });
  }
}
