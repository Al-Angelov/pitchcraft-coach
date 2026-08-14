/**
 * Unit tests for the Studio Shell
 * Requirements: 7.5, 9.7
 *
 * Tests verify:
 * - All four nav tabs are present in #nav
 * - Tab labels are correct (Stage, Library, Navigator, Archetypes)
 * - #stage is the default active module (not hidden)
 * - #library, #navigator, #archetypes are hidden on initial load
 * - #studio is hidden on initial load
 * - Stage tab has aria-selected="true" by default; others have aria-selected="false"
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const html = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf-8');

// HEREEE!!!

// Extract the body content from the full HTML document, stripping <script> tags
// so jsdom does not attempt to execute app JS during tests
function getBodyContent(fullHtml) {
  const match = fullHtml.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  const body = match ? match[1] : fullHtml;
  return body.replace(/<script[\s\S]*?<\/script>/gi, '');
}

const bodyContent = getBodyContent(html);

describe('Studio Shell', () => {
  beforeEach(() => {
    document.body.innerHTML = bodyContent;
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('all four nav tabs are present', () => {
    const tabs = document.querySelectorAll('#nav [role="tab"]');
    expect(tabs.length).toBe(4);
  });

  it('nav tab labels are correct', () => {
    const tabs = document.querySelectorAll('#nav [role="tab"]');
    const labels = Array.from(tabs).map(tab => tab.textContent.trim());
    expect(labels).toEqual(['Stage', 'Library', 'Navigator', 'Archetypes']);
  });

  it('#stage is the default active module', () => {
    const stage = document.querySelector('#stage');
    const library = document.querySelector('#library');
    const navigator = document.querySelector('#navigator');
    const archetypes = document.querySelector('#archetypes');

    // #stage should NOT have the hidden attribute
    expect(stage.hasAttribute('hidden')).toBe(false);

    // The other three modules SHOULD have the hidden attribute
    expect(library.hasAttribute('hidden')).toBe(true);
    expect(navigator.hasAttribute('hidden')).toBe(true);
    expect(archetypes.hasAttribute('hidden')).toBe(true);
  });

  it('#studio is hidden on initial load', () => {
    const studio = document.querySelector('#studio');
    expect(studio).not.toBeNull();
    expect(studio.hasAttribute('hidden')).toBe(true);
  });

  it('Stage tab has aria-selected="true" by default', () => {
    const tabStage = document.querySelector('#tab-stage');
    const tabLibrary = document.querySelector('#tab-library');
    const tabNavigator = document.querySelector('#tab-navigator');
    const tabArchetypes = document.querySelector('#tab-archetypes');

    expect(tabStage.getAttribute('aria-selected')).toBe('true');
    expect(tabLibrary.getAttribute('aria-selected')).toBe('false');
    expect(tabNavigator.getAttribute('aria-selected')).toBe('false');
    expect(tabArchetypes.getAttribute('aria-selected')).toBe('false');
  });
});
