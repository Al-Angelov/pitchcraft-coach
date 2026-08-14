/**
 * Landing screen unit tests
 * Requirements: 9.2, 9.3, 9.5, 8.1
 *
 * Tests verify:
 * - Landing screen renders the wordmark "Pitch & Eloquence."
 * - Landing screen renders the subtitle "The Public Speaking & Psychology Studio"
 * - Landing screen renders the "Enter the Studio" CTA button
 * - The CTA button is keyboard focusable (native button, tabIndex ≥ 0, not disabled)
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const html = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf-8');

// Extract body content, stripping <script> and <noscript> blocks
// so jsdom does not attempt to execute app JS during tests
function getBodyContent(fullHtml) {
  const match = fullHtml.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  const body = match ? match[1] : fullHtml;
  return body
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, '');
}

const bodyContent = getBodyContent(html);

describe('Landing Screen', () => {
  beforeEach(() => {
    document.body.innerHTML = bodyContent;
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  // Requirement 9.1 — structural sanity
  it('renders a #landing section', () => {
    expect(document.querySelector('#landing')).not.toBeNull();
  });

  // Requirement 9.2 — Wordmark: full text "Pitch & Eloquence."
  it('renders the wordmark "Pitch & Eloquence."', () => {
    const el = document.querySelector('.landing__wordmark');
    expect(el).not.toBeNull();
    expect(el.textContent).toContain('Pitch');
    expect(el.textContent).toContain('Eloquence');
    expect(el.textContent.trim()).toMatch(/Pitch.*Eloquence\./);
  });

  // Requirement 9.3 — Subtitle: full text "The Public Speaking & Psychology Studio"
  it('renders the subtitle "The Public Speaking & Psychology Studio"', () => {
    const el = document.querySelector('.landing__subtitle');
    expect(el).not.toBeNull();
    expect(el.textContent).toContain('Public Speaking');
    expect(el.textContent).toContain('Psychology Studio');
  });

  // Requirement 9.5 — CTA button present with correct label
  it('renders the "Enter the Studio" CTA button', () => {
    const cta = document.querySelector('#enter-studio');
    expect(cta).not.toBeNull();
    expect(cta.tagName.toLowerCase()).toBe('button');
    expect(cta.textContent.trim()).toBe('Enter the Studio');
  });

  // Requirement 8.1 — CTA is keyboard focusable: native button, not disabled, tabIndex ≥ 0
  it('CTA button is a native button element (implicitly keyboard focusable)', () => {
    const cta = document.querySelector('#enter-studio');
    expect(cta).not.toBeNull();
    expect(cta.tagName.toLowerCase()).toBe('button');
  });

  it('CTA button is not disabled', () => {
    const cta = document.querySelector('#enter-studio');
    expect(cta).not.toBeNull();
    expect(cta.disabled).toBe(false);
    expect(cta.hasAttribute('disabled')).toBe(false);
  });

  it('CTA button is not removed from the tab order (tabIndex !== -1)', () => {
    const cta = document.querySelector('#enter-studio');
    expect(cta).not.toBeNull();
    // Native buttons default to tabIndex 0; only -1 removes from tab order
    expect(cta.tabIndex).not.toBe(-1);
  });

  it('CTA button becomes the active element when focused', () => {
    const cta = document.querySelector('#enter-studio');
    expect(cta).not.toBeNull();
    cta.focus();
    expect(document.activeElement).toBe(cta);
  });
});
