import { useEffect, useState } from 'react';
import { createTodo, deleteTodo, listTodos, updateTodo } from './api';
import { Category, type Todo } from './types';

const CATEGORIES = Object.values(Category);

export default function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [title, setTitle] = useState('');

  const [category, setCategory] = useState<Category>(Category.GENERAL);

  const [busy, setBusy] = useState(false);

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
    setBusy(true);
    setError(null);
    try {
      const created = await createTodo(title.trim());
      setTodos((t) => [created, ...t]);
      setTitle('');
    } catch (e: any) {
      setError(e.message);
    }
  }

  async function onToggleDone(id: string, next: boolean) {
    setError(null);
    // optimistic update
    setTodos((prev) =>
      prev.map((x) => (x.id === id ? { ...x, done: next } : x))
    );
    try {
      const updated = await updateTodo(id, { done: next });
      setTodos((prev) => prev.map((x) => (x.id === id ? updated : x)));
    } catch (e: any) {
      setError(e.message ?? 'Failed to update todo');
      // revert
      setTodos((prev) =>
        prev.map((x) => (x.id === id ? { ...x, done: !next } : x))
      );
    }
  }

  async function onChangeCategory(id: string, next: Category) {
    setError(null);
    setTodos((prev) =>
      prev.map((x) => (x.id === id ? { ...x, category: next } : x))
    );
    try {
      const updated = await updateTodo(id, { category: next });
      setTodos((prev) => prev.map((x) => (x.id === id ? updated : x)));
    } catch (e: any) {
      setError(e.message ?? 'Failed to update category');
      try {
        const data = await listTodos();
        setTodos(data);
      } catch (e: any) {
        setError(e.message);
      }
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
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold">
            Todo App (React + TS + Tailwind)
          </h1>
          <p className="text-sm text-gray-600">
            Swagger-dokumentaatio:{' '}
            <a
              className="underline"
              href={`${
                import.meta.env.VITE_API_BASE ?? 'http://localhost:4000'
              }/docs`}
              target="_blank"
              rel="noreferrer"
            >
              /docs
            </a>
          </p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Create form */}
        <form
          onSubmit={onAdd}
          className="bg-white border rounded-xl p-4 flex flex-col gap-3"
        >
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <label className="block text-sm mb-1" htmlFor="title">
                Uusi tehtävä
              </label>
              <input
                id="title"
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring"
                placeholder="Kirjoita tehtävä..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm mb-1" htmlFor="category">
                Kategoria
              </label>
              <select
                id="category"
                className="border rounded-lg px-3 py-2"
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              disabled={busy || !title.trim()}
              className="px-4 py-2 rounded-lg bg-black text-white disabled:opacity-50"
            >
              Lisää
            </button>
            {busy && (
              <span className="text-sm text-gray-500">Tallennetaan…</span>
            )}
          </div>
        </form>

        {error && (
          <div
            role="alert"
            className="bg-red-50 text-red-700 border border-red-200 rounded-lg p-3"
          >
            {error}
          </div>
        )}
        {loading && <div className="text-gray-600">Ladataan…</div>}
        {!loading && todos.length === 0 && (
          <div className="text-gray-500">
            Ei tehtäviä. Lisää ensimmäinen yllä!
          </div>
        )}

        {/* List */}
        <ul className="space-y-2">
          {todos.map((t) => (
            <li
              key={t.id}
              className="bg-white border rounded-xl p-4 flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <input
                  id={`done-${t.id}`}
                  type="checkbox"
                  className="h-4 w-4"
                  checked={t.done}
                  onChange={(e) => onToggleDone(t.id, e.target.checked)}
                />
                <div>
                  <label
                    htmlFor={`done-${t.id}`}
                    className={`font-medium ${
                      t.done ? 'line-through text-gray-500' : ''
                    }`}
                  >
                    {t.title}
                  </label>
                  <div className="text-xs text-gray-500">id: {t.id}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs">
                  {t.category}
                </span>

                <select
                  aria-label="Muuta kategoriaa"
                  className="border rounded-lg px-2 py-1 text-sm"
                  value={t.category}
                  onChange={(e) =>
                    onChangeCategory(t.id, e.target.value as Category)
                  }
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => onDelete(t.id)}
                  className="px-3 py-1 rounded-lg border hover:bg-gray-50 text-sm"
                >
                  Poista
                </button>
              </div>
            </li>
          ))}
        </ul>
      </main>

      <footer className="max-w-4xl mx-auto p-6 text-xs text-gray-500">
        API: {import.meta.env.VITE_API_BASE ?? 'http://localhost:4000'}
      </footer>
    </div>
  );
}
