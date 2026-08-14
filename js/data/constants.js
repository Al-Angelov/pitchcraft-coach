// js/data/constants.js - Data constants for PitchCraft & Eloquence Studio

const SESSION_MODES = [
  {
    id: 'elevator-60',
    label: '60-Second Elevator Pitch',
    durationSeconds: 60,
    isFreeMode: false,
    phases: [
      { name: 'Hook',     startPercent: 0,    endPercent: 0.25 },
      { name: 'Problem',  startPercent: 0.25, endPercent: 0.5  },
      { name: 'Solution', startPercent: 0.5,  endPercent: 0.75 },
      { name: 'CTA',      startPercent: 0.75, endPercent: 1.0  }
    ]
  },
  {
    id: 'startup-5m',
    label: '5-Minute Startup Demo',
    durationSeconds: 300,
    isFreeMode: false,
    phases: [
      { name: 'Intro',    startPercent: 0,    endPercent: 0.15 },
      { name: 'Problem',  startPercent: 0.15, endPercent: 0.35 },
      { name: 'Solution', startPercent: 0.35, endPercent: 0.60 },
      { name: 'Demo',     startPercent: 0.60, endPercent: 0.80 },
      { name: 'CTA',      startPercent: 0.80, endPercent: 1.0  }
    ]
  },
  {
    id: 'presentation-15m',
    label: '15-Minute Presentation',
    durationSeconds: 900,
    isFreeMode: false,
    phases: [
      { name: 'Intro',     startPercent: 0,    endPercent: 0.10 },
      { name: 'Context',   startPercent: 0.10, endPercent: 0.25 },
      { name: 'Core 1',    startPercent: 0.25, endPercent: 0.45 },
      { name: 'Core 2',    startPercent: 0.45, endPercent: 0.65 },
      { name: 'Synthesis', startPercent: 0.65, endPercent: 0.85 },
      { name: 'Close',     startPercent: 0.85, endPercent: 1.0  }
    ]
  },
  {
    id: 'deep-dive-30m',
    label: '30-Minute Deep-Dive Presentation',
    durationSeconds: 1800,
    isFreeMode: false,
    phases: [
      { name: 'Intro',      startPercent: 0,    endPercent: 0.08 },
      { name: 'Background', startPercent: 0.08, endPercent: 0.20 },
      { name: 'Analysis 1', startPercent: 0.20, endPercent: 0.35 },
      { name: 'Analysis 2', startPercent: 0.35, endPercent: 0.50 },
      { name: 'Analysis 3', startPercent: 0.50, endPercent: 0.65 },
      { name: 'Synthesis',  startPercent: 0.65, endPercent: 0.80 },
      { name: 'Q&A Prep',   startPercent: 0.80, endPercent: 0.92 },
      { name: 'Close',      startPercent: 0.92, endPercent: 1.0  }
    ]
  },
  {
    id: 'free',
    label: 'Free Mode',
    durationSeconds: 0,
    isFreeMode: true,
    phases: []
  }
];

// Lesson catalog — Requirements 4.1, 4.3
const LESSON_CATALOG = [
  // ── TED Talk insights ──────────────────────────────────────────────────
  {
    id: 'lesson-sinek-start-with-why',
    category: 'ted-talk',
    title: 'Start With Why',
    sourceReference: 'TED Talk: Simon Sinek, 2009',
    keyTakeaways: [
      'People don\'t buy what you do; they buy why you do it — your purpose, cause, or belief.',
      'The Golden Circle works from the inside out: Why → How → What. Most communicators work backward (What → How → Why), missing the emotional core.',
      'The limbic brain — responsible for feelings, trust, and decision-making — responds to "why" messages, not facts and features.',
      'Inspiring leaders and organisations communicate from a clear sense of purpose that predates any particular product or policy.'
    ],
    actionableTechniques: [
      'Open every pitch or presentation with a crisp "Why" statement before introducing any product details: "We believe that [cause]. That\'s why we built [thing]."',
      'Test your "why" by asking whether it would still hold true if your current product disappeared tomorrow. If yes, it\'s genuinely foundational.',
      'When persuading an audience, lead with the belief or problem you share — establish common ground in purpose before you present solutions.'
    ],
    content: 'Simon Sinek\'s "Start With Why" argues that the most inspiring leaders and organisations think, act, and communicate from a clear sense of purpose that sits at the centre of what he calls the Golden Circle. The outermost ring is What — every organisation knows what it does. The middle ring is How — some know how they do it distinctively. But only a few can clearly articulate Why — what they believe, why they exist beyond making money. Sinek\'s central insight is that humans are wired to respond to purpose, not features. The limbic brain, which governs trust, loyalty, and decision-making, processes "why" messages and drives behaviour, while the neocortex handles rational facts. This is why logical arguments alone rarely move people. The practical implication for speakers is profound: begin every talk, pitch, or conversation at the centre of the Golden Circle, not the periphery.',
    isUserNote: false
  },
  {
    id: 'lesson-cuddy-body-language',
    category: 'ted-talk',
    title: 'Your Body Language May Shape Who You Are',
    sourceReference: 'TED Talk: Amy Cuddy, 2012',
    keyTakeaways: [
      'Body language not only affects how others see us — it also changes how we see ourselves and how we perform under pressure.',
      '"Power posing" (expansive, open postures) can shift hormonal profiles and increase feelings of confidence before high-stakes interactions.',
      'Nonverbal communication accounts for a substantial portion of how speakers are evaluated for warmth, competence, and trustworthiness.',
      'Tiny adjustments in posture and physical presence, practised deliberately before a talk, can meaningfully reduce anxiety and improve performance.'
    ],
    actionableTechniques: [
      'Two minutes before going on stage or entering a high-stakes conversation, adopt an expansive posture in a private space — stand tall, arms wide, chin up — to prime a confident mental state.',
      'During a presentation, avoid collapsed postures (hunched shoulders, crossed arms, downward gaze) which signal low status and erode audience confidence.',
      'Anchor yourself physically at the start: plant your feet hip-width apart, keep your hands visible, and make deliberate eye contact with different sections of the audience.'
    ],
    content: 'Amy Cuddy\'s 2012 TED Talk explores the feedback loop between body language and self-perception. Her research showed that humans, like other animals, use posture to signal and experience power. Expansive, open postures — what Cuddy calls "power poses" — are associated with elevated testosterone (confidence) and reduced cortisol (stress). Conversely, contracted, closed postures suppress confidence hormones and amplify stress. The practical revelation is that you do not need to feel powerful to act powerfully: briefly adopting expansive postures before a high-stakes moment can genuinely shift your internal state. For speakers, this means pre-stage preparation is as much physical as cognitive — vocal warm-ups, posture work, and intentional breathing all prime the body-mind for peak performance. Cuddy\'s broader message is to "fake it till you become it": consistent practice of confident behaviours gradually reshapes the underlying identity.',
    isUserNote: false
  },
  {
    id: 'lesson-brown-vulnerability',
    category: 'ted-talk',
    title: 'The Power of Vulnerability',
    sourceReference: 'TED Talk: Brené Brown, 2010',
    keyTakeaways: [
      'Vulnerability — the willingness to show up when you can\'t control the outcome — is the birthplace of authentic connection and creative courage.',
      'People who feel a deep sense of worthiness (what Brown calls "wholehearted" people) embrace vulnerability rather than armour against it.',
      'Numbing vulnerability also numbs joy, gratitude, and authentic connection — you cannot selectively numb emotions.',
      'Audiences connect most deeply with speakers who acknowledge uncertainty, admit mistakes, and share genuine stakes — not polished, invulnerable personas.'
    ],
    actionableTechniques: [
      'Open a talk by acknowledging what you genuinely don\'t know or what\'s personally at stake for you — this creates immediate trust and makes technical content more human.',
      'Replace scripted "perfect" stories with real, imperfect experiences including setbacks. A moment of authentic failure followed by learning is more memorable than a highlight reel.',
      'Use the phrase "I was wrong about this" or "I changed my mind because..." — admitting intellectual evolution builds credibility far more than projecting infallibility.'
    ],
    content: 'Brené Brown spent years researching human connection and found one variable that consistently predicted whether people lived with a full sense of belonging: vulnerability. Her studies revealed a sharp distinction between people who felt worthy of love and connection (wholehearted people) and those who constantly struggled — the primary difference was that wholehearted people leaned into vulnerability rather than avoiding it. They had the courage to be imperfect, to be seen without guarantee of outcome. For communicators, Brown\'s research is transformative: the polished, over-prepared speaker who never shows doubt or stakes actually reduces connection. Audiences are wired to detect authenticity. When a speaker acknowledges uncertainty, admits what they don\'t know, or shares something genuinely personal, the limbic brain of every listener relaxes — it trusts what it sees. The most powerful moments in public speaking consistently emerge from vulnerability, not performance.',
    isUserNote: false
  },

  // ── Communication book summaries ───────────────────────────────────────
  {
    id: 'lesson-gallo-talk-like-ted',
    category: 'book-summary',
    title: 'Talk Like TED',
    sourceReference: 'Book: Carmine Gallo, 2014',
    keyTakeaways: [
      'The nine habits of the world\'s top TED speakers converge on three principles: emotional, novel, and memorable delivery.',
      'Passion is the foundation — before mastering technique, speakers must identify and articulate the one idea that genuinely excites them.',
      'The "18-minute rule" reflects the limits of conscious attention; even the longest TED talk forces ruthless editing that strengthens any talk.',
      'Storytelling activates more brain regions than data delivery alone — the narrative brain is the persuasion brain.',
      'Novelty — genuinely new information or perspectives — triggers dopamine release, making the audience more alert and more likely to retain content.'
    ],
    actionableTechniques: [
      'Identify your "one throughline" — a single sentence that captures the core idea of your talk — before writing a single slide. Every element of the talk should either support or illustrate this sentence.',
      'Replace at least one data slide with a story that makes the same point: a specific person, a specific moment, a specific transformation.',
      'Apply the "Twitter test": can you summarise your core message in 140 characters? If not, your idea isn\'t sharp enough yet.'
    ],
    content: 'Carmine Gallo analysed hundreds of TED talks to extract the nine habits that define the world\'s most compelling communicators. His central argument is that TED-style communication is not a gift reserved for natural charisma — it is a set of learnable behaviours rooted in science, storytelling, and deliberate practice. Gallo finds that the most electrifying talks share three qualities: they are emotionally resonant (they make you feel something), intellectually novel (they introduce an idea you hadn\'t encountered before), and viscerally memorable (they anchor abstract ideas in concrete images, analogies, or stories). The book details techniques including "jaw-dropping moments" that shock the audience into attention, visual storytelling that replaces bullet points with photographs and narratives, and conversational delivery that makes a 5,000-person audience feel they are being spoken to individually. The throughline in all nine habits is that great speeches are designed with the audience\'s cognitive and emotional experience as the primary design constraint.',
    isUserNote: false
  },
  {
    id: 'lesson-voss-never-split',
    category: 'book-summary',
    title: 'Never Split the Difference',
    sourceReference: 'Book: Chris Voss, 2016',
    keyTakeaways: [
      'Tactical empathy — genuinely seeing the world from your counterpart\'s perspective and acknowledging their emotions — is the master tool of elite negotiators and persuaders.',
      '"Mirroring" (repeating the last 1–3 words someone said) keeps conversation flowing and signals deep listening without triggering defensiveness.',
      'Calibrated questions that begin with "How" or "What" invite the other party to solve the problem collaboratively, reducing resistance.',
      'The "late-night FM DJ voice" — a slow, downward-inflected, warm tone — calms nervous systems and creates psychological safety during tense moments.'
    ],
    actionableTechniques: [
      'When you sense disagreement, label the other person\'s emotion before making your point: "It sounds like you\'re concerned about..." — labelling defuses emotion and signals empathy.',
      'Slow down. Most speakers rush when nervous, which triggers the listener\'s fight-or-flight. A deliberate pause of 2–3 seconds after a key statement signals confidence and gives the idea space to land.',
      'Use "How" questions to invite collaboration: "How would you like us to proceed?" rather than "Do you agree?" — open questions give the other party agency and reduce defensiveness.'
    ],
    content: 'Chris Voss, a former FBI hostage negotiator, argues in "Never Split the Difference" that the best negotiators — and by extension the best communicators — are not logic machines delivering rational arguments. They are master practitioners of tactical empathy: the ability to accurately recognise and then explicitly acknowledge the emotional state of their counterpart. Voss\'s framework, developed in life-or-death negotiations, translates directly to everyday communication, persuasion, and public speaking. His key insight is that humans make decisions emotionally and justify them rationally — a principle with profound implications for anyone trying to change minds. Techniques like mirroring, labelling, calibrated questions, and the "accusation audit" (proactively naming objections before the audience raises them) all work by creating psychological safety and demonstrated understanding, which makes the listener far more open to new information and persuasion. For speakers, the most practical takeaway is to treat every audience as a set of individual nervous systems that need to feel heard before they will accept being influenced.',
    isUserNote: false
  },
  {
    id: 'lesson-heath-made-to-stick',
    category: 'book-summary',
    title: 'Made to Stick',
    sourceReference: 'Book: Chip Heath & Dan Heath, 2007',
    keyTakeaways: [
      'The "Curse of Knowledge" is the central barrier to great communication: once you know something, it is nearly impossible to imagine not knowing it, making experts poor teachers by default.',
      'Sticky ideas share six properties summarised by the acronym SUCCESS: Simple, Unexpected, Concrete, Credible, Emotional, and Story-driven.',
      'Concreteness beats abstraction: "a grapefruit-sized tumour" is remembered; "a large tumour" is not.',
      'Unexpected gaps in knowledge (what the Heaths call "curiosity gaps") drive sustained attention — create the question before you give the answer.',
      'The most persuasive statistics are translated into a human scale: 1 in 6 children goes to bed hungry every night in this city — not a percentage.'
    ],
    actionableTechniques: [
      'Before presenting any complex idea, create a "curiosity gap": ask the question your data answers before showing the data. "What single variable predicts whether a startup succeeds?" Then reveal it.',
      'Replace every abstract noun in your talk outline with a concrete image or analogy. Replace "operational efficiency" with "each project ships three weeks faster than last year."',
      'Apply the "Grandma test": if your core message wouldn\'t make sense to a smart non-expert, your language is too abstract. Translate before you present.'
    ],
    content: 'In "Made to Stick," brothers Chip and Dan Heath investigate why some ideas survive and spread while others — often more accurate or more important — are immediately forgotten. Their answer is a six-point framework called SUCCESS, which identifies the properties that make ideas "sticky": they are simple (stripped to their core), unexpected (they violate assumptions and open curiosity gaps), concrete (expressed in sensory, human-scale terms), credible (anchored in details and vivid evidence), emotional (they make you care about a person, not a statistic), and story-driven (they follow a narrative arc that triggers simulation in the listener\'s mind). The Heaths trace the enemy of sticky communication to what they call the Curse of Knowledge: experts systematically overestimate what their audience knows, leading to abstract, jargon-heavy messages that slide off the listener\'s mind without sticking. The practical antidote is to lead with a concrete story, create a curiosity gap, and then give the abstraction a name — not the other way around.',
    isUserNote: false
  },

  // ── Foundational human psychology ─────────────────────────────────────
  {
    id: 'lesson-peak-end-rule',
    category: 'psychology',
    title: 'The Peak-End Rule in Presentations',
    sourceReference: 'Psychology: Kahneman & Fredrickson, 1993',
    keyTakeaways: [
      'Audiences remember experiences based primarily on two moments: the emotional peak (the most intense high or low) and the very end — not the average or duration.',
      'This "peak-end rule" means a mediocre 30-minute presentation with a brilliant closing moment will be remembered more favourably than a strong 15-minute talk with a flat ending.',
      'Duration neglect: people\'s evaluations of experiences are largely insensitive to how long the experience lasted, which has counterintuitive implications for talk length.',
      'A positive peak early, followed by a strong close, is more effective than attempting to maintain consistently high quality throughout.'
    ],
    actionableTechniques: [
      'Deliberately design your peak moment: identify the single most surprising, emotional, or insight-generating moment in your talk and amplify it — give it time, silence, or a visual anchor.',
      'Never end with Q&A if you can avoid it — the final impression should be yours to control. Instead, close with a prepared, emotionally resonant 60-second "landing" after Q&A.',
      'If the talk starts rocky, create a recovery peak: a strong story, a provocative question, or a surprising reveal can reset the audience\'s emotional trajectory partway through.'
    ],
    content: 'The peak-end rule, first documented by Daniel Kahneman and Barbara Fredrickson, describes a systematic bias in how humans evaluate past experiences. Rather than computing an average of all moments, the brain uses a heuristic shortcut: it weights the most emotionally intense moment (the peak) and the final moment (the end) disproportionately in forming an overall memory and evaluation. Duration is largely ignored — a phenomenon called duration neglect. For speakers, this finding is both liberating and demanding. Liberating because it means a talk with a clear, powerful emotional peak and a strong landing can be remembered as excellent even if other sections were rough. Demanding because it means a flat or forgettable ending can undermine an otherwise strong performance. The implication is precise: every talk needs a deliberately engineered peak moment — not left to chance — and a prepared, scripted close that leaves the audience on a high emotional note, not drifting into administrative Q&A.',
    isUserNote: false
  },
  {
    id: 'lesson-cognitive-load',
    category: 'psychology',
    title: 'Cognitive Load Theory for Speakers',
    sourceReference: 'Psychology: John Sweller, 1988',
    keyTakeaways: [
      'Working memory can hold approximately 4 (±1) chunks of information simultaneously — speakers who overload it lose their audience at the neural level, not just the attention level.',
      'Cognitive load falls into three types: intrinsic (complexity inherent to the topic), extraneous (complexity added by poor presentation design), and germane (mental effort that builds genuine understanding).',
      'Extraneous load — text-heavy slides, visual clutter, jargon, and rapid information delivery — is the speaker\'s enemy. It consumes the limited bandwidth the audience needs for actual understanding.',
      'Dual-coding: presenting information through both verbal and visual channels simultaneously (complementary, not redundant) expands effective working memory capacity.'
    ],
    actionableTechniques: [
      'Apply the "one idea per slide" rule: if a slide contains more than one claim, split it. Audiences cannot process multiple concurrent claims and retain either.',
      'Use the "signpost and summary" technique: before introducing a complex section, tell the audience exactly what\'s coming and why it matters, then deliver it, then briefly summarise. This structures working memory before demanding it.',
      'Read your slide aloud silently: if a slide contains more text than you can read in 3 seconds, it will split the audience\'s attention between reading and listening — two tasks that compete for the same cognitive channel.'
    ],
    content: 'Cognitive Load Theory, developed by educational psychologist John Sweller, explains why so many technically accurate presentations fail to produce understanding. The theory holds that human working memory — the mental workspace where active thinking occurs — has a severely limited capacity, typically around four chunks of information at a time. When a presentation demands more than this capacity, the audience does not slow down and try harder: they simply stop processing and start appearing engaged while cognitively absent. Sweller identifies three types of cognitive load. Intrinsic load is the irreducible complexity of the subject matter itself. Extraneous load is unnecessary complexity introduced by poor communication design — dense text, irrelevant animations, undefined jargon, rapid pacing. Germane load is the productive mental effort that results in genuine schema formation and learning. The speaker\'s job is to minimise extraneous load relentlessly, allowing the brain\'s limited bandwidth to be directed toward germane processing. Practically, this means radical simplicity: fewer words, cleaner visuals, more white space, explicit signposting, and deliberate pacing.',
    isUserNote: false
  },
  {
    id: 'lesson-pratfall-effect',
    category: 'psychology',
    title: 'The Pratfall Effect: Showing Vulnerability',
    sourceReference: 'Psychology: Elliot Aronson, 1966',
    keyTakeaways: [
      'Highly competent people are perceived as significantly more likeable and trustworthy when they make a minor blunder — a finding called the Pratfall Effect.',
      'The effect reverses for people perceived as average or below-average: their blunders reduce likeability because they do not have a competence buffer.',
      'For expert speakers, deliberate acknowledgment of a mistake, limitation, or moment of uncertainty increases perceived warmth without reducing perceived competence.',
      'Audiences are cognitively primed to be suspicious of too-polished delivery — flawlessness reads as performance, not authenticity, which triggers subtle trust deficits.'
    ],
    actionableTechniques: [
      'When you make an error mid-talk — mispronounce a word, lose your place, stumble over a transition — acknowledge it lightly and move on rather than over-correcting. A brief "let me rephrase that" is far more trustworthy than a seamless recovery that the audience knows is rehearsed.',
      'Build a planned "limitation disclosure" into your talk: identify one genuine boundary of your expertise and state it clearly. "This is outside my domain — here\'s who knows more about it." This counterintuitively increases your authority in the areas you do claim.',
      'Match your polish level to your goal: a high-stakes board presentation warrants rehearsed precision. A team brainstorm warrants deliberate informality and visible thinking-aloud.'
    ],
    content: 'In 1966, social psychologist Elliot Aronson conducted a famous experiment in which participants evaluated a highly competent quiz contestant. In one condition, the contestant spilled coffee on himself. Despite — or rather because of — this minor blunder, the clumsy-but-competent contestant was rated more likeable than the equally competent but flawless version. Aronson called this the Pratfall Effect. The mechanism is rooted in perceived approachability: extraordinary competence creates psychological distance. A small, human mistake signals that the person is real, fallible, and safe to be around — reducing the social threat that extreme competence can inadvertently create. For speakers, the implications are directly actionable. A slight stumble, a candid "I\'m not sure about this exact figure — let me check and follow up" or a disclosed area of uncertainty does not undermine your authority; it humanises you in a way that makes your confident moments far more credible. The key qualifier is that the effect only works from a baseline of demonstrated competence — pratfalls deepen connection; they do not manufacture it.',
    isUserNote: false
  },

  // ── Personal note (catalog entry, not user-generated) ─────────────────
  {
    id: 'lesson-personal-note-best-habits',
    category: 'personal-note',
    title: 'My Best Presentation Habits',
    sourceReference: 'Personal Note Template',
    keyTakeaways: [
      'A personal note for capturing your own best practices and recurring wins across presentations.',
      'Use this entry to log specific techniques that consistently work for you, distinct from general advice.',
      'Review and update this note after each significant presentation to build a personalised playbook.'
    ],
    actionableTechniques: [
      'After each presentation, write one sentence about what worked best and one about what you would change — do this within 24 hours while recall is sharp.',
      'Periodically read back through previous entries to identify patterns: which openings consistently land well? Which transitions feel awkward? Build on the patterns.'
    ],
    content: 'This is a personal note template for recording your own best presentation habits, techniques, and observations. Unlike the curated lessons in this library, personal notes capture your lived experience — the specific approaches that work for your voice, your audiences, and your subject matter. Use this space to log wins and experiments, track what you learn from each session, and build a personalised playbook that complements the universal principles taught elsewhere in the library. Great speakers are perpetual students of their own practice, and the gap between good and great is often the habit of deliberate self-reflection after every performance.',
    isUserNote: false
  },
  {
    id: 'lesson-opening-strong',
    category: 'personal-note',
    title: 'Opening Strong: A Personal Framework',
    sourceReference: 'Personal Note Template',
    keyTakeaways: [
      'The first 30 seconds of any talk determine whether the audience grants you their full attention for the rest of it.',
      'An effective opening either creates a curiosity gap, makes an unexpected claim, or places the audience emotionally inside a story.',
      'Avoid starting with thank-yous, housekeeping, or self-introductions — these signals tell the brain "this is low-stakes filler" and trigger attention drift.'
    ],
    actionableTechniques: [
      'Write three possible openings for every talk: one that starts mid-story, one that opens with a provocative question, and one that leads with a counterintuitive claim. Choose the sharpest one.',
      'Rehearse the first 60 seconds until it is completely internalised — this is the highest-anxiety moment and the one most audiences use to calibrate their investment in listening.'
    ],
    content: 'This personal note template is designed for capturing your own evolving framework for opening presentations powerfully. The opening is disproportionately important: cognitive psychology research shows that first impressions formed in the opening seconds of any social interaction are resistant to revision. Audiences decide within the first 30 seconds whether a speaker is worth their full attention. A compelling opening does not guarantee a great talk, but a weak opening creates a credibility deficit the rest of the talk must overcome. Use this template to record which opening techniques have worked for you in practice, which fell flat, and what you\'ve learned about calibrating your opening to specific audience types and contexts.',
    isUserNote: false
  },
  {
    id: 'lesson-handling-questions',
    category: 'personal-note',
    title: 'Handling Tough Questions: Field Notes',
    sourceReference: 'Personal Note Template',
    keyTakeaways: [
      'The quality of Q&A handling is often remembered more vividly than the talk itself — it is the live test of how well you actually know your material.',
      'A composed, honest "I don\'t know the answer to that — here\'s how I\'d find it" is more credible than a confident bluff that an expert in the audience will detect.',
      'Reframing a hostile question before answering it is a legitimate and powerful technique: "What I think you\'re really asking is..." shifts the conversational frame without dismissing the questioner.'
    ],
    actionableTechniques: [
      'Pre-load five anticipated tough questions before any high-stakes talk. Write out your best 30-second answer to each. This dramatically reduces the cognitive load of thinking-while-talking under pressure.',
      'Use the "bridge" technique: answer the question briefly, then pivot to what you most want the audience to take away — "And that connects to the broader point I want to emphasise..."'
    ],
    content: 'This personal note template is for recording your evolving playbook for handling difficult, hostile, or unexpected questions during and after presentations. Q&A is the moment when the polished, rehearsed performance gives way to live thinking, and audiences register this shift acutely. Your ability to remain composed, honest, and articulate under the pressure of a pointed question often determines whether the audience leaves trusting you or doubting you. Use this template to log specific tough questions you\'ve encountered, the responses that worked, the ones that didn\'t, and the patterns you\'re noticing about what audiences in different contexts actually want to know.',
    isUserNote: false
  }
];

/* ============================================================
   CURVEBALL_POOL — 24 curveballs across 4 categories (6 each)
   Requirements: 3.3, 3.5
============================================================ */
const CURVEBALL_POOL = [
  // ── SKEPTICISM (6) ──────────────────────────────────────────
  {
    id: 'cb-skepticism-01',
    category: 'skepticism',
    prompt: 'Your revenue projections look extremely optimistic. What assumptions are those numbers based on?',
    advice: 'Walk through your key assumptions one by one — market size, conversion rate, pricing — and acknowledge which carry the most uncertainty. Showing your reasoning is more persuasive than defending a number.'
  },
  {
    id: 'cb-skepticism-02',
    category: 'skepticism',
    prompt: "This problem has been around for decades. Why hasn't anyone solved it already?",
    advice: "Name the specific technical, regulatory, or market shift that makes now the right moment. Acknowledge prior attempts briefly, then explain your unique angle — don't dismiss predecessors, learn from them."
  },
  {
    id: 'cb-skepticism-03',
    category: 'skepticism',
    prompt: "I've seen three other startups try exactly this. None of them made it. What makes you different?",
    advice: 'Agree that competition validates the problem, then pivot to what specifically differentiates your approach — technology, distribution, timing, or team. Be concrete, not vague.'
  },
  {
    id: 'cb-skepticism-04',
    category: 'skepticism',
    prompt: 'Your customer acquisition cost seems way too low. How did you arrive at that figure?',
    advice: "Cite the channel-by-channel data or pilot experiment behind the number. If it's a projection, say so and explain the logic. Investors respect honesty about what's tested vs. assumed."
  },
  {
    id: 'cb-skepticism-05',
    category: 'skepticism',
    prompt: "The market you're describing is much smaller than you think. Have you validated actual demand?",
    advice: "Reference specific evidence — paying customers, signed letters of intent, waitlist sign-ups, or survey data. Quantify demand signals; anecdotes alone won't move skeptics."
  },
  {
    id: 'cb-skepticism-06',
    category: 'skepticism',
    prompt: "Your timeline to profitability is unrealistic given your burn rate. What's your contingency if you miss it?",
    advice: 'Present your scenario planning honestly: what levers you\'d pull (reduce spend, raise bridge, pursue revenue earlier). Showing you\'ve stress-tested the plan builds credibility more than defending the optimistic case.'
  },

  // ── CLARIFICATION (6) ────────────────────────────────────────
  {
    id: 'cb-clarification-01',
    category: 'clarification',
    prompt: "Can you explain that in simpler terms? I'm not sure I followed the technical part.",
    advice: 'Reach for an analogy that maps your solution to something familiar. Test it mentally: could a smart 12-year-old follow this? Strip jargon first, then rebuild only the technical terms that are truly essential.'
  },
  {
    id: 'cb-clarification-02',
    category: 'clarification',
    prompt: "I didn't catch how you actually make money. Can you walk us through the business model again?",
    advice: 'State the revenue model in one sentence first ("We charge X per Y"), then give a concrete example with real numbers. Avoid abstract percentages — anchor on a typical customer transaction.'
  },
  {
    id: 'cb-clarification-03',
    category: 'clarification',
    prompt: 'Who exactly is your target customer? You said "enterprises" but that\'s very broad.',
    advice: "Narrow it to a vivid, specific persona: industry, company size, job title of the buyer, and the workflow they're using today. Specificity signals you've done real customer discovery, not just desktop research."
  },
  {
    id: 'cb-clarification-04',
    category: 'clarification',
    prompt: 'What does "traction" actually mean for you right now? Can you be more specific?',
    advice: 'Replace the word "traction" with hard numbers: MRR, DAUs, contracts signed, pilots underway, units shipped. If numbers are early-stage, frame them as signals and name the next milestone you\'re aiming for.'
  },
  {
    id: 'cb-clarification-05',
    category: 'clarification',
    prompt: 'You mentioned a "proprietary algorithm." What makes it proprietary and why can\'t a competitor replicate it?',
    advice: "Describe the moat without giving away IP: is it the training data, the team's domain expertise, the time required to build it, or legal protection? Be specific about why replication is harder than it looks."
  },
  {
    id: 'cb-clarification-06',
    category: 'clarification',
    prompt: "I'm still unclear on the difference between your free tier and paid tier. Can you walk through what each includes?",
    advice: 'Use a side-by-side framing: "Free gets you X; paid unlocks Y and Z." Tie the upgrade trigger to a specific customer moment — the point where the free limit creates real pain.'
  },

  // ── PIVOT (6) ───────────────────────────────────────────────
  {
    id: 'cb-pivot-01',
    category: 'pivot',
    prompt: "What if your primary target market doesn't adopt this at the rate you're projecting? Who's your Plan B?",
    advice: "Name your adjacent market before you need it — a secondary customer segment where the value proposition still holds. Investors want to see you've mapped the terrain, not just the highway."
  },
  {
    id: 'cb-pivot-02',
    category: 'pivot',
    prompt: "Let's say a big tech company enters your space tomorrow with unlimited resources. What do you do?",
    advice: 'Lean into your asymmetric advantages: speed, customer intimacy, niche focus, or regulatory knowledge they\'d take years to build. Don\'t panic-compete — explain why your position is defensible at your scale.'
  },
  {
    id: 'cb-pivot-03',
    category: 'pivot',
    prompt: 'Have you considered that this might work better as a feature inside an existing platform rather than a standalone product?',
    advice: 'Engage the question honestly. If partnership is part of your strategy, say so. If standalone is the right answer, explain what the standalone experience unlocks that a feature embed cannot.'
  },
  {
    id: 'cb-pivot-04',
    category: 'pivot',
    prompt: 'What would you do if you learned today that your core technology assumption was wrong?',
    advice: "Demonstrate that you've separated the problem insight from the current solution. Describe what you'd learn quickly and which adjacent approach you'd test first — this shows intellectual flexibility, not indecision."
  },
  {
    id: 'cb-pivot-05',
    category: 'pivot',
    prompt: 'What happens to your business if the regulatory environment shifts significantly in the next 18 months?',
    advice: "Show you're monitoring the regulatory landscape and have mapped two or three plausible scenarios. Name one concrete step you'd take in each scenario — regulators reward preparation, as do investors."
  },
  {
    id: 'cb-pivot-06',
    category: 'pivot',
    prompt: 'If you had to cut your roadmap to just one feature for the next six months, what would it be and why?',
    advice: 'Name the single feature most directly tied to your core value proposition and retention. Justify it with data if possible. This question tests whether you truly understand your own product priorities.'
  },

  // ── PERSONAL-CHALLENGE (6) ──────────────────────────────────
  {
    id: 'cb-personal-challenge-01',
    category: 'personal-challenge',
    prompt: 'Why are YOU the right person to build this? What in your background makes you uniquely qualified?',
    advice: "Connect two or three specific past experiences — professional, research, or lived — to the exact problem you're solving. Authenticity here is more compelling than credentials; show the link, don't just list achievements."
  },
  {
    id: 'cb-personal-challenge-02',
    category: 'personal-challenge',
    prompt: "Have you personally experienced this problem? If not, how deep is your understanding of it really?",
    advice: 'If you have lived experience, share a concrete story. If you haven\'t, describe your customer discovery process — number of interviews, time spent in the field, relationships built. Acknowledge the gap honestly and explain how you\'re closing it.'
  },
  {
    id: 'cb-personal-challenge-03',
    category: 'personal-challenge',
    prompt: "You seem very confident in this vision. What's the biggest mistake you've made so far in building this, and what did you learn?",
    advice: "Choose a real mistake, not a humblebrag. Describe what you assumed, what actually happened, and the specific change you made. Founders who can articulate genuine failures demonstrate the learning loop that matters most at this stage."
  },
  {
    id: 'cb-personal-challenge-04',
    category: 'personal-challenge',
    prompt: 'This is a very crowded space. Are you sure you have the resilience to survive the next two to three years of grinding competition?',
    advice: 'Point to specific evidence of resilience — a setback you pushed through, a pivot you made, a hard month you survived. Then connect that personal durability to why you stay motivated by this particular problem.'
  },
  {
    id: 'cb-personal-challenge-05',
    category: 'personal-challenge',
    prompt: "What does your co-founder bring to the table that you don't? If you're solo, why haven't you found a co-founder?",
    advice: "If you have a co-founder, describe the genuine skill split with a concrete example of complementarity in action. If solo, acknowledge the risk honestly and explain the compensating mechanisms — advisors, early hires, structured accountability — you've built in instead."
  },
  {
    id: 'cb-personal-challenge-06',
    category: 'personal-challenge',
    prompt: 'If this company fails in 18 months, what will you have learned, and what do you do next?',
    advice: "This is a maturity test, not a trick. Engage it directly: name the knowledge you'd carry forward and one or two paths you'd pursue. Founders who can articulate a post-failure scenario are showing they're in it for the mission, not just the outcome."
  }
];

/* ============================================================
   GOALS — 5 speaker development goals with ordered lesson paths
   Requirements: 5.1, 5.2, 5.3
============================================================ */
const GOALS = [
  {
    id: 'funding-pitch',
    label: 'Funding Pitch',
    description: 'Master the art of persuading investors — from opening hook to compelling CTA — with clarity, credibility, and conviction.',
    lessonIds: [
      'lesson-sinek-start-with-why',
      'lesson-voss-never-split',
      'lesson-heath-made-to-stick',
      'lesson-peak-end-rule',
      'lesson-handling-questions'
    ],
    tips: [
      'Lead with the "why" before the "what" — investors back founders with a mission, not just a product.',
      'Pre-load your five toughest anticipated objections and rehearse crisp 30-second answers to each.',
      'End on a deliberate emotional peak, not on a financial slide — design your close to be memorable.',
      'Use concrete numbers anchored to human scale: "500 families served" lands harder than "0.02% market penetration".',
      'Silence is a tool — pause for two seconds after your most important claim to let it land.'
    ]
  },
  {
    id: 'technical-explanation',
    label: 'Technical Explanation',
    description: 'Translate complex technical concepts to any audience without dumbing them down — by building understanding rather than just conveying information.',
    lessonIds: [
      'lesson-cognitive-load',
      'lesson-heath-made-to-stick',
      'lesson-gallo-talk-like-ted',
      'lesson-sinek-start-with-why',
      'lesson-opening-strong'
    ],
    tips: [
      'Apply the "one idea per slide" rule — if a slide contains more than one claim, split it.',
      'Lead with a curiosity gap: ask the question your explanation answers before you start explaining.',
      'Translate every abstract term into a concrete analogy before your first rehearsal — if you can\'t, you don\'t understand it well enough yet.',
      'Use signpost and summary: tell them what\'s coming, deliver it, then briefly recap before moving on.',
      'Test your explanation with the "Grandma test" — if a smart non-expert couldn\'t follow it, simplify before presenting.'
    ]
  },
  {
    id: 'casual-networking',
    label: 'Casual Networking',
    description: 'Build genuine connections in informal settings — conversations that feel natural, leave a lasting impression, and open real doors.',
    lessonIds: [
      'lesson-brown-vulnerability',
      'lesson-pratfall-effect',
      'lesson-voss-never-split',
      'lesson-cuddy-body-language',
      'lesson-personal-note-best-habits'
    ],
    tips: [
      'Ask questions you\'re genuinely curious about — authentic interest is the most memorable thing in any room.',
      'Acknowledge something you don\'t know or got wrong recently — the Pratfall Effect makes you more likeable, not less credible.',
      'Mirror the last few words of what someone said before responding — it signals deep listening and keeps the conversation going.',
      'Match your physical presence to the energy of the room; expansive posture signals openness, not dominance.',
      'Follow up within 24 hours with one specific reference to your conversation — it transforms a chat into a connection.'
    ]
  },
  {
    id: 'inspirational-talk',
    label: 'Inspirational Talk',
    description: 'Move an audience emotionally and intellectually — crafting talks that leave people feeling changed, motivated, and ready to act.',
    lessonIds: [
      'lesson-sinek-start-with-why',
      'lesson-brown-vulnerability',
      'lesson-gallo-talk-like-ted',
      'lesson-peak-end-rule',
      'lesson-opening-strong'
    ],
    tips: [
      'Start with a story that puts the audience emotionally inside the problem before you name the solution.',
      'Identify your single "jaw-dropping moment" and give it room — silence, a pause, a strong visual.',
      'Design your close before your opening — the final 60 seconds should be scripted and internalised completely.',
      'Use vulnerability deliberately: share what genuinely surprised you, changed you, or challenged you — it creates trust instantly.',
      'Your "why" must be real and personal — audiences can detect performed purpose. Find the belief that predates your talk.'
    ]
  },
  {
    id: 'job-interview',
    label: 'Job Interview',
    description: 'Present your experience, thinking, and potential compellingly in high-stakes conversations — and handle tough questions with composure.',
    lessonIds: [
      'lesson-cuddy-body-language',
      'lesson-pratfall-effect',
      'lesson-voss-never-split',
      'lesson-handling-questions',
      'lesson-peak-end-rule'
    ],
    tips: [
      'Two minutes before the interview, adopt an expansive power posture in private to prime a confident internal state.',
      'Prepare a "limitation disclosure" — one honest area where you\'re still growing — it counterintuitively increases your credibility.',
      'Use labelling to show empathy with the interviewer\'s concerns: "It sounds like the team is looking for someone who can..." before answering.',
      'End your answers with a forward-looking sentence that connects your experience to the role\'s future — peak-end rule in action.',
      'Slow down when answering complex questions — a deliberate pause signals confidence and gives your answer space to land.'
    ]
  }
];

/* ============================================================
   ARCHETYPES — 4 speaker archetypes with inline SVG illustrations
   Requirements: 6.1, 6.3, 7.6
============================================================ */
const ARCHETYPES = [
  {
    id: 'the-visionary',
    name: 'The Visionary',
    tagline: 'See what others can\'t yet — and make them believe it too.',
    styleDescription: 'The Visionary speaks from conviction before evidence, painting a future so vivid it feels inevitable. Their delivery is expansive, emotionally resonant, and grounded in a powerful "why" that precedes every argument. They don\'t persuade with data first — they build belief, then let the data confirm it.',
    signatureTechniques: [
      'Opening with a bold, counterintuitive claim that reframes the entire conversation',
      'Using "future-back" storytelling: describing a desirable future state, then working backward to the present',
      'Sustained eye contact with sweeping pauses to let ideas breathe',
      'Repeating a simple, memorable phrase as an anchor throughout the talk'
    ],
    strengths: [
      'Creates genuine emotional momentum in the room',
      'Makes complex change feel achievable and worth pursuing',
      'Inspires loyalty and commitment beyond rational argument',
      'Turns abstract ideas into felt experience'
    ],
    idealContexts: [
      'All-hands company announcements',
      'Keynote addresses at industry conferences',
      'Fundraising pitches where belief precedes traction',
      'Team kickoffs at the start of a challenging initiative'
    ],
    exampleExcerpt: '"We\'re not building a product. We\'re building the infrastructure for a world where no expert knowledge dies with the person who holds it. That world is ten years away — and every line of code we write this week is a brick in that road."',
    illustrationAsset: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
  <!-- Head -->
  <circle cx="40" cy="22" r="10" stroke="#4a7c59" stroke-width="1.8"/>
  <!-- Body / torso -->
  <path d="M28 60 C28 46 52 46 52 60" stroke="#4a7c59" stroke-width="1.8"/>
  <!-- Arms wide open — visionary gesture -->
  <path d="M28 48 L14 38" stroke="#4a7c59" stroke-width="1.8"/>
  <path d="M52 48 L66 38" stroke="#4a7c59" stroke-width="1.8"/>
  <!-- Radiating lines above head — vision / light -->
  <line x1="40" y1="8"  x2="40" y2="4"  stroke="#c8922a" stroke-width="1.5"/>
  <line x1="33" y1="10" x2="30" y2="7"  stroke="#c8922a" stroke-width="1.5"/>
  <line x1="47" y1="10" x2="50" y2="7"  stroke="#c8922a" stroke-width="1.5"/>
  <line x1="28" y1="15" x2="24" y2="13" stroke="#c8922a" stroke-width="1.2"/>
  <line x1="52" y1="15" x2="56" y2="13" stroke="#c8922a" stroke-width="1.2"/>
</svg>`,
    mappedGoalId: 'inspirational-talk'
  },
  {
    id: 'the-deep-tech-educator',
    name: 'The Deep-Tech Educator',
    tagline: 'Complexity is the canvas. Clarity is the art.',
    styleDescription: 'The Deep-Tech Educator transforms dense technical material into insight that anyone can grasp — without simplifying away the truth. Their delivery is structured, precise, and deliberately paced. They build understanding sequentially, signpost every transition, and use concrete analogies to anchor abstract ideas in the listener\'s existing mental models.',
    signatureTechniques: [
      'Opening with the question the explanation answers — before any technical content',
      'Using layered analogies: start simple, then add nuance in deliberate passes',
      'Explicit signposting: "There are three things you need to understand. First..."',
      'Drawing or sketching concepts live (or simulating it) to externalise thinking'
    ],
    strengths: [
      'Earns trust from technical and non-technical audiences simultaneously',
      'Makes complex systems feel navigable rather than intimidating',
      'Builds credibility through demonstrated mastery without gatekeeping',
      'Creates lasting understanding rather than just memorable moments'
    ],
    idealContexts: [
      'Investor technical deep-dives',
      'Cross-functional team briefings on complex systems',
      'Conference talks aimed at mixed-expertise audiences',
      'Product demos for technically sophisticated buyers'
    ],
    exampleExcerpt: '"Think of it like a postal system — but one where every letter is sealed so only the recipient can open it, and the postmaster can\'t read anything. That\'s end-to-end encryption. Now let me show you exactly how we\'ve built that into every layer of what we\'re deploying."',
    illustrationAsset: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
  <!-- Head -->
  <circle cx="40" cy="20" r="9" stroke="#5c6b7a" stroke-width="1.8"/>
  <!-- Body -->
  <path d="M30 58 C30 44 50 44 50 58" stroke="#5c6b7a" stroke-width="1.8"/>
  <!-- Arm pointing to board -->
  <path d="M30 46 L18 42" stroke="#5c6b7a" stroke-width="1.8"/>
  <!-- Whiteboard / panel -->
  <rect x="4" y="30" width="16" height="18" rx="1" stroke="#8b7355" stroke-width="1.5"/>
  <!-- Diagram on board — nodes and connector -->
  <circle cx="9"  cy="36" r="2" stroke="#8b7355" stroke-width="1.2"/>
  <circle cx="16" cy="36" r="2" stroke="#8b7355" stroke-width="1.2"/>
  <line x1="11" y1="36" x2="14" y2="36" stroke="#8b7355" stroke-width="1.2"/>
  <line x1="12" y1="36" x2="12" y2="42" stroke="#8b7355" stroke-width="1.2"/>
  <circle cx="12" cy="44" r="2" stroke="#8b7355" stroke-width="1.2"/>
</svg>`,
    mappedGoalId: 'technical-explanation'
  },
  {
    id: 'the-empathetic-storyteller',
    name: 'The Empathetic Storyteller',
    tagline: 'Connection before content. Always.',
    styleDescription: 'The Empathetic Storyteller leads with human experience — theirs or someone else\'s — before any argument or information. Their delivery is warm, unhurried, and deeply attentive to the emotional state of the people in the room. They use personal disclosure, active listening cues, and narrative arcs that mirror the audience\'s own struggles and aspirations.',
    signatureTechniques: [
      'Opening mid-story — dropping the audience directly into a scene before establishing context',
      'Naming and labelling the audience\'s emotional state before addressing it',
      'Using deliberate vulnerability: acknowledging personal mistakes, uncertainty, or change',
      'Asking reflective questions that invite the audience to locate themselves in the narrative'
    ],
    strengths: [
      'Builds room-wide trust faster than any other archetype',
      'Makes sensitive or difficult topics approachable and safe to discuss',
      'Leaves audiences feeling understood as well as informed',
      'Creates stories that travel — retold in hallways and across teams'
    ],
    idealContexts: [
      'Networking and relationship-building conversations',
      'Team retrospectives and culture talks',
      'Community building and DEI-focused presentations',
      'Sales conversations where the buyer\'s emotional journey matters'
    ],
    exampleExcerpt: '"The first time I had to lay someone off, I rehearsed it fourteen times. I still got it wrong. I\'m going to tell you what I wish I\'d known — not as a framework, but as the person who made every mistake on your behalf."',
    illustrationAsset: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
  <!-- Head -->
  <circle cx="40" cy="21" r="9" stroke="#8b4513" stroke-width="1.8"/>
  <!-- Body — leaning slightly forward, engaged -->
  <path d="M30 58 C29 44 51 44 50 58" stroke="#8b4513" stroke-width="1.8"/>
  <!-- One hand extended open — invitation gesture -->
  <path d="M30 46 L20 52" stroke="#8b4513" stroke-width="1.8"/>
  <path d="M20 52 L16 50" stroke="#8b4513" stroke-width="1.4"/>
  <path d="M20 52 L18 55" stroke="#8b4513" stroke-width="1.4"/>
  <!-- Heart shape above — empathy symbol -->
  <path d="M36 10 C36 7 33 6 33 9 C33 11 36 14 36 14 C36 14 39 11 39 9 C39 6 36 7 36 10 Z" stroke="#c8922a" stroke-width="1.4"/>
</svg>`,
    mappedGoalId: 'casual-networking'
  },
  {
    id: 'the-challenger',
    name: 'The Challenger',
    tagline: 'Disrupt the assumption before you pitch the solution.',
    styleDescription: 'The Challenger deliberately unsettles the audience\'s existing mental model before offering a new one. Their delivery is confident, direct, and strategically provocative — they lead with a counterintuitive claim, dismantle a widely-held belief with evidence, and then present their alternative as the logical conclusion. They are not abrasive; they are rigorous.',
    signatureTechniques: [
      'Opening with the assumption everyone in the room holds — then dismantling it',
      'Using data to challenge consensus before presenting the alternative view',
      '"Accusation audit": naming the most common objection before the audience can raise it',
      'Rhetorical questions that force the audience to confront an inconsistency in their own thinking'
    ],
    strengths: [
      'Commands immediate attention and intellectual respect',
      'Changes minds rather than just informing them',
      'Particularly effective with skeptical, sophisticated audiences',
      'Creates memorable moments through productive intellectual discomfort'
    ],
    idealContexts: [
      'Investor pitches to skeptical or experienced VCs',
      'Industry conference keynotes challenging received wisdom',
      'Board presentations proposing a significant strategic pivot',
      'Sales situations where the prospect\'s status quo is the main competitor'
    ],
    exampleExcerpt: '"Every person in this room has told a founder to go find more traction before coming back. I\'m going to show you the data on what that advice actually costs — in missed returns, in markets ceded, and in the specific companies you passed on that are now worth ten figures."',
    illustrationAsset: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
  <!-- Head -->
  <circle cx="40" cy="20" r="9" stroke="#2c2416" stroke-width="1.8"/>
  <!-- Body — upright, assured stance -->
  <path d="M30 58 C30 44 50 44 50 58" stroke="#2c2416" stroke-width="1.8"/>
  <!-- One arm raised with pointing finger — challenging gesture -->
  <path d="M50 46 L62 36" stroke="#2c2416" stroke-width="1.8"/>
  <line x1="62" y1="36" x2="62" y2="30" stroke="#2c2416" stroke-width="1.4"/>
  <!-- Broken line / crack — dismantling assumptions -->
  <path d="M10 40 L20 35 L16 45 L26 40" stroke="#c8922a" stroke-width="1.6" stroke-dasharray="2 2"/>
  <!-- Exclamation mark — provocation symbol -->
  <line x1="68" y1="20" x2="68" y2="30" stroke="#c8922a" stroke-width="1.8"/>
  <circle cx="68" cy="34" r="1.5" fill="#c8922a"/>
</svg>`,
    mappedGoalId: 'funding-pitch'
  }
];

const AppState = {
  screen: 'landing',
  activeModule: 'stage',
  session: { mode: null, status: 'idle', elapsed: 0, phasesCompleted: [], curveballsShown: [], recording: false, transcript: null },
  activeGoal: null,
  openLessonId: null,
  openArchetypeId: null,
  notes: [],
  searchQuery: '',
  curveballsEnabled: true,
  historyPanelOpen: false,

  init() {
    this.screen = 'landing';
    this.activeModule = 'stage';
    this.session = { mode: null, status: 'idle', elapsed: 0, phasesCompleted: [], curveballsShown: [], recording: false, transcript: null };
    this.activeGoal = null;
    this.openLessonId = null;
    this.openArchetypeId = null;
    this.notes = [];
    this.searchQuery = '';
    this.curveballsEnabled = true;
    this.historyPanelOpen = false;
  }
};

export { SESSION_MODES, LESSON_CATALOG, CURVEBALL_POOL, GOALS, ARCHETYPES, AppState };
