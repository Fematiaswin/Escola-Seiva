import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const PAID_EVENTS = ['PAYMENT_CONFIRMED', 'PAYMENT_RECEIVED'];

export async function POST(req: Request) {
  // Validação de token do webhook
  const token = req.headers.get('asaas-access-token') || req.headers.get('x-webhook-secret');
  const secret = process.env.WEBHOOK_SECRET;

  if (secret && token !== secret) {
    console.warn('[Webhook Asaas] Token inválido recebido');
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  let payload: Record<string, any>;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: 'Payload inválido' }, { status: 400 });
  }

  const event = String(payload.event || 'UNKNOWN');

  // Registra o evento
  let log;
  try {
    log = await prisma.webhookEvent.create({
      data: { eventType: event, payload: JSON.stringify(payload), processed: false },
    });
  } catch (err) {
    console.error('[Webhook] Erro ao criar log:', err);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }

  // Processa pagamento confirmado
  if (PAID_EVENTS.includes(event)) {
    try {
      const externalReference = payload.payment?.externalReference as string | undefined;
      const asaasPaymentId = payload.payment?.id as string | undefined;

      if (!externalReference && !asaasPaymentId) {
        await prisma.webhookEvent.update({
          where: { id: log.id },
          data: { error: 'Sem referência externa ou ID de pagamento' },
        });
        return NextResponse.json({ received: true });
      }

      const payment = await prisma.payment.findFirst({
        where: {
          OR: [
            ...(externalReference ? [{ externalReference }] : []),
            ...(asaasPaymentId ? [{ asaasPaymentId }] : []),
          ],
        },
      });

      if (!payment) {
        await prisma.webhookEvent.update({
          where: { id: log.id },
          data: { error: `Pagamento não encontrado: ref=${externalReference}, asaasId=${asaasPaymentId}` },
        });
        return NextResponse.json({ received: true });
      }

      // Evita duplo processamento
      if (payment.status === 'CONFIRMED') {
        await prisma.webhookEvent.update({ where: { id: log.id }, data: { processed: true } });
        return NextResponse.json({ received: true });
      }

      // Atualiza pagamento e libera acesso — transação
      await prisma.$transaction([
        prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: 'CONFIRMED',
            confirmedAt: new Date(),
            asaasPaymentId: asaasPaymentId || payment.asaasPaymentId,
          },
        }),
        prisma.studentCourse.upsert({
          where: { userId_courseId: { userId: payment.userId, courseId: payment.courseId } },
          update: { accessStatus: 'ACTIVE' },
          create: { userId: payment.userId, courseId: payment.courseId, accessStatus: 'ACTIVE' },
        }),
      ]);

      await prisma.webhookEvent.update({ where: { id: log.id }, data: { processed: true } });
      console.log(`[Webhook] Acesso liberado: user=${payment.userId}, course=${payment.courseId}`);
    } catch (err: any) {
      console.error('[Webhook] Erro ao processar pagamento:', err);
      await prisma.webhookEvent.update({
        where: { id: log.id },
        data: { error: err.message || 'Erro desconhecido' },
      });
      return NextResponse.json({ error: 'Erro ao processar' }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
