import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { authenticate } from '../middleware/auth';
import { select, selectOne, insertOne } from '../lib/db';
import { devDb } from '../lib/devDb';

export const forumRouter = Router();
forumRouter.use(authenticate);

const createQuestionSchema = z.object({
  title: z.string().min(5).max(300),
  content: z.string().min(10).max(10000),
  tags: z.array(z.string().max(50)).max(10).optional(),
});

const createAnswerSchema = z.object({
  content: z.string().min(1).max(5000),
});

forumRouter.post('/questions', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = createQuestionSchema.parse(req.body);

    const question = await insertOne('forum_questions', {
      user_id: req.user!.userId,
      title: data.title,
      content: data.content,
      tags: data.tags || [],
    });

    res.status(201).json(question);
  } catch (error) { next(error); }
});

forumRouter.get('/questions', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tag, page = '1', limit = '20' } = req.query;
    const pageNum = Math.max(1, parseInt(page as string));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit as string)));

    const questions = await select('forum_questions', { order: ['created_at', false] });
    const filtered = tag ? questions.filter((q: any) => q.tags?.some((t: string) => t.toLowerCase() === (tag as string).toLowerCase())) : questions;

    const total = filtered.length;
    const paginated = filtered.slice((pageNum - 1) * limitNum, pageNum * limitNum);

    const userIds = [...new Set(paginated.map((q: any) => q.user_id))];
    const users = userIds.map((id: string) => devDb.findById('users', id)).filter(Boolean);

    res.json({
      questions: paginated.map((q: any) => ({
        ...q,
        user: users.find((u: any) => u.id === q.user_id) || null,
        answer_count: 0,
      })),
      pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
    });
  } catch (error) { next(error); }
});

forumRouter.get('/questions/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const question = await selectOne('forum_questions', 'id', req.params.id);
    if (!question) return res.status(404).json({ error: 'Question not found' });

    const answers = await select('forum_answers', { eq: ['question_id', req.params.id], order: ['created_at', true] });
    const userIds = [...new Set([question.user_id, ...answers.map((a: any) => a.user_id)])];
    const users = userIds.map((id: string) => devDb.findById('users', id)).filter(Boolean);

    res.json({
      ...question,
      user: users.find((u: any) => u.id === question.user_id) || null,
      answers: answers.map((a: any) => ({
        ...a,
        user: users.find((u: any) => u.id === a.user_id) || null,
      })),
    });
  } catch (error) { next(error); }
});

forumRouter.post('/questions/:id/answers', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = createAnswerSchema.parse(req.body);

    const question = await selectOne('forum_questions', 'id', req.params.id);
    if (!question) return res.status(404).json({ error: 'Question not found' });

    const answer = await insertOne('forum_answers', {
      question_id: req.params.id,
      user_id: req.user!.userId,
      content: data.content,
    });

    res.status(201).json(answer);
  } catch (error) { next(error); }
});
