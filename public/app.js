// Ask Dokita front end. No framework; all AI text is inserted with
// textContent / DOM nodes, never innerHTML.

const MAPS_HOSPITAL = 'https://www.google.com/maps/search/?api=1&query=hospital+near+me';
const MAPS_CLINIC = 'https://www.google.com/maps/search/?api=1&query=clinic+near+me';

const STRINGS = {
  en: {
    tagline: 'Health guidance in your language',
    notice: 'Not a doctor. General guidance only, not a diagnosis. In an emergency call <strong>112</strong>.',
    welcomeTitle: 'How are you feeling today?',
    welcomeBody: "Tell me what's wrong, how long it has been going on, and who it is for. I'll ask a few questions, then tell you one of these:",
    chipsLabel: 'Or start with',
    chips: ['I have a fever and headache', 'My child has diarrhoea', 'I have a cough for 2 weeks', 'Stomach pain since morning'],
    placeholder: 'Describe your symptoms…',
    error: "Sorry, I couldn't connect. Check your internet and try again.",
    restart: 'New chat',
    foot: 'Your chat is not saved. Answers are made by AI and can be wrong.',
    call: 'Call 112',
    hospital: 'Nearest hospital',
    clinic: 'Find a clinic',
    levels: {
      ask_more: ['A few questions'],
      self_care: ['Home care', 'You can likely manage this at home'],
      see_clinic: ['See a clinic', 'Get checked within 1–2 days'],
      urgent: ['Go today', 'See a nurse or doctor today'],
      emergency: ['Emergency', 'Get help right now'],
    },
  },
  pcm: {
    tagline: 'Health advice for your own language',
    notice: 'I no be doctor. Na general advice, no be diagnosis. If e serious, call <strong>112</strong>.',
    welcomeTitle: 'How body dey do you today?',
    welcomeBody: 'Tell me wetin dey do you, how long e don dey, and na who e be. I go ask you small questions, then I go tell you one of these:',
    chipsLabel: 'Or start with',
    chips: ['I get fever and headache', 'My pikin dey purge', 'Cough don dey me for 2 weeks', 'Belle dey pain me since morning'],
    placeholder: 'Write wetin dey do you…',
    error: 'Network wahala. Check your data and try again.',
    restart: 'New chat',
    foot: 'We no dey save your chat. Na AI dey answer, e fit make mistake.',
    call: 'Call 112',
    hospital: 'Hospital wey near',
    clinic: 'Find clinic',
    levels: {
      ask_more: ['Small questions'],
      self_care: ['Take care for house', 'You fit manage am for house'],
      see_clinic: ['Go clinic', 'Make dem check you within 1–2 days'],
      urgent: ['Go today', 'See nurse or doctor today'],
      emergency: ['Emergency', 'Get help now now'],
    },
  },
  yo: {
    tagline: 'Ìmọ̀ràn ìlera ní èdè rẹ',
    notice: 'Kì í ṣe dókítà ni mí. Ìmọ̀ràn gbogbogbò ni, kì í ṣe àyẹ̀wò àìsàn. Tí ó bá le, pe <strong>112</strong>.',
    welcomeTitle: 'Báwo ni ara rẹ ṣe rí lónìí?',
    welcomeBody: 'Sọ ohun tó ń ṣe ọ́, bí ó ti pẹ́ tó, àti ẹni tí ó kàn. Màá bi ọ́ ní ìbéèrè díẹ̀, lẹ́yìn náà màá sọ ọ̀kan nínú ìwọ̀nyí fún ọ:',
    chipsLabel: 'Tàbí bẹ̀rẹ̀ pẹ̀lú',
    chips: ['Ibà àti orí fífọ́ ń ṣe mí', 'Ọmọ mi ń ṣe ìgbẹ́ gbuuru', 'Ikọ́ ti wà fún ọ̀sẹ̀ méjì', 'Ikùn ń dùn mí láti àárọ̀'],
    placeholder: 'Kọ àwọn àmì àìsàn rẹ…',
    error: 'Ìṣòro nẹ́tíwọ́ọ̀kì. Ṣàyẹ̀wò íntánẹ́ẹ̀tì rẹ kí o sì gbìyànjú lẹ́ẹ̀kan sí i.',
    restart: 'Ìjíròrò tuntun',
    foot: 'A kò tọ́jú ìjíròrò rẹ. AI ló ń dáhùn, ó lè ṣàṣìṣe.',
    call: 'Pe 112',
    hospital: 'Ilé-ìwòsàn tó súnmọ́',
    clinic: 'Wá ilé-ìwòsàn',
    levels: {
      ask_more: ['Àwọn ìbéèrè díẹ̀'],
      self_care: ['Ìtọ́jú ilé', 'O lè tọ́jú èyí nílé'],
      see_clinic: ['Lọ sí ilé-ìwòsàn', 'Jẹ́ kí wọ́n yẹ̀ ọ́ wò láàrin ọjọ́ 1–2'],
      urgent: ['Lọ lónìí', 'Rí nọ́ọ̀sì tàbí dókítà lónìí'],
      emergency: ['Pàjáwìrì', 'Wá ìrànlọ́wọ́ báyìí'],
    },
  },
  ha: {
    tagline: 'Shawarar lafiya a harshenka',
    notice: 'Ba likita ba ne ni. Shawara ce kawai, ba gano cuta ba. Idan gaggawa ce, kira <strong>112</strong>.',
    welcomeTitle: 'Yaya jikinka yau?',
    welcomeBody: 'Gaya mini abin da ke damunka, tun yaushe, kuma wane ne. Zan yi maka tambayoyi kadan, sannan in gaya maka daya daga cikin wadannan:',
    chipsLabel: 'Ko fara da',
    chips: ['Ina da zazzabi da ciwon kai', 'Yarona yana gudawa', 'Tari na mako biyu', 'Ciwon ciki tun safe'],
    placeholder: 'Rubuta alamomin rashin lafiyarka…',
    error: 'Matsalar sadarwa. Duba intanet dinka ka sake gwadawa.',
    restart: 'Sabuwar hira',
    foot: 'Ba ma ajiye hirarka. AI ne ke amsawa, yana iya yin kuskure.',
    call: 'Kira 112',
    hospital: 'Asibiti mafi kusa',
    clinic: 'Nemo asibiti',
    levels: {
      ask_more: ['Tambayoyi kadan'],
      self_care: ['Kula a gida', 'Za ka iya kula da shi a gida'],
      see_clinic: ['Je asibiti', 'A duba ka cikin kwana 1–2'],
      urgent: ['Je yau', 'Ga ma\'aikacin lafiya yau'],
      emergency: ['Gaggawa', 'Nemi taimako yanzu'],
    },
  },
};

const ICONS = {
  ask_more: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6v.6M12 17h.01"/>',
  self_care: '<path d="M4 11l8-7 8 7v9h-5v-6H9v6H4z"/>',
  see_clinic: '<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M12 8v8M8 12h8"/>',
  urgent: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2M9 2h6"/>',
  emergency: '<path d="M12 3l10 18H2z"/><path d="M12 10v4M12 17.5h.01"/>',
  phone: '<path d="M5 3h4l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-2"/>',
  pin: '<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
};
const LEGEND = ['self_care', 'see_clinic', 'urgent', 'emergency'];
const LEGEND_COLOR = { self_care: 'var(--self)', see_clinic: 'var(--clinic)', urgent: 'var(--urgent)', emergency: 'var(--emergency)' };

const $ = (id) => document.getElementById(id);
const chat = $('chat');
const welcome = $('welcome');
const form = $('form');
const input = $('input');
const send = $('send');
const langSel = $('lang');
const restartBtn = $('restart');

let history = [];
let busy = false;
let lang = 'en';
try {
  lang = localStorage.getItem('lang') || 'en';
} catch {
  /* storage may be blocked */
}
if (!STRINGS[lang]) lang = 'en';
langSel.value = lang;
const t = () => STRINGS[lang];

function svg(name) {
  const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  s.setAttribute('viewBox', '0 0 24 24');
  s.setAttribute('aria-hidden', 'true');
  s.innerHTML = ICONS[name]; // static, trusted markup
  return s;
}

function el(tag, cls, text) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text != null) n.textContent = text;
  return n;
}

// Turn plain AI text into paragraphs and lists, safely.
function formatReply(text) {
  const frag = document.createDocumentFragment();
  let list = null;
  for (const raw of text.replace(/\*\*/g, '').split('\n')) {
    const line = raw.trim();
    if (!line) {
      list = null;
      continue;
    }
    const num = line.match(/^(\d+)[.)]\s+(.*)/);
    const bullet = line.match(/^[-*•]\s+(.*)/);
    if (num || bullet) {
      const type = num ? 'ol' : 'ul';
      if (!list || list.tagName.toLowerCase() !== type) {
        list = el(type);
        frag.append(list);
      }
      list.append(el('li', null, num ? num[2] : bullet[1]));
    } else {
      list = null;
      frag.append(el('p', null, line));
    }
  }
  return frag;
}

function scrollDown() {
  chat.scrollTop = chat.scrollHeight;
}

function addUser(text) {
  chat.append(el('div', 'msg user', text));
  scrollDown();
}

function addBot(text, level) {
  const box = el('div', `msg bot${level ? ` lv-${level}` : ''}`);
  if (level && t().levels[level]) {
    const [label, sub] = t().levels[level];
    const head = el('div', 'level');
    const words = el('div', null, label);
    if (sub) words.append(el('small', null, sub));
    head.append(svg(level), words);
    box.append(head);
  }
  const body = el('div', 'body');
  body.append(formatReply(text));
  box.append(body);

  const acts = [];
  if (level === 'emergency') {
    acts.push(['tel:112', t().call, 'phone', true], [MAPS_HOSPITAL, t().hospital, 'pin']);
  } else if (level === 'urgent') {
    acts.push([MAPS_HOSPITAL, t().hospital, 'pin']);
  } else if (level === 'see_clinic') {
    acts.push([MAPS_CLINIC, t().clinic, 'pin']);
  }
  if (acts.length) {
    const row = el('div', 'actions');
    for (const [href, label, icon, primary] of acts) {
      const a = el('a', `action${primary ? ' primary' : ''}`);
      a.href = href;
      if (href.startsWith('http')) {
        a.target = '_blank';
        a.rel = 'noopener';
      }
      a.append(svg(icon), document.createTextNode(label));
      row.append(a);
    }
    box.append(row);
  }
  chat.append(box);
  scrollDown();
}

function addTyping() {
  const box = el('div', 'msg bot');
  const dots = el('div', 'typing');
  dots.setAttribute('aria-label', '…');
  dots.append(el('span'), el('span'), el('span'));
  box.append(dots);
  chat.append(box);
  scrollDown();
  return box;
}

function renderStatic() {
  const s = t();
  document.documentElement.lang = lang === 'pcm' ? 'en' : lang;
  $('tagline').textContent = s.tagline;
  $('notice').innerHTML = s.notice; // static, trusted strings
  $('welcomeTitle').textContent = s.welcomeTitle;
  $('welcomeBody').textContent = s.welcomeBody;
  $('chipsLabel').textContent = s.chipsLabel;
  $('restartLabel').textContent = s.restart;
  restartBtn.title = s.restart;
  $('foot').textContent = s.foot;
  input.placeholder = s.placeholder;

  $('steps').replaceChildren(
    ...LEGEND.map((lv) => {
      const li = el('li');
      const dot = el('span', 'dot');
      dot.style.background = LEGEND_COLOR[lv];
      const [label, sub] = s.levels[lv];
      const txt = el('span');
      txt.append(el('strong', null, label), document.createTextNode(` · ${sub}`));
      li.append(dot, txt);
      return li;
    }),
  );
  $('chips').replaceChildren(
    ...s.chips.map((c) => {
      const b = el('button', null, c);
      b.type = 'button';
      b.onclick = () => submit(c);
      return b;
    }),
  );
}

function autosize() {
  input.style.height = 'auto';
  input.style.height = `${Math.min(input.scrollHeight, 140)}px`;
}

async function submit(text) {
  text = text.trim();
  if (!text || busy) return;
  busy = true;
  send.disabled = true;
  welcome.hidden = true;
  restartBtn.hidden = false;
  addUser(text);
  history.push({ role: 'user', content: text });
  input.value = '';
  autosize();
  const typing = addTyping();
  try {
    const res = await fetch('/api/triage', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ messages: history, lang }),
    });
    const data = await res.json();
    if (!data.reply) throw new Error(data.error || 'bad response');
    typing.remove();
    addBot(data.reply, data.level);
    history.push({ role: 'assistant', content: data.reply });
  } catch {
    typing.remove();
    const err = el('div', 'msg bot error');
    err.append(el('div', 'body', t().error));
    chat.append(err);
    scrollDown();
    history.pop();
    input.value = text; // let the user resend
    autosize();
  } finally {
    busy = false;
    send.disabled = false;
    input.focus();
  }
}

function restart() {
  history = [];
  chat.replaceChildren(welcome);
  welcome.hidden = false;
  restartBtn.hidden = true;
  input.value = '';
  autosize();
  input.focus();
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  submit(input.value);
});
input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) {
    e.preventDefault();
    submit(input.value);
  }
});
input.addEventListener('input', autosize);
restartBtn.addEventListener('click', restart);
langSel.addEventListener('change', () => {
  lang = langSel.value;
  try {
    localStorage.setItem('lang', lang);
  } catch {
    /* ignore */
  }
  renderStatic();
});

renderStatic();
