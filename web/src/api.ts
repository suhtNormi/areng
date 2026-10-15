export interface Book {
  id: string;
  title: string;
  author: string;
  read: boolean;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`/api${path}`, {
      ...init,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    throw new Error('Could not reach the server');
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Request failed (${res.status})`);
  }
  return res.status === 204 ? (undefined as T) : res.json();
}

export const listBooks = () => request<Book[]>('/books');

export const addBook = (title: string, author: string) =>
  request<Book>('/books', { method: 'POST', body: JSON.stringify({ title, author }) });

export const setRead = (id: string, read: boolean) =>
  request<Book>(`/books/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify({ read }) });

export const deleteBook = (id: string) =>
  request<void>(`/books/${encodeURIComponent(id)}`, { method: 'DELETE' });
