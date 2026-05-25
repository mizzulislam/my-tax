export function sanitizePlainText(value: unknown, maxLength = 4000): string {
  return String(value ?? '')
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]*>/g, '')
    .replace(/javascript:/gi, '')
    .replace(/\son\w+=/gi, '')
    .slice(0, maxLength)
    .trim();
}

export function sanitizeMarkdown(value: unknown, maxLength = 16000): string {
  return String(value ?? '')
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/<iframe[\s\S]*?>[\s\S]*?<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/\son\w+=/gi, '')
    .slice(0, maxLength);
}
