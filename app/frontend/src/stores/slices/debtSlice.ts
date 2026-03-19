import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IDebt, IDebtStatus } from '@/types';

// Local interface for debtor selection in the form
// (not from backend, used only for UI state)
export interface IDebtor {
  id: string;
  username: string;
  displayName: string;
  email?: string;
}

interface DebtState {
  title: string;
  username: string;
  isCompany: boolean;
  description: string;
  amount: string;
  currency: string;
  reason: string;
  dueDate: string;
  debtors: IDebtor[];
  createdDebt: IDebt | null;
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
  reason: '',
  dueDate: '',
  debtors: [],
  createdDebt: null,
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

    setCreatedDebt: (state, action: PayloadAction<IDebt>) => {
      state.createdDebt = action.payload;
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
  setCreatedDebt,
  setStatus,
  setError,
  resetForm,
} = debtSlice.actions;

export default debtSlice.reducer;
