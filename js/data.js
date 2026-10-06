// Catálogo de domínios e blueprint oficial do exame.
// Pesos conforme o exam guide do Databricks Certified Data Analyst Associate.
// examCount = 45 questões distribuídas pelo método de maior resto (soma exata 45).

export const DOMAINS = {
  plat: { label: 'Understanding of Databricks Data + AI Platform', short: 'Plataforma', weight: 11, examCount: 5 },
  mng: { label: 'Managing Data', short: 'Gerenciar dados', weight: 8, examCount: 4 },
  imp: { label: 'Importing Data', short: 'Importar dados', weight: 5, examCount: 2 },
  sql: { label: 'Executing queries using Databricks SQL and SQL Warehouses', short: 'Databricks SQL', weight: 20, examCount: 9 },
  anl: { label: 'Analyzing Queries', short: 'Analisar queries', weight: 15, examCount: 7 },
  viz: { label: 'Creating Dashboards and Visualizations in Databricks', short: 'Dashboards', weight: 16, examCount: 7 },
  gen: { label: 'Developing, Sharing, and Maintaining AI/BI Genie spaces', short: 'Genie', weight: 12, examCount: 5 },
  mdl: { label: 'Data Modeling with Databricks SQL', short: 'Modelagem', weight: 5, examCount: 2 },
  sec: { label: 'Securing Data', short: 'Segurança', weight: 8, examCount: 4 }
};

export const DOMAIN_ORDER = ['plat', 'mng', 'imp', 'sql', 'anl', 'viz', 'gen', 'mdl', 'sec'];

export const EXAM = {
  questions: 45,
  minutes: 90,
  passScore: 70
};

let cache = null;

// O banco é gerado com a alternativa correta sempre na posição A. Embaralhar na
// carga tira esse viés sem depender de como o JSON foi escrito — vale também
// para questões adicionadas depois. O resultado fica em cache, então a ordem só
// muda quando a página é recarregada, nunca no meio de uma questão.
function shuffleOptions(q) {
  if (!Array.isArray(q.opts) || !Number.isInteger(q.c) || q.c < 0 || q.c >= q.opts.length) {
    return q;
  }
  const mixed = shuffle(q.opts.map((text, i) => ({ text, correct: i === q.c })));
  return {
    ...q,
    opts: mixed.map(o => o.text),
    c: mixed.findIndex(o => o.correct)
  };
}

export async function loadQuestions() {
  if (cache) return cache;
  const response = await fetch('./data/questions.json');
  if (!response.ok) throw new Error(`Falha ao carregar questões (HTTP ${response.status})`);
  const raw = await response.json();
  cache = raw.map((q, id) => shuffleOptions({ ...q, id }));
  return cache;
}

export function countByDomain(questions) {
  return questions.reduce((acc, q) => {
    acc[q.dom] = (acc[q.dom] || 0) + 1;
    return acc;
  }, {});
}

export function shuffle(list) {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

// Sorteia um simulado respeitando a proporção de domínios da prova real.
// Se algum domínio não tiver questões suficientes, completa com as demais.
export function buildExam(questions) {
  const picked = [];
  const used = new Set();

  for (const dom of DOMAIN_ORDER) {
    const pool = shuffle(questions.filter(q => q.dom === dom));
    const take = pool.slice(0, DOMAINS[dom].examCount);
    take.forEach(q => used.add(q.id));
    picked.push(...take);
  }

  if (picked.length < EXAM.questions) {
    const filler = shuffle(questions.filter(q => !used.has(q.id)));
    picked.push(...filler.slice(0, EXAM.questions - picked.length));
  }

  return shuffle(picked).slice(0, EXAM.questions);
}
