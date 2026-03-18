import { configureStore } from '@reduxjs/toolkit';

import userReducer from './slices/userSlice';
import dolgReducer from './slices/dolgSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    dolg: dolgReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
