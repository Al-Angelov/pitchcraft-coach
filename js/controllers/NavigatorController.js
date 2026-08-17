// js/controllers/NavigatorController.js
import { GOALS, LESSON_CATALOG, AppState } from '../data/constants.js';
import { GOAL_PLAYBOOKS } from '../data/playbooks.js';
import { LibraryController } from './LibraryController.js';

/* ============================================================
   NavigatorController — goal selection, visual diagrams, playbook,
   and interactive lesson path with Library deep-linking
============================================================ */

// Diagram configurations per goal — defines the visual framework
const GOAL_DIAGRAMS = {
  'funding-pitch': {
    type: 'intersection',
    title: 'The Funding Triangle',
    subtitle: 'Where conviction, urgency, and mechanism converge',
    nodes: [
      { id: 'conviction', label: 'Founder Conviction', desc: 'Why YOU, why NOW', color: '#c8922a' },
      { id: 'urgency', label: 'Market Urgency', desc: 'The pain is real and growing', color: '#d4a843' },
      { id: 'mechanism', label: 'Unique Mechanism', desc: 'Your unfair advantage', color: '#a67c52' }
    ],
    center: { label: 'Investable', desc: 'The pitch that closes' }
  },
  'technical-explanation': {
    type: 'layers',
    title: 'The Clarity Stack',
    subtitle: 'Building understanding from the ground up',
    nodes: [
      { id: 'foundation', label: 'Shared Context', desc: 'What they already know', color: '#3a2e20' },
      { id: 'bridge', label: 'The Analogy Bridge', desc: 'Familiar → Unfamiliar', color: '#5c4a32' },
      { id: 'core', label: 'Core Mechanism', desc: 'The one idea that matters', color: '#8b6914' },
      { id: 'proof', label: 'Proof Point', desc: 'See it working live', color: '#c8922a' }
    ]
  },
  'casual-networking': {
    type: 'cycle',
    title: 'The Connection Loop',
    subtitle: 'Natural conversations that build trust',
    nodes: [
      { id: 'open', label: 'Authentic Open', desc: 'Genuine curiosity', color: '#c8922a' },
      { id: 'listen', label: 'Deep Listen', desc: 'Mirror + Label', color: '#d4a843' },
      { id: 'share', label: 'Vulnerable Share', desc: 'Reciprocal disclosure', color: '#a67c52' },
      { id: 'close', label: 'Memorable Close', desc: 'Specific follow-up', color: '#8b6914' }
    ]
  },
  'inspirational-talk': {
    type: 'arc',
    title: 'The Emotional Arc',
    subtitle: 'Designing peaks that resonate beyond the room',
    nodes: [
      { id: 'entry', label: 'Emotional Entry', desc: 'Story-first hook', color: '#5c4a32' },
      { id: 'tension', label: 'Rising Tension', desc: 'Build the stakes', color: '#8b6914' },
      { id: 'peak', label: 'The Peak', desc: 'Jaw-drop moment', color: '#c8922a' },
      { id: 'resolve', label: 'Resolution', desc: 'Call to belief', color: '#d4a843' }
    ]
  },
  'job-interview': {
    type: 'hub',
    title: 'The Presence Framework',
    subtitle: 'Confidence radiates from preparation',
    nodes: [
      { id: 'physical', label: 'Physical Presence', desc: 'Posture + eye contact', color: '#c8922a' },
      { id: 'narrative', label: 'Story Arsenal', desc: 'STAR+ ready', color: '#d4a843' },
      { id: 'empathy', label: 'Tactical Empathy', desc: 'Read the room', color: '#a67c52' },
      { id: 'grace', label: 'Graceful Unknown', desc: 'Own your limits', color: '#8b6914' }
    ],
    center: { label: 'Composure', desc: 'Authentic confidence' }
  }
};

const NavigatorController = {
  init() {
    const goalCards = document.querySelectorAll('.navigator__pill');
    goalCards.forEach(card => {
      card.addEventListener('click', () => {
        this.selectGoal(card.dataset.goalId);
      });
    });
  },

  selectGoal(goalId) {
    const goal = GOALS.find(g => g.id === goalId);
    if (!goal) return;

    AppState.activeGoal = goalId;

    const goalCards = document.querySelectorAll('.navigator__pill');
    goalCards.forEach(card => {
      card.setAttribute('aria-checked', card.dataset.goalId === goalId ? 'true' : 'false');
    });

    this.renderBlueprint();
    this.renderPlaybook();
    this.renderGoalPath();

    const stageGoalLabel = document.getElementById('stage-goal-label');
    if (stageGoalLabel) stageGoalLabel.textContent = 'Your focus: ' + goal.label;
  },

  getActiveGoal() {
    if (!AppState.activeGoal) return null;
    return GOALS.find(g => g.id === AppState.activeGoal) || null;
  },

  // ── Visual Strategy Diagram ─────────────────────────────────────

  renderBlueprint() {
    const goal = this.getActiveGoal();
    const section = document.getElementById('goal-blueprint-section');
    const flow = document.getElementById('goal-blueprint-flow');
    const emptyState = document.getElementById('navigator-empty');
    if (!section || !flow) return;

    const diagram = goal ? GOAL_DIAGRAMS[goal.id] : null;

    if (!goal || !diagram) {
      section.setAttribute('hidden', '');
      if (emptyState) emptyState.style.display = '';
      return;
    }

    if (emptyState) emptyState.style.display = 'none';
    section.removeAttribute('hidden');

    let diagramHtml = '';

    switch (diagram.type) {
      case 'intersection':
        diagramHtml = this._renderIntersectionDiagram(diagram);
        break;
      case 'layers':
        diagramHtml = this._renderLayersDiagram(diagram);
        break;
      case 'cycle':
        diagramHtml = this._renderCycleDiagram(diagram);
        break;
      case 'arc':
        diagramHtml = this._renderArcDiagram(diagram);
        break;
      case 'hub':
        diagramHtml = this._renderHubDiagram(diagram);
        break;
      default:
        diagramHtml = this._renderFallbackDiagram(diagram);
    }

    flow.innerHTML =
      '<div class="diagram__header">' +
      '<h4 class="diagram__title">' + diagram.title + '</h4>' +
      '<p class="diagram__subtitle">' + diagram.subtitle + '</p>' +
      '</div>' +
      '<div class="diagram__canvas">' + diagramHtml + '</div>';
  },

  _renderIntersectionDiagram(diagram) {
    // Three overlapping circles with a center convergence point
    const n = diagram.nodes;
    return '<div class="diagram--intersection">' +
      '<svg viewBox="0 0 320 280" class="diagram__svg" aria-hidden="true">' +
      '<circle cx="130" cy="110" r="80" fill="' + n[0].color + '" opacity="0.15" stroke="' + n[0].color + '" stroke-width="1.5"/>' +
      '<circle cx="190" cy="110" r="80" fill="' + n[1].color + '" opacity="0.15" stroke="' + n[1].color + '" stroke-width="1.5"/>' +
      '<circle cx="160" cy="170" r="80" fill="' + n[2].color + '" opacity="0.15" stroke="' + n[2].color + '" stroke-width="1.5"/>' +
      '<circle cx="160" cy="130" r="24" fill="none" stroke="#c8922a" stroke-width="2" stroke-dasharray="4 3"/>' +
      '</svg>' +
      '<div class="diagram__node diagram__node--tl"><span class="diagram__node-label">' + n[0].label + '</span><span class="diagram__node-desc">' + n[0].desc + '</span></div>' +
      '<div class="diagram__node diagram__node--tr"><span class="diagram__node-label">' + n[1].label + '</span><span class="diagram__node-desc">' + n[1].desc + '</span></div>' +
      '<div class="diagram__node diagram__node--bc"><span class="diagram__node-label">' + n[2].label + '</span><span class="diagram__node-desc">' + n[2].desc + '</span></div>' +
      '<div class="diagram__center-badge"><span class="diagram__center-label">' + diagram.center.label + '</span><span class="diagram__center-desc">' + diagram.center.desc + '</span></div>' +
      '</div>';
  },

  _renderLayersDiagram(diagram) {
    // Stacked horizontal layers building upward
    const layers = diagram.nodes;
    const layerHtml = layers.map((node, i) => {
      const width = 60 + (i * 10);
      return '<div class="diagram__layer" style="width:' + width + '%;border-color:' + node.color + ';background:' + node.color + '12">' +
        '<span class="diagram__layer-label">' + node.label + '</span>' +
        '<span class="diagram__layer-desc">' + node.desc + '</span>' +
        '</div>';
    }).reverse().join('');
    return '<div class="diagram--layers">' + layerHtml + '</div>';
  },

  _renderCycleDiagram(diagram) {
    // Circular loop with 4 nodes connected by arrows
    const n = diagram.nodes;
    return '<div class="diagram--cycle">' +
      '<svg viewBox="0 0 300 300" class="diagram__svg" aria-hidden="true">' +
      '<circle cx="150" cy="150" r="90" fill="none" stroke="#3a2e20" stroke-width="2" stroke-dasharray="6 4"/>' +
      '<path d="M150 60 A90 90 0 0 1 240 150" fill="none" stroke="#c8922a" stroke-width="2.5" marker-end="url(#arrowhead)"/>' +
      '<path d="M240 150 A90 90 0 0 1 150 240" fill="none" stroke="#d4a843" stroke-width="2.5" marker-end="url(#arrowhead)"/>' +
      '<path d="M150 240 A90 90 0 0 1 60 150" fill="none" stroke="#a67c52" stroke-width="2.5" marker-end="url(#arrowhead)"/>' +
      '<path d="M60 150 A90 90 0 0 1 150 60" fill="none" stroke="#8b6914" stroke-width="2.5" marker-end="url(#arrowhead)"/>' +
      '<defs><marker id="arrowhead" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" fill="#c8922a"/></marker></defs>' +
      '</svg>' +
      '<div class="diagram__node diagram__node--top"><span class="diagram__node-label">' + n[0].label + '</span><span class="diagram__node-desc">' + n[0].desc + '</span></div>' +
      '<div class="diagram__node diagram__node--right"><span class="diagram__node-label">' + n[1].label + '</span><span class="diagram__node-desc">' + n[1].desc + '</span></div>' +
      '<div class="diagram__node diagram__node--bottom"><span class="diagram__node-label">' + n[2].label + '</span><span class="diagram__node-desc">' + n[2].desc + '</span></div>' +
      '<div class="diagram__node diagram__node--left"><span class="diagram__node-label">' + n[3].label + '</span><span class="diagram__node-desc">' + n[3].desc + '</span></div>' +
      '</div>';
  },

  _renderArcDiagram(diagram) {
    // Rising arc with peak emphasis
    const n = diagram.nodes;
    return '<div class="diagram--arc">' +
      '<svg viewBox="0 0 360 200" class="diagram__svg" aria-hidden="true">' +
      '<path d="M30 170 Q90 160 130 130 Q170 100 200 50 Q230 100 270 130 Q310 150 340 160" fill="none" stroke="#c8922a" stroke-width="2.5" stroke-linecap="round"/>' +
      '<circle cx="50" cy="165" r="6" fill="#5c4a32"/>' +
      '<circle cx="140" cy="120" r="6" fill="#8b6914"/>' +
      '<circle cx="200" cy="50" r="10" fill="#c8922a" stroke="#d4a843" stroke-width="2"/>' +
      '<circle cx="300" cy="145" r="6" fill="#d4a843"/>' +
      '<line x1="200" y1="40" x2="200" y2="25" stroke="#c8922a" stroke-width="1.5"/>' +
      '<polygon points="195,25 200,18 205,25" fill="#c8922a"/>' +
      '</svg>' +
      '<div class="diagram__arc-labels">' +
      n.map((node, i) => '<div class="diagram__arc-node' + (i === 2 ? ' diagram__arc-node--peak' : '') + '">' +
        '<span class="diagram__arc-node-label">' + node.label + '</span>' +
        '<span class="diagram__arc-node-desc">' + node.desc + '</span>' +
        '</div>').join('') +
      '</div>' +
      '</div>';
  },

  _renderHubDiagram(diagram) {
    // Central hub with radiating spokes
    const n = diagram.nodes;
    const angles = [(-Math.PI / 4), (Math.PI / 4), (3 * Math.PI / 4), (5 * Math.PI / 4)];
    const cx = 160, cy = 140, r = 85;
    const spokes = n.map((node, i) => {
      const x = cx + r * Math.cos(angles[i]);
      const y = cy + r * Math.sin(angles[i]);
      return '<line x1="' + cx + '" y1="' + cy + '" x2="' + Math.round(x) + '" y2="' + Math.round(y) + '" stroke="' + node.color + '" stroke-width="1.5" stroke-dasharray="4 3"/>' +
        '<circle cx="' + Math.round(x) + '" cy="' + Math.round(y) + '" r="8" fill="' + node.color + '" opacity="0.3" stroke="' + node.color + '" stroke-width="1.5"/>';
    }).join('');

    return '<div class="diagram--hub">' +
      '<svg viewBox="0 0 320 280" class="diagram__svg" aria-hidden="true">' +
      spokes +
      '<circle cx="' + cx + '" cy="' + cy + '" r="32" fill="rgba(200,146,42,0.08)" stroke="#c8922a" stroke-width="2"/>' +
      '</svg>' +
      '<div class="diagram__hub-center"><span class="diagram__center-label">' + diagram.center.label + '</span><span class="diagram__center-desc">' + diagram.center.desc + '</span></div>' +
      '<div class="diagram__node diagram__node--tl"><span class="diagram__node-label">' + n[0].label + '</span><span class="diagram__node-desc">' + n[0].desc + '</span></div>' +
      '<div class="diagram__node diagram__node--tr"><span class="diagram__node-label">' + n[1].label + '</span><span class="diagram__node-desc">' + n[1].desc + '</span></div>' +
      '<div class="diagram__node diagram__node--br"><span class="diagram__node-label">' + n[2].label + '</span><span class="diagram__node-desc">' + n[2].desc + '</span></div>' +
      '<div class="diagram__node diagram__node--bl"><span class="diagram__node-label">' + n[3].label + '</span><span class="diagram__node-desc">' + n[3].desc + '</span></div>' +
      '</div>';
  },

  _renderFallbackDiagram(diagram) {
    return '<div class="diagram--fallback">' +
      diagram.nodes.map(n => '<div class="diagram__fallback-node"><strong>' + n.label + '</strong><span>' + n.desc + '</span></div>').join('') +
      '</div>';
  },

  // ── Strategic Playbook (detailed accordion) ─────────────────────

  renderPlaybook() {
    const goal = this.getActiveGoal();
    const section = document.getElementById('goal-playbook-section');
    const list = document.getElementById('goal-playbook-list');
    if (!section || !list) return;

    const playbook = goal ? GOAL_PLAYBOOKS[goal.id] : null;

    if (!goal || !playbook || !playbook.strategies || playbook.strategies.length === 0) {
      section.setAttribute('hidden', '');
      return;
    }

    section.removeAttribute('hidden');
    list.innerHTML = '<div class="navigator__playbook-grid">' +
      playbook.strategies.map((strategy, i) => {
      const stepsHtml = strategy.blueprint.map(step =>
        '<li class="navigator__playbook-step">' + step + '</li>'
      ).join('');

      const caseStudyHtml = strategy.caseStudy
        ? '<div class="navigator__case-study">' +
          '<p class="navigator__case-study-company">' + strategy.caseStudy.company + '</p>' +
          '<p class="navigator__case-study-text">' + strategy.caseStudy.context + ' ' + strategy.caseStudy.execution + '</p>' +
          '<p class="navigator__case-study-result">' + strategy.caseStudy.result + '</p>' +
          '</div>'
        : '';

      const psychologyHtml = strategy.psychology
        ? '<div class="navigator__psychology-block">' + strategy.psychology + '</div>'
        : '';

      return '<article class="navigator__strategy-card">' +
        '<div class="navigator__strategy-card-header">' +
        '<span class="navigator__strategy-card-number">' + String(i + 1).padStart(2, '0') + '</span>' +
        '<span class="navigator__strategy-title">' + strategy.title + '</span>' +
        '</div>' +
        '<p class="navigator__playbook-objective">' + strategy.objective + '</p>' +
        '<p class="navigator__playbook-label">The Approach</p>' +
        '<p class="navigator__playbook-approach">' + strategy.approach + '</p>' +
        '<p class="navigator__playbook-label">Execution Blueprint</p>' +
        '<ol class="navigator__playbook-steps">' + stepsHtml + '</ol>' +
        '<p class="navigator__playbook-label">Real-World Example</p>' +
        caseStudyHtml +
        '<p class="navigator__playbook-label">The Psychology</p>' +
        psychologyHtml +
        '</article>';
    }).join('') + '</div>';
  },

  // ── Interactive Lesson Path (with Library deep-linking) ─────────

  renderGoalPath() {
    const goal = this.getActiveGoal();
    const section = document.getElementById('goal-path-section');
    const list = document.getElementById('goal-path-list');
    if (!section || !list) return;

    if (!goal) {
      section.setAttribute('hidden', '');
      return;
    }

    section.removeAttribute('hidden');

    const playbook = GOAL_PLAYBOOKS[goal.id];
    const descriptions = playbook ? playbook.lessonDescriptions : [];

    list.innerHTML = goal.lessonIds.map((lessonId, i) => {
      const lesson = LESSON_CATALOG.find(l => l.id === lessonId);
      const title = lesson ? lesson.title : lessonId;
      const source = lesson ? lesson.sourceReference : '';
      const desc = descriptions.find(d => d.lessonId === lessonId);
      const descText = desc ? desc.whyItMatters : '';

      return '<button type="button" class="navigator__lesson-card" data-lesson-id="' + lessonId + '" aria-label="Open ' + title + ' in Library">' +
        '<span class="navigator__lesson-card-number">' + (i + 1) + '</span>' +
        '<div class="navigator__lesson-card-body">' +
        '<span class="navigator__lesson-card-title">' + title + '</span>' +
        (source ? '<span class="navigator__lesson-card-source">' + source + '</span>' : '') +
        (descText ? '<p class="navigator__lesson-card-desc">' + descText + '</p>' : '') +
        '<span class="navigator__lesson-card-badge">' +
        '<svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 12 L12 4 M12 4 L6 4 M12 4 L12 10"/></svg>' +
        'Open in Library</span>' +
        '</div>' +
        '<svg class="navigator__lesson-card-arrow" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="8,4 14,10 8,16"/></svg>' +
        '</button>';
    }).join('');

    list.querySelectorAll('.navigator__lesson-card').forEach(card => {
      card.addEventListener('click', () => {
        const lessonId = card.dataset.lessonId;
        if (lessonId) this.openLessonInLibrary(lessonId);
      });
    });
  },

  openLessonInLibrary(lessonId) {
    if (window._switchToModule) {
      window._switchToModule('library');
    }
    setTimeout(() => {
      if (LibraryController && LibraryController.openLesson) {
        LibraryController.openLesson(lessonId);
      }
    }, 100);
  }
};

export { NavigatorController };
