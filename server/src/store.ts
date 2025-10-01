import { Todo } from './types';

const todos: Todo[] = [
  { id: '1', title: 'Learn Express + TS', done: true },
  { id: '2', title: 'Hook up React client', done: false },
];

export const Store = {
  list(): Todo[] {
    return todos;
  },
  add(todo: Todo) {
    todos.push(todo);
  },
  remove(id: string) {
    const idx = todos.findIndex((t) => t.id === id);
    if (idx !== -1) todos.splice(idx, 1);
  },
};
