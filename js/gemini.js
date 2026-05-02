/**
 * ElectIQ – Gemini API Integration
 * Advanced: Streaming, Vision (multimodal), AI Quiz Gen, Civic Report
 */

'use strict';

const GeminiService = (() => {
  const API_BASE        = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash';
  const STREAM_ENDPOINT = `${API_BASE}:streamGenerateContent?alt=sse`;
  const SYNC_ENDPOINT   = `${API_BASE}:generateContent`;
  const MAX_RETRIES     = 3;
  const TIMEOUT_MS      = 45000;
  const RATE_LIMIT_DELAY_MS = 2000;

  // ─── SYSTEM PROMPT ─────────────────────────────────────────────────────────
  // Advanced prompt engineering: persona + chain-of-thought + few-shot + schema
  const SYSTEM_PROMPT = `You are ElectIQ, an expert Election Process Education Assistant powered by Google Gemini.
Your mission: make democracy understandable to every citizen — especially first-time voters, students, and people who feel excluded from civic life.

## PERSONA
- Name: ElectIQ
- Tone: Warm, encouraging, and authoritative — like a brilliant civics teacher who never makes you feel stupid
- Voice: Conversational but precise. Use "you" to address the user directly.
- Never: partisan, preachy, or condescending

## CHAIN-OF-THOUGHT INSTRUCTIONS
Before answering, internally think:
1. What is the user's core question?
2. What level of civic knowledge do they likely have?
3. What real-world example from ANY country best illustrates this?
4. What follow-up question would deepen their understanding?

## STRICT GUIDELINES
1. SCOPE: Answer ONLY election-related topics — voting, electoral systems, voter registration, timelines, civic rights, democratic institutions, political science, constitutions, and referendums.
2. REDIRECT: If asked off-topic, say: "That's outside my expertise! I specialize in elections and democracy. Here's something related you might find interesting: [pivot to relevant election topic]"
3. BALANCE: Strictly non-partisan. Never favor any party, candidate, or political ideology from any country.
4. ACCESSIBILITY: Write for a Grade 8 reading level. Define jargon immediately when used.
5. GLOBAL: Draw examples from multiple countries (India, USA, UK, Germany, Japan, Brazil, etc.) when relevant.
6. EVIDENCE: Be factually accurate. If uncertain, say "I believe..." and recommend verifying with official sources.
7. ENCOURAGE: Always end with a specific, curious follow-up question to deepen learning.
8. CONCISE: Aim for 150–250 words per response unless the user asks for more detail.

## OUTPUT FORMAT (always follow this structure)
[Direct answer in 1–2 sentences]

**Key Points:**
• [Point 1]
• [Point 2]
• [Point 3 if needed]

**Real-World Example:** [Specific example from a named country]

💡 *[Encouraging follow-up question to deepen learning]*

## FEW-SHOT EXAMPLES

User: "What is gerrymandering?"
ElectIQ: Gerrymandering is the manipulation of electoral district boundaries to give one political party an unfair advantage over others.

**Key Points:**
• District lines are redrawn to "pack" opposition voters into one district or "crack" them across many
• The term comes from Massachusetts Governor Elbridge Gerry (1812), whose oddly-shaped district resembled a salamander
• It's controversial because it can dilute the voting power of minority communities

**Real-World Example:** In the United States, after each 10-year census, state legislatures redraw congressional districts — creating ongoing gerrymandering debates in states like North Carolina and Wisconsin.

💡 *Do you know which countries have independent commissions to prevent gerrymandering? The answer might surprise you!*

---

User: "How do I register to vote?"
ElectIQ: Voter registration is the process of officially adding your name to the electoral roll so you're eligible to vote on Election Day.

**Key Points:**
• Requirements typically include: proof of citizenship, age 18+, and residential address
• You can usually register online, by mail, or in person at government offices
• Deadlines vary — some countries have automatic registration for citizens

**Real-World Example:** In India, citizens register through the National Voter Service Portal (voters.eci.gov.in). In the USA, registration deadlines vary by state — some allow same-day registration, others cut off 30 days before the election.

💡 *Did you know some countries like Australia make voting MANDATORY? What do you think — should voting be compulsory?*`;

  let conversationHistory = [];

  // ─── API KEY ────────────────────────────────────────────────────────────────
  function getApiKey() {
    return sessionStorage.getItem('electiq_api_key') || localStorage.getItem('electiq_api_key_saved') || '';
  }
  function saveApiKey(key, persist = false) {
    const sanitized = key.trim();
    if (!sanitized) throw new Error('API key cannot be empty');
    if (sanitized.length < 20) throw new Error('Invalid API key format');
    sessionStorage.setItem('electiq_api_key', sanitized);
    if (persist) localStorage.setItem('electiq_api_key_saved', sanitized);
    return true;
  }
  function clearApiKey() {
    sessionStorage.removeItem('electiq_api_key');
    localStorage.removeItem('electiq_api_key_saved');
    conversationHistory = [];
  }
  function hasApiKey() { return Boolean(getApiKey()); }

  // ─── REQUEST BUILDER ────────────────────────────────────────────────────────
  function buildRequestBody(userMessage, imagePart = null) {
    const parts = [{ text: userMessage }];
    if (imagePart) parts.unshift(imagePart);

    // Stage the user message (will be committed on success)
    const userEntry = { role: 'user', parts };
    const stagedHistory = [...conversationHistory, userEntry].slice(-20);

    return {
      userEntry,
      body: {
        system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: stagedHistory,
        generationConfig: {
          temperature: 0.7, topK: 40, topP: 0.95,
          maxOutputTokens: 1024, candidateCount: 1
        },
        safetySettings: [
          { category: 'HARM_CATEGORY_HARASSMENT',        threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_HATE_SPEECH',       threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' }
        ]
      }
    };
  }

  // ─── STREAMING SEND ─────────────────────────────────────────────────────────
  /**
   * Stream a message from Gemini — calls onChunk(text) for each token.
   * @param {string} userMessage
   * @param {function} onChunk - called with each partial text chunk
   * @param {object|null} imagePart - optional Gemini image part
   * @returns {Promise<string>} full response text
   */
  async function sendMessageStream(userMessage, onChunk, imagePart = null) {
    const apiKey = getApiKey();
    if (!apiKey) throw new Error('NO_API_KEY');

    const sanitizedMsg = userMessage.trim().slice(0, 2000);
    if (!sanitizedMsg) throw new Error('Message cannot be empty');

    const url = `${STREAM_ENDPOINT}&key=${encodeURIComponent(apiKey)}`;
    const { userEntry, body } = buildRequestBody(sanitizedMsg, imagePart);

    let lastError;
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        if (attempt > 0) {
          const isRateLimit = lastError?.message === 'RATE_LIMIT';
          const delay = isRateLimit ? RATE_LIMIT_DELAY_MS * Math.pow(2, attempt - 1) : 1000 * attempt;
          const statusMsg = isRateLimit
            ? `⏳ Rate limited — retrying in ${delay / 1000}s... (${attempt}/${MAX_RETRIES})`
            : `🔄 Retrying...`;
          window.dispatchEvent(new CustomEvent('gemini:status', { detail: { message: statusMsg } }));
          await new Promise(r => setTimeout(r, delay));
        }

        const controller = new AbortController();
        const timeoutId  = setTimeout(() => controller.abort(), TIMEOUT_MS);

        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          const errMsg  = errData?.error?.message || `HTTP ${response.status}`;
          if (response.status === 400) throw new Error(`Invalid request: ${errMsg}`);
          if (response.status === 401 || response.status === 403) throw new Error('INVALID_KEY');
          if (response.status === 429) { lastError = new Error('RATE_LIMIT'); continue; }
          if (response.status >= 500)  { lastError = new Error(`Server error: ${errMsg}`); continue; }
          throw new Error(errMsg);
        }

        // Read SSE stream
        const reader  = response.body.getReader();
        const decoder = new TextDecoder();
        let fullText  = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          for (const line of chunk.split('\n')) {
            if (!line.startsWith('data: ')) continue;
            const jsonStr = line.slice(6).trim();
            if (jsonStr === '[DONE]') continue;
            try {
              const parsed = JSON.parse(jsonStr);
              const token  = parsed?.candidates?.[0]?.content?.parts?.[0]?.text;
              if (token) {
                fullText += token;
                onChunk(token);
              }
              const finishReason = parsed?.candidates?.[0]?.finishReason;
              if (finishReason === 'SAFETY') throw new Error('SAFETY_FILTER');
            } catch (parseErr) {
              if (parseErr.message === 'SAFETY_FILTER') throw parseErr;
            }
          }
        }

        if (!fullText) throw new Error('Empty response from AI');

        // SUCCESS: commit to conversation history
        conversationHistory.push(userEntry);
        conversationHistory.push({ role: 'model', parts: [{ text: fullText }] });
        return fullText;

      } catch (err) {
        if (err.name === 'AbortError') throw new Error('TIMEOUT');
        if (['NO_API_KEY','INVALID_KEY','SAFETY_FILTER','TIMEOUT'].includes(err.message)) throw err;
        if (err.message.startsWith('Invalid request') || err.message.startsWith('Empty response')) throw err;
        lastError = err;
      }
    }
    // ALL retries failed — do NOT commit to history
    if (lastError?.message === 'RATE_LIMIT') throw new Error('RATE_LIMIT');
    throw lastError || new Error('Failed after retries');
  }

  // ─── SYNC SEND (for structured JSON outputs) ────────────────────────────────
  async function sendSync(body, apiKey) {
    const url = `${SYNC_ENDPOINT}?key=${encodeURIComponent(apiKey)}`;
    const controller = new AbortController();
    const timeoutId  = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData?.error?.message || `HTTP ${response.status}`);
      }
      return response.json();
    } finally {
      clearTimeout(timeoutId);
    }
  }

  // ─── AI QUIZ GENERATION ─────────────────────────────────────────────────────
  /**
   * Generate quiz questions via Gemini using structured JSON output.
   * @param {string} topic - e.g. "voter registration", "electoral college"
   * @param {'easy'|'medium'|'hard'} difficulty
   * @param {number} count
   * @returns {Promise<Array>} array of quiz question objects
   */
  async function generateQuizQuestions(topic, difficulty = 'medium', count = 5) {
    const apiKey = getApiKey();
    if (!apiKey) throw new Error('NO_API_KEY');

    const prompt = `Generate ${count} multiple-choice quiz questions about "${topic}" in the context of elections, voting, and democracy.

REQUIREMENTS:
- Difficulty level: ${difficulty}
- Each question must be factually accurate and educational
- Options should be plausible but clearly distinct
- Explanations should be 1-2 sentences, educational and engaging
- Focus on civic knowledge that helps citizens participate better

Return ONLY valid JSON in this exact format (no markdown, no extra text):
[
  {
    "id": 1,
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correct": 0,
    "explanation": "Why this answer is correct and why it matters for democracy."
  }
]

"correct" is the 0-based index of the correct option in the "options" array.`;

    const body = {
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.8, topK: 40, topP: 0.95,
        maxOutputTokens: 2048, candidateCount: 1,
        responseMimeType: 'application/json'
      }
    };

    const data = await sendSync(body, apiKey);
    const raw  = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!raw) throw new Error('No questions generated');

    // Parse JSON — strip markdown fences if present
    const jsonStr = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const questions = JSON.parse(jsonStr);

    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error('Invalid quiz format returned');
    }
    return questions;
  }

  // ─── GEMINI VISION (Ballot Analyzer) ────────────────────────────────────────
  /**
   * Analyze an image (ballot, voter card, election notice) with Gemini Vision.
   * @param {string} base64Data - base64 encoded image data
   * @param {string} mimeType - e.g. 'image/jpeg', 'image/png'
   * @param {function} onChunk - streaming callback
   * @returns {Promise<string>}
   */
  async function analyzeImage(base64Data, mimeType, onChunk) {
    const prompt = `You are analyzing an election-related document (ballot, voter ID, election notice, voting machine, etc.) for a civic education app.

Please:
1. Identify what type of document/image this is
2. Explain all key elements visible in plain, simple language
3. If it's a ballot — explain what each section means and how to fill it
4. If it's a voter ID / registration — explain what information is shown and why it matters
5. If it's a polling booth / election notice — explain the process it describes
6. Highlight anything a first-time voter should pay special attention to
7. End with one encouraging tip for the voter

If the image is NOT election-related, politely say so and explain what the image appears to show.

Be warm, educational, and make the user feel confident about the voting process.`;

    const imagePart = {
      inlineData: { mimeType, data: base64Data }
    };

    return sendMessageStream(prompt, onChunk, imagePart);
  }

  // ─── CIVIC READINESS REPORT ─────────────────────────────────────────────────
  /**
   * Generate a personalized civic readiness analysis after the quiz.
   * @param {number} score
   * @param {number} total
   * @param {Array} wrongQuestions - array of question objects the user got wrong
   * @param {function} onChunk - streaming callback
   * @returns {Promise<string>}
   */
  async function generateCivicReport(score, total, wrongQuestions, onChunk) {
    const pct = Math.round((score / total) * 100);
    const wrongTopics = wrongQuestions.map(q => q.question.slice(0, 80)).join('; ');

    const prompt = `A user just completed the ElectIQ civic knowledge quiz and scored ${score} out of ${total} (${pct}%).

${wrongQuestions.length > 0 ? `They answered these questions incorrectly: ${wrongTopics}` : 'They answered ALL questions correctly!'}

Generate a personalized "Civic Readiness Report" that:
1. Opens with a warm, encouraging assessment of their score (2 sentences)
2. Identifies their 2–3 knowledge gap areas based on the wrong answers (or celebrates mastery if perfect)
3. Gives a specific 3-step Learning Path with concrete actions they can take
4. Suggests 3 specific questions they can ask ElectIQ's AI chat to deepen their understanding
5. Closes with an inspiring statement about civic participation

Format it clearly with emoji, bold headings, and bullet points. Make it feel like a personal letter from a civic mentor, not a generic report. Keep it under 300 words.`;

    // Reuse the full streaming pipeline (gets retries + rate limit handling for free)
    const result = await sendMessageStream(prompt, onChunk);

    // Remove the report Q&A from conversation history so it doesn't pollute chat
    // (sendMessageStream committed them on success)
    conversationHistory.splice(-2, 2);

    return result;
  }

  // ─── ERROR MESSAGES ──────────────────────────────────────────────────────────
  function getErrorMessage(error) {
    const map = {
      'NO_API_KEY':    '🔑 Please enter your Gemini API key in the sidebar to enable AI responses.',
      'INVALID_KEY':   '❌ Invalid API key. Please check your key at Google AI Studio and try again.',
      'RATE_LIMIT':    '⏳ Rate limit reached — retried automatically. Your key may have hit its daily quota. Get a free key at Google AI Studio.',
      'SAFETY_FILTER': '🛡️ This message was flagged by safety filters. Please rephrase your question.',
      'TIMEOUT':       '⌛ The request timed out. Please check your internet connection and try again.'
    };
    return map[error.message] || `⚠️ Something went wrong: ${error.message}. Please try again.`;
  }

  function clearHistory() { conversationHistory = []; }
  function getHistory()   { return [...conversationHistory]; }

  // Public API
  return {
    sendMessageStream,
    generateQuizQuestions,
    analyzeImage,
    generateCivicReport,
    saveApiKey,
    clearApiKey,
    hasApiKey,
    getApiKey,
    getErrorMessage,
    clearHistory,
    getHistory
  };
})();

window.GeminiService = GeminiService;
