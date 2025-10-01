import { Router, Request, Response } from 'express';
import { Store } from '../store';
import { Todo } from '../types';
import crypto from 'node:crypto';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Todos
 *   description: Simple in-memory Todo API
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Todo:
 *       type: object
 *       required: [id, title, done]
 *       properties:
 *         id:
 *           type: string
 *           example: "a1b2c3"
 *         title:
 *           type: string
 *           example: "Build something"
 *         done:
 *           type: boolean
 *           example: false
 *   responses:
 *     NotFound:
 *       description: Resource not found
 */

/**
 * @swagger
 * /api/todos:
 *   get:
 *     summary: List all todos
 *     tags: [Todos]
 *     responses:
 *       200:
 *         description: Array of todos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Todo'
 */
router.get('/', (_req: Request, res: Response) => {
  res.json(Store.list());
});

// POST /api/todos → create a new todo (requires { title: string })
/**
 * @swagger
 * /api/todos:
 *   post:
 *     summary: Create a new todo
 *     tags: [Todos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title]
 *             properties:
 *               title:
 *                 type: string
 *     responses:
 *       201:
 *         description: Created todo
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Todo'
 *       400:
 *         description: Invalid input
 */
router.post('/', (req: Request, res: Response) => {
  const title = String(req.body?.title ?? '').trim();
  if (!title) return res.status(400).json({ error: 'title is required' });
  const todo: Todo = { id: crypto.randomUUID(), title, done: false };
  Store.add(todo);
  res.status(201).json(todo);
});

// DELETE /api/todos/:id → delete by id
/**
 * @swagger
 * /api/todos/{id}:
 *   delete:
 *     summary: Delete a todo by id
 *     tags: [Todos]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Todo id
 *     responses:
 *       204:
 *         description: Deleted
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.delete('/:id', (req: Request, res: Response) => {
  const before = Store.list().length;
  Store.remove(req.params.id);
  const after = Store.list().length;
  if (after === before) return res.status(404).json({ error: 'not found' });
  res.status(204).send();
});

export default router;
