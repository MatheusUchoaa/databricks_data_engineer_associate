// Modo Exercícios: todas as questões na página, feedback imediato ao responder.

import { DOMAINS, DOMAIN_ORDER, countByDomain, shuffle } from './data.js';

let allQuestions = [];
let visible = [];
let answers = {};
let activeFilters = new Set();

const el = {};

export function initPractice(questions) {
  allQuestions = questions;
  visible = [...questions];

  el.root = document.getElementById('practice');
  el.filters = document.getElementById('filters');
  el.quiz = document.getElementById('quiz');
  el.empty = document.getElementById('empty');
  el.filterLabel = document.getElementById('filterlabel');
  el.stats = {
    total: document.getElementById('s-total'),
    answered: document.getElementById('s-ans'),
    ok: document.getElementById('s-ok'),
    bad: document.getElementById('s-bad'),
    pct: document.getElementById('s-pct')
  };

  buildFilters();
  document.getElementById('btn-shuffle').addEventListener('click', shuffleQuestions);
  document.getElementById('btn-reveal').addEventListener('click', revealAll);
  document.getElementById('btn-reset').addEventListener('click', resetAll);

  applyFilters();
}

function buildFilters() {
  const counts = countByDomain(allQuestions);
  el.filters.innerHTML = '';

  DOMAIN_ORDER.forEach(dom => {
    const chip = document.createElement('button');
    chip.className = 'chip';
    chip.dataset.dom = dom;
    chip.innerHTML = `${DOMAINS[dom].short}<span class="c">${counts[dom] || 0}</span>`;
    chip.addEventListener('click', () => {
      activeFilters.has(dom) ? activeFilters.delete(dom) : activeFilters.add(dom);
      chip.classList.toggle('on');
      applyFilters();
    });
    el.filters.appendChild(chip);
  });
}

function applyFilters() {
  visible = activeFilters.size === 0
    ? [...allQuestions]
    : allQuestions.filter(q => activeFilters.has(q.dom));

  el.filterLabel.textContent = activeFilters.size === 0
    ? ''
    : `Filtrando: ${[...activeFilters].map(d => DOMAINS[d].short).join(', ')}`;

  render();
}

function render() {
  if (visible.length === 0) {
    el.quiz.innerHTML = '';
    el.empty.style.display = 'block';
    updateStats();
    return;
  }

  el.empty.style.display = 'none';
  el.quiz.innerHTML = visible.map(questionCard).join('');

  el.quiz.querySelectorAll('.q').forEach(card => {
    const q = allQuestions[Number(card.dataset.id)];
    card.querySelectorAll('.opt').forEach((opt, idx) => {
      opt.addEventListener('click', () => answer(q, idx, card));
    });
  });

  updateStats();
}

function questionCard(q) {
  const picked = answers[q.id];
  const done = picked !== undefined;

  const opts = q.opts.map((text, i) => {
    let cls = 'opt';
    if (done) {
      cls += ' locked';
      if (i === q.c) cls += ' correct';
      else if (i === picked) cls += ' wrong';
    }
    return `<div class="${cls}"><span class="k">${String.fromCharCode(65 + i)}</span><span>${text}</span></div>`;
  }).join('');

  const correct = picked === q.c;

  return `
    <div class="q" data-id="${q.id}">
      <div class="top">
        <span class="dom">${DOMAINS[q.dom].short}</span>
        <span class="num">#${q.id + 1}</span>
      </div>
      <div class="stem">${q.stem}</div>
      <div class="opts">${opts}</div>
      <div class="expl${done ? ' show' : ''}">
        <span class="tag${correct ? '' : ' bad'}">${correct ? 'Correto' : 'Incorreto'}</span>
        <span>${q.expl}</span>
        <div class="src">${q.src}</div>
      </div>
    </div>`;
}

function answer(q, idx, card) {
  if (answers[q.id] !== undefined) return;
  answers[q.id] = idx;

  card.querySelectorAll('.opt').forEach((opt, i) => {
    opt.classList.add('locked');
    if (i === q.c) opt.classList.add('correct');
    else if (i === idx) opt.classList.add('wrong');
  });

  const correct = idx === q.c;
  const expl = card.querySelector('.expl');
  const tag = expl.querySelector('.tag');
  tag.textContent = correct ? 'Correto' : 'Incorreto';
  tag.className = correct ? 'tag' : 'tag bad';
  expl.classList.add('show');

  updateStats();
}

function updateStats() {
  const answered = visible.filter(q => answers[q.id] !== undefined);
  const ok = answered.filter(q => answers[q.id] === q.c).length;

  el.stats.total.textContent = visible.length;
  el.stats.answered.textContent = answered.length;
  el.stats.ok.textContent = ok;
  el.stats.bad.textContent = answered.length - ok;
  el.stats.pct.textContent = answered.length === 0
    ? '—'
    : `${Math.round((ok / answered.length) * 100)}%`;
}

function shuffleQuestions() {
  visible = shuffle(visible);
  render();
}

function revealAll() {
  visible.forEach(q => {
    if (answers[q.id] === undefined) answers[q.id] = -1;
  });
  render();
}

function resetAll() {
  if (!confirm('Isso vai apagar todas as respostas do modo Exercícios. Continuar?')) return;
  answers = {};
  render();
}
