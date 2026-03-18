import type { IDebt, IDebtEvidence, IDebtStatus, IDebtStatusHistory } from '@/types';

export type TDebtSortBy = 'dueDate' | 'amount';
export type TDebtSortOrder = 'asc' | 'desc';
export type TDebtStatusFilter = 'ALL' | IDebtStatus;

export interface IDebtFilters {
  search: string;
  status: TDebtStatusFilter;
  minAmount: string;
  maxAmount: string;
  fromDate: string;
  toDate: string;
  sortBy: TDebtSortBy;
  sortOrder: TDebtSortOrder;
}

export interface IDebtListItem extends IDebt {
  creditorName: string;
  debtorName: string;
  relation: 'mine' | 'othersToMe';
  counterpartyName: string;
  dueInDays: number;
}

export interface IDebtsSummary {
  myDebtsCount: number;
  myDebtsTotal: number;
  othersDebtsCount: number;
  othersDebtsTotal: number;
}

export interface IDebtsListData {
  items: IDebtListItem[];
  summary: IDebtsSummary;
  lastUpdated: string;
}

export interface IDebtDetailsData {
  debt: IDebtListItem;
  evidence: IDebtEvidence[];
  statusHistory: IDebtStatusHistory[];
  lastUpdated: string;
}

export const DEFAULT_DEBT_FILTERS: IDebtFilters = {
  search: '',
  status: 'ALL',
  minAmount: '',
  maxAmount: '',
  fromDate: '',
  toDate: '',
  sortBy: 'dueDate',
  sortOrder: 'asc',
};
