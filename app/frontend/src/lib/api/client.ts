interface IApiResponse<TData> {
  data: TData;
  error: string;
}

const buildUrl = (
  path: string,
  query: Record<string, string | number | undefined> = {}
) => {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === '') return;
    params.set(key, String(value));
  });

  const qs = params.toString();
  return qs ? `${path}?${qs}` : path;
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
    headers: {
      'Content-Type': 'application/json',
    },
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
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const payload = (await response.json()) as IApiResponse<TData>;

  if (!response.ok || payload.error) {
    throw new Error(payload.error || `HTTP ${response.status}`);
  }

  return payload.data;
};
