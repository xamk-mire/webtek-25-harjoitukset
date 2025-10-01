import { useEffect, useState } from 'react';
import { createTodo, deleteTodo, listTodos } from './api';
import type { Todo } from './types';

export default function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listTodos()
      .then(setTodos)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  async function onAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    try {
      const created = await createTodo(title.trim());
      setTodos((t) => [created, ...t]);
      setTitle('');
    } catch (e: any) {
      setError(e.message);
    }
  }

  async function onDelete(id: string) {
    try {
      await deleteTodo(id);
      setTodos((t) => t.filter((x) => x.id !== id));
    } catch (e: any) {
      setError(e.message);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="p-6 shadow bg-white">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold">
            Todo App (Express + React + TS)
          </h1>
          <p className="text-sm text-gray-600">
            Swagger docs at{' '}
            <a
              className="underline"
              href="http://localhost:4000/docs"
              target="_blank"
            >
              /docs
            </a>
          </p>
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-6">
        <form onSubmit={onAdd} className="flex gap-3 mb-6">
          <input
            className="flex-1 border rounded-xl px-4 py-2 focus:outline-none focus:ring"
            placeholder="Add a todo..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-black text-white"
          >
            Add
          </button>
        </form>

        {loading && <div className="text-gray-600">Loading…</div>}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 border border-red-200">
            {error}
          </div>
        )}

        <ul className="space-y-2">
          {todos.map((t) => (
            <li
              key={t.id}
              className="bg-white border rounded-xl p-4 flex items-center justify-between"
            >
              <div>
                <p className="font-medium">{t.title}</p>
                <p className="text-xs text-gray-500">id: {t.id}</p>
              </div>
              <button
                onClick={() => onDelete(t.id)}
                className="px-3 py-1 rounded-lg border hover:bg-gray-50"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
