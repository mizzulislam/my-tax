export function generateBillingCode(): string {
  const part = (length: number) =>
    Array.from({ length }, () => Math.floor(Math.random() * 10)).join('');

  return `${part(3)}-${part(3)}-${part(4)}-${part(4)}`;
}

export function calculateExpiry(from: Date = new Date()): Date {
  const expiry = new Date(from);
  expiry.setDate(expiry.getDate() + 30);
  return expiry;
}

export function isBillingExpired(expiresAt: string | Date): boolean {
  return new Date(expiresAt).getTime() < Date.now();
}

export function buildBillingVerificationPayload(input: {
  billingCode: string;
  amount: number;
  reportId?: string | null;
}) {
  return JSON.stringify({
    issuer: 'My Tax App',
    type: 'MOCK_E_BILLING',
    billingCode: input.billingCode,
    amount: input.amount,
    reportId: input.reportId || null,
    generatedAt: new Date().toISOString(),
    disclaimer: 'Simulasi kode billing. Bukan kanal resmi DJP.',
  });
}
