import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

import { errorHandler } from './middleware/errorHandler';
import { authRouter } from './routes/auth';
import { patientsRouter } from './routes/patients';
import { consultationsRouter } from './routes/consultations';
import { doctorsRouter } from './routes/doctors';
import { chwRouter } from './routes/chw';
import { ussdRouter } from './routes/ussd';
import { adminRouter } from './routes/admin';
import { analyticsRouter } from './routes/analytics';
import { notificationsRouter } from './routes/notifications';
import { videoRouter } from './routes/videoConsultation';
import { aiRouter } from './routes/aiTriage';
import { schedulingRouter } from './routes/scheduling';
import { remindersRouter } from './routes/medicationReminders';
import { whatsappRouter } from './routes/whatsapp';
import { inventoryRouter } from './routes/inventory';
import { healthAlertsRouter } from './routes/healthAlerts';
import { insuranceRouter } from './routes/insurance';
import { voiceRouter } from './routes/voice';
import { chwPerformanceRouter } from './routes/chwPerformance';
import { sosRouter } from './routes/sos';
import { forumRouter } from './routes/forum';
import { familyRouter } from './routes/family';
import { labResultsRouter } from './routes/labResults';
import { bloodDonorRouter } from './routes/bloodDonor';
import { deliveryRouter } from './routes/delivery';
import { epidemicRouter } from './routes/epidemic';
import { voiceTriageRouter } from './routes/voiceTriage';
import { initSocketIO } from './services/socket';

dotenv.config();

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 3001;

if (process.env.VERCEL !== '1') {
  initSocketIO(server);
}

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') || '*' }));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), version: '1.0.0' });
});

app.use('/api/auth', authRouter);
app.use('/api/patients', patientsRouter);
app.use('/api/consultations', consultationsRouter);
app.use('/api/doctors', doctorsRouter);
app.use('/api/chw', chwRouter);
app.use('/api/ussd', ussdRouter);
app.use('/api/admin', adminRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/video', videoRouter);
app.use('/api/ai', aiRouter);
app.use('/api/scheduling', schedulingRouter);
app.use('/api/reminders', remindersRouter);
app.use('/api/whatsapp', whatsappRouter);
app.use('/api/inventory', inventoryRouter);
app.use('/api/alerts', healthAlertsRouter);
app.use('/api/insurance', insuranceRouter);
app.use('/api/voice', voiceRouter);
app.use('/api/chw-performance', chwPerformanceRouter);
app.use('/api/sos', sosRouter);
app.use('/api/forum', forumRouter);
app.use('/api/family', familyRouter);
app.use('/api/lab-results', labResultsRouter);
app.use('/api/blood-donors', bloodDonorRouter);
app.use('/api/delivery', deliveryRouter);
app.use('/api/epidemic', epidemicRouter);
app.use('/api/voice-triage', voiceTriageRouter);

app.use(errorHandler);

if (process.env.VERCEL !== '1') {
  server.listen(PORT, () => {
    console.log(`HealthBridge API running on port ${PORT}`);
  });
}

export default app;
