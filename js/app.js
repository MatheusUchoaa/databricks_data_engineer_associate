let questions = [];
let currentAnswers = {};
let filteredQuestions = [];
let activeFilters = {};

const DOMAIN_LABELS = {
  dev: 'Desenvolvimento',
  gov: 'Governança',
  plat: 'Plataforma',
  proc: 'Processamento'
};

const DOMAIN_WEAK = {
  dev: false,
  gov: false,
  plat: false,
  proc: false
};

async function loadQuestions() {
  try {
    const response = await fetch('./data/questions.json');
    questions = await response.json();
    initializeApp();
  } catch (error) {
    console.error('Erro ao carregar questões:', error);
    document.getElementById('quiz').innerHTML =
      '<div class="empty">Erro ao carregar as questões. Verifique o arquivo data/questions.json</div>';
  }
}

function initializeApp() {
  buildFilters();
  applyFilters();
  renderQuestions();
  updateStats();
}

function buildFilters() {
  const filterContainer = document.getElementById('filters');
  filterContainer.innerHTML = '';

  Object.entries(DOMAIN_LABELS).forEach(([key, label]) => {
    const chip = document.createElement('button');
    chip.className = 'chip' + (DOMAIN_WEAK[key] ? ' weak' : '');
    chip.textContent = label;
    chip.onclick = () => toggleFilter(key, chip);
    filterContainer.appendChild(chip);
  });
}

function toggleFilter(domain, element) {
  activeFilters[domain] = !activeFilters[domain];
  element.classList.toggle('on');
  applyFilters();
  renderQuestions();
  updateStats();
}

function applyFilters() {
  const activeKeys = Object.keys(activeFilters).filter(k => activeFilters[k]);

  if (activeKeys.length === 0) {
    filteredQuestions = questions.map((q, idx) => ({ ...q, _id: idx }));
  } else {
    filteredQuestions = questions
      .map((q, idx) => ({ ...q, _id: idx }))
      .filter(q => activeKeys.includes(q.dom));
  }

  updateFilterLabel();
}

function updateFilterLabel() {
  const label = document.getElementById('filterlabel');
  const activeKeys = Object.keys(activeFilters).filter(k => activeFilters[k]);

  if (activeKeys.length === 0) {
    label.textContent = '';
  } else {
    const names = activeKeys.map(k => DOMAIN_LABELS[k]).join(', ');
    label.textContent = `Filtrando: ${names}`;
  }
}

function renderQuestions() {
  const quiz = document.getElementById('quiz');
  const empty = document.getElementById('empty');

  if (filteredQuestions.length === 0) {
    quiz.innerHTML = '';
    empty.style.display = 'block';
    return;
  }

  empty.style.display = 'none';
  quiz.innerHTML = filteredQuestions.map((q, idx) => renderQuestion(q, idx)).join('');

  filteredQuestions.forEach((q, idx) => {
    const el = quiz.children[idx];
    el.querySelectorAll('.opt').forEach((opt, optIdx) => {
      opt.onclick = () => selectOption(q, optIdx, opt);
    });
  });
}

function renderQuestion(q, idx) {
  const qId = q._id;
  const answered = currentAnswers[qId] !== undefined;
  const selectedIdx = currentAnswers[qId];
  const domClass = DOMAIN_WEAK[q.dom] ? 'weak' : '';

  return `
    <div class="q">
      <div class="top">
        <span class="dom ${domClass}">${q.dom}</span>
        <span class="num">#${qId + 1}</span>
      </div>
      <div class="stem">${q.stem}</div>
      <div class="opts">
        ${q.opts
          .map((opt, i) => {
            let optClass = 'opt';
            if (answered) {
              optClass += ' locked';
              if (i === q.c) optClass += ' correct';
              else if (i === selectedIdx) optClass += ' wrong';
            }
            const letter = String.fromCharCode(65 + i);
            return `<div class="${optClass}"><span class="k">${letter}</span>${opt}</div>`;
          })
          .join('')}
      </div>
      <div class="expl ${answered ? 'show' : ''}">
        <span class="tag ${selectedIdx === q.c ? '' : 'bad'}" data-debug="selectedIdx:${selectedIdx},q.c:${q.c}">
          ${selectedIdx === q.c ? 'Correto' : 'Incorreto'}
        </span>
        <div>${q.expl}</div>
        <div class="src">${q.src}</div>
      </div>
    </div>
  `;
}

function selectOption(q, optIdx, element) {
  const qId = q._id;

  if (currentAnswers[qId] !== undefined) return;

  currentAnswers[qId] = optIdx;

  element.parentNode.querySelectorAll('.opt').forEach((el, i) => {
    el.classList.add('locked');
    if (i === q.c) el.classList.add('correct');
    else if (i === optIdx) el.classList.add('wrong');
  });

  const explDiv = element.parentNode.nextElementSibling;
  const isCorrect = optIdx === q.c;
  const tagSpan = explDiv.querySelector('.tag');
  tagSpan.textContent = isCorrect ? 'Correto' : 'Incorreto';
  tagSpan.className = isCorrect ? 'tag' : 'tag bad';
  explDiv.classList.add('show');
  updateStats();
}

function updateStats() {
  const total = filteredQuestions.length;
  const answered = Object.keys(currentAnswers).filter(qId =>
    filteredQuestions.some(q => q._id == qId)
  ).length;

  const correct = Object.entries(currentAnswers).reduce((sum, [qId, optIdx]) => {
    const q = filteredQuestions.find(fq => fq._id == qId);
    return sum + (q && q.c === optIdx ? 1 : 0);
  }, 0);

  const wrong = answered - correct;
  const pct = answered === 0 ? '—' : Math.round((correct / answered) * 100) + '%';

  document.getElementById('s-total').textContent = total;
  document.getElementById('s-ans').textContent = answered;
  document.getElementById('s-ok').textContent = correct;
  document.getElementById('s-bad').textContent = wrong;
  document.getElementById('s-pct').textContent = pct;
}

function shuffleQ() {
  const shuffled = [...filteredQuestions];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  filteredQuestions = shuffled;
  renderQuestions();
}

function revealAll() {
  filteredQuestions.forEach(q => {
    const qId = q._id;
    if (currentAnswers[qId] === undefined) {
      currentAnswers[qId] = -1;
    }
  });
  renderQuestions();
  updateStats();
}

function resetAll() {
  if (confirm('Tem certeza? Isso vai resetar todas as respostas.')) {
    currentAnswers = {};
    renderQuestions();
    updateStats();
  }
}

document.addEventListener('DOMContentLoaded', loadQuestions);
