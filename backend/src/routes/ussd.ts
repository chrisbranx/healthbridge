import { Router, Request, Response, NextFunction } from 'express';
import { select, selectOne, insertOne, updateOne } from '../lib/db';

export const ussdRouter = Router();

const USSD_MENUS: Record<string, Record<string, string>> = {
  en: {
    menu: 'CON HealthBridge Telemedicine\n1. Describe symptoms\n2. My consultation history\n3. First aid guide\n4. Change language to French\n0. Exit',
    symptoms: 'CON Please describe your symptoms (e.g., fever, headache, malaria symptoms):',
    symptoms_confirm: 'CON Your symptoms have been recorded. Choose severity:\n1. Mild\n2. Moderate\n3. Severe\n4. Emergency',
    history: 'END Your consultation history will be sent via SMS.',
    first_aid: 'CON First Aid Topics:\n1. Malaria\n2. Fever\n3. Diarrhea\n4. Wounds\n0. Back',
    first_aid_malaria: 'END HEALTHBRIDGE FIRST AID - Malaria:\n1. Take paracetamol for fever\n2. Drink plenty of water\n3. Go to nearest clinic for blood test\n4. Sleep under insecticide-treated net\nFor emergency: call 1510',
    first_aid_fever: 'END HEALTHBRIDGE FIRST AID - Fever:\n1. Rest and hydrate\n2. Take paracetamol if available\n3. Monitor temperature\n4. If fever persists >3 days, visit clinic\nFor emergency: call 1510',
    first_aid_diarrhea: 'END HEALTHBRIDGE FIRST AID - Diarrhea:\n1. Drink ORS solution\n2. Continue feeding (breastfeeding for infants)\n3. Seek clinic if blood in stool\n4. Monitor for dehydration signs\nFor emergency: call 1510',
    first_aid_wounds: 'END HEALTHBRIDGE FIRST AID - Wounds:\n1. Clean with clean water\n2. Apply antiseptic if available\n3. Cover with sterile bandage\n4. Seek clinic for deep wounds\nFor emergency: call 1510',
    consulting: 'END Thank you for using HealthBridge. A doctor will review your case within 24 hours. You will receive a response via SMS. Stay safe!',
    error: 'END Invalid input. Please try again.',
    goodbye: 'END Thank you for using HealthBridge. Stay healthy!',
  },
  fr: {
    menu: 'CON HealthBridge Telemedecine\n1. Decrire les symptomes\n2. Mes consultations\n3. Guide de premiers soins\n4. Passer en anglais\n0. Quitter',
    symptoms: 'CON Veuillez decrire vos symptomes (ex: fievre, maux de tete, paludisme):',
    symptoms_confirm: 'CON Vos symptomes ont ete enregistres. Choisissez la severite:\n1. Legere\n2. Moderee\n3. Severe\n4. Urgence',
    history: 'END Votre historique de consultations sera envoye par SMS.',
    first_aid: 'CON Premiers Soins:\n1. Paludisme\n2. Fievre\n3. Diarrhee\n4. Blessures\n0. Retour',
    first_aid_malaria: 'END HEALTHBRIDGE PREMIERS SOINS - Paludisme:\n1. Prenez du paracetamol contre la fievre\n2. Buvez beaucoup d eau\n3. Allez au centre de sante pour un test sanguin\n4. Dormez sous moustiquaire impregnee\nUrgence: appelez 1510',
    first_aid_fever: 'END HEALTHBRIDGE PREMIERS SOINS - Fievre:\n1. Reposez-vous et hydratez-vous\n2. Prenez du paracetamol si disponible\n3. Surveillez la temperature\n4. Si la fievre persiste >3 jours, consultez\nUrgence: appelez 1510',
    first_aid_diarrhea: 'END HEALTHBRIDGE PREMIERS SOINS - Diarrhee:\n1. Buvez une solution SRO\n2. Continuez a vous alimenter\n3. Consultez si sang dans les selles\n4. Surveillez les signes de deshydratation\nUrgence: appelez 1510',
    first_aid_wounds: 'END HEALTHBRIDGE PREMIERS SOINS - Blessures:\n1. Nettoyez avec de l eau propre\n2. Appliquez un antiseptique si disponible\n3. Couvrez avec un pansement sterile\n4. Consultez pour les blessures profondes\nUrgence: appelez 1510',
    consulting: 'END Merci d utiliser HealthBridge. Un medecin examinera votre cas dans les 24 heures. Vous recevrez une reponse par SMS. Restez en bonne sante!',
    error: 'END Entree invalide. Veuillez reessayer.',
    goodbye: 'END Merci d utiliser HealthBridge. Restez en bonne sante!',
  },
};

const TRIAGE_MAP: Record<string, string> = {
  '1': 'low',
  '2': 'medium',
  '3': 'high',
  '4': 'critical',
};

ussdRouter.post('/handle', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { sessionId, phoneNumber, text } = req.body;

    if (!sessionId || !phoneNumber) {
      return res.json({ response: 'END Invalid request' });
    }

    const input = text?.trim() || '';
    const steps = input ? input.split('*') : [];
    const currentInput = steps[steps.length - 1] || '';

    const sessions = await select('ussd_sessions', { eq: ['session_id', sessionId] });
    let session = sessions[0] || null;

    if (!session) {
      const users = await select('users', { eq: ['phone', phoneNumber] });
      const userPref = users[0] || null;
      const lang = userPref?.language || 'en';

      session = await insertOne('ussd_sessions', {
        session_id: sessionId,
        phone_number: phoneNumber,
        language: lang,
        current_step: 'menu',
      });

      if (currentInput === '' || currentInput === '0') {
        return res.json({ response: USSD_MENUS[lang].menu });
      }
    }

    const lang = session.language || 'en';
    const menus = USSD_MENUS[lang];

    if (currentInput === '0') {
      await updateOne('ussd_sessions', session.id, { is_completed: true, current_step: 'goodbye' });

      await insertOne('analytics_events', {
        event_type: 'ussd_session_completed',
        entity_type: 'ussd_session',
        entity_id: session.id,
        metadata: { phone: phoneNumber },
      });

      return res.json({ response: menus.goodbye });
    }

    if (session.current_step === 'menu') {
      switch (currentInput) {
        case '1':
          await updateOne('ussd_sessions', session.id, { current_step: 'symptoms' });
          return res.json({ response: menus.symptoms });

        case '2': {
          const consultations = await select('consultations', { eq: ['patient_id', session.patient_id], order: ['created_at', false] });
          if (consultations?.length) {
            let historyMsg = `END Your last ${Math.min(consultations.length, 5)} consultations:\n`;
            consultations.slice(0, 5).forEach((c: any, i: number) => {
              historyMsg += `${i + 1}. ${new Date(c.created_at).toLocaleDateString()} - ${c.status}\n`;
              if (c.diagnosis) historyMsg += `   Diagnosis: ${c.diagnosis}\n`;
            });
            return res.json({ response: historyMsg });
          }
          return res.json({ response: 'END No consultation history found.' });
        }

        case '3':
          await updateOne('ussd_sessions', session.id, { current_step: 'first_aid' });
          return res.json({ response: menus.first_aid });

        case '4': {
          const newLang = lang === 'en' ? 'fr' : 'en';
          await updateOne('ussd_sessions', session.id, { language: newLang, current_step: 'menu' });
          return res.json({ response: USSD_MENUS[newLang].menu });
        }

        default:
          return res.json({ response: menus.error });
      }
    }

    if (session.current_step === 'symptoms') {
      const symptoms = currentInput;

      const patients = await select('patients', { eq: ['phone', phoneNumber] });
      let patient = patients[0] || null;

      if (!patient) {
        patient = await insertOne('patients', {
          name: `Patient ${phoneNumber.slice(-4)}`,
          phone: phoneNumber,
        });
      }

      await updateOne('ussd_sessions', session.id, {
        symptoms,
        patient_id: patient.id,
        current_step: 'symptoms_confirm',
      });

      return res.json({ response: menus.symptoms_confirm });
    }

    if (session.current_step === 'symptoms_confirm') {
      const triageLevel = TRIAGE_MAP[currentInput] || 'low';
      const symptoms = session.symptoms || 'No symptoms described';

      const consultation = await insertOne('consultations', {
        patient_id: session.patient_id,
        symptoms,
        channel: 'ussd',
        triage_level: triageLevel,
        status: 'pending',
      });

      await updateOne('ussd_sessions', session.id, {
        current_step: 'consulting',
        consultation_id: consultation.id,
        is_completed: true,
      });

      await insertOne('sms_log', {
        phone_number: phoneNumber,
        message: `HealthBridge: Your consultation request has been received (ID: ${consultation.id.slice(0, 8)}). A doctor will respond within 24 hours.`,
        message_type: 'consultation_ack',
        related_entity_type: 'consultation',
        related_entity_id: consultation.id,
      });

      await insertOne('analytics_events', {
        event_type: 'ussd_consultation_created',
        entity_type: 'consultation',
        entity_id: consultation.id,
        metadata: { phone: phoneNumber, triage: triageLevel, symptoms },
      });

      return res.json({ response: menus.consulting });
    }

    if (session.current_step === 'first_aid') {
      const firstAidMap: Record<string, string> = {
        '1': 'first_aid_malaria',
        '2': 'first_aid_fever',
        '3': 'first_aid_diarrhea',
        '4': 'first_aid_wounds',
      };

      const topic = firstAidMap[currentInput];
      if (topic && menus[topic]) {
        await updateOne('ussd_sessions', session.id, { is_completed: true });
        return res.json({ response: menus[topic] });
      }

      if (currentInput === '0') {
        await updateOne('ussd_sessions', session.id, { current_step: 'menu' });
        return res.json({ response: menus.menu });
      }

      return res.json({ response: menus.error });
    }

    return res.json({ response: menus.error });
  } catch (error) {
    next(error);
  }
});

ussdRouter.post('/callback', async (req: Request, res: Response) => {
  const { phoneNumber, text, sessionId } = req.body;
  console.log('USSD Callback:', { phoneNumber, text, sessionId });
  res.json({ response: 'END Thank you' });
});
