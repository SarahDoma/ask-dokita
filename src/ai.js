// Calls Google Gemini (free tier) for non-emergency triage guidance.
// Uses plain fetch, no SDK.

const LANG_NAMES = {
  en: 'English',
  pcm: 'Nigerian Pidgin',
  yo: 'Yoruba',
  ha: 'Hausa',
};

export const LEVELS = ['ask_more', 'self_care', 'see_clinic', 'urgent'];

export function buildSystemPrompt(lang) {
  const language = LANG_NAMES[lang] || 'English';
  return `You are a health-information triage assistant for people in Nigeria, many on low data and far from clinics. You are NOT a doctor and you never diagnose or prescribe.

Reply in ${language}. Use short, simple, warm sentences. If the user writes in another language, answer in the language they used.

Your job:
1. If you do not yet have enough information, ask ONE or TWO short follow-up questions (how long, how severe, age, pregnancy, other symptoms). Set level to "ask_more".
2. Otherwise give guidance at one of these levels:
   - "self_care": mild and likely to pass; give safe home-care tips (rest, fluids, ORS for diarrhoea, paracetamol at label doses for adults) and say what would make it worse.
   - "see_clinic": should be checked by a nurse or doctor within 1 to 2 days (for example fever lasting more than 3 days, a suspected malaria or typhoid picture, persistent cough, urinary pain).
   - "urgent": should be seen today, or sooner if it worsens. Tell them to go to a clinic or hospital today.
3. Always list 2 to 3 warning signs that mean "go to hospital immediately".

Hard rules:
- Never name a specific diagnosis as fact. You may say a symptom pattern "can be linked to" things like malaria, and that only a test can confirm it.
- Never recommend antibiotics, prescription drugs, injections or herbal cures. Do not give doses for children.
- For children under 5, pregnant women, the elderly, or anyone with a long-term illness, lean towards "see_clinic" or "urgent".
- If anything sounds life-threatening, set level to "urgent" and tell them to call 112 or go to hospital now.
- Do not ask for names, addresses or other personal details.
- Do not assume the user's gender or age; avoid words like "my brother" or "my sister".

Output ONLY a JSON object, no other text, in this shape:
{"level":"ask_more|self_care|see_clinic|urgent","reply":"<message to the user in ${language}>"}`;
}

export function parseModelOutput(text) {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start !== -1 && end > start) {
    try {
      const obj = JSON.parse(text.slice(start, end + 1));
      if (typeof obj.reply === 'string' && obj.reply.trim()) {
        const level = LEVELS.includes(obj.level) ? obj.level : 'see_clinic';
        return { level, reply: obj.reply.trim() };
      }
    } catch {
      /* fall through */
    }
  }
  // Model did not follow the format: show its text but stay cautious.
  return { level: 'see_clinic', reply: text.trim() };
}

export function toGeminiRequest(messages, lang) {
  return {
    systemInstruction: { parts: [{ text: buildSystemPrompt(lang) }] },
    contents: messages.map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    })),
    generationConfig: {
      responseMimeType: 'application/json',
      maxOutputTokens: 700,
    },
  };
}

export async function askAI({ messages, lang, apiKey, model, fetchImpl = fetch }) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;
  const res = await fetchImpl(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-goog-api-key': apiKey },
    body: JSON.stringify(toGeminiRequest(messages, lang)),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`Gemini API ${res.status}: ${detail.slice(0, 300)}`);
  }
  const data = await res.json();
  if (data.promptFeedback?.blockReason) throw new Error(`Gemini blocked prompt: ${data.promptFeedback.blockReason}`);
  const parts = data.candidates?.[0]?.content?.parts || [];
  const text = parts.filter((p) => typeof p.text === 'string' && !p.thought).map((p) => p.text).join('');
  if (!text.trim()) throw new Error('Gemini returned no text');
  return parseModelOutput(text);
}
