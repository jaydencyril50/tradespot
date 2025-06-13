// Service for managing trash items via API
export type TrashItem = {
  _id: string;
  content: string;
  createdAt: string;
};

const API_URL = '/api/trash';

export async function getTrashItems(): Promise<TrashItem[]> {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error('Failed to fetch trash items');
  return res.json();
}

export async function addTrashItem(content: string): Promise<{ success: boolean; error?: string }> {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content })
  });
  if (res.status === 201) return { success: true };
  const data = await res.json();
  return { success: false, error: data.error || 'Error' };
}

export async function searchTrashItems(query: string): Promise<TrashItem[]> {
  const url = query.trim() ? `${API_URL}/search?q=${encodeURIComponent(query)}` : API_URL;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to search trash items');
  return res.json();
}
