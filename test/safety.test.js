import test from 'node:test';
import assert from 'node:assert/strict';
import { detectRedFlags, detectInLatest, emergencyReply } from '../src/safety.js';
import { parseModelOutput, askAI } from '../src/ai.js';
import { validate } from '../server.js';

test('flags English emergencies', () => {
  assert.deepEqual(detectRedFlags("I can't breathe"), ['breathing']);
  assert.ok(detectRedFlags('severe chest pain since an hour').includes('chest_pain'));
  assert.ok(detectRedFlags('I want to die').includes('self_harm'));
});

test('flags Pidgin emergencies', () => {
  assert.ok(detectRedFlags('my chest dey pain me well well').includes('chest_pain'));
  assert.ok(detectRedFlags('blood no dey stop').includes('severe_bleeding'));
  assert.ok(detectRedFlags('snake don bite my brother').includes('snakebite'));
});

test('flags Yoruba and Hausa emergencies, ignoring tone marks', () => {
  assert.ok(detectRedFlags('Àyà mi ń dùn').includes('chest_pain'));
  assert.ok(detectRedFlags('Ina da ciwon kirji').includes('chest_pain'));
  assert.ok(detectRedFlags('ba na iya numfashi').includes('breathing'));
});

test('combination rules need both parts', () => {
  assert.ok(detectRedFlags('I am pregnant and bleeding').includes('pregnancy_danger'));
  assert.deepEqual(detectRedFlags('I am pregnant and tired'), []);
  assert.ok(detectRedFlags('my baby is very hot and wont feed').includes('infant_danger'));
});

test('does not fire on ordinary complaints or inside other words', () => {
  assert.deepEqual(detectRedFlags('I have a mild headache and a runny nose'), []);
  assert.deepEqual(detectRedFlags('I rejected the offer, my head hurts'), []);
  assert.deepEqual(detectRedFlags('fever for two days'), []);
});

test('a red flag in a later message escalates; an old one does not repeat', () => {
  const convo = [
    { role: 'user', content: 'I have a headache' },
    { role: 'assistant', content: 'How long?' },
    { role: 'user', content: 'also my chest dey pain me' },
  ];
  assert.ok(detectInLatest(convo).includes('chest_pain'));
  convo.push({ role: 'assistant', content: 'Call 112' }, { role: 'user', content: 'ok I feel better now' });
  assert.deepEqual(detectInLatest(convo), []);
});

test('emergency reply is localized and mentions 112', () => {
  for (const lang of ['en', 'pcm', 'yo', 'ha']) {
    const r = emergencyReply(['chest_pain'], lang);
    assert.equal(r.level, 'emergency');
    assert.match(r.reply, /112/);
  }
  assert.notEqual(emergencyReply(['chest_pain'], 'ha').reply, emergencyReply(['chest_pain'], 'en').reply);
  assert.match(emergencyReply(['self_harm'], 'en').reply, /sorry/i);
});

test('parseModelOutput handles clean, wrapped and malformed output', () => {
  assert.deepEqual(parseModelOutput('{"level":"urgent","reply":"Go today"}'), { level: 'urgent', reply: 'Go today' });
  assert.equal(parseModelOutput('Sure:\n```json\n{"level":"self_care","reply":"Rest"}\n```').level, 'self_care');
  assert.equal(parseModelOutput('{"level":"bogus","reply":"x"}').level, 'see_clinic');
  const plain = parseModelOutput('just text');
  assert.equal(plain.level, 'see_clinic');
  assert.equal(plain.reply, 'just text');
});

test('askAI sends a Gemini request and reads the reply', async () => {
  let sent;
  const fakeFetch = async (url, init) => {
    sent = { url, init, body: JSON.parse(init.body) };
    return {
      ok: true,
      json: async () => ({ candidates: [{ content: { parts: [{ text: '{"level":"self_care","reply":"Rest well"}' }] } }] }),
    };
  };
  const out = await askAI({
    messages: [
      { role: 'user', content: 'headache' },
      { role: 'assistant', content: 'How long?' },
      { role: 'user', content: 'since morning' },
    ],
    lang: 'pcm',
    apiKey: 'k',
    model: 'gemini-test',
    fetchImpl: fakeFetch,
  });
  assert.deepEqual(out, { level: 'self_care', reply: 'Rest well' });
  assert.match(sent.url, /models\/gemini-test:generateContent$/);
  assert.equal(sent.init.headers['x-goog-api-key'], 'k');
  assert.deepEqual(sent.body.contents.map((c) => c.role), ['user', 'model', 'user']);
  assert.match(sent.body.systemInstruction.parts[0].text, /Nigerian Pidgin/);
});

test('askAI throws on API errors and blocked prompts', async () => {
  const args = { messages: [{ role: 'user', content: 'x' }], lang: 'en', apiKey: 'k', model: 'm' };
  await assert.rejects(askAI({ ...args, fetchImpl: async () => ({ ok: false, status: 429, text: async () => 'quota' }) }), /429/);
  await assert.rejects(
    askAI({ ...args, fetchImpl: async () => ({ ok: true, json: async () => ({ promptFeedback: { blockReason: 'SAFETY' } }) }) }),
    /blocked/,
  );
});

test('validate trims, caps and rejects bad input', () => {
  assert.equal(validate(null), null);
  assert.equal(validate({ messages: [] }), null);
  assert.equal(validate({ messages: [{ role: 'assistant', content: 'hi' }] }), null);
  const v = validate({ lang: 'xx', messages: [{ role: 'assistant', content: 'hi' }, { role: 'user', content: 'a'.repeat(5000) }] });
  assert.equal(v.lang, 'en');
  assert.equal(v.messages[0].role, 'user');
  assert.equal(v.messages[0].content.length, 1000);
});
