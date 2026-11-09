# Ask Dokita

A health triage assistant for Nigeria that speaks **English, Nigerian Pidgin, Yoruba and Hausa**. You describe your symptoms, and it helps you decide what to do next: care for yourself at home, see a clinic, go today, or treat it as an emergency.

Built for SLAY HACKS 2026.

> ⚠️ This app is not a doctor and does not diagnose. It gives general guidance only. In an emergency, call **112** or go to the nearest hospital.

## The problem
Many people in Nigeria live far from a clinic, pay for care out of pocket, and look up health information in a language they don't speak first. The result is that some people rush to hospital for minor illnesses, while others wait at home through real emergencies.

## How it works
```
user message
   │
   ▼
1. Safety rules (deterministic, src/safety.js)
   Red-flag phrases in 4 languages: chest pain, can't breathe,
   heavy bleeding, seizure, stroke signs, self-harm, poisoning,
   snakebite, pregnancy and newborn danger signs
   │── match → fixed emergency message in the user's language ("call 112")
   │           The AI is never called, so it can never downplay an emergency.
   ▼
2. Google Gemini, free tier (src/ai.js)
   Asks follow-up questions, then returns one of:
   ask_more · self_care · see_clinic · urgent
   Strict rules: no diagnoses as fact, no prescriptions or antibiotics,
   no doses for children, extra caution for under-5s, pregnancy and the elderly.
```
- **Responsible AI:** Emergency escalation is code, not a prompt, and unit tests cover it. If the model's output is malformed or uses an unknown level, the app falls back to "see a clinic". The server stores no personal data, and the conversation lives only in the browser tab.
- **Low data:** There's no framework and no build step. The whole frontend is a few KB.

## Running it
You need Node 22 or newer. There are no npm dependencies.

```bash
cp .env.example .env    # then add your free GEMINI_API_KEY from aistudio.google.com
npm start               # http://localhost:3000
npm test
```
Without an API key, the safety rules still work, and every other message gets a "see a clinic" reply. The default model is `gemini-3.5-flash-lite`. You can change it with `GEMINI_MODEL`.

## Deploying (free)
The repo includes a [Render](https://render.com) Blueprint (`render.yaml`). In Render, choose **New → Blueprint**, select this repo, and paste your `GEMINI_API_KEY` when asked. On the free plan the app sleeps when nobody uses it, so the first visit afterwards takes about a minute to load.

## Known limits
- The Yoruba and Hausa keyword lists and translations need review by native speakers.
- The keyword matching can miss unusual phrasings. The AI is told to escalate to "urgent" whenever something sounds life-threatening, as a second net.
- It has not been clinically validated. It is a hackathon prototype.
- **Privacy:** On Gemini's free tier, Google may use prompts to improve its products. Don't enter real patient details. A real deployment would need a paid tier with no data use.
