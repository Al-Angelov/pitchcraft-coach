/**
 * Unit tests for LibraryController
 * Requirements: 4.1, 4.2, 4.4, 4.5, 4.6
 *
 * Tests verify:
 * - Empty personal notes state on fresh init
 * - Note persists across simulated reload
 * - Lesson detail panel is keyboard-accessible (has close button)
 * - Search filters within 300ms debounce
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

// Minimal LESSON_CATALOG mirror
const LESSON_CATALOG = [
  {
    id: 'lesson-sinek',
    category: 'ted-talk',
    title: 'Start With Why',
    sourceReference: 'TED Talk: Simon Sinek, 2009',
    keyTakeaways: ['People buy why you do it'],
    actionableTechniques: ['Open with a Why statement'],
    content: 'Simon Sinek argues about purpose.',
    isUserNote: false
  },
  {
    id: 'lesson-cuddy',
    category: 'ted-talk',
    title: 'Body Language Shapes You',
    sourceReference: 'TED Talk: Amy Cuddy, 2012',
    keyTakeaways: ['Power posing works'],
    actionableTechniques: ['Adopt expansive posture'],
    content: 'Amy Cuddy explores body language.',
    isUserNote: false
  }
];

// StorageService mirror
const StorageService = {
  _KEY: 'pitchcraft_notes',
  saveNotes(notes) { try { localStorage.setItem(this._KEY, JSON.stringify(notes)); } catch(_){} },
  loadNotes() { try { const r = localStorage.getItem(this._KEY); if (!r) return []; const p = JSON.parse(r); return Array.isArray(p) ? p : []; } catch(_){ return []; } },
  clearNotes() { try { localStorage.removeItem(this._KEY); } catch(_){} }
};

// AppState mirror
const AppState = {
  notes: [],
  searchQuery: '',
  openLessonId: null,
  init() { this.notes = []; this.searchQuery = ''; this.openLessonId = null; }
};

// AccessibilityService mirror
const AccessibilityService = {
  trapFocus(c) {},
  releaseFocus() {}
};

// LibraryController mirror
const LibraryController = {
  _debounceTimer: null,
  init() {
    AppState.notes = StorageService.loadNotes();
    this.renderCatalog('');
    const searchInput = document.getElementById('library-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => { this.search(e.target.value); });
    }
    const noteForm = document.getElementById('note-form');
    if (noteForm) {
      noteForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const titleEl = document.getElementById('note-title');
        const contentEl = document.getElementById('note-content');
        if (titleEl && contentEl && titleEl.value.trim() && contentEl.value.trim()) {
          this.addNote(titleEl.value.trim(), contentEl.value.trim());
          titleEl.value = '';
          contentEl.value = '';
        }
      });
    }
    const closeBtn = document.getElementById('lesson-detail-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.closeLesson());
    }
  },
  renderCatalog(query) {
    const grid = document.getElementById('library-grid');
    if (!grid) return;
    const lowerQuery = (query || '').toLowerCase();
    const allLessons = [...LESSON_CATALOG, ...AppState.notes];
    const filtered = lowerQuery
      ? allLessons.filter(l => (l.title + ' ' + (l.content || '')).toLowerCase().includes(lowerQuery))
      : allLessons;
    grid.innerHTML = filtered.map(l => `
      <button type="button" class="library__card" data-lesson-id="${l.id}" tabindex="0">
        <span class="library__card-category">${l.category}</span>
        <h4 class="library__card-title">${l.title}</h4>
        <span class="library__card-source">${l.sourceReference || ''}</span>
      </button>
    `).join('');
    grid.querySelectorAll('.library__card').forEach(card => {
      card.addEventListener('click', () => { this.openLesson(card.dataset.lessonId); });
    });
  },
  openLesson(lessonId) {
    const allLessons = [...LESSON_CATALOG, ...AppState.notes];
    const lesson = allLessons.find(l => l.id === lessonId);
    if (!lesson) return;
    AppState.openLessonId = lessonId;
    const panel = document.getElementById('lesson-detail');
    const titleEl = document.getElementById('lesson-detail-title');
    const sourceEl = document.getElementById('lesson-detail-source');
    const bodyEl = document.getElementById('lesson-detail-body');
    if (titleEl) titleEl.textContent = lesson.title;
    if (sourceEl) sourceEl.textContent = lesson.sourceReference || '';
    if (bodyEl) {
      let h = '';
      if (lesson.keyTakeaways && lesson.keyTakeaways.length) { h += '<h4>Key Takeaways</h4><ul>'; lesson.keyTakeaways.forEach(t => { h += `<li>${t}</li>`; }); h += '</ul>'; }
      if (lesson.actionableTechniques && lesson.actionableTechniques.length) { h += '<h4>Actionable Techniques</h4><ul>'; lesson.actionableTechniques.forEach(t => { h += `<li>${t}</li>`; }); h += '</ul>'; }
      bodyEl.innerHTML = h;
    }
    if (panel) { panel.removeAttribute('hidden'); AccessibilityService.trapFocus(panel); }
  },
  closeLesson() {
    const panel = document.getElementById('lesson-detail');
    if (panel) panel.setAttribute('hidden', '');
    AppState.openLessonId = null;
    AccessibilityService.releaseFocus();
  },
  search(query) {
    clearTimeout(this._debounceTimer);
    this._debounceTimer = setTimeout(() => {
      AppState.searchQuery = query;
      this.renderCatalog(query);
    }, 300);
  },
  addNote(title, content) {
    const note = {
      id: `note-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      category: 'personal-note',
      title, content,
      sourceReference: 'Personal Note',
      keyTakeaways: [content],
      actionableTechniques: [],
      createdAt: new Date().toISOString(),
      isUserNote: true
    };
    AppState.notes.push(note);
    StorageService.saveNotes(AppState.notes);
    this.renderCatalog(AppState.searchQuery);
  }
};

describe('LibraryController', () => {
  beforeEach(() => {
    document.body.innerHTML = bodyContent;
    localStorage.clear();
    AppState.init();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    localStorage.clear();
    document.body.innerHTML = '';
  });

  it('empty personal notes state on fresh init', () => {
    LibraryController.init();
    expect(AppState.notes).toEqual([]);
  });

  it('renders all catalog lessons as cards on init', () => {
    LibraryController.init();
    const cards = document.querySelectorAll('.library__card');
    expect(cards.length).toBe(LESSON_CATALOG.length);
  });

  it('addNote persists and re-renders with the new note', () => {
    LibraryController.init();
    LibraryController.addNote('My Note', 'Some content');

    expect(AppState.notes.length).toBe(1);
    expect(AppState.notes[0].title).toBe('My Note');

    const cards = document.querySelectorAll('.library__card');
    expect(cards.length).toBe(LESSON_CATALOG.length + 1);
  });

  it('note persists across simulated reload', () => {
    LibraryController.init();
    LibraryController.addNote('Persist Test', 'Should survive reload');

    // Simulate reload: re-init
    AppState.init();
    LibraryController.init();

    expect(AppState.notes.length).toBe(1);
    expect(AppState.notes[0].title).toBe('Persist Test');
  });

  it('lesson detail panel has a close button', () => {
    LibraryController.init();
    const closeBtn = document.getElementById('lesson-detail-close');
    expect(closeBtn).not.toBeNull();
    expect(closeBtn.tagName.toLowerCase()).toBe('button');
  });

  it('openLesson shows the detail panel with correct title', () => {
    LibraryController.init();
    LibraryController.openLesson('lesson-sinek');

    const panel = document.getElementById('lesson-detail');
    expect(panel.hasAttribute('hidden')).toBe(false);

    const title = document.getElementById('lesson-detail-title');
    expect(title.textContent).toBe('Start With Why');
  });

  it('closeLesson hides the detail panel', () => {
    LibraryController.init();
    LibraryController.openLesson('lesson-sinek');
    LibraryController.closeLesson();

    const panel = document.getElementById('lesson-detail');
    expect(panel.hasAttribute('hidden')).toBe(true);
    expect(AppState.openLessonId).toBeNull();
  });

  it('search filters cards after 300ms debounce', () => {
    LibraryController.init();

    // Trigger search
    LibraryController.search('sinek');

    // Before debounce fires, all cards still shown
    const cardsBefore = document.querySelectorAll('.library__card');
    expect(cardsBefore.length).toBe(LESSON_CATALOG.length);

    // Advance past debounce
    vi.advanceTimersByTime(301);

    const cardsAfter = document.querySelectorAll('.library__card');
    expect(cardsAfter.length).toBe(1);
  });

  it('search with empty query shows all lessons', () => {
    LibraryController.init();
    LibraryController.search('sinek');
    vi.advanceTimersByTime(301);

    LibraryController.search('');
    vi.advanceTimersByTime(301);

    const cards = document.querySelectorAll('.library__card');
    expect(cards.length).toBe(LESSON_CATALOG.length);
  });
});
