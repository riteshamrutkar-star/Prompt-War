/**
 * ElectIQ – Gemini API Integration
 * Handles all communication with the Google Gemini API
 */

'use strict';

const GeminiService = (() => {
  const API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
  const MAX_RETRIES = 3;
  const TIMEOUT_MS = 30000;
  const RATE_LIMIT_DELAY_MS = 2000; // base delay for rate limit retries

  // Election-focused system prompt
  const SYSTEM_PROMPT = `You are ElectIQ, a friendly and knowledgeable Election Process Education Assistant. Your role is to help users — especially first-time voters and students — understand elections, democracy, and civic participation in a clear, unbiased, and accessible way.

GUIDELINES:
1. Focus exclusively on election-related topics: voting processes, electoral systems, voter registration, election timelines, democratic institutions, civic rights, political science concepts, and related subjects.
2. If asked about unrelated topics, politely redirect: "That's outside my expertise — I'm specialized in election education! Let me help you with anything about elections, voting, or democracy."
3. Be factual, balanced, and non-partisan. Never favor any political party, candidate, or ideology.
4. Use simple language with clear examples. Use analogies to explain complex concepts.
5. Structure responses with clear headings and bullet points when appropriate.
6. Cite real-world examples from multiple countries when relevant.
7. Encourage civic participation and responsible voting.
8. If asked about a specific country's election system, provide accurate details for that country.
9. Always end responses with a relevant follow-up question to encourage deeper learning.
10. Keep responses concise but comprehensive — aim for clarity over length.

FORMATTING:
- Use **bold** for key terms
- Use bullet points for lists
- Use numbered lists for step-by-step processes
- Keep paragraphs short (2-3 sentences max)
- Include relevant emoji occasionally to make content engaging`;

  let conversationHistory = [];

  /**
   * Get API key from session storage (not localStorage for security)
   */
  function getApiKey() {
    return sessionStorage.getItem('electiq_api_key') || '';
  }

  /**
   * Save API key to session storage
   * @param {string} key - The API key to save
   */
  function saveApiKey(key) {
    const sanitized = key.trim();
    if (!sanitized) throw new Error('API key cannot be empty');
    // Basic format validation (Gemini keys start with AIza)
    if (sanitized.length < 20) throw new Error('Invalid API key format');
    sessionStorage.setItem('electiq_api_key', sanitized);
    return true;
  }

  /**
   * Clear stored API key
   */
  function clearApiKey() {
    sessionStorage.removeItem('electiq_api_key');
    conversationHistory = [];
  }

  /**
   * Check if API key is stored
   */
  function hasApiKey() {
    return Boolean(getApiKey());
  }

  /**
   * Format message for Gemini API
   * @param {string} userMessage
   * @returns {Object} Request body
   */
  function buildRequestBody(userMessage) {
    // Add user message to history
    conversationHistory.push({
      role: 'user',
      parts: [{ text: userMessage }]
    });

    // Keep last 20 messages to avoid token limit issues
    const recentHistory = conversationHistory.slice(-20);

    return {
      system_instruction: {
        parts: [{ text: SYSTEM_PROMPT }]
      },
      contents: recentHistory,
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
        candidateCount: 1
      },
      safetySettings: [
        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' }
      ]
    };
  }

  /**
   * Make API request with timeout support
   * @param {string} url
   * @param {Object} body
   * @returns {Promise<Response>}
   */
  async function fetchWithTimeout(url, body) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: controller.signal
      });
      return response;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Send a message to Gemini API
   * @param {string} userMessage - The user's question
   * @returns {Promise<string>} - The AI response text
   */
  async function sendMessage(userMessage) {
    const apiKey = getApiKey();
    if (!apiKey) throw new Error('NO_API_KEY');

    const sanitizedMsg = userMessage.trim().slice(0, 500);
    if (!sanitizedMsg) throw new Error('Message cannot be empty');

    const url = `${API_BASE}?key=${encodeURIComponent(apiKey)}`;
    const body = buildRequestBody(sanitizedMsg);

    let lastError;
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        // For rate limit retries, use exponential backoff (2s, 4s, 8s...)
        // For other retries, use linear backoff (1s, 2s, 3s...)
        if (attempt > 0) {
          const isRateLimit = lastError && lastError.message === 'RATE_LIMIT';
          const delay = isRateLimit
            ? RATE_LIMIT_DELAY_MS * Math.pow(2, attempt - 1)
            : 1000 * attempt;

          // Notify UI about retry status
          const statusMsg = isRateLimit
            ? `⏳ Rate limited — retrying in ${delay / 1000}s... (${attempt}/${MAX_RETRIES})`
            : `🔄 Retrying...`;
          window.dispatchEvent(new CustomEvent('gemini:status', { detail: { message: statusMsg } }));

          await new Promise(r => setTimeout(r, delay));
        }

        const response = await fetchWithTimeout(url, body);

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          const errMsg = errData?.error?.message || `HTTP ${response.status}`;

          if (response.status === 400) throw new Error(`Invalid request: ${errMsg}`);
          if (response.status === 401 || response.status === 403) throw new Error('INVALID_KEY');
          if (response.status === 429) {
            // Rate limited — store as lastError and let retry loop handle it
            lastError = new Error('RATE_LIMIT');
            continue;
          }
          if (response.status >= 500) { lastError = new Error(`Server error: ${errMsg}`); continue; }
          throw new Error(errMsg);
        }

        const data = await response.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text) {
          const reason = data?.candidates?.[0]?.finishReason;
          if (reason === 'SAFETY') throw new Error('SAFETY_FILTER');
          throw new Error('Empty response from AI');
        }

        // Add assistant response to history
        conversationHistory.push({
          role: 'model',
          parts: [{ text }]
        });

        return text;

      } catch (err) {
        if (err.name === 'AbortError') throw new Error('TIMEOUT');
        // Fatal errors — don't retry
        if (['NO_API_KEY', 'INVALID_KEY', 'SAFETY_FILTER', 'TIMEOUT'].includes(err.message)) throw err;
        if (err.message.startsWith('Invalid request') || err.message.startsWith('Empty response')) throw err;
        lastError = err;
      }
    }
    // If we exhausted retries on a rate limit, show a friendlier message
    if (lastError && lastError.message === 'RATE_LIMIT') throw new Error('RATE_LIMIT');
    throw lastError || new Error('Failed after retries');
  }

  /**
   * Get user-friendly error message
   * @param {Error} error
   * @returns {string}
   */
  function getErrorMessage(error) {
    const map = {
      'NO_API_KEY': '🔑 Please enter your Gemini API key in the sidebar to enable AI responses.',
      'INVALID_KEY': '❌ Invalid API key. Please check your key at Google AI Studio and try again.',
      'RATE_LIMIT': '⏳ Rate limit reached. Already retried automatically — if this keeps happening, your API key may have hit its daily quota. Get a free key at Google AI Studio.',
      'SAFETY_FILTER': '🛡️ This message was flagged by safety filters. Please rephrase your question.',
      'TIMEOUT': '⌛ The request timed out. Please check your internet connection and try again.'
    };
    return map[error.message] || `⚠️ Something went wrong: ${error.message}. Please try again.`;
  }

  /**
   * Clear conversation history
   */
  function clearHistory() {
    conversationHistory = [];
  }

  /**
   * Get conversation history for export
   * @returns {Array}
   */
  function getHistory() {
    return [...conversationHistory];
  }

  // Public API
  return {
    sendMessage,
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
