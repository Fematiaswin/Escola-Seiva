import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createAsaasPayment } from '@/lib/asaas';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

const checkoutSchema = z.object({
  courseId: z.string().min(1, 'Curso inválido'),
  name: z.string().min(2).max(100),
  email: z.string().email('E-mail inválido'),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const body = await req.json().catch(() => null);
    const formData = !body ? await req.formData().catch(() => null) : null;

    const rawData = body || (formData ? {
      courseId: String(formData.get('courseId') || ''),
      name: String(formData.get('name') || ''),
      email: String(formData.get('email') || ''),
    } : null);

    if (!rawData) return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 });

    const parsed = checkoutSchema.safeParse(rawData);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0]?.message }, { status: 400 });
    }

    const { courseId, name, email } = parsed.data;

    const course = await prisma.course.findUnique({ where: { id: courseId, isPublished: true } });
    if (!course) return NextResponse.json({ error: 'Curso não encontrado' }, { status: 404 });

    // Usa sessão se disponível, senão cria/busca usuário
    let userId = session?.user?.id;
    if (!userId) {
      const user = await prisma.user.upsert({
        where: { email },
        update: { name },
        create: { name, email, role: 'STUDENT' },
      });
      userId = user.id;
    }

    // Verifica se já tem acesso
    const existingAccess = await prisma.studentCourse.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });
    if (existingAccess?.accessStatus === 'ACTIVE') {
      return NextResponse.json({ error: 'Você já tem acesso a este curso.' }, { status: 409 });
    }

    // Verifica pagamento pendente recente (evita duplicidade)
    const recentPending = await prisma.payment.findFirst({
      where: { userId, courseId, status: 'PENDING', createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
      orderBy: { createdAt: 'desc' },
    });

    if (recentPending?.paymentUrl) {
      if (req.headers.get('accept')?.includes('application/json')) {
        return NextResponse.json({ paymentUrl: recentPending.paymentUrl });
      }
      return NextResponse.redirect(recentPending.paymentUrl, 303);
    }

    const externalReference = `${userId}:${courseId}:${Date.now()}`;

    if (course.asaasPaymentLink) {
      await prisma.payment.create({
        data: {
          userId,
          courseId,
          value: course.price,
          status: 'PENDING',
          externalReference,
          paymentUrl: course.asaasPaymentLink,
        },
      });

      if (req.headers.get('accept')?.includes('application/json')) {
        return NextResponse.json({ paymentUrl: course.asaasPaymentLink, mode: 'manual-link' });
      }
      return NextResponse.redirect(course.asaasPaymentLink, 303);
    }

    const payment = await prisma.payment.create({
      data: { userId, courseId, value: course.price, status: 'PENDING', externalReference },
    });

    const asaas = await createAsaasPayment({
      name, email, courseTitle: course.title, value: course.price, externalReference,
    });

    const paymentUrl = asaas.invoiceUrl || asaas.bankSlipUrl || '';
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        asaasPaymentId: asaas.id,
        asaasCustomerId: asaas.customer,
        status: 'PENDING',
        paymentUrl,
      },
    });

    if (req.headers.get('accept')?.includes('application/json')) {
      return NextResponse.json({ paymentUrl, paymentId: asaas.id });
    }
    return NextResponse.redirect(paymentUrl || `${process.env.NEXT_PUBLIC_APP_URL}/aluno/dashboard`, 303);
  } catch (err: any) {
    console.error('[Checkout]', err);
    return NextResponse.json(
      { error: err.message?.includes('ASAAS_API_KEY') ? 'Pagamentos não configurados. Contate o suporte.' : 'Erro ao processar pagamento.' },
      { status: 500 }
    );
  }
}
