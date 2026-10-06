// Modo Simulado: 45 questões sorteadas na proporção da prova real, 90 minutos,
// uma questão por tela e sem feedback antes de finalizar.

import { DOMAINS, DOMAIN_ORDER, EXAM, buildExam } from './data.js';

let bank = [];
let questions = [];
let answers = {};
let flagged = new Set();
let current = 0;
let deadline = 0;
let ticker = null;

const el = {};

export function initExam(allQuestions) {
  bank = allQuestions;

  el.intro = document.getElementById('exam-intro');
  el.run = document.getElementById('exam-run');
  el.result = document.getElementById('exam-result');
  el.blueprint = document.getElementById('exam-blueprint');
  el.clock = document.getElementById('exam-clock');
  el.progress = document.getElementById('exam-progress');
  el.bar = document.getElementById('exam-bar');
  el.card = document.getElementById('exam-card');
  el.grid = document.getElementById('exam-grid');
  el.prev = document.getElementById('exam-prev');
  el.next = document.getElementById('exam-next');
  el.flag = document.getElementById('exam-flag');

  renderBlueprint();

  document.getElementById('exam-start').addEventListener('click', start);
  document.getElementById('exam-finish').addEventListener('click', confirmFinish);
  el.prev.addEventListener('click', () => go(current - 1));
  el.next.addEventListener('click', () => go(current + 1));
  el.flag.addEventListener('click', toggleFlag);
}

export function stopExamTimer() {
  if (ticker) clearInterval(ticker);
  ticker = null;
}

function renderBlueprint() {
  el.blueprint.innerHTML = DOMAIN_ORDER.map(dom => `
    <div class="bp-row">
      <span class="bp-name">${DOMAINS[dom].label}</span>
      <span class="bp-weight">${DOMAINS[dom].weight}%</span>
      <span class="bp-count">${DOMAINS[dom].examCount} questões</span>
    </div>`).join('');
}

function start() {
  questions = buildExam(bank);
  answers = {};
  flagged = new Set();
  current = 0;
  deadline = Date.now() + EXAM.minutes * 60 * 1000;

  show('run');
  buildGrid();
  renderQuestion();

  stopExamTimer();
  tick();
  ticker = setInterval(tick, 1000);
}

function tick() {
  const left = Math.max(0, deadline - Date.now());
  const mm = String(Math.floor(left / 60000)).padStart(2, '0');
  const ss = String(Math.floor((left % 60000) / 1000)).padStart(2, '0');
  el.clock.textContent = `${mm}:${ss}`;
  el.clock.classList.toggle('warn', left <= 10 * 60 * 1000 && left > 5 * 60 * 1000);
  el.clock.classList.toggle('danger', left <= 5 * 60 * 1000);

  if (left === 0) {
    stopExamTimer();
    finish(true);
  }
}

function renderQuestion() {
  const q = questions[current];
  const picked = answers[current];

  el.progress.textContent = `Questão ${current + 1} de ${questions.length}`;
  el.bar.style.width = `${((current + 1) / questions.length) * 100}%`;

  el.card.innerHTML = `
    <div class="top">
      <span class="dom">${DOMAINS[q.dom].short}</span>
      <span class="num">#${current + 1}</span>
    </div>
    <div class="stem">${q.stem}</div>
    <div class="opts">
      ${q.opts.map((text, i) => `
        <div class="opt${picked === i ? ' picked' : ''}" data-idx="${i}">
          <span class="k">${String.fromCharCode(65 + i)}</span><span>${text}</span>
        </div>`).join('')}
    </div>`;

  el.card.querySelectorAll('.opt').forEach(opt => {
    opt.addEventListener('click', () => pick(Number(opt.dataset.idx)));
  });

  el.flag.classList.toggle('on', flagged.has(current));
  el.flag.textContent = flagged.has(current) ? 'Marcada para revisão' : 'Marcar para revisão';
  el.prev.disabled = current === 0;
  el.next.disabled = current === questions.length - 1;

  updateGrid();
}

function pick(idx) {
  answers[current] = idx;
  renderQuestion();
}

function toggleFlag() {
  flagged.has(current) ? flagged.delete(current) : flagged.add(current);
  renderQuestion();
}

function go(idx) {
  if (idx < 0 || idx >= questions.length) return;
  current = idx;
  renderQuestion();
  el.card.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function buildGrid() {
  el.grid.innerHTML = questions.map((_, i) =>
    `<button class="cell" data-idx="${i}">${i + 1}</button>`).join('');
  el.grid.querySelectorAll('.cell').forEach(cell => {
    cell.addEventListener('click', () => go(Number(cell.dataset.idx)));
  });
}

function updateGrid() {
  el.grid.querySelectorAll('.cell').forEach((cell, i) => {
    cell.classList.toggle('done', answers[i] !== undefined);
    cell.classList.toggle('flag', flagged.has(i));
    cell.classList.toggle('now', i === current);
  });
}

function confirmFinish() {
  const blank = questions.length - Object.keys(answers).length;
  const msg = blank > 0
    ? `Você deixou ${blank} questão(ões) em branco. Finalizar mesmo assim?`
    : 'Finalizar e ver o resultado?';
  if (confirm(msg)) {
    stopExamTimer();
    finish(false);
  }
}

function finish(byTimeout) {
  const correct = questions.filter((q, i) => answers[i] === q.c).length;
  const score = Math.round((correct / questions.length) * 100);
  const passed = score >= EXAM.passScore;

  const usedMs = EXAM.minutes * 60 * 1000 - Math.max(0, deadline - Date.now());
  const usedMin = Math.floor(usedMs / 60000);
  const usedSec = Math.floor((usedMs % 60000) / 1000);

  const tally = {};
  questions.forEach((q, i) => {
    const row = tally[q.dom] || (tally[q.dom] = { dom: q.dom, total: 0, hits: 0 });
    row.total++;
    if (answers[i] === q.c) row.hits++;
  });
  const perDomain = DOMAIN_ORDER.map(dom => tally[dom]).filter(Boolean);

  el.result.innerHTML = `
    <div class="score ${passed ? 'pass' : 'fail'}">
      <div class="score-pct">${score}%</div>
      <div class="score-label">${passed ? 'Aprovado' : 'Reprovado'} · corte de referência ${EXAM.passScore}%</div>
      <div class="score-sub">${correct} de ${questions.length} corretas · tempo usado ${usedMin}min ${String(usedSec).padStart(2, '0')}s${byTimeout ? ' · tempo esgotado' : ''}</div>
    </div>

    <h3 class="sec">Desempenho por domínio</h3>
    <div class="dom-stats">
      ${perDomain.map(d => {
        const pct = Math.round((d.hits / d.total) * 100);
        return `
          <div class="dom-row">
            <div class="dom-head"><span>${DOMAINS[d.dom].label}</span><b>${d.hits}/${d.total}</b></div>
            <div class="dom-track"><div class="dom-fill ${pct >= EXAM.passScore ? 'ok' : 'low'}" style="width:${pct}%"></div></div>
          </div>`;
      }).join('')}
    </div>

    <h3 class="sec">Revisão das questões</h3>
    <div class="review">
      ${questions.map((q, i) => {
        const picked = answers[i];
        const hit = picked === q.c;
        return `
          <div class="q">
            <div class="top">
              <span class="dom">${DOMAINS[q.dom].short}</span>
              <span class="num">#${i + 1}</span>
            </div>
            <div class="stem">${q.stem}</div>
            <div class="opts">
              ${q.opts.map((text, oi) => {
                let cls = 'opt locked';
                if (oi === q.c) cls += ' correct';
                else if (oi === picked) cls += ' wrong';
                return `<div class="${cls}"><span class="k">${String.fromCharCode(65 + oi)}</span><span>${text}</span></div>`;
              }).join('')}
            </div>
            <div class="expl show">
              <span class="tag${hit ? '' : ' bad'}">${hit ? 'Correto' : picked === undefined ? 'Em branco' : 'Incorreto'}</span>
              <span>${q.expl}</span>
              <div class="src">${q.src}</div>
            </div>
          </div>`;
      }).join('')}
    </div>

    <div class="toolbar" style="justify-content:center;margin-top:24px">
      <button class="btn brand" id="exam-again">Novo simulado</button>
    </div>`;

  document.getElementById('exam-again').addEventListener('click', reset);
  show('result');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function reset() {
  stopExamTimer();
  show('intro');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function show(stage) {
  el.intro.classList.toggle('hidden', stage !== 'intro');
  el.run.classList.toggle('hidden', stage !== 'run');
  el.result.classList.toggle('hidden', stage !== 'result');
}
