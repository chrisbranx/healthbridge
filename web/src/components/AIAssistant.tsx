import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import {
  HiOutlineChat, HiOutlineX, HiOutlinePaperAirplane,
  HiOutlineHeart, HiOutlineShieldCheck, HiOutlinePhone,
  HiOutlineClock, HiOutlineBookOpen, HiOutlineExclamationCircle,
  HiOutlineChevronRight, HiOutlineUser, HiOutlineArrowRight,
  HiOutlineInformationCircle
} from 'react-icons/hi';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const quickActions = [
  { label: 'Headache', icon: '🤕', key: 'headache' },
  { label: 'Fever', icon: '🌡️', key: 'fever' },
  { label: 'Malaria', icon: '🦟', key: 'malaria' },
  { label: 'Cough', icon: '🤧', key: 'cough' },
  { label: 'Diarrhea', icon: '💧', key: 'diarrhea' },
  { label: 'Pregnancy', icon: '🤰', key: 'pregnancy' },
  { label: 'First Aid', icon: '🩹', key: 'first_aid' },
];

const medicalResponses: Record<string, string> = {
  headache: `**Medical Assessment — Headache**
  
**Common Causes:** Tension, dehydration, sinusitis, migraine, eye strain, or lack of sleep.

**Self-Care Measures:**
- Rest in a quiet, dark environment
- Hydrate with water throughout the day
- Apply a cold or warm compress to the forehead
- Consider paracetamol/acetaminophen if available
- Gentle neck and shoulder stretches may help

**When to See a Doctor:**
- Sudden, severe ("thunderclap") headache
- Accompanied by stiff neck, high fever, or rash
- Following a head injury
- With vision changes, slurred speech, or confusion
- Persistent beyond 48 hours

> **Recommendation:** Start a consultation with a doctor for personalized evaluation. Tap "Consult Now" below.`,

  fever: `**Medical Assessment — Fever**
  
Fever is the body's natural immune response to infection.

**Self-Care Measures:**
- Rest and increase fluid intake (water, ORS)
- Remove excess clothing for heat dissipation
- Take paracetamol/acetaminophen if temperature exceeds 38.5°C
- Tepid sponging (lukewarm water, not cold)

**Warning Signs — Seek Immediate Care:**
- Infant under 3 months with any fever
- Temperature exceeding 40°C (104°F)
- Fever persisting beyond 72 hours
- Accompanied by difficulty breathing, rash, confusion
- Signs of dehydration (dry mouth, no urination over 8 hours)
- Recent travel to a malaria-endemic area

> **Recommendation:** If fever persists or worsens, consult a doctor immediately.`,

  malaria: `**Medical Assessment — Malaria**
  
Malaria is a serious but treatable disease transmitted by mosquito bites. Common in Cameroon.

**Key Symptoms:**
- Fever and chills
- Severe headache
- Muscle and joint pain
- Fatigue and nausea
- Sweating

**Recommended Action Plan:**
1. **Get tested immediately** — Rapid Diagnostic Test (RDT) at your nearest clinic or CHW
2. **If positive,** begin ACT (Artemisinin-based Combination Therapy) as prescribed
3. Complete the full 3-day treatment course even if symptoms improve
4. Take paracetamol for fever management

**⚠️ Severe Malaria — Emergency Signs:**
- Confusion or loss of consciousness
- Difficulty breathing
- Dark/cola-colored urine
- Yellowing of eyes or skin (jaundice)
- Inability to eat/drink or repeated vomiting
- Convulsions

**Prevention:** Sleep under insecticide-treated mosquito nets. Eliminate standing water.

> **Recommendation:** Start a consultation to get a malaria assessment and treatment plan.`,

  cough: `**Medical Assessment — Cough**

**Common Causes:** Upper respiratory infection, bronchitis, asthma, allergies, or post-nasal drip.

**Self-Care Measures:**
- Rest and drink warm fluids (herbal tea with honey)
- Steam inhalation to soothe airways (caution with hot water)
- Honey for cough relief (not for children under 1 year)
- Elevate head while sleeping
- Avoid smoke, dust, and respiratory irritants

**When to Consult a Doctor:**
- Cough persisting more than 3 weeks
- Coughing up blood
- Accompanied by chest pain or dyspnea
- High fever (above 39°C)
- Unexplained weight loss or night sweats (possible TB)
- Child showing rapid or labored breathing

> **Recommendation:** Book a consultation for persistent cough to rule out TB, bronchitis, or other conditions.`,

  diarrhea: `**Medical Assessment — Diarrhea**

Diarrhea can lead to dangerous dehydration, particularly in children and older adults.

**Immediate Self-Care:**
- **ORS (Oral Rehydration Solution):** Mix 6 teaspoons sugar + ½ teaspoon salt in 1 liter of clean water. Sip frequently.
- Continue breastfeeding for infants
- Small, easy-to-digest meals (rice, bananas, plain porridge)
- Avoid sugary drinks, fatty foods, and dairy temporarily

**⚠️ Danger Signs — Seek Medical Help:**
- Sunken eyes or dry mouth/tongue
- Skin pinch returns slowly (reduced skin turgor)
- No urine output for 6+ hours
- Lethargy or confusion
- Blood in stool
- Fever above 38.5°C
- Severe abdominal pain

**Prevention:** Hand washing with soap. Drink only clean/boiled water. Use proper sanitation facilities.

> **Recommendation:** Severe or persistent diarrhea requires medical evaluation. Start a consultation.`,

  pregnancy: `**Medical Information — Pregnancy & Antenatal Care**

Regular antenatal care is essential for a healthy pregnancy and safe delivery.

**Recommended Care Schedule:**
- Attend at least 4 antenatal (ANC) visits during pregnancy
- Take daily iron and folic acid supplements
- Sleep under an insecticide-treated mosquito net
- Maintain a balanced diet with fruits, vegetables, and protein

**⚠️ Obstetric Danger Signs — Go to Clinic Immediately:**
- Vaginal bleeding during pregnancy
- Severe headache or blurred vision
- Swelling of face, hands, or feet (possible pre-eclampsia)
- Convulsions or seizures
- High fever
- Severe abdominal pain
- Reduced fetal movements
- Leaking of fluid before 37 weeks

**Vaccinations in Pregnancy:**
- Tetanus toxoid (TT) — 2 doses recommended
- Hepatitis B screening

> **Recommendation:** Register for antenatal care through HealthBridge. A CHW or midwife can provide home visits.`,

  emergency: `**🚨 EMERGENCY MEDICAL PROTOCOL**

**If someone is unconscious, not breathing, or severely bleeding:**
1. **Call emergency services:** 1510 (Cameroon)
2. **Dial *800#** for emergency medical guidance
3. **Proceed to the nearest hospital immediately**

**Emergency Signs Requiring Immediate Action:**
- Unconsciousness or fainting
- Difficulty breathing or choking
- Severe bleeding not controlled by pressure
- Chest pain or chest pressure
- Sudden severe headache ("thunderclap")
- Poisoning or suspected overdose
- Severe allergic reaction (facial swelling, breathing difficulty)
- Major burn, fracture, or traumatic injury
- Seizures lasting more than 5 minutes

**While Awaiting Help:**
- Keep the person lying down and calm
- Do not give food or drink if consciousness is impaired
- Apply firm pressure to bleeding wounds
- Maintain body warmth
- Do not move a person with suspected neck/spine injury

> ⚠️ **This is emergency guidance only. Activate emergency services now.**`,

  clinic: `**Finding a Health Facility**

HealthBridge helps connect you with nearby clinics and healthcare facilities.

**Available Options:**
- *800# USSD — Menu option for "Nearby Clinic"
- Use the web app to search clinics by region
- Your assigned CHW can direct you to the nearest health center

**Types of Facilities:**
- **Health Post:** Basic care, vaccinations, first aid
- **Health Center:** Consultations, maternity, laboratory
- **District Hospital:** Surgery, emergency care, inpatient
- **Referral Hospital:** Specialist care, advanced treatment

> **Recommendation:** Register your location in Profile to receive personalized clinic recommendations.`,

  hiv: `**Medical Information — HIV/AIDS**

HIV is a manageable chronic condition. With proper antiretroviral therapy (ART), people with HIV lead long, healthy lives.

**Testing Services:**
- Free, confidential HIV testing at all public health centers
- Rapid test results in 15–20 minutes
- Early detection significantly improves outcomes

**Treatment:**
- ART is provided free of charge in Cameroon
- Daily medication at the same time maintains viral suppression
- **Undetectable = Untransmittable (U=U)**

**Prevention:**
- Consistent and correct condom use
- PrEP (Pre-exposure prophylaxis) available at clinics
- Avoid sharing needles
- Prevention of mother-to-child transmission with ART

> **Recommendation:** Schedule confidential testing or ART refill reminders through HealthBridge.`,

  tb: `**Medical Information — Tuberculosis (TB)**

TB is curable. Treatment is free in Cameroon.

**Common Symptoms:**
- Cough persisting more than 2–3 weeks
- Chest pain
- Coughing up blood or phlegm
- Night sweats, fever, and fatigue
- Unexplained weight loss

**Action Plan:**
1. Visit the nearest clinic for free sputum testing
2. If positive, begin directly observed treatment (DOT)
3. Treatment duration: 6 months — complete the full course
4. TB medication is provided free of charge

> **Recommendation:** If you have a persistent cough, start a consultation for TB screening.`,

  first_aid: `**First Aid Reference**

**Cuts and Wounds:**
1. Apply firm pressure with a clean cloth to stop bleeding
2. Clean gently with clean water
3. Apply antiseptic around the wound
4. Cover with sterile bandage; change daily

**Burns:**
1. Cool under running water for 10–15 minutes
2. Do NOT apply butter, oil, or toothpaste
3. Cover with a clean, non-stick dressing
4. Do not pop blisters
5. Seek medical attention for large or deep burns

**Fractures:**
1. Do NOT move the person if spinal injury is suspected
2. Immobilize the limb with a splint
3. Apply ice wrapped in cloth to reduce swelling
4. Transport to the nearest health facility

**Snake Bite:**
1. Keep the victim calm and still
2. Remove jewelry or tight clothing near the bite
3. Do NOT cut the wound or attempt to suck venom
4. Apply a firm bandage above the bite (not constrictive)
5. Transport to hospital immediately
6. Note the snake's appearance if possible

> **Recommendation:** For serious injuries, seek emergency care immediately.`,

  nutrition: `**Medical Information — Nutrition & Diet**

**For Children Under 5:**
- Exclusive breastfeeding for the first 6 months
- Introduce soft, nutritious foods from 6 months (mashed vegetables, porridge, eggs)
- Continue breastfeeding until 2 years
- Vitamin A supplementation every 6 months at your health center
- Monthly growth monitoring at weighing sessions

**For Pregnant and Breastfeeding Women:**
- 4–5 smaller meals per day
- Include protein sources (eggs, beans, fish, lean meat)
- Fruits and vegetables for essential vitamins
- Iron and folic acid supplements as prescribed
- Clean drinking water throughout the day

**For All Adults:**
- Varied diet: vegetables, fruits, whole grains, lean protein
- Limit salt, sugar, and saturated fats
- Drink clean, boiled or treated water
- Hand washing before meals and food preparation

> **Recommendation:** Nutrition counseling is available through your CHW or health center.`,

  vaccination: `**Medical Information — Vaccination Schedule (Cameroon)**

**Childhood Immunizations:**
- **Birth:** BCG (TB), Polio 0, Hepatitis B
- **6 Weeks:** DTP-HepB-Hib 1, Polio 1, PCV 1, Rota 1
- **10 Weeks:** DTP-HepB-Hib 2, Polio 2, PCV 2, Rota 2
- **14 Weeks:** DTP-HepB-Hib 3, Polio 3, PCV 3, IPV
- **9 Months:** Measles-Rubella 1, Yellow Fever
- **15–18 Months:** Measles-Rubella 2, DTP Booster

**Adult Vaccinations:**
- Tetanus booster every 10 years
- COVID-19 primary series and boosters
- HPV vaccine for girls aged 9–14 (prevents cervical cancer)
- Yellow fever (required for travel)

> **Recommendation:** Track your child's immunization schedule through HealthBridge. Set vaccination reminders.`,

  hypertension: `**Medical Information — Hypertension (High Blood Pressure)**

Hypertension is defined as blood pressure consistently above 140/90 mmHg. Often called "the silent killer" due to absence of symptoms.

**Risk Factors:**
- Family history of hypertension
- Overweight or obesity
- High dietary salt intake
- Sedentary lifestyle
- Smoking and excessive alcohol consumption
- Age over 40

**Management:**
1. Monitor blood pressure regularly at your health center or with a CHW
2. Reduce salt intake in cooking and avoid processed foods
3. Increase consumption of fruits and vegetables
4. Engage in 30 minutes of moderate exercise daily (walking)
5. Take prescribed antihypertensive medication consistently
6. Limit alcohol and discontinue smoking

**⚠️ Emergency Signs:** Severe headache, blurred vision, chest pain, shortness of breath — seek immediate hospital care.

> **Recommendation:** Regular BP monitoring and medication adherence are essential. Your CHW can provide weekly check-ins.`,

  diabetes: `**Medical Information — Diabetes**

**Common Symptoms:**
- Frequent urination (polyuria)
- Excessive thirst (polydipsia)
- Unexplained weight loss
- Fatigue and weakness
- Slow-healing wounds
- Blurred vision

**Management Plan:**
1. Get tested (blood glucose test) at your nearest clinic
2. If diagnosed, take medication as prescribed (metformin or insulin)
3. Monitor blood glucose levels regularly
4. Follow a balanced, low-sugar diet with increased fiber
5. Daily physical activity (walking 30 minutes)
6. Daily foot inspection for wounds or sores
7. Regular clinic follow-up appointments

**⚠️ Danger Signs:**
- **Hyperglycemia:** extreme thirst, frequent urination, confusion
- **Hypoglycemia:** shaking, sweating, dizziness, loss of consciousness

> **Recommendation:** Diabetes management requires consistent monitoring. Schedule regular consultations through HealthBridge.`,

  mental_health: `**Medical Information — Mental Health Support**

Mental health is as important as physical health. You are not alone.

**Common Signs Requiring Support:**
- Persistent sadness, hopelessness, or emptiness
- Excessive worry or fear that interferes with daily life
- Significant changes in sleep or appetite
- Loss of interest in previously enjoyed activities
- Difficulty concentrating or making decisions
- Thoughts of self-harm or suicide

**What You Can Do:**
- Speak with a trusted family member, friend, or CHW
- Visit your health center for counseling services
- Practice deep breathing and relaxation techniques
- Maintain a daily routine with adequate rest
- Avoid alcohol and recreational drugs

**📞 Helplines:**
- Mental Health Support: 1510 (Cameroon)
- Dial *800# for emotional support and guidance

> ⚠️ If you are having thoughts of self-harm, please reach out for help immediately. Call **1510** or go to the nearest hospital. You matter.

> **Recommendation:** Confidential mental health consultations are available through HealthBridge.`,

  cholera: `**Medical Information — Cholera**

Cholera is an acute diarrheal disease caused by ingestion of contaminated food or water.

**Symptoms:** Acute watery diarrhea ("rice water" stools), vomiting, and rapid dehydration.

**Immediate Action:**
1. Begin ORS immediately (6 teaspoons sugar + ½ teaspoon salt in 1 liter clean water)
2. Proceed to the nearest health center for treatment
3. Treatment is free — oral rehydration salts and antibiotics

**Prevention:**
- Drink only boiled or treated water
- Wash hands with soap after defecation and before eating
- Use latrines for defecation
- Cholera vaccine is available
- Report suspected cases to your CHW immediately

> ⚠️ Cholera is a notifiable disease. Please report suspected cases through HealthBridge or dial *800#.`,

  covid: `**Medical Information — COVID-19**

**Common Symptoms:**
- Fever, cough, difficulty breathing
- Loss of taste or smell
- Fatigue and body aches
- Sore throat and headache

**If Symptoms Are Mild:**
- Rest at home and self-isolate
- Wear a mask when around others
- Wash hands frequently with soap and water
- Monitor symptoms for worsening

**When to Seek Medical Care:**
- Difficulty breathing or chest pain
- High fever persisting beyond 3 days
- Confusion or difficulty waking

**Prevention:**
- Vaccination is available and free at health centers
- Wear masks in crowded indoor spaces
- Maintain physical distance from symptomatic individuals
- Hand hygiene with soap or alcohol-based sanitizer

> **Recommendation:** Schedule a consultation through HealthBridge if you have COVID symptoms or need vaccination information.`,

  chw: `**Medical Information — Community Health Workers (CHWs)**

HealthBridge CHWs are trained health professionals serving your community.

**CHW Services Include:**
- Patient registration and community health mapping
- Home visits for follow-up and adherence monitoring
- Health education and promotion
- Distribution of mosquito nets, ORS, and basic medications
- Rapid diagnostic testing (malaria, HIV)
- Emergency escalation to doctors and clinics
- Vaccination tracking and appointment reminders
- Support for pregnant women and new mothers

**How to Reach a CHW:**
- Dial *800# and select "Request CHW Visit"
- Use the app to request a home visit
- Your assigned CHW will contact you directly

> **Recommendation:** CHWs are your first point of contact for community-based care. Reach out through *800# or the app.`,

  app_help: `**HealthBridge Platform Guide**

**Registration**
- Create an account using your phone number
- Select your role: Patient, Doctor, or CHW
- Alternatively, dial *800# from any phone (no smartphone required)

**Patient Features**
- **Dashboard:** Health summary, recent consultations, quick actions
- **Consultation:** Describe symptoms, select severity, submit to a doctor
- **Medical History:** View past consultations, diagnoses, prescriptions
- **Profile:** Update personal and medical information
- **Settings:** Language, dark mode, notification preferences

**Doctor Features**
- Review and respond to patient consultations
- Manage your patient panel
- Provide diagnoses, prescriptions, and follow-up instructions

**CHW Features**
- Patient registration and community management
- Task management with status tracking
- Adherence monitoring and escalation alerts

**Need more help?** Visit Help & Support from the sidebar menu, or dial *800#.`,

  default: `**Welcome to HealthBridge AI — Your Medical Assistant**

I provide general health information and guidance. Here's how I can assist you:

**Medical Topics I Cover:**
- Symptom assessment and self-care guidance
- Common conditions: malaria, fever, headache, cough, diarrhea
- Chronic disease information: hypertension, diabetes, HIV, TB
- Women's health: pregnancy, antenatal care, nutrition
- First aid reference and emergency guidance
- Prevention: vaccinations, nutrition, hygiene

**Platform Assistance:**
- How to use the app
- Consultation process
- Finding clinics and CHW services
- USSD (*800#) guide

**To get started:** Ask me a question about your health, select a quick action below, or describe how you're feeling. For urgent medical needs, please contact emergency services directly.

> ⚠️ I provide general health information only. For emergencies, call **1510** or dial ***800#**.`,
};

function getAIResponse(input: string, lang: string): string {
  const q = input.toLowerCase().trim();

  const keywordMap: { keywords: string[]; key: string }[] = [
    { keywords: ['headache', 'migraine', 'head pain', 'head ache', 'mal de tête'], key: 'headache' },
    { keywords: ['fever', 'hot', 'temperature', 'high temp', 'fièvre', 'chaud'], key: 'fever' },
    { keywords: ['malaria', 'paludisme', 'mosquito', 'palu', 'moustique'], key: 'malaria' },
    { keywords: ['cough', 'toux', 'whooping', 'bronchitis', 'bronchite'], key: 'cough' },
    { keywords: ['diarrhea', 'diarrhoea', 'diarrhée', 'loose stool', 'running stomach', 'watery stool', 'selless'], key: 'diarrhea' },
    { keywords: ['pregnancy', 'pregnant', 'enceinte', 'antenatal', 'prenatal', 'maternity', 'midwife', 'accouchement', 'grossesse'], key: 'pregnancy' },
    { keywords: ['emergency', 'urgence', 'accident', 'bleeding', 'unconscious', 'urgent', 'saignement', 'blessure', 'trauma'], key: 'emergency' },
    { keywords: ['clinic', 'hospital', 'health center', 'hôpital', 'clinique', 'doctor near', 'health facility', 'nearby', 'pharmacy'], key: 'clinic' },
    { keywords: ['hiv', 'aids', 'vih', 'sida', 'antiretroviral', 'art'], key: 'hiv' },
    { keywords: ['tb', 'tuberculosis', 'tuberculose', 'tbc', 'pulmonary'], key: 'tb' },
    { keywords: ['first aid', 'premiers soins', 'wound', 'blessure', 'burn', 'brûlure', 'fracture', 'snake', 'serpent', 'choking', 'choke', 'poison'], key: 'first_aid' },
    { keywords: ['how to use', 'help', 'guide', 'tutorial', 'comment utiliser', 'aide', 'app features', 'how do I', 'how to', 'register', 'consultation', 'dashboard', 'history', 'profile'], key: 'app_help' },
    { keywords: ['nutrition', 'diet', 'food', 'eat', 'meal', 'feeding', 'alimentation', 'régime', 'nourriture'], key: 'nutrition' },
    { keywords: ['vaccin', 'vaccination', 'immunization', 'vaccine', 'shot', 'piqûre', 'vacciné'], key: 'vaccination' },
    { keywords: ['hypertension', 'high blood', 'blood pressure', 'tension', 'bp', 'pression'], key: 'hypertension' },
    { keywords: ['diabetes', 'diabetic', 'diabète', 'sugar', 'blood sugar', 'glucose', 'insulin', 'insuline'], key: 'diabetes' },
    { keywords: ['mental', 'stress', 'anxiety', 'anxiété', 'depression', 'dépression', 'sad', 'triste', 'worry', 'suicide', 'mental health'], key: 'mental_health' },
    { keywords: ['cholera', 'choléra'], key: 'cholera' },
    { keywords: ['covid', 'corona', 'coronavirus', 'covid-19'], key: 'covid' },
    { keywords: ['chw', 'community health', 'health worker', 'agent de santé', 'relais communautaire'], key: 'chw' },
  ];

  for (const entry of keywordMap) {
    if (entry.keywords.some(kw => q.includes(kw))) {
      return medicalResponses[entry.key] || medicalResponses.default;
    }
  }

  return medicalResponses.default;
}

export default function AIAssistant() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleToggleAI = useCallback(() => setIsOpen(prev => !prev), [navigate]);

  useEffect(() => {
    window.addEventListener('toggle-ai', handleToggleAI);
    return () => window.removeEventListener('toggle-ai', handleToggleAI);
  }, [handleToggleAI]);

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        role: 'assistant',
        content: language === 'fr'
          ? `**Bienvenue sur HealthBridge AI** 🏥\n\nJe suis votre assistant médical personnel. Je fournis des informations générales sur la santé et des conseils d'auto-soins.\n\n**Comment puis-je vous aider aujourd'hui ?**\n\n• Décrivez vos symptômes pour une évaluation\n• Renseignez-vous sur les conditions médicales\n• Obtenez des conseils sur les premiers soins\n• Apprenez à utiliser la plateforme HealthBridge\n\n> ⚠️ Je fournis uniquement des informations générales. Pour les urgences, appelez le **1510** ou composez le ***800#**.`
          : `**Welcome to HealthBridge AI** 🏥\n\nI am your personal medical assistant. I provide general health information and self-care guidance based on standard medical practice.\n\n**How may I assist you today?**\n\n• Describe your symptoms for assessment\n• Ask about medical conditions\n• Get first aid guidance\n• Learn how to use the HealthBridge platform\n\n> ⚠️ I provide general health information only. For emergencies, call **1510** or dial ***800#**.`
      }]);
    }
  }, [language]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const handleSend = async (text?: string) => {
    const msg = (text || input).trim();
    if (!msg || isTyping) return;

    setMessages(prev => [...prev, { role: 'user', content: msg }]);
    setInput('');
    setIsTyping(true);

    await new Promise(r => setTimeout(r, 500 + Math.random() * 600));

    const response = getAIResponse(msg, language);
    setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    setIsTyping(false);
  };

  const handleQuickAction = (label: string) => handleSend(label);

  const renderMessage = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, i) => {
      if (line.startsWith('> ')) {
        return (
          <div key={i} className="flex items-start space-x-1.5 mt-2 px-3 py-2 bg-amber-50 dark:bg-amber-900/20 border-l-2 border-amber-400 rounded-r-lg">
            <HiOutlineInformationCircle className="h-3.5 w-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
            <p className="text-[11px] text-amber-700 dark:text-amber-400 italic leading-relaxed">{line.slice(2)}</p>
          </div>
        );
      }
      if (line.startsWith('**') && line.endsWith('**')) {
        return <p key={i} className="font-bold text-primary-700 dark:text-primary-400 text-sm mt-2">{line.replace(/\*\*/g, '')}</p>;
      }
      if (line.includes('**')) {
        const parts = line.split(/(\*\*.*?\*\*)/);
        return (
          <p key={i} className="text-sm text-secondary-600 dark:text-secondary-300 leading-relaxed">
            {parts.map((part, j) =>
              part.startsWith('**') && part.endsWith('**')
                ? <strong key={j} className="text-primary-600 dark:text-primary-400">{part.slice(2, -2)}</strong>
                : part
            )}
          </p>
        );
      }
      if (line.startsWith('- ')) {
        return <p key={i} className="text-sm text-secondary-600 dark:text-secondary-300 ml-2">• {line.slice(2)}</p>;
      }
      if (/^\d+\./.test(line)) {
        return <p key={i} className="text-sm text-secondary-600 dark:text-secondary-300 ml-2">{line}</p>;
      }
      return <p key={i} className="text-sm text-secondary-600 dark:text-secondary-300 leading-relaxed">{line}</p>;
    });
  };

  const handleStartConsultation = () => {
    setIsOpen(false);
    navigate('/patient/consultation');
  };

  return (
    <>
      {/* FAB Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-24 lg:bottom-6 right-4 z-50 h-11 w-11 rounded-xl bg-gradient-to-br from-primary-600 to-accent-500 text-white shadow-lg shadow-primary-600/30 flex items-center justify-center hover:shadow-primary-600/50 transition-all duration-300"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ rotate: 45 }} animate={{ rotate: 0 }} exit={{ rotate: 45 }}>
              <HiOutlineX className="h-5 w-5" />
            </motion.div>
          ) : (
            <motion.div key="chat" initial={{ rotate: -45 }} animate={{ rotate: 0 }} exit={{ rotate: -45 }}>
              <HiOutlineChat className="h-5 w-5" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ type: 'spring', damping: 22, stiffness: 280 }}
            className="fixed bottom-36 lg:bottom-24 right-4 left-4 lg:left-auto lg:right-6 lg:w-[26rem] z-50 bg-white dark:bg-secondary-800 rounded-2xl shadow-2xl border border-secondary-100 dark:border-secondary-700 flex flex-col overflow-hidden max-h-[75vh] lg:max-h-[640px]"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-primary-600 to-accent-600 p-4 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-9 w-9 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                    <HiOutlineHeart className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-sm">HealthBridge AI</h3>
                    <p className="text-white/70 text-[10px] tracking-wide">
                      {language === 'fr' ? 'Assistant médical 24h/7' : 'Medical Assistant 24/7'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="flex items-center space-x-1.5 px-2 py-1 rounded-full bg-white/10">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-300 animate-pulse" />
                    <span className="text-[10px] text-white/80">{language === 'fr' ? 'En ligne' : 'Online'}</span>
                  </span>
                  <button onClick={() => setIsOpen(false)} className="p-1 rounded-lg hover:bg-white/10 transition-colors">
                    <HiOutlineX className="h-4 w-4 text-white/70" />
                  </button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-secondary-50/50 dark:bg-secondary-900/50">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.03 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[88%] rounded-2xl p-3 ${
                      msg.role === 'user'
                        ? 'bg-primary-600 text-white rounded-tr-md'
                        : 'bg-white dark:bg-secondary-700 text-secondary-800 dark:text-secondary-200 rounded-tl-md shadow-sm border border-secondary-100 dark:border-secondary-600'
                    }`}
                  >
                    {msg.role === 'assistant' && (
                      <div className="flex items-center space-x-1.5 mb-2 pb-2 border-b border-secondary-100 dark:border-secondary-600">
                        <div className="h-5 w-5 rounded-md bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center">
                          <HiOutlineHeart className="h-3 w-3 text-primary-600 dark:text-primary-400" />
                        </div>
                        <span className="text-[10px] font-semibold text-primary-600 dark:text-primary-400 tracking-wide uppercase">AI Medical Assistant</span>
                      </div>
                    )}
                    <div className={msg.role === 'user' ? 'text-sm text-white' : 'text-sm'}>
                      {renderMessage(msg.content)}
                    </div>
                  </div>
                </motion.div>
              ))}

              {isTyping && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                  <div className="bg-white dark:bg-secondary-700 rounded-2xl rounded-bl-md p-4 shadow-sm border border-secondary-100 dark:border-secondary-600">
                    <div className="flex space-x-1.5">
                      <motion.div animate={{ y: [0, -4, 0] }} transition={{ duration: 0.5, repeat: Infinity, delay: 0 }} className="h-2 w-2 rounded-full bg-primary-400" />
                      <motion.div animate={{ y: [0, -4, 0] }} transition={{ duration: 0.5, repeat: Infinity, delay: 0.12 }} className="h-2 w-2 rounded-full bg-primary-400" />
                      <motion.div animate={{ y: [0, -4, 0] }} transition={{ duration: 0.5, repeat: Infinity, delay: 0.24 }} className="h-2 w-2 rounded-full bg-primary-400" />
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick actions */}
            {messages.length <= 1 && !isTyping && (
              <div className="px-4 pb-2 pt-1 bg-secondary-50/50 dark:bg-secondary-900/50">
                <div className="flex flex-wrap gap-1.5">
                  {quickActions.map((action) => (
                    <motion.button
                      key={action.label}
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => handleQuickAction(action.label)}
                      className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-white dark:bg-secondary-700 text-xs font-medium text-secondary-600 dark:text-secondary-300 shadow-sm border border-secondary-100 dark:border-secondary-600 hover:border-primary-200 hover:text-primary-700 transition-colors"
                    >
                      <span>{action.icon}</span>
                      <span>{action.label}</span>
                    </motion.button>
                  ))}
                </div>
                <button
                  onClick={handleStartConsultation}
                  className="mt-2 w-full flex items-center justify-center space-x-1.5 py-2 rounded-lg bg-gradient-to-r from-primary-500 to-accent-500 text-white text-xs font-semibold shadow hover:shadow-lg transition-all"
                >
                  <HiOutlineUser className="h-3.5 w-3.5" />
                  <span>{language === 'fr' ? 'Consulter un médecin' : 'Consult a Doctor'}</span>
                  <HiOutlineArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            {/* Input */}
            <div className="p-3 border-t border-secondary-100 dark:border-secondary-700 bg-white dark:bg-secondary-800 flex-shrink-0">
              <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex items-center space-x-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={language === 'fr' ? 'Décrivez vos symptômes...' : 'Describe your symptoms...'}
                  className="flex-1 px-4 py-2.5 bg-secondary-100 dark:bg-secondary-700 rounded-xl text-sm text-secondary-800 dark:text-secondary-200 placeholder-secondary-400 border-0 focus:ring-2 focus:ring-primary-500/30 focus:outline-none transition-all"
                  disabled={isTyping}
                />
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.9 }}
                  disabled={!input.trim() || isTyping}
                  className="h-10 w-10 rounded-xl bg-primary-600 text-white flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary-700 transition-colors shadow-sm"
                >
                  <HiOutlinePaperAirplane className="h-4 w-4" />
                </motion.button>
              </form>
            </div>

            {/* Footer */}
            <div className="px-4 py-2.5 bg-secondary-50 dark:bg-secondary-900/50 flex items-center justify-between text-[10px] text-secondary-400 border-t border-secondary-100 dark:border-secondary-700">
              <span className="flex items-center space-x-1">
                <HiOutlineShieldCheck className="h-3 w-3 text-primary-500" />
                <span>{language === 'fr' ? 'Informations médicales générales' : 'General medical information'}</span>
              </span>
              <span className="flex items-center space-x-1">
                <HiOutlinePhone className="h-3 w-3 text-red-400" />
                <span>{language === 'fr' ? 'Urgence: 1510' : 'Emergency: 1510'}</span>
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
