import axios from 'axios';

const API_URL = import.meta.env.PROD ? '/api' : 'http://localhost:5000/api';

export async function generatePreVisitSummary(symptoms) {
  try {
    const response = await axios.post(`${API_URL}/ai/pre-visit`, { symptoms });
    return response.data;
  } catch (error) {
    console.error('Error fetching pre-visit summary:', error);
    // Fallback locally in case backend fails
    const severity = symptoms.severity;
    const urgency = severity >= 8 ? 'High' : severity >= 5 ? 'Medium' : 'Low';
    return {
      urgencyLevel: urgency,
      chiefComplaint: symptoms.chiefComplaint || symptoms.symptoms.join(', ') || 'General consultation',
      suggestedQuestions: [
        'When did the symptoms first appear?',
        'Have you experienced similar symptoms before?',
        'Are there any factors that make symptoms better or worse?',
      ],
      summaryText: `Patient reports ${symptoms.chiefComplaint}. Duration: ${symptoms.duration}. Severity: ${symptoms.severity}/10. Additional context: ${symptoms.additionalNotes || 'None provided'}.`,
      generatedAt: new Date().toISOString(),
    };
  }
}

export async function generatePostVisitSummary(notes, prescriptions) {
  try {
    const response = await axios.post(`${API_URL}/ai/post-visit`, { notes, prescriptions });
    return response.data;
  } catch (error) {
    console.error('Error fetching post-visit summary:', error);
    // Fallback
    const medSchedule = prescriptions.map(p => ({
      medication: p.medication,
      dosage: p.dosage,
      schedule: `${p.frequency} for ${p.duration}`,
      instructions: p.instructions,
    }));
    return {
      summaryText: `Your doctor has reviewed your condition. ${notes}`,
      medicationSchedule: medSchedule,
      followUpSteps: ['Take prescribed medications as directed', 'Return if symptoms worsen', 'Schedule a follow-up in 2 weeks if needed'],
      generatedAt: new Date().toISOString(),
    };
  }
}

