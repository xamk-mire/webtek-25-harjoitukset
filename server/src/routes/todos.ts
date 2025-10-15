import { Router, Request, Response } from 'express';
import { Store } from '../store';
import { Todo } from '../types';
import crypto from 'node:crypto';
import { prisma } from '../db';

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
 *     Category:
 *       type: string
 *       enum: [GENERAL, WORK, STUDY, HOME]
 *       example: GENERAL
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
router.get('/', async (req: Request, res: Response) => {
  const items = await prisma.todo.findMany({
    orderBy: { createdAt: 'desc' },
  });

  res.json(items);
});

/**
 * @swagger
 * /api/todos/{id}:
 *   put:
 *     summary: Päivitä olemassa oleva todo
 *     tags: [Todos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Todo-id
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               done:
 *                 type: boolean
 *               category:
 *                 $ref: '#/components/schemas/Category'
 *     responses:
 *       200:
 *         description: Päivitetty Todo
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Todo'
 *       400:
 *         description: Virheellinen pyyntö
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.put('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, done, category } = req.body as {
    title?: string;
    done?: boolean;
    category?: 'GENERAL' | 'WORK' | 'STUDY' | 'HOME';
  };

  try {
    const updated = await prisma.todo.update({
      where: { id },
      data: { title, done, category },
    });
    res.json(updated);
  } catch (e: any) {
    res.status(404).json({ error: 'not found' });
  }
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
router.post('/', async (req: Request, res: Response) => {
  const title = String(req.body?.title ?? '').trim();

  const category = req.body?.category as
    | 'GENERAL'
    | 'WORK'
    | 'STUDY'
    | 'HOME'
    | undefined;

  if (!title) return res.status(400).json({ error: 'title is required' });

  try {
    const created = await prisma.todo.create({
      data: {
        title,
        category, // jos undefined, Prisma käyttää oletusta GENERAL
      },
    });

    res.status(201).json(created);
  } catch (e: any) {
    res.status(400).json({ error: 'invalid payload' });
  }
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
router.delete('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.todo.delete({ where: { id } });
    res.status(204).send();
  } catch {
    res.status(404).json({ error: 'not found' });
  }
});

export default router;
