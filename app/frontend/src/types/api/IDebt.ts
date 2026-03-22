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

  creditorUserId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  debtorUserId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };

  title: string;
  description: string;

  amount: {
    $numberDecimal: string;
  };
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
