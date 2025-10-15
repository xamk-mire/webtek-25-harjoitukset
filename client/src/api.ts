import type { Todo } from './types';

const BASE = 'http://localhost:4000';

export async function listTodos(): Promise<Todo[]> {
  const res = await fetch(`${BASE}/api/todos`);
  if (!res.ok) throw new Error('Failed to list todos');
  return res.json();
}

export async function createTodo(title: string): Promise<Todo> {
  const res = await fetch(`${BASE}/api/todos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
  });
  if (!res.ok) throw new Error('Failed to create todo');
  return res.json();
}

export async function updateTodo(
  id: string,
  patch: Partial<Pick<Todo, 'title' | 'done' | 'category'>>
) {
  const res = await fetch(`${BASE}/api/todos/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  });
  if (!res.ok) throw new Error('Failed to update todo');
  return (await res.json()) as Todo;
}

export async function deleteTodo(id: string): Promise<void> {
  const res = await fetch(`${BASE}/api/todos/${id}`, { method: 'DELETE' });
  if (!res.ok && res.status !== 204) throw new Error('Failed to delete todo');
}
