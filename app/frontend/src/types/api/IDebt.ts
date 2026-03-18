export type TDebtStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'PARTIALLY_PAID'
  | 'PAID'
  | 'CANCELLED'
  | 'DISPUTED';

export interface IDebt {
  _id: string;

  creditorUserId: string;
  debtorUserId: string;

  title: string;
  description: string;

  amount: number;
  currency: string;
  reason: string;
  status: TDebtStatus;

  dueDate: string;
  acceptedAt?: string;
  rejectedAt?: string;
  paidAt?: string;

  verificationRequired: boolean;
  verificationThresholdSnapshot: number;

  createdAt: string;
  updatedAt?: string | false;
}
