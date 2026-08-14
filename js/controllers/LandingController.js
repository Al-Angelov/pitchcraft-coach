// js/controllers/LandingController.js
import { AppState } from '../data/constants.js';
import { AnimationService } from '../services/AnimationService.js';
import { AccessibilityService } from '../services/AccessibilityService.js';

/* ============================================================
   LandingController — transition from landing screen to studio
   Requirements: 9.6, 9.7, 9.11
============================================================ */
const LandingController = {
  init() {
    const cta = document.getElementById('enter-studio');
    if (cta) {
      cta.addEventListener('click', () => this.enter());
    }
  },

  enter() {
    const landing = document.getElementById('landing');
    const studio = document.getElementById('studio');
    if (!landing || !studio) return;

    // Use AnimationService for the 600ms dissolve (or immediate cut for reduced motion)
    AnimationService.transition(landing, 'landing--exiting', 600, () => {
      landing.style.display = 'none';
      studio.removeAttribute('hidden');
      studio.classList.add('studio--entering');
      studio.setAttribute('data-active', 'true');
      AppState.screen = 'studio';

      // Move focus to the first tab for keyboard users
      const firstTab = document.querySelector('[role="tab"]');
      if (firstTab) AccessibilityService.moveFocusTo(firstTab);
    });
  }
};

export { LandingController };
