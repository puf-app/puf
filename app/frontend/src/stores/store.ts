import { configureStore } from '@reduxjs/toolkit';

import userReducer from './slices/userSlice';
import debtReducer from './slices/debtSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    debt: debtReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
