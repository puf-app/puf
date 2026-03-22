import { getFromApi, postToApi } from '@/lib/api/client';
import { setUser } from '@/stores/slices/userSlice';
import type { AppDispatch } from '@/stores/store';
import type { IUser } from '@/types';

type LoginResponse = {
  message?: string;
  requires2FA?: boolean;
  user?: { username?: string; admin?: boolean } & Record<string, unknown>;
};

export type LoginCredentials = { username: string; password: string };

/**
 * Calls login API, loads full profile, and stores user in Redux (same flow as Sign in page).
 * @returns whether 2FA is required (caller should not treat as logged in)
 */
export async function loginWithCredentials(
  dispatch: AppDispatch,
  credentials: LoginCredentials
): Promise<{ requires2FA: boolean }> {
  const res = await postToApi<LoginResponse>('/api/auth/loginUser', {
    username: credentials.username,
    password: credentials.password,
  });

  if (res.requires2FA) {
    return { requires2FA: true };
  }

  if (res.user) {
    const profile = await getFromApi<{ user: IUser }>('/api/users/getCurrentUserProfile');
    dispatch(setUser(profile.user));
  }

  return { requires2FA: false };
}
