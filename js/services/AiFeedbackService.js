// js/services/AiFeedbackService.js
import { SESSION_MODES } from '../data/constants.js';

/* ============================================================
   AiFeedbackService — Proxied via /api/feedback serverless function
   The API key is stored server-side only; this service sends
   prompt data to our own backend which forwards it to GPT.
============================================================ */
const AiFeedbackService = {
  _MODEL: 'gpt-4o-mini',
  _TEMPERATURE: 0.7,

  /**
   * Build the coaching system prompt tailored to the session mode.
   */
  _buildSystemPrompt(sessionMode) {
    const modeObj = SESSION_MODES.find(m => m.id === sessionMode);
    const modeContext = modeObj
      ? 'The speaker was practicing a "' + modeObj.label + '" session (' + (modeObj.durationSeconds > 0 ? modeObj.durationSeconds + ' seconds' : 'free-form') + ').'
      : 'The speaker was practicing a pitch session.';

    return 'You are an expert public speaking and pitch coach. ' + modeContext + '\n\nAnalyze the following transcript and provide structured coaching feedback. Your evaluation must cover:\n\n## Pitch Structure\nEvaluate how well the speaker addressed each structural element:\n- **Hook**: Did the opening grab attention within the first few seconds?\n- **Problem**: Was the problem clearly articulated and relatable?\n- **Solution**: Was the solution presented clearly and compellingly?\n- **Call-to-Action (CTA)**: Was there a clear, actionable ask at the end?\n\n## Delivery Quality\nAssess:\n- **Clarity**: Was the language clear and easy to follow?\n- **Confidence**: Did the speaker sound assured and authoritative?\n- **Pacing**: Was the delivery well-paced or rushed/too slow?\n\n## Filler Words & Verbal Tics\nIdentify any filler words or verbal tics (such as "um", "uh", "like", "you know", "so", "basically", "right", "actually"). Note their frequency and impact.\n\n## Actionable Suggestions\nProvide 3 to 5 specific, actionable improvement suggestions the speaker can implement in their next practice session.\n\nFormat your response using markdown with the section headings above. Be constructive, specific, and encouraging. Reference exact phrases from the transcript when giving examples.';
  },

  /**
   * Generate coaching feedback for a transcript via /api/feedback proxy.
   */
  async generateFeedback(transcript, sessionMode) {
    if (!transcript || transcript.trim().length === 0) {
      return { success: false, error: 'No transcript to analyze.' };
    }

    const systemPrompt = this._buildSystemPrompt(sessionMode);

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this._MODEL,
          temperature: this._TEMPERATURE,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: 'Here is the transcript of my practice session:\n\n' + transcript }
          ]
        })
      });

      const data = await response.json();

      if (data.success) {
        return { success: true, feedback: data.content };
      } else if (data.statusCode === 401) {
        return { success: false, error: 'Unable to generate feedback: invalid API key.', statusCode: 401 };
      } else if (data.statusCode === 429) {
        return { success: false, error: 'Rate limit reached. Try again later.', statusCode: 429 };
      } else {
        return { success: false, error: data.error || 'Feedback unavailable.', statusCode: data.statusCode };
      }
    } catch (err) {
      return { success: false, error: 'Feedback unavailable: network error.' };
    }
  },

  /**
   * Convert basic markdown to HTML for rendering in the UI.
   */
  renderMarkdown(markdown) {
    if (!markdown) return '';
    let html = markdown
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    const lines = html.split('\n');
    let result = [];
    let inList = false;
    let listType = null;

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];

      if (line.match(/^### /)) {
        if (inList) { result.push(listType === 'ul' ? '</ul>' : '</ol>'); inList = false; }
        result.push('<h5 style="font-family: var(--font-serif); font-size: var(--text-sm); font-weight: 700; color: var(--color-studio-primary); margin-top: 1rem; margin-bottom: 0.5rem;">' + line.replace(/^### /, '') + '</h5>');
        continue;
      }
      if (line.match(/^## /)) {
        if (inList) { result.push(listType === 'ul' ? '</ul>' : '</ol>'); inList = false; }
        result.push('<h4 style="font-family: var(--font-serif); font-size: var(--text-sm); font-weight: 700; color: var(--color-studio-primary); text-transform: uppercase; letter-spacing: 0.06em; margin-top: 1.25rem; margin-bottom: 0.5rem;">' + line.replace(/^## /, '') + '</h4>');
        continue;
      }

      if (line.match(/^[-*] /)) {
        if (!inList || listType !== 'ul') {
          if (inList) result.push(listType === 'ul' ? '</ul>' : '</ol>');
          result.push('<ul style="margin: 0.5rem 0; padding-left: 1.25rem; list-style: disc;">');
          inList = true;
          listType = 'ul';
        }
        let content = line.replace(/^[-*] /, '');
        content = this._inlineMarkdown(content);
        result.push('<li style="margin-bottom: 0.25rem; line-height: 1.6;">' + content + '</li>');
        continue;
      }

      if (line.match(/^\d+\. /)) {
        if (!inList || listType !== 'ol') {
          if (inList) result.push(listType === 'ul' ? '</ul>' : '</ol>');
          result.push('<ol style="margin: 0.5rem 0; padding-left: 1.25rem;">');
          inList = true;
          listType = 'ol';
        }
        let content = line.replace(/^\d+\. /, '');
        content = this._inlineMarkdown(content);
        result.push('<li style="margin-bottom: 0.25rem; line-height: 1.6;">' + content + '</li>');
        continue;
      }

      if (inList) {
        result.push(listType === 'ul' ? '</ul>' : '</ol>');
        inList = false;
      }

      if (line.trim() === '') continue;

      line = this._inlineMarkdown(line);
      result.push('<p style="margin-bottom: 0.5rem; line-height: 1.7;">' + line + '</p>');
    }

    if (inList) {
      result.push(listType === 'ul' ? '</ul>' : '</ol>');
    }

    return result.join('\n');
  },

  _inlineMarkdown(text) {
    text = text.replace(/\*\*(.+?)\*\*/g, '<strong style="color: var(--color-studio-primary);">$1</strong>');
    text = text.replace(/\*(.+?)\*/g, '<em>$1</em>');
    return text;
  },

  /**
   * Generate a concise session title from the transcript via /api/feedback proxy.
   */
  async generateTitle(transcript, sessionMode) {
    if (!transcript || transcript.trim().length === 0) {
      return { success: false, error: 'No transcript.' };
    }

    const modeObj = SESSION_MODES.find(m => m.id === sessionMode);
    const modeLabel = modeObj ? modeObj.label : 'practice session';

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this._MODEL,
          temperature: 0.4,
          max_tokens: 30,
          messages: [
            { role: 'system', content: 'You generate concise session titles (5-8 words max) for pitch practice recordings. Return ONLY the title, no quotes, no punctuation at the end. Reflect the topic/content of the pitch, not just the mode.' },
            { role: 'user', content: 'Mode: ' + modeLabel + '\nTranscript (first 500 chars): ' + transcript.slice(0, 500) }
          ]
        })
      });

      const data = await response.json();
      if (data.success && data.content) {
        return { success: true, title: data.content.trim() };
      }
      return { success: false, error: 'Title generation failed.' };
    } catch (err) {
      return { success: false, error: 'Network error.' };
    }
  }
};

export { AiFeedbackService };
