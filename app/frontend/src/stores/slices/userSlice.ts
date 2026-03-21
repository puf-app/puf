import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IUser } from '@/types';

interface UserState {
  user: IUser | null;
  isHydrated: boolean;
}

const initialState: UserState = {
  user: null,
  isHydrated: false,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<IUser>) => {
      state.user = action.payload;
      state.isHydrated = true;
    },

    clearUser: (state) => {
      state.user = null;
      state.isHydrated = true;
    },

    setHydrated: (state) => {
      state.isHydrated = true;
    },
  },
});

export const { setUser, clearUser, setHydrated } = userSlice.actions;
export default userSlice.reducer;
