const STRINGS = {
  en: {
    tagline: "Tell me how you feel. I'll help you decide what to do next.",
    banner: 'Not a doctor. I give general guidance only and cannot diagnose. In an emergency call <strong>112</strong> or go to the nearest hospital.',
    placeholder: 'Type your symptoms…',
    send: 'Send',
    typing: 'Thinking…',
    hello: "Hello! Tell me what's wrong, how long it has been going on, and who it is for (you, a child, someone else).",
    error: 'Network problem. Please try again.',
    chips: ['I have a fever and headache', 'My child has diarrhoea', 'I have a cough for 2 weeks', 'Stomach pain since morning'],
    levels: { ask_more: 'A few questions', self_care: 'Home care', see_clinic: 'See a clinic', urgent: 'Go today', emergency: 'Emergency' },
  },
  pcm: {
    tagline: 'Tell me how body dey do you. I go help you know wetin to do.',
    banner: 'I no be doctor. I dey give general advice only, I no fit diagnose. If e serious, call <strong>112</strong> or go hospital sharp sharp.',
    placeholder: 'Write wetin dey do you…',
    send: 'Send',
    typing: 'I dey think…',
    hello: 'How far! Tell me wetin dey do you, how long e don dey, and na who e be (you, pikin, or another person).',
    error: 'Network wahala. Abeg try again.',
    chips: ['I get fever and headache', 'My pikin dey purge', 'Cough don dey me for 2 weeks', 'Belle don dey pain me since morning'],
    levels: { ask_more: 'Small questions', self_care: 'Take care for house', see_clinic: 'Go clinic', urgent: 'Go today', emergency: 'Emergency' },
  },
  yo: {
    tagline: 'So bi ara re ṣe rí fún mi. Màá ràn ọ́ lọ́wọ́ láti mọ ohun tí o máa ṣe.',
    banner: 'Kì í ṣe dókítà ni mí. Ìmọ̀ràn gbogbogbò ni mo ń fún, mi ò lè ṣe ìwádìí àrùn. Tí ó bá le, pe <strong>112</strong> tàbí lọ sí ilé-ìwòsàn tó súnmọ́ ọ.',
    placeholder: 'Kọ àwọn àmì àìsàn rẹ…',
    send: 'Fi ránṣẹ́',
    typing: 'Mò ń ronú…',
    hello: 'Pẹ̀lẹ́ o! Sọ ohun tó ń ṣe ọ́ fún mi, ó ti pẹ́ tó, àti ẹni tí ó kàn (ìwọ, ọmọ, tàbí ẹlòmíràn).',
    error: 'Ìṣòro nẹ́tíwọ́ọ̀kì. Jọ̀wọ́ gbìyànjú lẹ́ẹ̀kan sí i.',
    chips: ['Ibà àti orí fífọ́ ń ṣe mí', 'Ọmọ mi ń ṣe ìgbẹ́ gbuuru', 'Ikọ́ ti wà fún ọ̀sẹ̀ méjì', 'Ikùn ń dùn mí láti àárọ̀'],
    levels: { ask_more: 'Àwọn ìbéèrè díẹ̀', self_care: 'Ìtọ́jú ilé', see_clinic: 'Lọ sí ilé-ìwòsàn', urgent: 'Lọ lónìí', emergency: 'Pàjáwìrì' },
  },
  ha: {
    tagline: 'Gaya mini yadda kake ji. Zan taimaka maka ka san abin da zaka yi.',
    banner: 'Ba likita ba ne ni. Ina ba da shawarar gaba daya ne kawai, ba zan iya gano cuta ba. Idan gaggawa ce, kira <strong>112</strong> ko ka je asibiti mafi kusa.',
    placeholder: 'Rubuta alamomin rashin lafiyarka…',
    send: 'Aika',
    typing: 'Ina tunani…',
    hello: 'Sannu! Gaya mini abin da ke damunka, tun yaushe, kuma wane ne (kai, yaro, ko wani).',
    error: 'Matsalar hanyar sadarwa. Don Allah sake gwadawa.',
    chips: ['Ina da zazzabi da ciwon kai', 'Yarona yana gudawa', 'Tari na mako biyu', 'Ciwon ciki tun safe'],
    levels: { ask_more: 'Tambayoyi kadan', self_care: 'Kula a gida', see_clinic: 'Je asibiti', urgent: 'Je yau', emergency: 'Gaggawa' },
  },
};

const chat = document.getElementById('chat');
const form = document.getElementById('form');
const input = document.getElementById('input');
const send = document.getElementById('send');
const langSel = document.getElementById('lang');
const chips = document.getElementById('chips');

let history = [];
let lang = 'en';
try {
  lang = localStorage.getItem('lang') || 'en';
} catch {
  /* storage may be blocked */
}
if (!STRINGS[lang]) lang = 'en';
langSel.value = lang;

const t = () => STRINGS[lang];

function addMsg(who, text, level) {
  const el = document.createElement('div');
  el.className = `msg ${who}${level === 'emergency' ? ' emergency' : ''}`;
  if (level) {
    const b = document.createElement('span');
    b.className = `badge ${level}`;
    b.textContent = t().levels[level] || level;
    el.append(b, document.createElement('br'));
  }
  el.append(document.createTextNode(text)); // textContent-safe: no HTML injection
  chat.append(el);
  chat.scrollTop = chat.scrollHeight;
  return el;
}

function applyLang() {
  document.documentElement.lang = lang === 'pcm' ? 'en' : lang;
  document.getElementById('tagline').textContent = t().tagline;
  document.getElementById('banner').innerHTML = t().banner; // static trusted strings
  input.placeholder = t().placeholder;
  send.textContent = t().send;
  chips.replaceChildren(
    ...t().chips.map((c) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = c;
      b.onclick = () => submit(c);
      return b;
    }),
  );
}

async function submit(text) {
  text = text.trim();
  if (!text) return;
  chips.hidden = true;
  addMsg('user', text);
  history.push({ role: 'user', content: text });
  input.value = '';
  send.disabled = true;
  const typing = addMsg('bot typing', t().typing);
  try {
    const res = await fetch('/api/triage', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ messages: history, lang }),
    });
    const data = await res.json();
    typing.remove();
    if (!data.reply) throw new Error(data.error || 'bad response');
    addMsg('bot', data.reply, data.level);
    history.push({ role: 'assistant', content: data.reply });
  } catch (e) {
    typing.remove();
    addMsg('bot', t().error);
    history.pop(); // let the user retry the same message
  } finally {
    send.disabled = false;
    input.focus();
  }
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  submit(input.value);
});

langSel.addEventListener('change', () => {
  lang = langSel.value;
  try {
    localStorage.setItem('lang', lang);
  } catch {
    /* ignore */
  }
  applyLang();
  if (history.length === 0) {
    chat.replaceChildren();
    addMsg('bot', t().hello);
  }
});

applyLang();
addMsg('bot', t().hello);
