import { configureStore } from '@reduxjs/toolkit';

import userReducer from './slices/userSlice';
import debtReducer from './slices/debtSlice';
import statisticsReducer from './slices/statisticsSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    debt: debtReducer,
    statistics: statisticsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
