// Deterministic red-flag detection. Runs BEFORE any AI call and can never be
// downgraded by the model. Keyword lists cover English, Nigerian Pidgin,
// Yoruba and Hausa. The Yoruba/Hausa lists are a starting point and should be
// reviewed by native speakers before real-world use.

export function normalize(text) {
  return String(text)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // strip tone marks / diacritics
    .replace(/[^a-z0-9\s']/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const RULES = [
  {
    id: 'chest_pain',
    any: ['chest pain', 'chest dey pain', 'chest dey hurt', 'pain in my chest', 'chest is paining', 'aya n dun', 'aya mi n dun', 'ciwon kirji', 'kirjina yana ciwo'],
  },
  {
    id: 'breathing',
    any: ["can't breathe", 'cant breathe', 'cannot breathe', 'difficulty breathing', 'hard to breathe', 'struggling to breathe', 'no fit breathe', 'breath no dey come', 'wahalar numfashi', 'ba na iya numfashi'],
  },
  {
    id: 'severe_bleeding',
    any: ['heavy bleeding', 'bleeding wont stop', "bleeding won't stop", 'bleeding wey no stop', 'blood no dey stop', 'bleeding too much', 'zubar da jini mai yawa', 'jini ba ya tsayawa', 'eje n san ko duro'],
  },
  {
    id: 'seizure',
    any: ['seizure', 'convulsion', 'convulsing', 'dey shake body', 'body dey shake', 'farfadiya', 'ijagba'],
  },
  {
    id: 'unconscious',
    any: ['unconscious', 'passed out', 'pass out', 'not waking up', 'no wake up', 'wont wake up', "won't wake up", 'ti daku', 'ya suma', 'ta suma', 'ode ti daku'],
  },
  {
    id: 'stroke',
    any: ['face drooping', 'face is drooping', 'slurred speech', 'cant move one side', "can't move one side", 'one side of my body', 'mouth don twist', 'face don twist'],
  },
  {
    id: 'self_harm',
    any: ['kill myself', 'suicide', 'suicidal', 'end my life', 'want to die', 'wan die', 'dey think of dying', 'kashe kaina', 'ina son mutuwa', 'pa ara mi'],
  },
  {
    id: 'poisoning',
    any: ['swallowed poison', 'drank poison', 'drink poison', 'swallow sniper', 'drank sniper', 'drank kerosene', 'swallowed kerosene', 'poisoned', 'ya sha guba'],
  },
  {
    id: 'snakebite',
    any: ['snake bite', 'snakebite', 'snake bit', 'snake don bite', 'maciji ya cije', 'ejo buje'],
  },
  {
    id: 'allergic_reaction',
    any: ['throat swelling', 'throat is swelling', 'face swelling and', 'tongue swelling', 'lips swelling and'],
  },
  {
    // combination rules: every group must match at least one term
    id: 'pregnancy_danger',
    all: [
      ['pregnant', 'pregnancy', 'dey carry belle', 'carry belle', 'mai ciki', 'aboyun', 'loyun'],
      ['bleeding', 'blood', 'severe pain', 'strong pain', 'fits', 'seizure', 'jini', 'eje', 'swollen face', 'blurry vision'],
    ],
  },
  {
    id: 'infant_danger',
    all: [
      ['baby', 'infant', 'newborn', 'pikin', 'jariri', 'omo tuntun'],
      ['not breathing', 'no dey breathe', 'blue lips', 'very hot', 'wont feed', "won't feed", 'no dey chop', 'convulsion', 'seizure', 'limp'],
    ],
  },
];

export function detectRedFlags(text) {
  const t = ` ${normalize(text)} `;
  const hits = [];
  // whole-word/phrase match so short terms like "eje" don't fire inside other words
  const has = (k) => t.includes(` ${normalize(k)} `);
  for (const rule of RULES) {
    const matched = rule.any ? rule.any.some(has) : rule.all.every((group) => group.some(has));
    if (matched) hits.push(rule.id);
  }
  return hits;
}

// Checks the newest user message. Earlier red flags were already escalated
// when they were sent; re-scanning them would make every later reply an
// emergency. The AI still sees the full history and is told to stay cautious.
export function detectInLatest(messages) {
  const last = [...messages].reverse().find((m) => m.role === 'user');
  return last ? detectRedFlags(last.content) : [];
}

export const EMERGENCY_NUMBER = '112';

const EMERGENCY_TEXT = {
  en: {
    head: 'This could be an emergency.',
    body: `Please get help now: call ${EMERGENCY_NUMBER} (Nigeria's emergency number) or go to the nearest hospital or emergency unit right away. If someone is with you, ask them to take you or call for you. Do not wait to see if it gets better.`,
    self_harm: `I'm really sorry you're feeling this way. You deserve support right now. Please tell someone near you, such as family, a friend or a neighbour, and stay with them. You can also call ${EMERGENCY_NUMBER} or go to the nearest hospital. If you are in immediate danger, please get help straight away.`,
  },
  pcm: {
    head: 'Dis one fit be emergency.',
    body: `Abeg make you get help now now: call ${EMERGENCY_NUMBER} or go di nearest hospital sharp sharp. If person dey near you, tell dem make dem carry you go or call for you. No wait make e come better by itself.`,
    self_harm: `I dey sorry say you dey feel dis way. You deserve help. Abeg tell person wey dey near you, like family, friend or neighbour, and no stay alone. You fit also call ${EMERGENCY_NUMBER} or go di nearest hospital. If danger dey now, get help immediately.`,
  },
  yo: {
    head: 'Eyi le je pajawiri.',
    body: `Jowo wa iranlowo ni kiakia: pe ${EMERGENCY_NUMBER} tabi lo si ile-iwosan to sunmo julo lesekese. Ti enikan ba wa pelu re, so fun un ki o gbe e lo tabi ki o pe fun e. Ma duro de ki o san funra re.`,
    self_harm: `Mo ni ibanuje pe o n ri bayi. O ye lati gba iranlowo. Jowo so fun eniyan ti o sunmo e, bi ebi, ore tabi aladugbo, ma si dawa wa. O tun le pe ${EMERGENCY_NUMBER} tabi lo si ile-iwosan to sunmo. Ti ewu ba wa lowolowo, wa iranlowo lesekese.`,
  },
  ha: {
    head: 'Wannan na iya zama gaggawa.',
    body: `Don Allah nemi taimako yanzu: kira ${EMERGENCY_NUMBER} ko ka je asibiti mafi kusa nan da nan. Idan akwai mutum kusa da kai, ka ce ya kai ka ko ya kira maka taimako. Kada ka jira ya warke da kansa.`,
    self_harm: `Na yi bakin ciki da jin haka. Kana bukatar taimako yanzu. Don Allah ka gaya wa wani kusa da kai, kamar iyali, aboki ko makwabci, kada ka kasance kai kadai. Za ka iya kiran ${EMERGENCY_NUMBER} ko ka je asibiti mafi kusa. Idan kana cikin hadari yanzu, nemi taimako nan da nan.`,
  },
};

export function emergencyReply(flags, lang = 'en') {
  const t = EMERGENCY_TEXT[lang] || EMERGENCY_TEXT.en;
  const body = flags.includes('self_harm') ? t.self_harm : t.body;
  return {
    level: 'emergency',
    reply: flags.includes('self_harm') ? body : `${t.head} ${body}`,
    flags,
    source: 'safety-rules',
  };
}
