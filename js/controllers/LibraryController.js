// js/controllers/LibraryController.js
import { LESSON_CATALOG, AppState } from '../data/constants.js';
import { StorageService } from '../services/StorageService.js';
import { AccessibilityService } from '../services/AccessibilityService.js';

/* ============================================================
   LibraryController — lesson catalog, search, personal notes
   Requirements: 4.1, 4.2, 4.4, 4.5, 4.6
============================================================ */
const LibraryController = {
  _debounceTimer: null,

  init() {
    // Load persisted notes into AppState
    AppState.notes = StorageService.loadNotes();

    // Render initial catalog
    this.renderCatalog('');

    // Search input handler with 300ms debounce
    const searchInput = document.getElementById('library-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.search(e.target.value);
      });
    }

    // Note form submit handler
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

    // Close lesson detail
    const closeBtn = document.getElementById('lesson-detail-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.closeLesson());
    }
  },

  renderCatalog(query) {
    const grid = document.getElementById('library-grid');
    if (!grid) return;

    const lowerQuery = (query || '').toLowerCase();

    // Combine lesson catalog with personal notes
    const allLessons = [...LESSON_CATALOG, ...AppState.notes];

    // Filter by query
    const filtered = lowerQuery
      ? allLessons.filter(lesson => {
          const searchable = (lesson.title + ' ' + (lesson.content || '')).toLowerCase();
          return searchable.includes(lowerQuery);
        })
      : allLessons;

    // Render cards
    grid.innerHTML = filtered.map(lesson => `
      <button type="button" class="library__card" data-lesson-id="${lesson.id}" tabindex="0">
        <span class="library__card-category">${lesson.category}</span>
        <h4 class="library__card-title">${lesson.title}</h4>
        <span class="library__card-source">${lesson.sourceReference || ''}</span>
      </button>
    `).join('');

    // Attach click handlers to cards
    grid.querySelectorAll('.library__card').forEach(card => {
      card.addEventListener('click', () => {
        this.openLesson(card.dataset.lessonId);
      });
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
      let html = '';

      // Conceptual illustration placeholder (floats right)
      const illustrations = {
        'lesson-sinek-start-with-why': `<svg viewBox="0 0 200 200" fill="none" stroke="#c8922a" stroke-width="1.5" stroke-linecap="round"><circle cx="100" cy="100" r="30"/><circle cx="100" cy="100" r="58"/><circle cx="100" cy="100" r="86"/><text x="92" y="105" font-size="14" fill="#c8922a" stroke="none">Why</text><text x="88" y="78" font-size="10" fill="#9a8b74" stroke="none">How</text><text x="84" y="52" font-size="10" fill="#9a8b74" stroke="none">What</text></svg>`,
        'lesson-cuddy-body-language': `<svg viewBox="0 0 200 200" fill="none" stroke="#c8922a" stroke-width="1.5" stroke-linecap="round"><circle cx="100" cy="55" r="18"/><path d="M100 73 L100 120"/><path d="M100 85 L60 60"/><path d="M100 85 L140 60"/><path d="M100 120 L75 160"/><path d="M100 120 L125 160"/><path d="M55 55 L48 48" opacity="0.4"/><path d="M145 55 L152 48" opacity="0.4"/><text x="65" y="185" font-size="9" fill="#9a8b74" stroke="none">Power Pose</text></svg>`,
        'lesson-brown-vulnerability': `<svg viewBox="0 0 200 200" fill="none" stroke="#c8922a" stroke-width="1.5" stroke-linecap="round"><path d="M100 40 C80 40 65 55 65 75 C65 110 100 140 100 140 C100 140 135 110 135 75 C135 55 120 40 100 40Z"/><path d="M85 80 L95 95 L115 70" stroke-width="2"/><text x="60" y="170" font-size="9" fill="#9a8b74" stroke="none">Vulnerability = Trust</text></svg>`,
        'lesson-gallo-talk-like-ted': `<svg viewBox="0 0 200 200" fill="none" stroke="#c8922a" stroke-width="1.5" stroke-linecap="round"><rect x="50" y="50" width="100" height="70" rx="3"/><line x1="100" y1="120" x2="100" y2="145"/><line x1="70" y1="145" x2="130" y2="145"/><circle cx="80" cy="80" r="4" fill="#c8922a" opacity="0.4"/><circle cx="100" cy="80" r="4" fill="#c8922a" opacity="0.4"/><circle cx="120" cy="80" r="4" fill="#c8922a" opacity="0.4"/><path d="M70 100 L90 95 L110 100 L130 90" opacity="0.6"/><text x="55" y="175" font-size="9" fill="#9a8b74" stroke="none">Emotional + Novel + Memorable</text></svg>`,
        'lesson-voss-never-split': `<svg viewBox="0 0 200 200" fill="none" stroke="#c8922a" stroke-width="1.5" stroke-linecap="round"><circle cx="70" cy="80" r="22"/><circle cx="130" cy="80" r="22"/><path d="M92 80 L108 80"/><path d="M96 75 L108 80 L96 85"/><path d="M60 110 C60 130 80 130 80 110" opacity="0.5"/><path d="M120 110 C120 130 140 130 140 110" opacity="0.5"/><text x="55" y="160" font-size="9" fill="#9a8b74" stroke="none">Mirror → Empathy</text></svg>`,
        'lesson-heath-made-to-stick': `<svg viewBox="0 0 200 200" fill="none" stroke="#c8922a" stroke-width="1.5" stroke-linecap="round"><rect x="60" y="45" width="80" height="25" rx="3"/><text x="73" y="62" font-size="10" fill="#c8922a" stroke="none">SUCCESS</text><line x1="70" y1="80" x2="70" y2="95"/><line x1="90" y1="80" x2="90" y2="95"/><line x1="110" y1="80" x2="110" y2="95"/><line x1="130" y1="80" x2="130" y2="95"/><rect x="60" y="95" width="20" height="14" rx="2" opacity="0.5"/><rect x="82" y="95" width="16" height="14" rx="2" opacity="0.5"/><rect x="100" y="95" width="20" height="14" rx="2" opacity="0.5"/><rect x="122" y="95" width="18" height="14" rx="2" opacity="0.5"/><text x="63" y="106" font-size="6" fill="#9a8b74" stroke="none">Simple</text><text x="84" y="106" font-size="6" fill="#9a8b74" stroke="none">Unex</text><text x="103" y="106" font-size="6" fill="#9a8b74" stroke="none">Concr</text><text x="125" y="106" font-size="6" fill="#9a8b74" stroke="none">Cred</text><text x="55" y="145" font-size="9" fill="#9a8b74" stroke="none">Sticky = Simple + Unexpected</text></svg>`,
        'lesson-peak-end-rule': `<svg viewBox="0 0 200 200" fill="none" stroke="#c8922a" stroke-width="1.5" stroke-linecap="round"><path d="M20 160 C40 160 50 150 70 130 C90 80 100 50 110 80 C120 110 130 140 150 130 C170 120 180 100 190 90"/><circle cx="110" cy="50" r="6" fill="#c8922a" opacity="0.5"/><circle cx="190" cy="90" r="6" fill="#c8922a" opacity="0.5"/><text x="95" y="38" font-size="9" fill="#9a8b74" stroke="none">Peak</text><text x="175" y="82" font-size="9" fill="#9a8b74" stroke="none">End</text><line x1="20" y1="170" x2="190" y2="170" stroke="#3a2e20"/></svg>`,
        'lesson-cognitive-load': `<svg viewBox="0 0 200 200" fill="none" stroke="#c8922a" stroke-width="1.5" stroke-linecap="round"><ellipse cx="100" cy="70" rx="50" ry="35"/><rect x="55" y="95" width="25" height="18" rx="2" opacity="0.7"/><rect x="85" y="95" width="25" height="18" rx="2" opacity="0.7"/><rect x="115" y="95" width="25" height="18" rx="2" opacity="0.7"/><rect x="75" y="118" width="25" height="18" rx="2" opacity="0.4"/><line x1="55" y1="150" x2="145" y2="150" stroke="#3a2e20"/><text x="65" y="170" font-size="9" fill="#9a8b74" stroke="none">Working Memory: 4±1</text></svg>`,
        'lesson-pratfall-effect': `<svg viewBox="0 0 200 200" fill="none" stroke="#c8922a" stroke-width="1.5" stroke-linecap="round"><circle cx="100" cy="60" r="18"/><path d="M100 78 L100 115"/><path d="M100 90 L75 105"/><path d="M100 90 L125 75"/><path d="M100 115 L80 150"/><path d="M100 115 L120 150"/><circle cx="135" cy="130" r="8" opacity="0.4"/><path d="M130 135 C132 140 138 140 140 135" opacity="0.4"/><text x="55" y="180" font-size="9" fill="#9a8b74" stroke="none">Competence + Blunder = Trust</text></svg>`,
        'lesson-personal-note-best-habits': `<svg viewBox="0 0 200 200" fill="none" stroke="#c8922a" stroke-width="1.5" stroke-linecap="round"><rect x="50" y="40" width="100" height="130" rx="3"/><line x1="65" y1="65" x2="135" y2="65" opacity="0.4"/><line x1="65" y1="85" x2="125" y2="85" opacity="0.4"/><line x1="65" y1="105" x2="130" y2="105" opacity="0.4"/><line x1="65" y1="125" x2="110" y2="125" opacity="0.4"/><line x1="65" y1="145" x2="120" y2="145" opacity="0.4"/><path d="M55 50 L65 55 L55 60" fill="#c8922a" opacity="0.5"/></svg>`,
        'lesson-opening-strong': `<svg viewBox="0 0 200 200" fill="none" stroke="#c8922a" stroke-width="1.5" stroke-linecap="round"><path d="M40 140 L100 50 L160 140" stroke-width="2"/><circle cx="100" cy="50" r="8" fill="#c8922a" opacity="0.3"/><line x1="100" y1="58" x2="100" y2="100" stroke-dasharray="4 3" opacity="0.5"/><text x="85" y="35" font-size="9" fill="#9a8b74" stroke="none">Hook</text><text x="50" y="165" font-size="9" fill="#9a8b74" stroke="none">First 30 seconds define attention</text></svg>`,
        'lesson-handling-questions': `<svg viewBox="0 0 200 200" fill="none" stroke="#c8922a" stroke-width="1.5" stroke-linecap="round"><circle cx="100" cy="75" r="35"/><text x="90" y="82" font-size="24" fill="#c8922a" stroke="none" opacity="0.6">?</text><path d="M70 120 C70 140 130 140 130 120" opacity="0.5"/><path d="M75 150 L85 160 L95 150 L105 160 L115 150 L125 160" opacity="0.3"/><text x="55" y="185" font-size="9" fill="#9a8b74" stroke="none">Compose → Bridge → Deliver</text></svg>`
      };

      // Secondary illustration (floats left, appears near techniques)
      const secondaryIllustrations = {
        'lesson-sinek-start-with-why': `<svg viewBox="0 0 160 160" fill="none" stroke="#c8922a" stroke-width="1.2" stroke-linecap="round" opacity="0.5"><path d="M40 120 L80 40 L120 120"/><circle cx="80" cy="40" r="5"/><line x1="80" y1="45" x2="80" y2="80" stroke-dasharray="3 3"/><text x="45" y="140" font-size="8" fill="#9a8b74" stroke="none">Lead with belief</text></svg>`,
        'lesson-cuddy-body-language': `<svg viewBox="0 0 160 160" fill="none" stroke="#c8922a" stroke-width="1.2" stroke-linecap="round" opacity="0.5"><rect x="40" y="30" width="80" height="100" rx="3"/><path d="M60 70 L60 50 L100 50 L100 70" stroke-dasharray="3 2"/><path d="M80 70 L80 110"/><text x="42" y="145" font-size="8" fill="#9a8b74" stroke="none">2 min before = prime</text></svg>`,
        'lesson-brown-vulnerability': `<svg viewBox="0 0 160 160" fill="none" stroke="#c8922a" stroke-width="1.2" stroke-linecap="round" opacity="0.5"><circle cx="50" cy="70" r="15"/><circle cx="110" cy="70" r="15"/><path d="M65 70 C75 55 85 55 95 70"/><path d="M65 70 C75 85 85 85 95 70"/><text x="35" y="120" font-size="8" fill="#9a8b74" stroke="none">Imperfection → Connection</text></svg>`,
        'lesson-peak-end-rule': `<svg viewBox="0 0 160 160" fill="none" stroke="#c8922a" stroke-width="1.2" stroke-linecap="round" opacity="0.5"><rect x="30" y="40" width="100" height="60" rx="2"/><path d="M45 85 L65 55 L85 75 L105 50 L115 65" opacity="0.7"/><text x="35" y="125" font-size="8" fill="#9a8b74" stroke="none">Design peak, then close</text></svg>`,
        'lesson-cognitive-load': `<svg viewBox="0 0 160 160" fill="none" stroke="#c8922a" stroke-width="1.2" stroke-linecap="round" opacity="0.5"><rect x="30" y="50" width="45" height="60" rx="2"/><rect x="85" y="50" width="45" height="60" rx="2"/><line x1="52" y1="65" x2="52" y2="100" stroke-dasharray="2 3" opacity="0.4"/><line x1="107" y1="65" x2="107" y2="100" stroke-dasharray="2 3" opacity="0.4"/><text x="35" y="130" font-size="8" fill="#9a8b74" stroke="none">One idea per slide</text></svg>`
      };

      const illustration = illustrations[lesson.id] || `<svg viewBox="0 0 200 200" fill="none" stroke="#c8922a" stroke-width="1.2" stroke-linecap="round" opacity="0.6"><circle cx="100" cy="80" r="20"/><path d="M75 130 C75 110 125 110 125 130"/><path d="M65 105 L50 95"/><path d="M135 105 L150 95"/><line x1="100" y1="140" x2="100" y2="170"/><path d="M80 170 L120 170"/></svg>`;
      const secondaryIllustration = secondaryIllustrations[lesson.id] || '';

      html += `<div class="reader__illustration">${illustration}</div>`;

      // Key Takeaways as cards
      if (lesson.keyTakeaways && lesson.keyTakeaways.length > 0) {
        html += '<h3 class="reader__section-title">Key Takeaways</h3>';
        html += '<div class="reader__takeaway-grid">';
        lesson.keyTakeaways.forEach(t => {
          html += `<div class="reader__takeaway-card">${t}</div>`;
        });
        html += '</div>';
      }

      // Actionable Techniques as numbered list (with secondary illustration)
      if (lesson.actionableTechniques && lesson.actionableTechniques.length > 0) {
        html += '<h3 class="reader__section-title">Actionable Techniques</h3>';
        if (secondaryIllustration) {
          html += `<div class="reader__illustration reader__illustration--left">${secondaryIllustration}</div>`;
        }
        html += '<ol class="reader__technique-list">';
        lesson.actionableTechniques.forEach(t => {
          html += `<li class="reader__technique-item">${t}</li>`;
        });
        html += '</ol>';
      }

      // Prose content
      if (lesson.content) {
        html += `<p class="reader__prose">${lesson.content}</p>`;
      }

      bodyEl.innerHTML = html;
    }

    if (panel) {
      panel.removeAttribute('hidden');
      AccessibilityService.trapFocus(panel);
    }
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
      title: title,
      content: content,
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

export { LibraryController };
