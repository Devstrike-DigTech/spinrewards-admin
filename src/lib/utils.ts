import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: string | number) {
  return `₦${parseFloat(String(amount)).toLocaleString('en-NG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

/** Format USDT — up to 6dp, trailing zeros trimmed, $ prefix. */
export function formatUsdt(amount: string | number) {
  const n = parseFloat(String(amount))
  if (isNaN(n)) return '$0'
  const trimmed = n.toFixed(6).replace(/\.?0+$/, '')
  const [whole, dec] = trimmed.split('.')
  const withCommas = parseInt(whole, 10).toLocaleString('en-US')
  return `$${dec ? `${withCommas}.${dec}` : withCommas}`
}

/** Currency-aware money formatter — NGN → ₦, USDT → $. */
export function formatMoney(amount: string | number, currency: 'NGN' | 'USDT' | string) {
  return currency === 'USDT' ? formatUsdt(amount) : formatCurrency(amount)
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
