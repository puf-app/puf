import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface DebtStats {
  totalDebts: number;
  debtsLastWeek: number;
  totalAmount: number;
  graphData: Array<{
    date: string;
    amount: number;
    count: number;
  }>;
}

interface StatisticsState {
  stats: DebtStats;
  loading: boolean;
  error: string | null;
}

const initialState: StatisticsState = {
  stats: {
    totalDebts: 0,
    debtsLastWeek: 0,
    totalAmount: 0,
    graphData: [],
  },
  loading: false,
  error: null,
};

const statisticsSlice = createSlice({
  name: 'statistics',
  initialState,
  reducers: {
    setStats: (state, action: PayloadAction<DebtStats>) => {
      state.stats = action.payload;
      state.loading = false;
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearStats: (state) => {
      state.stats = initialState.stats;
      state.loading = false;
      state.error = null;
    },
  },
});

export const { setStats, setLoading, setError, clearStats } = statisticsSlice.actions;
export default statisticsSlice.reducer;
