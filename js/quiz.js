/**
 * ElectIQ – Quiz Module
 * Supports: static questions, AI-generated questions, question shuffle,
 * difficulty levels, and AI Civic Readiness Report
 */
'use strict';

const QuizModule = (() => {
  let currentQuestion = 0;
  let score = 0;
  let answered = false;
  let activeQuestions = [];
  let wrongAnswers = [];
  let currentDifficulty = 'medium';
  let isAIMode = false;
  let isGenerating = false;
  let timerInterval = null;
  let timeLeft = 0;
  const QUESTION_TIME = 30; // seconds per question

  /* ── helpers ── */
  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function shuffleWithAnswers(questions) {
    return questions.map(q => {
      const correct = q.options[q.correct];
      const shuffled = shuffle(q.options);
      return { ...q, options: shuffled, correct: shuffled.indexOf(correct) };
    });
  }

  function getProgressPct() {
    return Math.round((currentQuestion / activeQuestions.length) * 100);
  }

  function updateMeta() {
    const counter  = document.getElementById('questionCounter');
    const scoreEl  = document.getElementById('quizScoreDisplay');
    const fill     = document.getElementById('quizProgressFill');
    const bar      = fill?.closest('[role="progressbar"]');
    const modeTag  = document.getElementById('quizModeTag');

    if (counter) counter.textContent = `Question ${Math.min(currentQuestion + 1, activeQuestions.length)} of ${activeQuestions.length}`;
    if (scoreEl)  scoreEl.textContent = `Score: ${score}`;
    if (fill)     fill.style.width = getProgressPct() + '%';
    if (bar) {
      bar.setAttribute('aria-valuenow', getProgressPct());
      bar.setAttribute('aria-label', `Quiz progress: ${getProgressPct()}%`);
    }
    if (modeTag) {
      modeTag.textContent = isAIMode ? '🤖 AI-Generated' : '📚 Standard';
      modeTag.className   = `quiz-mode-tag ${isAIMode ? 'ai' : ''}`;
    }
  }

  /* ── render question ── */
  function renderQuestion(index) {
    const q = activeQuestions[index];
    const content = document.getElementById('quizContent');
    if (!content || !q) return;
    answered = false;

    const letters = ['A','B','C','D'];
    content.innerHTML = `
      <div class="quiz-timer" id="quizTimer">
        <svg class="timer-ring" viewBox="0 0 36 36">
          <circle class="timer-bg" cx="18" cy="18" r="15.9"/>
          <circle class="timer-fill" id="timerFill" cx="18" cy="18" r="15.9"
            stroke-dasharray="100, 100" stroke-dashoffset="0"/>
        </svg>
        <span class="timer-text" id="timerText">${QUESTION_TIME}</span>
      </div>
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
        ${index === activeQuestions.length - 1 ? 'See Results \ud83c\udf89' : 'Next Question \u2192'}
      </button>
    `;

    updateMeta();
    startTimer();
    bindOptionListeners(q);
  }

  /* ── timer ── */
  function startTimer() {
    stopTimer();
    timeLeft = QUESTION_TIME;
    updateTimerDisplay();
    timerInterval = setInterval(() => {
      timeLeft--;
      updateTimerDisplay();
      if (timeLeft <= 0) {
        stopTimer();
        autoTimeout();
      }
    }, 1000);
  }

  function stopTimer() {
    if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
  }

  function updateTimerDisplay() {
    const textEl = document.getElementById('timerText');
    const fillEl = document.getElementById('timerFill');
    if (textEl) textEl.textContent = timeLeft;
    if (fillEl) {
      const pct = ((QUESTION_TIME - timeLeft) / QUESTION_TIME) * 100;
      fillEl.style.strokeDashoffset = pct;
      // Color transitions: green -> yellow -> red
      if (timeLeft <= 5) fillEl.style.stroke = '#EF4444';
      else if (timeLeft <= 10) fillEl.style.stroke = '#F59E0B';
      else fillEl.style.stroke = '#10B981';
    }
  }

  function autoTimeout() {
    if (answered) return;
    answered = true;
    const q = activeQuestions[currentQuestion];
    wrongAnswers.push(q);

    const options = document.querySelectorAll('.quiz-option');
    options.forEach((b, i) => {
      b.disabled = true;
      if (i === q.correct) b.classList.add('correct');
    });

    const explanationEl = document.getElementById('quizExplanation');
    if (explanationEl) {
      explanationEl.hidden = false;
      explanationEl.className = 'quiz-explanation';
      explanationEl.innerHTML = `<strong>\u23f0 Time's up!</strong> ${q.explanation}`;
    }

    const nextBtn = document.getElementById('nextBtn');
    if (nextBtn) { nextBtn.disabled = false; nextBtn.focus(); }
    updateMeta();
  }

  function bindOptionListeners(q) {
    const options      = document.querySelectorAll('.quiz-option');
    const nextBtn      = document.getElementById('nextBtn');
    const explanationEl = document.getElementById('quizExplanation');

    options.forEach((btn, idx) => {
      btn.addEventListener('click', () => {
        if (answered) return;
        answered = true;
        stopTimer();

        const isCorrect = idx === q.correct;
        if (isCorrect) {
          score++;
        } else {
          wrongAnswers.push(q);
        }

        options.forEach((b, i) => {
          b.disabled = true;
          if (i === q.correct)              b.classList.add('correct');
          else if (i === idx && !isCorrect) b.classList.add('incorrect');
        });

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

        const lr = document.getElementById('liveRegion');
        if (lr) lr.textContent = isCorrect ? 'Correct answer!' : 'Incorrect. Check the explanation.';
        updateMeta();
      });
    });

    nextBtn?.addEventListener('click', () => {
      currentQuestion++;
      if (currentQuestion >= activeQuestions.length) renderResult();
      else renderQuestion(currentQuestion);
    });
  }

  /* ── results with AI Civic Readiness Report ── */
  async function renderResult() {
    const content = document.getElementById('quizContent');
    if (!content) return;

    const pct = Math.round((score / activeQuestions.length) * 100);
    const { emoji, message } = getResultFeedback(pct);

    const fill = document.getElementById('quizProgressFill');
    if (fill) fill.style.width = '100%';
    const bar = fill?.closest('[role="progressbar"]');
    if (bar) bar.setAttribute('aria-valuenow', '100');

    content.innerHTML = `
      <div class="quiz-result" role="status" aria-live="polite">
        <span class="quiz-result-emoji" aria-hidden="true">${emoji}</span>
        <h3>${message}</h3>
        <div class="quiz-final-score" aria-label="${score} out of ${activeQuestions.length} correct, ${pct}%">
          ${score}/${activeQuestions.length} \u2014 ${pct}%
        </div>
        <p>${getEncouragement(pct)}</p>

        <div class="quiz-result-actions">
          <button class="quiz-btn" id="restartQuiz" aria-label="Restart the quiz">\ud83d\udd04 Try Again</button>
          <button class="quiz-btn quiz-btn-ai" id="askAI" aria-label="Ask AI about election topics">\u2728 Ask AI to Explain More</button>
        </div>

        <div class="share-results-section">
          <h4 class="share-title">\ud83d\udce3 Share Your Score</h4>
          <div class="share-buttons">
            <button class="share-btn share-twitter" id="shareTwitter" aria-label="Share on Twitter">\ud83d\udc26 Twitter/X</button>
            <button class="share-btn share-whatsapp" id="shareWhatsApp" aria-label="Share on WhatsApp">\ud83d\udcac WhatsApp</button>
            <button class="share-btn share-linkedin" id="shareLinkedIn" aria-label="Share on LinkedIn">\ud83d\udcbc LinkedIn</button>
            <button class="share-btn share-copy" id="shareCopy" aria-label="Copy share link">\ud83d\udccb Copy</button>
          </div>
        </div>

        <div class="civic-report-section" id="civicReportSection">
          <button class="quiz-btn quiz-btn-report" id="generateReportBtn" aria-label="Generate your personalized civic readiness report">
            \ud83e\udde0 Generate My Civic Readiness Report
          </button>
          <div class="civic-report-output" id="civicReportOutput" hidden></div>
        </div>
      </div>
    `;

    document.getElementById('restartQuiz')?.addEventListener('click', restart);
    bindShareButtons(score, activeQuestions.length, pct);

    document.getElementById('askAI')?.addEventListener('click', () => {
      scrollToSection('assistant');
      setTimeout(() => {
        const input = document.getElementById('chatInput');
        if (input) {
          input.value = `I scored ${score}/${activeQuestions.length} on the election quiz. Can you help me better understand the topics I might have missed?`;
          input.dispatchEvent(new Event('input'));
          input.focus();
        }
      }, 600);
    });

    document.getElementById('generateReportBtn')?.addEventListener('click', generateReport);
  }

  async function generateReport() {
    if (!GeminiService.hasApiKey()) {
      showToast('Enter your Gemini API key to generate a personalized report!', 'error');
      return;
    }

    const btn    = document.getElementById('generateReportBtn');
    const output = document.getElementById('civicReportOutput');
    if (!btn || !output) return;

    btn.disabled     = true;
    btn.textContent  = '⏳ Generating your report...';
    output.hidden    = false;
    output.innerHTML = '<div class="report-streaming"><span class="report-cursor">|</span></div>';

    let accumulated = '';
    const streamEl  = output.querySelector('.report-streaming');

    try {
      await GeminiService.generateCivicReport(
        score,
        activeQuestions.length,
        wrongAnswers,
        (token) => {
          accumulated += token;
          // Format inline as it streams
          streamEl.innerHTML = formatReportText(accumulated) + '<span class="report-cursor">|</span>';
          output.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      );
      streamEl.innerHTML = formatReportText(accumulated);
      btn.textContent = '✅ Report Generated!';
    } catch (err) {
      output.innerHTML = `<p style="color:var(--danger)">${GeminiService.getErrorMessage(err)}</p>`;
      btn.textContent = '🧠 Try Again';
      btn.disabled = false;
    }
  }

  function formatReportText(text) {
    // Simple markdown to HTML for the report
    return text
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/^#{1,3} (.+)$/gm, '<h4>$1</h4>')
      .replace(/\n/g, '<br>');
  }

  /* ── AI quiz generation ── */
  async function generateAIQuiz() {
    if (!GeminiService.hasApiKey()) {
      showToast('Enter your Gemini API key to generate AI-powered questions!', 'error');
      return;
    }

    const topicInput = document.getElementById('aiQuizTopic');
    const topic = topicInput ? topicInput.value.trim() : 'general election process';
    if (!topic) { showToast('Enter a topic for the quiz!', 'error'); return; }

    isGenerating = true;
    const genBtn = document.getElementById('generateAIQuizBtn');
    if (genBtn) { genBtn.disabled = true; genBtn.textContent = '⏳ Generating...'; }

    try {
      const questions = await GeminiService.generateQuizQuestions(topic, currentDifficulty, 5);
      isAIMode        = true;
      activeQuestions = questions.map((q, i) => ({ ...q, id: i + 1 }));
      currentQuestion = 0;
      score           = 0;
      wrongAnswers    = [];
      answered        = false;
      renderQuestion(0);
      showToast(`AI generated ${questions.length} questions on "${topic}"!`, 'success');
    } catch (err) {
      showToast('Failed to generate questions: ' + err.message, 'error');
    } finally {
      isGenerating = false;
      if (genBtn) { genBtn.disabled = false; genBtn.textContent = '🤖 Generate AI Quiz'; }
    }
  }

  /* ── feedback helpers ── */
  function getResultFeedback(pct) {
    if (pct >= 90) return { emoji: '🏆', message: 'Outstanding! Civic Champion!' };
    if (pct >= 75) return { emoji: '🎯', message: 'Great Job! Well Informed Voter!' };
    if (pct >= 50) return { emoji: '📚', message: 'Good Effort! Keep Learning!' };
    return          { emoji: '🌱', message: 'Keep Going! Democracy Needs You!' };
  }

  function getEncouragement(pct) {
    if (pct >= 90) return 'You\'re an election expert! Share your knowledge with others.';
    if (pct >= 75) return 'You have a solid understanding of the election process!';
    if (pct >= 50) return 'Keep exploring — use the AI assistant to learn more!';
    return          'Don\'t worry! Use our AI assistant to get personalized explanations.';
  }

  /* ── restart ── */
  function restart() {
    currentQuestion  = 0;
    score            = 0;
    answered         = false;
    wrongAnswers     = [];
    stopTimer();
    if (isAIMode) {
      activeQuestions = shuffleWithAnswers(activeQuestions);
    } else {
      activeQuestions = shuffleWithAnswers([...ELECTION_DATA.quizQuestions]);
    }
    renderQuestion(0);
  }

  /* ── share ── */
  function bindShareButtons(sc, total, pct) {
    const shareText = `I scored ${sc}/${total} (${pct}%) on ElectIQ's Civic Knowledge Quiz! \ud83d\uddf3\ufe0f Test your election knowledge: `;
    const shareUrl  = window.location.href;

    document.getElementById('shareTwitter')?.addEventListener('click', () => {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
    });
    document.getElementById('shareWhatsApp')?.addEventListener('click', () => {
      window.open(`https://wa.me/?text=${encodeURIComponent(shareText + shareUrl)}`, '_blank');
    });
    document.getElementById('shareLinkedIn')?.addEventListener('click', () => {
      window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank');
    });
    document.getElementById('shareCopy')?.addEventListener('click', () => {
      navigator.clipboard.writeText(shareText + shareUrl).then(() => {
        const btn = document.getElementById('shareCopy');
        if (btn) { btn.textContent = '\u2705 Copied!'; setTimeout(() => { btn.textContent = '\ud83d\udccb Copy'; }, 2000); }
      });
    });
  }

  /* ── init ── */
  function init() {
    // Shuffle static questions on load
    activeQuestions = shuffleWithAnswers([...ELECTION_DATA.quizQuestions]);
    renderQuestion(0);

    // Wire up AI quiz controls
    const diffBtns = document.querySelectorAll('.difficulty-btn');
    diffBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        diffBtns.forEach(b => { b.classList.remove('active'); b.setAttribute('aria-pressed', 'false'); });
        btn.classList.add('active');
        btn.setAttribute('aria-pressed', 'true');
        currentDifficulty = btn.getAttribute('data-difficulty');
      });
    });

    document.getElementById('generateAIQuizBtn')?.addEventListener('click', generateAIQuiz);

    document.getElementById('resetToStandardBtn')?.addEventListener('click', () => {
      isAIMode        = false;
      activeQuestions = shuffleWithAnswers([...ELECTION_DATA.quizQuestions]);
      currentQuestion = 0;
      score           = 0;
      wrongAnswers    = [];
      answered        = false;
      renderQuestion(0);
      showToast('Reset to standard quiz', 'info');
    });
  }

  return { init, restart };
})();

window.QuizModule = QuizModule;
