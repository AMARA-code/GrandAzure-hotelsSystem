export function formatCurrency(amount: number, currency = 'PKR'): string {
  return `PKR ${amount.toLocaleString('en-PK', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`
}

export function formatDate(date: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date))
}

export function formatDateTime(date: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export function formatNights(nights: number): string {
  return `${nights} ${nights === 1 ? 'night' : 'nights'}`
}

export function formatOccupancy(occupied: number, total: number): string {
  return `${Math.round((occupied / total) * 100)}%`
}

export function getInitials(firstName: string, lastName: string): string {
  return `${firstName[0]}${lastName[0]}`.toUpperCase()
}

export function formatPhone(phone: string): string {
  return phone.replace(/(\+\d{2})(\d{3})(\d{7})/, '$1 $2 $3')
}
export function formatNumber(num: number) {
  if (num === null || num === undefined) return "0";

  return new Intl.NumberFormat("en-US").format(num);
}