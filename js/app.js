import { loadQuestions } from './data.js';
import { initPractice } from './practice.js';
import { initExam, stopExamTimer } from './exam.js';

async function main() {
  let questions;
  try {
    questions = await loadQuestions();
  } catch (err) {
    document.getElementById('quiz').innerHTML =
      `<div class="empty">Erro ao carregar <code>data/questions.json</code>.<br>${err.message}</div>`;
    return;
  }

  document.getElementById('total-count').textContent = questions.length;

  initPractice(questions);
  initExam(questions);
  setupModeSwitch();
}

function setupModeSwitch() {
  const tabs = document.querySelectorAll('.tab');
  const panes = {
    practice: document.getElementById('practice'),
    exam: document.getElementById('exam')
  };

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const mode = tab.dataset.mode;
      if (tab.classList.contains('on')) return;

      // Sair do simulado interrompe o cronômetro em andamento.
      if (mode !== 'exam') stopExamTimer();

      tabs.forEach(t => t.classList.toggle('on', t === tab));
      Object.entries(panes).forEach(([key, pane]) => {
        pane.classList.toggle('hidden', key !== mode);
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });
}

main();
