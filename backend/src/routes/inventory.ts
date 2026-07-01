import { Router, Request, Response, NextFunction } from 'express';
import { select, selectOne, insertOne, updateOne } from '../lib/db';
import { authenticate, authorize } from '../middleware/auth';
import { z } from 'zod';

export const inventoryRouter = Router();
inventoryRouter.use(authenticate);

const addItemSchema = z.object({
  clinic_id: z.string().uuid().optional(),
  chw_id: z.string().uuid().optional(),
  medication_name: z.string().min(1),
  category: z.enum(['medication', 'supply', 'equipment', 'vaccine']),
  quantity: z.number().int().min(0),
  unit: z.string().min(1),
  expiry_date: z.string().optional(),
  reorder_level: z.number().int().min(0).default(10),
});

inventoryRouter.post('/items', authorize('doctor', 'chw', 'admin'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = addItemSchema.parse(req.body);
    if (!data.clinic_id && !data.chw_id) return res.status(400).json({ error: 'Must specify clinic_id or chw_id' });
    const item = await insertOne('inventory_items', data);
    res.status(201).json(item);
  } catch (error) { next(error); }
});

inventoryRouter.get('/items', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { clinic_id, chw_id, low_stock } = req.query;
    let items = await select('inventory_items', { order: ['medication_name', true] });
    if (clinic_id) items = items.filter((i: any) => i.clinic_id === clinic_id);
    if (chw_id) items = items.filter((i: any) => i.chw_id === chw_id);
    if (low_stock === 'true') items = items.filter((i: any) => i.quantity <= i.reorder_level);
    res.json(items);
  } catch (error) { next(error); }
});

inventoryRouter.patch('/items/:id', authorize('doctor', 'chw', 'admin'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { quantity } = req.body;
    if (quantity !== undefined && typeof quantity !== 'number') return res.status(400).json({ error: 'Invalid quantity' });
    const item = await updateOne('inventory_items', req.params.id, req.body);
    res.json(item);
  } catch (error) { next(error); }
});

inventoryRouter.post('/items/:id/adjust', authorize('doctor', 'chw', 'admin'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { delta, reason } = req.body;
    if (typeof delta !== 'number') return res.status(400).json({ error: 'Delta must be a number' });
    const item = await selectOne('inventory_items', 'id', req.params.id);
    if (!item) return res.status(404).json({ error: 'Item not found' });
    const newQty = Math.max(0, item.quantity + delta);
    const updated = await updateOne('inventory_items', req.params.id, { quantity: newQty });
    await insertOne('inventory_log', {
      item_id: req.params.id,
      previous_qty: item.quantity,
      new_qty: newQty,
      delta,
      reason: reason || 'manual adjustment',
      adjusted_by: req.user!.userId,
    });
    res.json(updated);
  } catch (error) { next(error); }
});
