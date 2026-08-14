// js/app.js — Main entry point for PitchCraft & Eloquence Studio
// Imports all modules and wires up initialization on DOMContentLoaded

import { AppState } from './data/constants.js';
import { SessionHistoryService } from './services/SessionHistoryService.js';
import { AccessibilityService } from './services/AccessibilityService.js';
import { LandingController } from './controllers/LandingController.js';
import { StageController } from './controllers/StageController.js';
import { LibraryController } from './controllers/LibraryController.js';
import { NavigatorController } from './controllers/NavigatorController.js';
import { ArchetypesController } from './controllers/ArchetypesController.js';
import { HistoryPanelController } from './controllers/HistoryPanelController.js';

/* ============================================================
   Initialization — wire up all controllers on DOMContentLoaded
============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  AppState.init();
  AccessibilityService.init();
  LandingController.init();
  StageController.init();
  LibraryController.init();
  NavigatorController.init();
  ArchetypesController.init();

  // ── Session History — load from localStorage and init panel ──
  SessionHistoryService.loadHistory();
  HistoryPanelController.init();

  // ── Brand logo — return to landing/home ─────────────────────
  const brandHome = document.getElementById('brand-home');
  if (brandHome) {
    brandHome.addEventListener('click', () => {
      const landing = document.getElementById('landing');
      const studio = document.getElementById('studio');
      if (!landing || !studio) return;

      // Show landing, hide studio
      studio.setAttribute('hidden', '');
      studio.classList.remove('studio--entering');
      landing.style.display = '';
      landing.classList.remove('landing--exiting');
      AppState.screen = 'landing';
    });
  }

  // ── SPA Tab Navigation ──────────────────────────────────────
  const navTabs = document.querySelectorAll('#nav [role="tab"]');
  if (!navTabs || navTabs.length === 0) {
    console.warn('[PitchCraft] No navigation tabs found. Check that #nav contains [role="tab"] elements.');
  }

  function switchToModule(moduleId) {
    if (!moduleId) {
      console.warn('[PitchCraft] switchToModule called without a moduleId.');
      return;
    }
    // Ensure studio is visible
    const landing = document.getElementById('landing');
    const studio = document.getElementById('studio');
    if (landing && landing.style.display !== 'none') {
      landing.style.display = 'none';
      landing.classList.add('landing--exiting');
    }
    if (studio && studio.hasAttribute('hidden')) {
      studio.removeAttribute('hidden');
      studio.classList.add('studio--entering');
      studio.setAttribute('data-active', 'true');
      AppState.screen = 'studio';
    }

    // Update AppState
    AppState.activeModule = moduleId;

    // Update tab states
    navTabs.forEach(t => {
      const isActive = t.dataset.module === moduleId;
      t.setAttribute('aria-selected', isActive ? 'true' : 'false');
      t.classList.toggle('nav__tab--active', isActive);
    });

    // Swap module panels with fade
    const panels = document.querySelectorAll('#studio [role="tabpanel"]');
    panels.forEach(panel => {
      if (panel.id === moduleId) {
        panel.removeAttribute('hidden');
        panel.classList.remove('module--exiting');
        panel.classList.add('module--active');
        // Trigger fade-in
        panel.classList.remove('module--entering');
        void panel.offsetWidth; // force reflow
        panel.classList.add('module--entering');
        requestAnimationFrame(() => {
          panel.classList.remove('module--entering');
        });
      } else {
        panel.setAttribute('hidden', '');
        panel.classList.remove('module--active', 'module--entering');
      }
    });
  }

  navTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const moduleId = tab.dataset.module;
      if (moduleId) switchToModule(moduleId);
    });
  });

  // Make switchToModule available globally for practiceWithStyle
  window._switchToModule = switchToModule;

  // ── Footer navigation links ────────────────────────────────
  document.querySelectorAll('.site-footer__link[data-nav]').forEach(link => {
    link.addEventListener('click', () => {
      const moduleId = link.dataset.nav;
      if (moduleId) {
        switchToModule(moduleId);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  });
  document.querySelectorAll('.site-footer__nav-heading--link[data-nav]').forEach(heading => {
    heading.addEventListener('click', () => {
      const moduleId = heading.dataset.nav;
      if (moduleId) {
        switchToModule(moduleId);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  });

  // Footer logo — return to landing
  const footerBrand = document.getElementById('footer-brand-home');
  if (footerBrand) {
    footerBrand.addEventListener('click', () => {
      const landing = document.getElementById('landing');
      const studio = document.getElementById('studio');
      if (!landing || !studio) return;
      studio.setAttribute('hidden', '');
      studio.classList.remove('studio--entering');
      landing.style.display = '';
      landing.classList.remove('landing--exiting');
      AppState.screen = 'landing';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ── AI Coaching — Wire Stop Recording button ────────────────
  const btnStopRecording = document.getElementById('btn-stop-recording');
  if (btnStopRecording) {
    btnStopRecording.addEventListener('click', () => StageController.endSession());
  }

  // Ensure Record button starts hidden (no active session on load)
  const btnRecordInit = document.getElementById('btn-record');
  if (btnRecordInit) btnRecordInit.hidden = true;
});
