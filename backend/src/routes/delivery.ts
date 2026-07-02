import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { authenticate } from '../middleware/auth';
import { insertOne, select, selectOne, updateOne } from '../lib/db';

export const deliveryRouter = Router();
deliveryRouter.use(authenticate);

const createOrderSchema = z.object({
  patient_id: z.string().uuid(),
  medication: z.string().min(1).max(500),
  quantity: z.number().int().positive(),
  address: z.string().min(5).max(500),
  notes: z.string().max(1000).optional(),
});

const updateStatusSchema = z.object({
  status: z.enum(['preparing', 'in_transit', 'delivered', 'cancelled']),
  tracking_notes: z.string().max(1000).optional(),
});

deliveryRouter.post('/orders', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = createOrderSchema.parse(req.body);

    const order = await insertOne('delivery_orders', {
      created_by: req.user!.userId,
      patient_id: data.patient_id,
      medication: data.medication,
      quantity: data.quantity,
      address: data.address,
      notes: data.notes || '',
      status: 'pending',
    });

    res.status(201).json(order);
  } catch (error) { next(error); }
});

deliveryRouter.get('/orders', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.query;

    let orders = await select('delivery_orders', { order: ['created_at', false] });
    if (status) orders = orders.filter((o: any) => o.status === status);

    res.json(orders);
  } catch (error) { next(error); }
});

deliveryRouter.get('/orders/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const order = await selectOne('delivery_orders', 'id', req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (error) { next(error); }
});

deliveryRouter.patch('/orders/:id/status', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = updateStatusSchema.parse(req.body);

    const order = await updateOne('delivery_orders', req.params.id, {
      status: data.status,
      tracking_notes: data.tracking_notes || '',
      ...(data.status === 'delivered' ? { delivered_at: new Date().toISOString() } : {}),
    });

    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (error) { next(error); }
});
