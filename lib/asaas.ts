const BASE_URL = process.env.ASAAS_BASE_URL || 'https://sandbox.asaas.com/api/v3';

function getHeaders(): HeadersInit {
  const apiKey = process.env.ASAAS_API_KEY;
  if (!apiKey) throw new Error('ASAAS_API_KEY não configurada nas variáveis de ambiente');
  return {
    'Content-Type': 'application/json',
    'access_token': apiKey,
  };
}

async function asaasRequest<T>(path: string, options: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: getHeaders(),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error(`[Asaas] Erro ${res.status} em ${path}:`, body);
    throw new Error(`Asaas API error: ${res.status} — ${body.slice(0, 200)}`);
  }

  return res.json() as Promise<T>;
}

export interface AsaasCustomer {
  id: string;
  name: string;
  email: string;
}

export interface AsaasPayment {
  id: string;
  customer: string;
  status: string;
  value: number;
  invoiceUrl?: string;
  bankSlipUrl?: string;
  pixQrCodeUrl?: string;
  externalReference: string;
}

export async function findOrCreateCustomer(name: string, email: string): Promise<AsaasCustomer> {
  // Busca cliente existente
  const existing = await asaasRequest<{ data: AsaasCustomer[] }>(
    `/customers?email=${encodeURIComponent(email)}`,
    { method: 'GET' }
  );

  if (existing.data?.length > 0) {
    // Atualiza nome se necessário
    return existing.data[0];
  }

  return asaasRequest<AsaasCustomer>('/customers', {
    method: 'POST',
    body: JSON.stringify({ name, email }),
  });
}

export async function createPayment(input: {
  customerId: string;
  courseTitle: string;
  value: number;
  externalReference: string;
  daysToExpire?: number;
}): Promise<AsaasPayment> {
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + (input.daysToExpire ?? 3));
  const dueDateStr = dueDate.toISOString().slice(0, 10);

  return asaasRequest<AsaasPayment>('/payments', {
    method: 'POST',
    body: JSON.stringify({
      customer: input.customerId,
      billingType: 'UNDEFINED',
      value: input.value,
      dueDate: dueDateStr,
      description: `Curso: ${input.courseTitle}`,
      externalReference: input.externalReference,
    }),
  });
}

export async function createAsaasPayment(input: {
  name: string;
  email: string;
  courseTitle: string;
  value: number;
  externalReference: string;
}): Promise<AsaasPayment> {
  const customer = await findOrCreateCustomer(input.name, input.email);
  return createPayment({
    customerId: customer.id,
    courseTitle: input.courseTitle,
    value: input.value,
    externalReference: input.externalReference,
  });
}
