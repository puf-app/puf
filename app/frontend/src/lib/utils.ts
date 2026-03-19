import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getHeaderText(pathname: string) {
  switch (pathname) {
    case '/create-debt':
      return 'Create Debt';
    case '/approve-debt':
      return 'Approve Debt';
    case '/check-debt':
      return 'Check Debt';
    case '/debts-all':
      return 'Debts';
    case '/profile':
      return 'Profile';
    case '/settings':
      return 'Settings';
    case '/verification':
      return 'ID verification';
    case '/contacts':
      return 'Contacts';
    default:
      return 'Puf';
  }
}
