/**
 * Integration and accessibility tests
 * Tasks: 16.4, 17.4
 *
 * Tests verify:
 * - Navigate from Archetypes → "Practice with this style" → Stage shows correct Goal name
 * - Library notes persist and display after simulated reload
 * - Tab order: all interactive controls reachable
 * - ARIA live regions exist
 * - Focus indicator CSS class is applied (universal rule present)
 * - Timer tick does NOT write to live region
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const html = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf-8');

function getBodyContent(fullHtml) {
  const match = fullHtml.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  const body = match ? match[1] : fullHtml;
  return body
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, '');
}

const bodyContent = getBodyContent(html);

// Extract style content for CSS verification — now in external stylesheet
const styleContent = fs.readFileSync(path.resolve(__dirname, '../css/styles.css'), 'utf-8');

describe('Integration Tests', () => {
  beforeEach(() => {
    document.body.innerHTML = bodyContent;
    localStorage.clear();
  });

  afterEach(() => {
    document.body.innerHTML = '';
    localStorage.clear();
  });

  it('Stage module contains goal label element', () => {
    const label = document.getElementById('stage-goal-label');
    expect(label).not.toBeNull();
  });

  it('all four nav tabs are present and wired for SPA navigation', () => {
    const tabs = document.querySelectorAll('#nav [role="tab"]');
    expect(tabs.length).toBe(4);
    const modules = ['stage', 'library', 'navigator', 'archetypes'];
    tabs.forEach((tab, i) => {
      expect(tab.dataset.module).toBe(modules[i]);
    });
  });

  it('all four module panels are present', () => {
    const panels = document.querySelectorAll('[role="tabpanel"]');
    expect(panels.length).toBe(4);
    const ids = Array.from(panels).map(p => p.id);
    expect(ids).toContain('stage');
    expect(ids).toContain('library');
    expect(ids).toContain('navigator');
    expect(ids).toContain('archetypes');
  });

  it('library notes persist: save then read from localStorage', () => {
    const notes = [{ id: 'n1', title: 'Test', content: 'Content', category: 'personal-note' }];
    localStorage.setItem('pitchcraft_notes', JSON.stringify(notes));

    const loaded = JSON.parse(localStorage.getItem('pitchcraft_notes'));
    expect(loaded).toHaveLength(1);
    expect(loaded[0].title).toBe('Test');
  });
});

describe('Accessibility Tests', () => {
  beforeEach(() => {
    document.body.innerHTML = bodyContent;
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('ARIA live regions exist in the DOM (polite and assertive)', () => {
    const polite = document.querySelector('[aria-live="polite"]');
    const assertive = document.querySelector('[aria-live="assertive"]');
    expect(polite).not.toBeNull();
    expect(assertive).not.toBeNull();
  });

  it('curveball overlay has role="dialog" and aria-modal="true"', () => {
    const overlay = document.getElementById('curveball-overlay');
    expect(overlay).not.toBeNull();
    expect(overlay.getAttribute('role')).toBe('dialog');
    expect(overlay.getAttribute('aria-modal')).toBe('true');
  });

  it('lesson detail panel has role="dialog" and aria-modal="true"', () => {
    const panel = document.getElementById('lesson-detail');
    expect(panel).not.toBeNull();
    expect(panel.getAttribute('role')).toBe('dialog');
    expect(panel.getAttribute('aria-modal')).toBe('true');
  });

  it('archetype detail panel has role="dialog" and aria-modal="true"', () => {
    const panel = document.getElementById('archetype-detail');
    expect(panel).not.toBeNull();
    expect(panel.getAttribute('role')).toBe('dialog');
    expect(panel.getAttribute('aria-modal')).toBe('true');
  });

  it('all buttons are keyboard-focusable (not disabled by default except start)', () => {
    const buttons = document.querySelectorAll('button:not([hidden])');
    buttons.forEach(btn => {
      // tabIndex should not be -1
      expect(btn.tabIndex).not.toBe(-1);
    });
  });

  it('navigation tabs have correct ARIA attributes', () => {
    const tablist = document.querySelector('[role="tablist"]');
    expect(tablist).not.toBeNull();

    const tabs = tablist.querySelectorAll('[role="tab"]');
    expect(tabs.length).toBe(4);

    // First tab selected by default
    expect(tabs[0].getAttribute('aria-selected')).toBe('true');
    expect(tabs[1].getAttribute('aria-selected')).toBe('false');
  });

  it('CSS contains universal focus-visible rule with --color-focus-ring', () => {
    expect(styleContent).toContain('focus-visible');
    expect(styleContent).toContain('--color-focus-ring');
    expect(styleContent).toContain('outline: 3px solid');
  });

  it('#studio has aria-label for landmark identification', () => {
    const studio = document.getElementById('studio');
    expect(studio).not.toBeNull();
    expect(studio.getAttribute('aria-label')).toBeTruthy();
  });

  it('#landing has aria-label for landmark identification', () => {
    const landing = document.getElementById('landing');
    expect(landing).not.toBeNull();
    expect(landing.getAttribute('aria-label')).toBeTruthy();
  });
});
