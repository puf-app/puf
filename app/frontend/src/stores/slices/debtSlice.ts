import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IDebt } from '@/types';

interface DebtState {
  debtorUsername: string;
  title: string;
  description: string;
  amount: string;
  currency: string;
  reason: string;
  dueDate: string;
  verificationRequired: boolean;
  createdDebt: IDebt | null;
  debts: IDebt[];
  status: 'idle' | 'submitting' | 'success' | 'error';
  error: string | null;
}

const initialState: DebtState = {
  debtorUsername: '',
  title: '',
  description: '',
  amount: '',
  currency: 'EUR',
  reason: '',
  dueDate: '',
  verificationRequired: false,
  createdDebt: null,
  debts: [],
  status: 'idle',
  error: null,
};

const debtSlice = createSlice({
  name: 'debt',
  initialState,
  reducers: {
    setVerificationRequired: (state, action: PayloadAction<boolean>) => {
      state.verificationRequired = action.payload;
    },

    setCreatedDebt: (state, action: PayloadAction<IDebt>) => {
      state.createdDebt = action.payload;
    },

    setStatus: (state, action: PayloadAction<DebtState['status']>) => {
      state.status = action.payload;
    },
    setDebts: (state, action: PayloadAction<IDebt[]>) => {
      state.debts = action.payload;
    },

    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    resetForm: () => initialState,
  },
});

export const {
  setVerificationRequired,
  setCreatedDebt,
  setStatus,
  setDebts,
  setError,
  resetForm,
} = debtSlice.actions;

export default debtSlice.reducer;
