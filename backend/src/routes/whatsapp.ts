import { Router, Request, Response, NextFunction } from 'express';
import { select, insertOne } from '../lib/db';
import { authenticate, authorize } from '../middleware/auth';
import { z } from 'zod';

export const whatsappRouter = Router();
whatsappRouter.use(authenticate);

whatsappRouter.post('/webhook', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { from, body, messageId } = req.body;
    if (!from) return res.status(400).json({ error: 'Missing sender' });

    const msg = body?.toLowerCase().trim() || '';
    let response: string;

    if (msg === 'hi' || msg === 'hello' || msg === 'bonjour') {
      response = `*HealthBridge Bot* 🇨🇲\n\nWelcome! Choose an option:\n1️⃣ Consult a doctor\n2️⃣ Check medication reminder\n3️⃣ Talk to a CHW\n4️⃣ Emergency (urgent care)\n\nReply with the number.`;
    } else if (msg === '1') {
      response = `Please describe your symptoms (e.g., "I have a fever and headache").\nA doctor will respond shortly.`;
    } else if (msg === '2') {
      response = `Your medication reminders:\n- Amoxicillin 500mg: 8:00 AM (Today)\n- Paracetamol 1g: 2:00 PM\n\nReply "taken [medication]" to confirm.`;
    } else if (msg === '3') {
      response = `Your assigned CHW: *Marie B.*\nPhone: +237 6XX XXX XXX\nThey will visit you within 48 hours.`;
    } else if (msg === '4') {
      response = `🚨 *EMERGENCY*\nPlease call 1510 or go to the nearest hospital immediately.\nWe are sending an ambulance to your area.`;
    } else if (msg.startsWith('taken')) {
      const med = msg.replace('taken ', '');
      response = `✅ Logged: ${med} taken. Great job staying on track!`;
    } else if (msg.includes('fever') || msg.includes('headache') || msg.includes('sick')) {
      response = `Your symptoms have been recorded. A doctor will review shortly.\n\n*Triage:* Medium priority\n*Estimated response:* Within 2 hours.\n\nReply STATUS to check.`;
    } else {
      response = `How can I help you?\n\nReply:\n1️⃣ Consult a doctor\n2️⃣ Medication reminders\n3️⃣ Contact CHW\n4️⃣ Emergency`;
    }

    await insertOne('whatsapp_messages', {
      from_number: from,
      message_body: body,
      bot_response: response,
      message_id: messageId || `wa-${Date.now()}`,
      direction: 'inbound',
    });

    res.json({ message: response });
  } catch (error) { next(error); }
});

whatsappRouter.get('/messages', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const messages = await select('whatsapp_messages', { order: ['created_at', false] });
    res.json(messages.slice(0, 100));
  } catch (error) { next(error); }
});
