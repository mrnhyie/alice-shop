const BASE = '/api';

export async function apiFetch(path, options = {}) {
  const { body, ...rest } = options;
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    ...rest,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `API error ${res.status}`);
  }
  return res.json();
}

export const api = {
  get:    (path)        => apiFetch(path),
  post:   (path, body)  => apiFetch(path, { method: 'POST',   body }),
  put:    (path, body)  => apiFetch(path, { method: 'PUT',    body }),
  patch:  (path, body)  => apiFetch(path, { method: 'PATCH',  body }),
  delete: (path, body)  => apiFetch(path, { method: 'DELETE', body }),
};
