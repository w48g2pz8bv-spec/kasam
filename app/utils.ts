export function formatMoney(value: number): string {
  return new Intl.NumberFormat("tr-TR").format(value);
}

export function parseAmount(raw: string): number {
  const normalized = raw.replace(/\./g, "").replace(",", ".");
  const num = Number(normalized);
  return isNaN(num) || num <= 0 ? 0 : num;
}

export function getTodayLocalDate(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getCurrentMonthKey(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

export function isToday(date?: string): boolean {
  if (!date) return false;
  return date === getTodayLocalDate();
}

export function isCurrentMonth(date?: string): boolean {
  if (!date) return false;
  return date.startsWith(getCurrentMonthKey());
}

export function getYesterdayLocalDate(): string {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function isYesterday(date?: string): boolean {
  if (!date) return false;
  return date === getYesterdayLocalDate();
}

export function formatDateTR(date?: string): string {
  if (!date) return "Tarih yok";
  const parts = date.split("-");
  if (parts.length !== 3) return "Tarih yok";
  return `${parts[2]}.${parts[1]}.${parts[0]}`;
}
