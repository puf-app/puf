import { API_BASE_URL } from '@/config/constants';

interface IApiResponse<TData> {
  data: TData;
  error: string;
}

const buildUrl = (
  path: string,
  query: Record<string, string | number | undefined>
) => {
  const url = new URL(path, API_BASE_URL);

  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === '') {
      return;
    }

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
    cache: 'no-store',
  });

  const payload = (await response.json()) as IApiResponse<TData>;

  if (!response.ok || payload.error) {
    throw new Error(payload.error || `HTTP ${response.status}`);
  }

  return payload.data;
};
