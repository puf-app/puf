import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getHeaderText(pathname: string) {
  // Extract path without locale prefix if it exists
  const path = pathname.replace(/^\/(en|sl)/, '') || '/';
  
  switch (path) {
    case '/create-debt':
      return 'createDebt';
    case '/approve-debt':
      return 'approveDebt';
    case '/check-debt':
      return 'checkDebt';
    case '/debts-all':
      return 'debts';
    case '/profile':
      return 'profile';
    case '/settings':
      return 'settings';
    case '/verification':
      return 'verification';
    case '/contacts':
      return 'contacts';
    default:
      return 'default';
  }
}

export const formatAmount = (amount: any): number => {
  if (typeof amount === 'number') return amount;
  if (amount && amount.$numberDecimal) return parseFloat(amount.$numberDecimal);
  return 0;
};
