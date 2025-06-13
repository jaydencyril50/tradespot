// Service for managing trash items in localStorage
export type TrashItem = {
  id: string;
  content: string;
  createdAt: number;
};

const STORAGE_KEY = 'admin_trash_items';

export function getTrashItems(): TrashItem[] {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

export function addTrashItem(content: string): { success: boolean; error?: string } {
  const items = getTrashItems();
  if (items.some(item => item.content.trim().toLowerCase() === content.trim().toLowerCase())) {
    return { success: false, error: 'Duplicate content not allowed.' };
  }
  const newItem: TrashItem = {
    id: Date.now().toString(),
    content: content.trim(),
    createdAt: Date.now(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify([newItem, ...items]));
  return { success: true };
}

export function searchTrashItems(query: string): TrashItem[] {
  const items = getTrashItems();
  if (!query.trim()) return items;
  return items.filter(item => item.content.toLowerCase().includes(query.trim().toLowerCase()));
}
