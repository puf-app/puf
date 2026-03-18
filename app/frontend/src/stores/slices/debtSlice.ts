import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type TDebtType =
  | 'personal'
  | 'business'
  | 'mortgage'
  | 'student'
  | 'credit_card'
  | 'other';

export type TRequestStatus =
  | 'pending'
  | 'confirmed'
  | 'rejected'
  | 'cancelled';

export interface IDebtor {
  id: string;
  username: string;
  displayName: string;
  email?: string;
}

export interface IDebtRequest {
  id: string;
  debtId: string;
  debtorId: string;
  debtorUsername: string;
  status: TRequestStatus;
  sentAt: string;
  respondedAt?: string;
}

interface DebtState {
  title: string;
  username: string;
  isCompany: boolean;
  description: string;
  amount: string;
  currency: string;
  type: TDebtType | '';
  startDate: string;
  endDate: string;
  delayDate: string;
  debtors: IDebtor[];
  requests: IDebtRequest[];
  status: 'idle' | 'submitting' | 'success' | 'error';
  error: string | null;
}

const initialState: DebtState = {
  title: '',
  username: '',
  isCompany: false,
  description: '',
  amount: '',
  currency: 'EUR',
  type: '',
  startDate: '',
  endDate: '',
  delayDate: '',
  debtors: [],
  requests: [],
  status: 'idle',
  error: null,
};

const debtSlice = createSlice({
  name: 'debt',
  initialState,
  reducers: {
    setIsCompany: (state, action: PayloadAction<boolean>) => {
      state.isCompany = action.payload;
    },

    addDebtor: (state, action: PayloadAction<IDebtor>) => {
      const exists = state.debtors.find((d) => d.id === action.payload.id);
      if (!exists) {
        state.debtors.push(action.payload);
      }
    },

    removeDebtor: (state, action: PayloadAction<string>) => {
      state.debtors = state.debtors.filter((d) => d.id !== action.payload);
    },

    setRequests: (state, action: PayloadAction<IDebtRequest[]>) => {
      state.requests = action.payload;
    },

    setStatus: (state, action: PayloadAction<DebtState['status']>) => {
      state.status = action.payload;
    },

    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    resetForm: () => initialState,
  },
});

export const {
  setIsCompany,
  addDebtor,
  removeDebtor,
  setRequests,
  setStatus,
  setError,
  resetForm,
} = debtSlice.actions;

export default debtSlice.reducer;
