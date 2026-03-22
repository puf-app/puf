export * from '@/types/api/IDebt';
export * from '@/types/api/IDebtEvidence';
export * from '@/types/api/IDebtStatusHistory';

export interface IDebtor {
  _id: string;
  username: string;
  firstName: string;
  lastName: string;
  email?: string;
}
