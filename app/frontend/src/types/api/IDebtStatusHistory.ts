export interface IDebtStatusHistory {
  _id: string;

  debtId: string;
  changedByUserId: string;

  oldStatus: string;
  newStatus: string;
  note: string;

  createdAt: string;
  updatedAt?: string | false;
}
