import { API_BASE_URL } from '@/config/constants';

interface IApiResponse<TData> {
  data: TData;
  error: string;
}

const buildUrl = (
  path: string,
  query: Record<string, string | number | undefined> = {}
) => {
  const url = new URL(path, API_BASE_URL);

  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === '') return;
    url.searchParams.set(key, String(value));
  });

  return url.toString();
};

export const getFromApi = async <TData>(
  path: string,
  query: Record<string, string | number | undefined> = {}
) => {
  const response = await fetch(buildUrl(path, query), {
    method: 'GET',
    credentials: 'include',
    cache: 'no-store',
  });

  const payload = (await response.json()) as IApiResponse<TData>;

  if (!response.ok || payload.error) {
    throw new Error(payload.error || `HTTP ${response.status}`);
  }

  return payload.data;
};

export const patchToApi = async <TData>(
  path: string,
  body: Record<string, unknown>
) => {
  const response = await fetch(buildUrl(path), {
    method: 'PATCH',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const payload = (await response.json()) as IApiResponse<TData>;

  if (!response.ok || payload.error) {
    throw new Error(payload.error || `HTTP ${response.status}`);
  }

  return payload.data;
};

export const postToApi = async <TData>(
  path: string,
  body: Record<string, unknown>
) => {
  const response = await fetch(buildUrl(path), {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const payload = (await response.json()) as IApiResponse<TData>;

  if (!response.ok || payload.error) {
    throw new Error(payload.error || `HTTP ${response.status}`);
  }

  return payload.data;
};

/** Multipart upload (e.g. verification documents). Do not set Content-Type — browser sets boundary. */
export const postFormDataToApi = async <TData>(path: string, formData: FormData) => {
  const response = await fetch(buildUrl(path), {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });

  const text = await response.text();
  let payload: IApiResponse<TData> | null = null;
  if (text) {
    try {
      payload = JSON.parse(text) as IApiResponse<TData>;
    } catch {
      throw new Error(`HTTP ${response.status}: invalid JSON`);
    }
  }

  if (!response.ok) {
    throw new Error(payload?.error || `HTTP ${response.status}`);
  }
  if (payload?.error) {
    throw new Error(payload.error);
  }

  return payload?.data as TData;
};

/** Pulls Mongo id from various `{ data: ... }` shapes returned by the API. */
export const extractIdFromApiData = (data: unknown): string | null => {
  if (data == null) return null;
  if (typeof data === 'string') return data;
  if (typeof data !== 'object') return null;
  const o = data as Record<string, unknown>;
  if (typeof o._id === 'string') return o._id;
  if (typeof o.id === 'string') return o.id;
  if (typeof o.verificationId === 'string') return o.verificationId;
  const nested = o.verification;
  if (nested && typeof nested === 'object') {
    const v = nested as Record<string, unknown>;
    if (typeof v._id === 'string') return v._id;
    if (typeof v.id === 'string') return v.id;
  }
  return null;
};
