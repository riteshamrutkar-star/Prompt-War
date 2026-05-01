/**
 * ElectIQ – Quiz Module
 */
'use strict';

const QuizModule = (() => {
  let currentQuestion = 0;
  let score = 0;
  let answered = false;
  const questions = ELECTION_DATA.quizQuestions;

  function getProgressPct() {
    return Math.round((currentQuestion / questions.length) * 100);
  }

  function updateMeta() {
    const counter = document.getElementById('questionCounter');
    const scoreEl = document.getElementById('quizScoreDisplay');
    const fill = document.getElementById('quizProgressFill');
    const bar = fill?.closest('[role="progressbar"]');

    if (counter) counter.textContent = `Question ${Math.min(currentQuestion + 1, questions.length)} of ${questions.length}`;
    if (scoreEl) scoreEl.textContent = `Score: ${score}`;
    if (fill) fill.style.width = getProgressPct() + '%';
    if (bar) {
      bar.setAttribute('aria-valuenow', getProgressPct());
      bar.setAttribute('aria-label', `Quiz progress: ${getProgressPct()}%`);
    }
  }

  function renderQuestion(index) {
    const q = questions[index];
    const content = document.getElementById('quizContent');
    if (!content || !q) return;
    answered = false;

    const letters = ['A','B','C','D'];
    content.innerHTML = `
      <div class="quiz-question" id="quiz-question-${q.id}">${q.question}</div>
      <div class="quiz-options" role="group" aria-labelledby="quiz-question-${q.id}">
        ${q.options.map((opt, i) => `
          <button
            class="quiz-option"
            data-index="${i}"
            aria-label="Option ${letters[i]}: ${opt}"
          >
            <span class="option-letter" aria-hidden="true">${letters[i]}</span>
            ${opt}
          </button>
        `).join('')}
      </div>
      <div id="quizExplanation" hidden></div>
      <button class="quiz-btn" id="nextBtn" disabled aria-label="Next question">
        ${index === questions.length - 1 ? 'See Results 🎉' : 'Next Question →'}
      </button>
    `;

    updateMeta();
    bindOptionListeners(q);
  }

  function bindOptionListeners(q) {
    const options = document.querySelectorAll('.quiz-option');
    const nextBtn = document.getElementById('nextBtn');
    const explanationEl = document.getElementById('quizExplanation');

    options.forEach((btn, idx) => {
      btn.addEventListener('click', () => {
        if (answered) return;
        answered = true;

        const isCorrect = idx === q.correct;
        if (isCorrect) score++;

        // Mark options
        options.forEach((b, i) => {
          b.disabled = true;
          if (i === q.correct) b.classList.add('correct');
          else if (i === idx && !isCorrect) b.classList.add('incorrect');
        });

        // Show explanation
        if (explanationEl) {
          explanationEl.hidden = false;
          explanationEl.className = 'quiz-explanation';
          explanationEl.innerHTML = `
            <strong>${isCorrect ? '✅ Correct!' : '❌ Incorrect.'}</strong>
            ${q.explanation}
          `;
        }

        nextBtn.disabled = false;
        nextBtn.focus();

        // Announce for screen readers
        const lr = document.getElementById('liveRegion');
        if (lr) lr.textContent = isCorrect ? 'Correct answer!' : 'Incorrect. Check the explanation.';
        updateMeta();
      });
    });

    nextBtn?.addEventListener('click', () => {
      currentQuestion++;
      if (currentQuestion >= questions.length) renderResult();
      else renderQuestion(currentQuestion);
    });
  }

  function renderResult() {
    const content = document.getElementById('quizContent');
    if (!content) return;

    const pct = Math.round((score / questions.length) * 100);
    const { emoji, message } = getResultFeedback(pct);

    const fill = document.getElementById('quizProgressFill');
    if (fill) fill.style.width = '100%';
    const bar = fill?.closest('[role="progressbar"]');
    if (bar) bar.setAttribute('aria-valuenow', '100');

    content.innerHTML = `
      <div class="quiz-result" role="status" aria-live="polite">
        <span class="quiz-result-emoji" aria-hidden="true">${emoji}</span>
        <h3>${message}</h3>
        <div class="quiz-final-score" aria-label="${score} out of ${questions.length} correct, ${pct}%">
          ${score}/${questions.length} — ${pct}%
        </div>
        <p>You answered ${score} out of ${questions.length} questions correctly. ${getEncouragement(pct)}</p>
        <button class="quiz-btn" id="restartQuiz" aria-label="Restart the quiz">
          🔄 Try Again
        </button>
        <button class="quiz-btn" id="askAI" style="margin-top:.5rem;background:linear-gradient(135deg,var(--accent),#D97706)" aria-label="Ask AI assistant about election topics">
          ✨ Ask AI to Explain More
        </button>
      </div>
    `;

    document.getElementById('restartQuiz')?.addEventListener('click', restart);
    document.getElementById('askAI')?.addEventListener('click', () => {
      scrollToSection('assistant');
      setTimeout(() => {
        const input = document.getElementById('chatInput');
        if (input) {
          input.value = `I scored ${score}/${questions.length} on the election quiz. Can you help me better understand the topics I might have missed?`;
          input.dispatchEvent(new Event('input'));
          input.focus();
        }
      }, 600);
    });
  }

  function getResultFeedback(pct) {
    if (pct >= 90) return { emoji: '🏆', message: 'Outstanding! Civic Champion!' };
    if (pct >= 75) return { emoji: '🎯', message: 'Great Job! Well Informed Voter!' };
    if (pct >= 50) return { emoji: '📚', message: 'Good Effort! Keep Learning!' };
    return { emoji: '🌱', message: 'Keep Going! Democracy Needs You!' };
  }

  function getEncouragement(pct) {
    if (pct >= 90) return 'You\'re an election expert! Share your knowledge with others.';
    if (pct >= 75) return 'You have a solid understanding of the election process!';
    if (pct >= 50) return 'Keep exploring — use the AI assistant to learn more!';
    return 'Don\'t worry! Use our AI assistant to get personalized explanations.';
  }

  function restart() {
    currentQuestion = 0;
    score = 0;
    answered = false;
    renderQuestion(0);
  }

  function init() {
    renderQuestion(0);
  }

  return { init, restart };
})();

window.QuizModule = QuizModule;
