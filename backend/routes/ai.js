const express = require('express');
const router = express.Router();
const axios = require('axios');

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

router.post('/pre-visit', async (req, res) => {
  try {
    const { symptoms } = req.body;
    const prompt = `Analyse these patient symptoms and return a JSON object with exactly these fields:
- urgencyLevel: "Low", "Medium", or "High"
- chiefComplaint: a concise one-sentence chief complaint
- suggestedQuestions: array of exactly 3 questions the doctor should ask
- summaryText: a 2-3 sentence clinical pre-visit summary

Patient symptom data:
Chief complaint: ${symptoms.chiefComplaint}
Duration: ${symptoms.duration}
Severity (1-10): ${symptoms.severity}
Symptoms: ${symptoms.symptoms ? symptoms.symptoms.join(', ') : ''}
Additional notes: ${symptoms.additionalNotes || 'None'}
Current medications: ${symptoms.currentMedications || 'None'}
Allergies: ${symptoms.allergies || 'None'}

Return ONLY valid JSON, no markdown.`;

    const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
      model: 'google/gemma-4-31b-it',
      messages: [{ role: 'user', content: prompt }]
    }, {
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'http://localhost:5173', 
        'X-Title': 'MediBook'
      }
    });

    let content = response.data.choices[0].message.content;
    const clean = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(clean);

    res.json({
      urgencyLevel: parsed.urgencyLevel || 'Medium',
      chiefComplaint: parsed.chiefComplaint || symptoms.chiefComplaint,
      suggestedQuestions: parsed.suggestedQuestions || [],
      summaryText: parsed.summaryText || '',
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[AI] Pre-visit summary failed:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to generate pre-visit summary' });
  }
});

router.post('/post-visit', async (req, res) => {
  try {
    const { notes, prescriptions } = req.body;
    const prescriptionText = (prescriptions || []).map(p =>
      `${p.medication} ${p.dosage}, ${p.frequency} for ${p.duration}. ${p.instructions}`
    ).join('\n');

    const prompt = `Convert these clinical notes into a patient-friendly summary. Return a JSON object with:
- summaryText: 3-4 sentences in plain language the patient can understand
- medicationSchedule: array of objects with {medication, dosage, schedule, instructions}
- followUpSteps: array of 3-5 actionable steps for the patient

Clinical notes: ${notes}

Prescriptions:
${prescriptionText || 'No medications prescribed'}

Return ONLY valid JSON, no markdown.`;

    const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
      model: 'google/gemma-4-31b-it',
      messages: [{ role: 'user', content: prompt }]
    }, {
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'http://localhost:5173', 
        'X-Title': 'MediBook'
      }
    });

    let content = response.data.choices[0].message.content;
    const clean = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(clean);

    res.json({
      summaryText: parsed.summaryText || '',
      medicationSchedule: parsed.medicationSchedule || [],
      followUpSteps: parsed.followUpSteps || [],
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[AI] Post-visit summary failed:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to generate post-visit summary' });
  }
});

module.exports = router;
