import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatPrice = (price: number | string) => {
  if (typeof price === 'string' && isNaN(Number(price))) {
    // If it's a string and not a simple number, it likely already has a currency prefix (e.g., "GHS 100.00")
    return price;
  }
  const numericPrice = typeof price === 'string' ? parsePrice(price) : price;
  return `GHS ${numericPrice.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export const parsePrice = (price: string | number | null | undefined): number => {
  if (price === null || price === undefined) return 0;
  if (typeof price === 'number') return price;
  // Remove everything except numbers, decimal point, and minus sign
  const cleaned = price.replace(/[^0-9.-]+/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
};
