// Goal Playbooks — deep strategic content for the Navigator module
// Consumed by NavigatorController.js to render rich coaching phases per goal

export const GOAL_PLAYBOOKS = {
  'funding-pitch': {
    lessonDescriptions: [
      {
        lessonId: 'lesson-sinek-start-with-why',
        whyItMatters: 'Investors hear 20+ pitches a week — the ones that stick lead with belief, not features. Starting with WHY forces you to articulate the conviction behind your company in under 10 seconds, which is exactly the filter VCs use to decide whether to keep listening.'
      },
      {
        lessonId: 'lesson-voss-never-split',
        whyItMatters: 'A funding pitch is a negotiation disguised as a presentation. Tactical empathy helps you preempt investor objections by labeling their concerns before they voice them, which disarms skepticism and builds trust faster than any slide deck.'
      },
      {
        lessonId: 'lesson-heath-made-to-stick',
        whyItMatters: 'Most pitch decks drown in abstraction. The SUCCESs framework forces you to anchor your narrative in concrete, unexpected details — the kind that survive the partner meeting when your champion retells your story without slides.'
      },
      {
        lessonId: 'lesson-peak-end-rule',
        whyItMatters: 'Investors remember two moments: the emotional peak and the final impression. Designing your pitch around these psychological anchors means you control what gets discussed in the debrief — not left to chance.'
      },
      {
        lessonId: 'lesson-handling-questions',
        whyItMatters: 'The Q&A reveals more about founder quality than the pitch itself. Handling tough questions with composure and intellectual honesty signals coachability — the single trait early-stage investors rank above market size.'
      }
    ],
    strategies: [
      {
        title: 'The Opening Hook',
        objective: 'Capture undivided attention in the first 15 seconds so investors lean in rather than check email.',
        approach: 'Leverage the curiosity gap — present an incomplete pattern that the brain cannot ignore. Combine a provocative statistic with an implied contradiction to create cognitive tension that demands resolution. This exploits the Zeigarnik Effect: open loops stay active in working memory until closed.',
        blueprint: [
          '0:00–0:05: Open with a single sentence containing one surprising number. Example: "Last year, 14 million hours of enterprise productivity vanished into a workflow that hasn\'t changed since 1997."',
          '0:05–0:10: Pause for 2 full seconds. Let the number land. Do not explain it yet.',
          '0:10–0:15: Deliver the contradiction: "Every company we spoke to knew this — and none had tried to fix it." This frames the gap as irrational, implying an insight only you possess.',
          '0:15–0:25: Transition with "Here\'s what we found…" — this bridges into your thesis without a jarring slide change.'
        ],
        caseStudy: {
          company: 'Airbnb',
          context: 'Pitching at Y Combinator Demo Day 2009 when the sharing economy was not yet a concept investors understood.',
          execution: 'Brian Chesky opened not with the product, but with a single data point: "In 2008, 2 people couldn\'t pay rent in San Francisco." He paused, then revealed they solved it by renting air mattresses to strangers — framing a personal desperation as a market insight. The contradiction (strangers sleeping in your apartment = billion-dollar market) created an open loop investors needed resolved.',
          result: 'Sequoia led a $600K seed round within weeks, citing the clarity of the problem framing.'
        },
        psychology: 'The Zeigarnik Effect means incomplete information occupies working memory until resolved — your audience literally cannot disengage from an unanswered question. Combined with the Von Restorff isolation effect (one surprising element among expected ones becomes disproportionately memorable), the opening hook ensures your pitch enters long-term memory at 10x the rate of a standard introduction.'
      },
      {
        title: 'The Market Narrative',
        objective: 'Frame the problem as urgent and inevitable so the market size feels earned rather than asserted.',
        approach: 'Use narrative transportation to make the investor feel the problem viscerally before showing the numbers. Lead with a specific user story that embodies the systemic failure, then zoom out to reveal scale. This bypasses analytical resistance because transported audiences suspend counterarguing.',
        blueprint: [
          '0:25–0:50: Tell a 25-second story about ONE real user. Name them. Describe their Tuesday morning. Show the specific moment the existing workflow fails them. Target 60 words maximum.',
          '0:50–1:10: Zoom out: "Sarah is one of 4.2 million operations managers hitting this wall every week." Transition from anecdote to TAM in one sentence.',
          '1:10–1:30: Show the structural reason the problem persists (legacy incentives, regulatory shift, or technology unlock). Use one slide with 3 words maximum.',
          '1:30–1:45: State your insight as a falsifiable thesis: "We believe [X] because [Y]." This gives investors something concrete to diligence.'
        ],
        caseStudy: {
          company: 'Stripe',
          context: 'Patrick Collison pitching developers as an underserved payment audience when PayPal dominated the market.',
          execution: 'Rather than showing a TAM slide, Collison described the exact moment a developer abandons a side project because payment integration takes 2 weeks. He named a specific developer forum thread with 400+ upvotes asking for a simpler solution. Then he revealed: "There are 18 million developers worldwide. None of them want to read a 300-page payment API doc."',
          result: 'Sequoia invested at a $100M valuation pre-revenue, convinced by the specificity of the pain point.'
        },
        psychology: 'Narrative transportation — when audiences are absorbed in a story, they reduce counterarguing by up to 70% (Green & Brock, 2000). By placing investors inside a user\'s frustration before showing market data, you bypass the "prove it" reflex. The anchoring bias then makes your TAM number feel conservative because they experienced the pain firsthand.'
      },
      {
        title: 'The Live Demo Moment',
        objective: 'Create an undeniable "aha" moment by showing the product solving the problem in real time.',
        approach: 'Exploit the picture superiority effect — visual demonstrations are retained 6x longer than verbal claims. Structure the demo as a before/after contrast compressed into 60 seconds, making the value gap visceral and self-evident rather than argued.',
        blueprint: [
          '1:45–2:00: Set up the demo with the status quo: "Let me show you what Sarah\'s Tuesday looks like today." Show the old way in 15 seconds — make it feel painful.',
          '2:00–2:15: Transition: "Now watch what happens with us." Click one button or perform one action. Keep the interaction count below 3.',
          '2:15–2:45: Let the result speak. Show real output, real data, real time savings. Display a counter or metric that updates live. Silence is powerful here — resist narrating.',
          '2:45–3:00: Close the demo with the delta: "That was 3 seconds. The old way takes 45 minutes." One sentence, one number comparison.'
        ],
        caseStudy: {
          company: 'Dropbox',
          context: 'Drew Houston pitching cloud storage when investors said "this already exists" (Box, iDisk, USB drives).',
          execution: 'Houston did not argue differentiation — he simply dragged a file into a folder on his laptop and showed it appear instantly on another device across the stage. No slides, no talking points during the 8-second action. Then he said: "That\'s it. It just works." The simplicity was the argument.',
          result: 'The demo video alone generated 75,000 waitlist signups overnight and led to Sequoia\'s Series A.'
        },
        psychology: 'The picture superiority effect means visual demonstrations transfer to long-term memory at 6x the rate of verbal information. Combined with the contrast effect (juxtaposing painful old way against effortless new way), live demos create what Kahneman calls "cognitive ease" — the product feels inevitable and obvious, which is the highest form of investor conviction.'
      },
      {
        title: 'The Close & Ask',
        objective: 'Convert attention into commitment by making a specific ask supported by social proof and calibrated urgency.',
        approach: 'Apply loss aversion — investors fear missing a deal more than they fear a bad one at seed stage. Combine a concrete ask (exact amount, use of funds, timeline) with social proof (who else is in) and a deadline that creates decision pressure without feeling manipulative.',
        blueprint: [
          '3:00–3:15: State the ask in one sentence: "We\'re raising $2M on a $10M cap to hire 3 engineers and reach $50K MRR by Q3." No ambiguity, no ranges.',
          '3:15–3:30: Drop social proof naturally: "Notation and South Park Commons are already committed for $800K." Name real investors or advisors — generics don\'t work.',
          '3:30–3:45: Create time pressure: "We\'re closing the round in 3 weeks because we have candidates waiting on offers." The urgency must be real and verifiable.',
          '3:45–4:00: End with forward momentum: "I\'d love to send our data room tonight and schedule a follow-up Thursday. Does that work?" Give them a specific next action, not an open question.'
        ],
        caseStudy: {
          company: 'Notion',
          context: 'Ivan Zhao raising a $10M Series A after nearly shutting down the company twice.',
          execution: 'Zhao closed his pitch with radical specificity: he named the exact number of power users (1,200), the exact revenue ($300K ARR), and the exact timeline ("we\'ll be at $1M ARR in 8 months or we\'ll shut down"). He then said two investors had already committed and the round would close in 2 weeks regardless of fill. The "regardless" created authentic urgency.',
          result: 'The round oversubscribed by 3x within 10 days, valuing Notion at $800M pre-revenue-inflection.'
        },
        psychology: 'Loss aversion means the pain of missing an opportunity is 2x stronger than the pleasure of capturing one (Kahneman & Tversky). By combining social proof ("others are in") with a verifiable deadline, you activate both herd instinct and scarcity bias simultaneously. The specific next action exploits the commitment consistency principle — once someone agrees to a small step (receiving a data room), they\'re significantly more likely to follow through on the larger one (writing a check).'
      }
    ]
  },

  'technical-explanation': {
    lessonDescriptions: [
      {
        lessonId: 'lesson-cognitive-load',
        whyItMatters: 'Technical explanations fail when they overload working memory. Understanding Cognitive Load Theory lets you chunk complex systems into 3-4 digestible pieces, ensuring your audience builds correct mental models instead of nodding while lost.'
      },
      {
        lessonId: 'lesson-heath-made-to-stick',
        whyItMatters: 'Engineers default to completeness over clarity. The SUCCESs framework teaches you to find the core — the one sentence that, if your audience remembers nothing else, still gives them the essential insight about your system.'
      },
      {
        lessonId: 'lesson-gallo-talk-like-ted',
        whyItMatters: 'The best technical communicators at companies like Stripe and Linear treat explanations as performances. Gallo\'s framework shows you how to structure a technical talk so it feels like a story, not a documentation dump.'
      },
      {
        lessonId: 'lesson-sinek-start-with-why',
        whyItMatters: 'Before explaining HOW something works, your audience needs to care WHY it exists. Leading with purpose creates a motivation scaffold that makes even dense architectural decisions feel logical and inevitable.'
      },
      {
        lessonId: 'lesson-opening-strong',
        whyItMatters: 'The first 30 seconds of a technical explanation determine whether your audience actively follows or passively waits. A strong opening poses the puzzle your explanation will solve, converting passive listeners into engaged problem-solvers.'
      }
    ],
    strategies: [
      {
        title: 'The Curiosity Scaffold',
        objective: 'Open with a question that makes the audience need the explanation before you deliver it.',
        approach: 'Use question-first architecture — pose a concrete puzzle that your technical content resolves. This activates the brain\'s prediction machinery, making each piece of information feel like a clue rather than a lecture point. The audience becomes an active participant seeking the answer rather than a passive recipient of facts.',
        blueprint: [
          '0:00–0:15: Pose a specific, falsifiable question: "Why does our search return results in 12ms when our database has 400 million rows?" Make it concrete enough to visualize.',
          '0:15–0:30: Acknowledge the obvious wrong answer: "You might think it\'s just caching — but our cache hit rate is only 34%." This eliminates the easy explanation and deepens curiosity.',
          '0:30–1:00: Preview the 3-part structure: "The answer involves three ideas: inverted indexes, bloom filters, and a trick we borrowed from video games." Give them a map of 3 stops maximum.',
          '1:00–1:30: Start with the simplest piece. Use one visual. Target 40 words to explain concept one before adding nuance.'
        ],
        caseStudy: {
          company: 'Linear',
          context: 'Karri Saarinen explaining to a developer audience why Linear feels faster than every other project management tool.',
          execution: 'Instead of showing architecture slides, Saarinen opened with a live performance test: he clicked a button and asked the audience to count the perceived delay. "Did you feel that? That was 50ms. Your brain registered it. Now watch Jira." The audience laughed — then wanted to know how. He had earned permission to go deep into their sync engine by making the audience feel the problem first.',
          result: 'The talk became Linear\'s most-shared engineering content, driving 30% of their developer signups that quarter.'
        },
        psychology: 'The information gap theory (Loewenstein, 1994) states that curiosity arises when we perceive a gap between what we know and what we want to know. By posing a question and eliminating the obvious answer, you widen this gap deliberately. The brain treats unresolved questions as open tasks — the same Zeigarnik Effect that makes cliffhangers work in storytelling keeps your technical audience engaged through dense material.'
      },
      {
        title: 'The Layered Analogy',
        objective: 'Build a mental model from everyday concepts that maps precisely onto the technical reality.',
        approach: 'Use analogical scaffolding — connect the unknown system to a known domain, then progressively add fidelity. The key is choosing an analogy where the structural relationships (not surface features) match your technical system. Layer complexity gradually: analogy first, precise terminology second, edge cases last.',
        blueprint: [
          '1:30–2:00: Introduce the base analogy in one sentence: "An inverted index works like the index in the back of a textbook — instead of reading every page to find a word, you look up the word and it tells you every page it appears on."',
          '2:00–2:30: Map 2-3 structural elements explicitly: "Pages are documents. Words are tokens. Page numbers are document IDs." Keep it to a 3-column table on one slide.',
          '2:30–3:00: Reveal where the analogy breaks down: "Unlike a book index, ours updates in real-time and ranks results by relevance — that\'s where bloom filters enter." This transition respects your audience\'s intelligence.',
          '3:00–3:30: Show the real implementation alongside the analogy. Use split-screen: left side shows the textbook metaphor, right side shows the actual data structure. Let them bridge the gap themselves.'
        ],
        caseStudy: {
          company: 'Figma',
          context: 'Evan Wallace explaining Figma\'s multiplayer architecture (CRDTs) to designers who had no distributed systems background.',
          execution: 'Wallace compared CRDTs to "a Google Doc, except imagine every letter remembers who typed it and in what order — even if two people type in the same spot at the same time." He then showed two cursors live-editing the same frame, narrating the conflict resolution as it happened. The analogy (Google Docs) was familiar; the delta (per-character memory) was the precise innovation.',
          result: 'Figma\'s multiplayer became their primary differentiator against Sketch, cited by designers who could now explain WHY it worked to their teams.'
        },
        psychology: 'Analogical reasoning is the brain\'s primary mechanism for understanding novel concepts (Gentner, 1983). Effective analogies share relational structure, not surface similarity. When you map known → unknown at the relationship level (textbook index → inverted index), you leverage existing neural pathways instead of building new ones from scratch. This reduces cognitive load by 40-60% compared to abstract-first explanations, freeing working memory for nuance and edge cases.'
      },
      {
        title: 'The Proof Point',
        objective: 'Transform abstract understanding into concrete conviction by showing the system performing under real conditions.',
        approach: 'Apply the concreteness principle — abstract claims become believable only when grounded in observable evidence. Structure the proof as a prediction → test → result sequence, which mirrors the scientific method and gives the audience a framework for evaluating your claim independently.',
        blueprint: [
          '3:30–3:45: Make a specific, testable prediction: "If this architecture works as I described, we should be able to search 400M rows in under 15ms with zero caching." State the exact metric.',
          '3:45–4:15: Run the test live. Show real data, real latency, real infrastructure. If live demos are risky, use a screen recording with timestamps visible. Never fake it — audiences detect inauthenticity instantly.',
          '4:15–4:30: Show the result and compare to the prediction: "12.4ms. That\'s 3x faster than the theoretical limit of a sequential scan." Let the number speak.',
          '4:30–5:00: Close with the implication: "This means [real-world outcome for users]." Always translate technical proof back into human impact. One sentence maximum.'
        ],
        caseStudy: {
          company: 'Superhuman',
          context: 'Rahul Vohra explaining their "100ms rule" — the principle that every interaction must complete within 100ms — to engineering candidates.',
          execution: 'Vohra didn\'t just state the rule. He opened Gmail on stage, performed 5 common actions, and displayed measured latency for each (180ms, 240ms, 320ms, 190ms, 280ms). Then he performed the same 5 actions in Superhuman: 40ms, 55ms, 60ms, 45ms, 50ms. He showed no slides during this — just two apps side by side with a latency overlay. The proof was visceral.',
          result: 'The demonstration became Superhuman\'s primary recruiting tool, with engineers citing "the speed demo" as why they joined.'
        },
        psychology: 'The availability heuristic means people judge likelihood based on how easily examples come to mind. A live demonstration creates a vivid, sensory memory trace that outweighs any amount of verbal argument. Combined with the prediction → test → result sequence (which activates the brain\'s hypothesis-testing circuitry), proof points create what psychologists call "experiential knowledge" — belief grounded in personal observation rather than secondhand claims.'
      }
    ]
  },

  'casual-networking': {
    lessonDescriptions: [
      {
        lessonId: 'lesson-brown-vulnerability',
        whyItMatters: 'Networking events reward depth over breadth. Brené Brown\'s research shows that strategic vulnerability — sharing a genuine challenge or uncertainty — creates trust 10x faster than polished self-presentation, turning a 5-minute conversation into a real relationship.'
      },
      {
        lessonId: 'lesson-pratfall-effect',
        whyItMatters: 'Competent people who show small imperfections are rated as more likeable and approachable. In networking contexts, a well-timed admission of what you don\'t know makes people want to help you rather than compete with you.'
      },
      {
        lessonId: 'lesson-voss-never-split',
        whyItMatters: 'Great networkers ask calibrated questions that make the other person feel heard. Voss\'s tactical empathy techniques (mirroring, labeling) turn shallow "what do you do?" exchanges into memorable conversations where both parties feel genuinely understood.'
      },
      {
        lessonId: 'lesson-cuddy-body-language',
        whyItMatters: 'First impressions at networking events form in 100ms — before you speak a single word. Understanding power poses and warmth signals lets you project approachability and confidence simultaneously, making people want to approach you.'
      },
      {
        lessonId: 'lesson-personal-note-best-habits',
        whyItMatters: 'The networking event is just the beginning. Building a habit of same-day follow-up with a specific detail from your conversation is what converts a pleasant chat into an actual professional relationship.'
      }
    ],
    strategies: [
      {
        title: 'The Authentic Opening',
        objective: 'Start a conversation with a stranger in a way that bypasses small talk and signals genuine interest within 30 seconds.',
        approach: 'Replace the standard "What do you do?" with a context-aware observation or question that demonstrates you\'re paying attention to the specific environment. This activates the reciprocity principle — people invest effort matching the quality of what they receive. A thoughtful opening earns a thoughtful response.',
        blueprint: [
          '0:00–0:05: Make eye contact and use an open posture (uncrossed arms, slight forward lean, visible palms). Approach from a 45-degree angle, not head-on.',
          '0:05–0:15: Open with a context-specific observation, not a generic question. Examples: "The speaker said something about async-first culture that I\'m still processing — did that land differently for you?" or "I noticed you asked that question about retention — are you dealing with that now?"',
          '0:15–0:25: After they respond, use a Voss mirror: repeat the last 2-3 words as a question. This signals deep listening and invites elaboration without effort.',
          '0:25–0:30: Offer one sentence about yourself that connects to what they said — not your title, but your current challenge or interest. "I\'m wrestling with something similar at my company right now."'
        ],
        caseStudy: {
          company: 'Calendly',
          context: 'Tope Awotona networking at SaaStr 2018 before Calendly had raised institutional funding.',
          execution: 'Rather than pitching his product, Awotona approached potential investors with a genuine question about their scheduling pain: "I\'m curious — when you book 15 meetings at a conference like this, how do you actually keep track of follow-ups?" This wasn\'t a setup for a pitch; it was genuine product research. But it opened conversations where investors experienced the problem firsthand and asked him to explain his solution.',
          result: 'Three of his seed investors cited "the conversation at SaaStr" as their entry point into the deal.'
        },
        psychology: 'The reciprocity norm (Cialdini, 1984) states that people feel obligated to match the quality of social exchange. A thoughtful, specific opening creates "social debt" — the other person invests more effort in their response because you invested more in your question. Combined with the mere exposure effect (familiarity breeds liking), a memorable opening means they\'ll recognize and approach YOU at the next event.'
      },
      {
        title: 'The Depth Pivot',
        objective: 'Transition from surface-level pleasantries to a genuine exchange within 3-5 minutes that both parties find valuable.',
        approach: 'Use calibrated questions that invite the other person to share challenges, not achievements. People bond over shared problems faster than shared successes because vulnerability activates mirror neurons — the listener feels what the speaker feels. The key is giving "permission" to go deeper by going first.',
        blueprint: [
          '2:00–2:30: After the initial exchange, ask ONE challenge-oriented question: "What\'s the hardest thing about [their work/role] that people on the outside don\'t see?" This signals respect and invites real talk.',
          '2:30–3:30: Listen for 60 full seconds without interrupting. When they pause, use a label: "It sounds like you\'re carrying that tension between [X] and [Y]." This validates their experience and deepens trust.',
          '3:30–4:00: Share your own parallel challenge in 30 seconds or less. Keep it current and specific: "I\'m dealing with something adjacent — we can\'t figure out [specific problem]." This creates mutual ground.',
          '4:00–4:30: Ask one future-oriented question: "What would solving that unlock for you?" This shifts energy from complaint to aspiration and makes the conversation memorable.'
        ],
        caseStudy: {
          company: 'Buffer',
          context: 'Joel Gascoigne building Buffer\'s early advisory network through genuine one-on-one conversations rather than formal advisory agreements.',
          execution: 'Gascoigne\'s networking approach was to share his exact monthly revenue numbers and challenges publicly (via blog) and privately (in conversations). At conferences, instead of pitching, he\'d say: "We\'re at $20K MRR and I genuinely don\'t know how to get to $50K. What would you try?" This radical transparency made people want to help — advisors, investors, and fellow founders all leaned in because the question was real, not performative.',
          result: 'Buffer built a 12-person advisory network without formal agreements, credited by Gascoigne as the primary driver of their growth from $20K to $200K MRR.'
        },
        psychology: 'Mirror neurons fire both when we experience an emotion and when we observe someone else experiencing it. When you share a genuine challenge, the listener\'s brain simulates your emotional state — creating instant empathy without requiring words. This neural coupling (Stephens et al., 2010) is why vulnerability creates connection: both brains literally synchronize, producing the subjective experience of "clicking" with someone.'
      },
      {
        title: 'The Memorable Close',
        objective: 'End the conversation in a way that creates a natural reason to follow up, making the next interaction feel expected rather than cold.',
        approach: 'Use the Peak-End Rule in reverse — engineer the final 30 seconds to be the emotional high point of the interaction. Combine a specific compliment (demonstrating you listened) with a concrete next step (removing ambiguity from follow-up). This transforms a pleasant chat into an open loop that both parties want to close.',
        blueprint: [
          '4:30–4:45: Signal the close warmly: "I should let you work the room, but I want to say — [specific thing they said] genuinely changed how I\'m thinking about [your challenge]." Be precise, not generic.',
          '4:45–5:00: Propose a concrete next step with low commitment: "I\'d love to send you [specific resource relevant to their challenge] — can I grab your email?" or "Would you be up for a 15-minute call next week? I want to hear how [their project] plays out."',
          '5:00–5:10: If they agree, confirm the detail: "Great, I\'ll send that article tonight." Create a micro-commitment with a specific timeline.',
          '5:10–5:15: Close with their name: "Really glad we talked, [Name]." Using their name at the end triggers the cocktail party effect and cements recall.'
        ],
        caseStudy: {
          company: 'Loom',
          context: 'Joe Thomas building early relationships with potential enterprise customers at SaaS conferences before Loom had product-market fit.',
          execution: 'Thomas developed a signature close: after every meaningful conversation, he\'d say "Let me send you a 2-minute Loom video summarizing what we talked about — it\'ll be easier than an email." This accomplished three things: it demonstrated his product naturally, it created a follow-up obligation (people always watched and replied), and it signaled genuine care because a video takes more effort than a templated email.',
          result: 'Thomas reported that his "Loom follow-up" had a 90%+ reply rate compared to 20% for standard post-conference emails, generating Loom\'s first 50 enterprise pilot customers.'
        },
        psychology: 'The Peak-End Rule (Kahneman, 1999) demonstrates that memories of experiences are disproportionately weighted by the emotional peak and the final moment. By engineering your close to be both the emotional peak (specific compliment showing you listened) and the final moment (concrete next step), you ensure the entire conversation is remembered positively. The specificity of the follow-up exploits implementation intentions — when people commit to a specific action ("send that article tonight"), execution rates increase from 30% to 70%.'
      }
    ]
  },

  'inspirational-talk': {
    lessonDescriptions: [
      {
        lessonId: 'lesson-sinek-start-with-why',
        whyItMatters: 'Inspirational talks that start with purpose create movements; those that start with information create presentations. Your WHY is the emotional current that carries the audience from passive agreement to active belief — it\'s the difference between applause and action.'
      },
      {
        lessonId: 'lesson-brown-vulnerability',
        whyItMatters: 'Audiences don\'t connect with perfection — they connect with struggle. Strategic vulnerability creates what Brown calls "the vulnerability loop": when you share honestly, the audience unconsciously reciprocates with trust, creating a room-wide emotional bond that generic motivational content cannot replicate.'
      },
      {
        lessonId: 'lesson-gallo-talk-like-ted',
        whyItMatters: 'The best TED talks share a hidden structure: emotional hook, narrative tension, resolution, call to action. Gallo\'s framework gives you the architecture to make an 18-minute talk feel like 5 minutes while delivering an idea that reshapes how the audience sees the world.'
      },
      {
        lessonId: 'lesson-peak-end-rule',
        whyItMatters: 'Standing ovations are not random — they\'re engineered. The Peak-End Rule tells you exactly where to place your most powerful story (two-thirds through) and how to construct a final 60 seconds that echoes in the audience\'s mind for weeks.'
      },
      {
        lessonId: 'lesson-opening-strong',
        whyItMatters: 'You have 7 seconds before an audience decides whether to give you their full attention or retreat to their phone. A strong opening earns the right to their time — it\'s not a luxury, it\'s the minimum viable entry ticket to being heard.'
      }
    ],
    strategies: [
      {
        title: 'The Emotional Entry Point',
        objective: 'Open with a personal story that earns the audience\'s emotional permission to lead them somewhere meaningful.',
        approach: 'Use story-first architecture — begin with a specific, sensory moment from your own experience that embodies the core theme. The story should be low-status (you struggling, failing, or uncertain) because this creates identification rather than distance. The audience must see themselves in your shoes before they\'ll follow where you lead.',
        blueprint: [
          '0:00–0:10: Drop into a scene mid-action. No preamble, no "I want to tell you a story." Example: "It was 2 AM and I was sitting in my car in the parking lot because I couldn\'t walk back into that building."',
          '0:10–0:30: Add one sensory detail that makes the moment physical: temperature, sound, texture. "The dashboard light was the only thing illuminating my hands, and they wouldn\'t stop shaking."',
          '0:30–0:50: Reveal the stakes in one sentence: "I had 48 hours to decide whether to shut down the company I\'d spent 3 years building." Keep it factual, not melodramatic.',
          '0:50–1:00: Pause. Then transition with a question: "What I didn\'t know then — what took me another year to understand — was that this moment was the beginning, not the end." This creates the open loop that your talk will resolve.'
        ],
        caseStudy: {
          company: 'Mailchimp',
          context: 'Ben Chestnut speaking at a founder conference about why Mailchimp never took VC funding for 20 years.',
          execution: 'Chestnut didn\'t open with Mailchimp\'s revenue numbers or contrarian philosophy. He opened with a story about being 12, watching his mother sew prom dresses in their living room for $50 each while their landlord raised rent. "She never scaled. She never hired. She just kept sewing." He paused for 5 seconds. Then: "I built a billion-dollar company trying to understand why." The audience was transported into a childhood living room before they were asked to think about SaaS economics.',
          result: 'The talk was shared 50,000+ times and became the defining articulation of why bootstrapping can outperform venture capital for certain founders.'
        },
        psychology: 'Narrative transportation (Green & Brock, 2000) occurs when audiences become absorbed in a story — their brain activity synchronizes with the speaker\'s (measured via fMRI), critical faculties reduce, and emotional responses amplify. By opening with a low-status personal moment, you trigger identification rather than comparison. The audience\'s mirror neurons simulate your experience, creating instant empathy. This neural coupling makes everything that follows land with 3-5x more emotional weight.'
      },
      {
        title: 'The Tension Arc',
        objective: 'Build escalating narrative tension that makes the resolution feel earned and cathartic rather than prescribed.',
        approach: 'Structure the middle section as a series of "raises" — each new story or data point increases the stakes and complicates the easy answer. Resist resolving the tension too early. The audience should feel slightly uncomfortable before you deliver the insight, because discomfort creates the cognitive space for new ideas to take root.',
        blueprint: [
          '3:00–5:00: Introduce the first complication. After your opening story establishes the theme, show why the obvious solution DIDN\'T work. "So I did what every business book says — I hired faster, raised more, worked harder. And it made everything worse." (120 words maximum.)',
          '5:00–7:00: Introduce a second perspective that contradicts your initial framing. Quote someone who challenged your assumption. "My cofounder said something I hated hearing: \'What if growing is the problem?\'" Let the tension between two valid perspectives sit unresolved.',
          '7:00–9:00: Raise the stakes with a consequence. Show what happened because of the unresolved tension. Make it personal and specific. "We lost 3 people I cared about deeply. Not to a competitor — to our own culture of urgency."',
          '9:00–10:00: Signal the turn WITHOUT resolving it: "I\'m going to tell you what I learned, but I want you to feel this tension for another moment — because most of us live in it and never name it."'
        ],
        caseStudy: {
          company: 'Basecamp',
          context: 'Jason Fried presenting "Enough" at a tech conference where every other speaker was celebrating hyper-growth.',
          execution: 'Fried structured his tension arc around a single question: "What if growth isn\'t the goal?" He presented 3 escalating examples of companies that grew themselves into misery (unnamed but recognizable), each one more painful than the last. The audience expected him to offer a solution after each example. He didn\'t. He let the discomfort build for 8 minutes before finally saying: "I don\'t have an answer. I have a practice." The delay made his framework land with cathartic relief.',
          result: 'The talk influenced a generation of founders to question default venture-scale assumptions, contributing to the "calm company" movement.'
        },
        psychology: 'The inverted-U model of arousal (Yerkes-Dodson Law) shows that moderate tension optimizes attention and memory formation. Too little tension and the audience drifts; too much and they shut down. By building tension gradually through complications and withholding resolution, you keep the audience in the peak performance zone of the arousal curve. The eventual resolution triggers dopamine release proportional to the tension duration — this is why great stories feel physically satisfying when they resolve.'
      },
      {
        title: 'The Vulnerability Window',
        objective: 'Share one moment of genuine weakness or failure that transforms you from a speaker into a human being the audience trusts.',
        approach: 'Strategic self-disclosure placed at the two-thirds mark — after you\'ve established credibility but before your closing argument. The vulnerability must be specific, time-bounded, and resolved (not ongoing). This follows Brené Brown\'s research showing that vulnerability from a position of strength builds trust, while vulnerability from desperation creates discomfort.',
        blueprint: [
          '10:00–10:30: Transition into the vulnerable moment: "I need to tell you something I haven\'t said on stage before." This signals to the audience that what follows is real, not rehearsed.',
          '10:30–11:30: Tell the story in 60 seconds maximum. Be specific: date, place, who was there, what you felt. "In March 2019, I stood in front of my team and cried. Not strategically. Not inspirationally. I cried because I was exhausted and scared and I didn\'t know what to do next." (50 words for the core confession.)',
          '11:30–12:00: Show what happened AFTER — the response, the shift, the lesson. "What I didn\'t expect was that three people came to me afterwards and said: \'Thank you — I thought I was the only one.\'". Resolution must be honest, not triumphant.',
          '12:00–12:30: Connect it to the audience\'s reality: "I\'m telling you this because I think most of us are performing competence while privately drowning. And that gap is killing our teams." Make the personal universal in one sentence.'
        ],
        caseStudy: {
          company: 'Slack',
          context: 'Stewart Butterfield speaking about Slack\'s near-death experience — the failed game company (Glitch) that accidentally produced a communication tool.',
          execution: 'Butterfield shared the exact moment he realized Glitch would fail: "I remember looking at our DAU graph and it was just... flat. For months. And I knew. Everyone knew. But no one was saying it." He then described the specific team meeting where he finally said the words: "We\'re shutting down the game." His voice caught slightly — not performed, genuine. Then: "The tool we\'d built to talk to each other while failing... that was the company."',
          result: 'The talk reframed failure as a creative act rather than a loss, and became Slack\'s origin myth that attracted talent who valued authenticity over polish.'
        },
        psychology: 'The Pratfall Effect (Aronson, 1966) demonstrates that competent individuals become MORE likeable after displaying a minor weakness — it activates the audience\'s approach motivation rather than avoidance. Placed at the two-thirds mark, vulnerability benefits from the credibility already established (you\'ve earned the right to be human) while creating the emotional peak that the Peak-End Rule requires for lasting memory formation. Audiences rate speakers who display strategic vulnerability as 40% more trustworthy and 25% more competent than those who present flawlessly.'
      },
      {
        title: 'The Resonant Close',
        objective: 'Construct a final 60 seconds so emotionally precise that the audience carries your message out of the room and into their decisions.',
        approach: 'Use the callback technique — return to your opening story with new meaning. The audience experiences the same image/moment through transformed understanding, which creates a sense of completion and intellectual satisfaction. Combine this with a single, actionable sentence they can repeat to others (your "soundbite thesis").',
        blueprint: [
          '15:00–15:15: Signal the close physically — step forward, lower your voice slightly, slow your pace by 30%. These nonverbal cues tell the audience\'s brain to increase attention.',
          '15:15–15:35: Return to your opening image: "Remember that parking lot at 2 AM? The shaking hands? I want to tell you what happened next." Completing the story loop creates cognitive closure.',
          '15:35–15:50: Deliver the resolution in 2 sentences maximum. It should be surprising but inevitable: "I walked back inside. Not because I had answers — but because I finally understood that not knowing was the job."',
          '15:50–16:00: End with one sentence that could stand alone as a thesis. It should be quotable, tweetable, and true: "Leadership isn\'t knowing the way. It\'s walking forward without a map and making that feel safe for others." Full stop. No "thank you." Walk off.'
        ],
        caseStudy: {
          company: 'Figma',
          context: 'Dylan Field speaking at Config 2023 about the future of design tools and the Adobe acquisition collapse.',
          execution: 'Field opened his talk with a photo of the first Figma prototype — crude, broken, running in a browser nobody thought could handle design tools. He built 45 minutes of narrative about community, collaboration, and bet-making. In his final 30 seconds, he put the same prototype screenshot back on screen and said: "This is still what we\'re building. Everything else is detail." The callback reframed 10 years of complexity into a single continuous intention. He walked off without saying thank you. The applause was immediate.',
          result: 'The closing line became Figma\'s internal rallying cry during the post-acquisition uncertainty, repeated in Slack channels and all-hands meetings for months.'
        },
        psychology: 'The Peak-End Rule (Kahneman) dictates that experiences are judged almost entirely by their emotional peak and their ending. By engineering your close to be BOTH the peak and the end simultaneously (callback technique + quotable thesis), you maximize memory encoding. The callback creates what Gestalt psychologists call "closure" — completing an open pattern, which triggers satisfaction and dopamine release. The quotable thesis exploits the "generation effect" — when audiences can repeat your idea in their own voice, retention increases by 50% compared to passive absorption.'
      }
    ]
  },

  'job-interview': {
    lessonDescriptions: [
      {
        lessonId: 'lesson-cuddy-body-language',
        whyItMatters: 'Interview decisions are disproportionately influenced by the first 2 minutes — before you answer a single substantive question. Cuddy\'s research on power posing and warmth signals gives you a tactical protocol for projecting competence and approachability from the moment you enter the room.'
      },
      {
        lessonId: 'lesson-pratfall-effect',
        whyItMatters: 'Candidates who present as flawless trigger skepticism. The Pratfall Effect shows that admitting one genuine limitation (after establishing competence) makes you more likeable and trustworthy — interviewers remember you as "the honest one" in a sea of rehearsed perfection.'
      },
      {
        lessonId: 'lesson-voss-never-split',
        whyItMatters: 'An interview is a negotiation about fit. Tactical empathy skills — mirroring, labeling, calibrated questions — let you understand what the interviewer really needs (often different from what the job posting says) and position your experience as the precise solution to their unstated problem.'
      },
      {
        lessonId: 'lesson-handling-questions',
        whyItMatters: 'The questions you cannot answer define you more than the ones you can. Having a framework for gracefully handling unknowns — acknowledging the gap, showing your reasoning process, offering to follow up — demonstrates intellectual honesty and learning velocity, the two traits senior leaders value most.'
      },
      {
        lessonId: 'lesson-peak-end-rule',
        whyItMatters: 'Interviewers write their evaluations 5-15 minutes after you leave. The Peak-End Rule means your final answer and closing moment disproportionately determine their assessment. Engineering your last 90 seconds is the highest-leverage interview preparation you can do.'
      }
    ],
    strategies: [
      {
        title: 'The Confidence Frame',
        objective: 'Establish physical and verbal presence in the first 2 minutes that signals leadership-level composure and genuine warmth.',
        approach: 'Combine Cuddy\'s power posing research (expansive posture, measured pace, firm handshake) with strategic warmth signals (genuine smile, name usage, brief personal connection). The goal is not dominance but calibrated confidence — you want the interviewer to feel that you\'re someone who can handle pressure while remaining human and collaborative.',
        blueprint: [
          'Pre-interview: 2 minutes of private power posing (arms raised, feet wide) to elevate testosterone and reduce cortisol. Do this in the restroom or car — never in the waiting area.',
          '0:00–0:15: Enter with upright posture, make eye contact, smile genuinely, and use their name: "Great to meet you, Sarah." Handshake: firm, 2 seconds, match their grip pressure. Sit at 80% of chair depth (signals engagement without rigidity).',
          '0:15–0:45: Deploy a "warmth signal" — one authentic sentence that\'s not about the job: "I noticed the team photos in the hallway — the offsite looked incredible. Where was that?" This demonstrates observation skills while building rapport.',
          '0:45–2:00: When they begin with "Tell me about yourself," deliver a 60-second narrative arc: [1] Where you were (10 sec), [2] The problem you chose to solve (20 sec), [3] What you built/learned (20 sec), [4] Why you\'re here specifically (10 sec). Total: 90 words maximum. End with: "But I\'d love to hear more about what this role looks like day-to-day for you."'
        ],
        caseStudy: {
          company: 'Notion',
          context: 'A senior product designer describing their interview experience at Notion, shared publicly in a career retrospective.',
          execution: 'The candidate researched Ivan Zhao\'s design philosophy extensively and opened with a specific observation: "I read your essay on tools for thought — the idea that software should feel like a physical workshop stuck with me." This signaled preparation without flattery. When asked "tell me about yourself," they delivered a 45-second answer structured around a single design principle they\'d evolved over their career, ending with: "That principle is why Notion\'s approach resonates — I want to understand how you think about it internally."',
          result: 'The candidate reported receiving a same-day follow-up from the hiring manager with the note: "We rarely have candidates who clearly understand our philosophy before walking in."'
        },
        psychology: 'Amy Cuddy\'s research demonstrates that high-power posing for 2 minutes increases testosterone by 20% and decreases cortisol by 25%, producing measurable changes in risk tolerance and social confidence. Combined with the "warmth first, competence second" framework (Fiske et al., 2007), leading with genuine warmth before demonstrating competence creates what social psychologists call the "halo effect" — positive first impressions color all subsequent evaluations, making the interviewer unconsciously look for evidence that confirms their initial positive judgment.'
      },
      {
        title: 'The STAR+ Method',
        objective: 'Structure behavioral answers so they demonstrate both past competence and forward-thinking capability in 90 seconds or less.',
        approach: 'Extend the traditional STAR format (Situation, Task, Action, Result) with a "+Forward" element that connects past experience to the interviewer\'s current challenges. This transforms answers from backward-looking proof points into forward-looking value propositions. The key constraint is time: answers exceeding 2 minutes lose the interviewer\'s attention regardless of content quality.',
        blueprint: [
          '0:00–0:15 (Situation): Set the scene in 2 sentences maximum. Include one specific constraint: "At my last company, we had 3 weeks to ship a feature that typically took 8 — and our senior engineer had just left." Specificity signals authenticity.',
          '0:15–0:35 (Task + Action): Combine these — state what YOU specifically did, not the team. Use first person: "I broke the feature into 3 independent workstreams, paired junior engineers with clear specs, and cut scope to the 2 user flows that covered 80% of use cases." Show decisions, not just activity.',
          '0:35–0:55 (Result): Quantify the outcome with one number: "We shipped in 2.5 weeks with zero critical bugs and 94% feature coverage." If you don\'t have a number, use a qualitative outcome from a specific person: "Our VP of Engineering told the board it was the best execution she\'d seen that quarter."',
          '0:55–1:15 (+Forward): Connect to their context: "I noticed your job posting mentions scaling the team from 4 to 12 — that compression dynamic is where I think this experience directly applies. I\'d love to hear what your timeline looks like." This converts your answer into a conversation about their needs.'
        ],
        caseStudy: {
          company: 'Stripe',
          context: 'A widely-shared interview prep guide from a former Stripe engineering manager describing what differentiated top candidates in behavioral rounds.',
          execution: 'The hiring manager noted that the strongest candidates universally followed a pattern: they kept Situation to under 15 seconds (weak candidates spent 60+ seconds on context), they used specific numbers in Results (not "it went well" but "reduced p95 latency from 340ms to 45ms"), and crucially, they ended every answer by connecting their experience to something specific about Stripe\'s current challenges. One candidate said: "I read about your migration to Ruby service mesh — the coordination pattern I described is exactly what I\'d apply there."',
          result: 'Candidates who used the "+Forward" pattern received offers at 2.5x the rate of those who used standard STAR, because they demonstrated they\'d already started thinking about the role.'
        },
        psychology: 'The primacy-recency effect means interviewers disproportionately remember the first and last things you say in an answer. By front-loading a specific, constrained situation (primacy) and ending with a forward-looking connection to their challenges (recency), you control what sticks. The "+Forward" element also exploits the "future self-continuity" bias — interviewers who can vividly imagine you in the role are significantly more likely to advocate for hiring you because the mental simulation creates a sense of loss if they choose someone else.'
      },
      {
        title: 'The Graceful Unknown',
        objective: 'Handle questions you cannot fully answer in a way that demonstrates intellectual honesty, structured thinking, and learning velocity.',
        approach: 'Use a "transparent scaffolding" technique: acknowledge the gap, show your reasoning framework, offer what you DO know that\'s adjacent, and commit to a specific follow-up. This works because senior interviewers value the process of thinking over the possession of answers — they\'re hiring for trajectory, not encyclopedia knowledge.',
        blueprint: [
          '0:00–0:10: Acknowledge directly without apologizing: "I haven\'t worked directly with [X], so I want to be honest about that rather than pretend." Honesty here builds trust that makes all your other answers more credible.',
          '0:10–0:30: Show your reasoning framework: "Here\'s how I\'d approach it based on what I do know..." Walk through 2-3 steps of how you\'d figure it out. Name the closest adjacent experience: "I\'ve worked extensively with [Y], which shares [specific principle] with [X]."',
          '0:30–0:50: Offer a structured hypothesis: "Based on that pattern, my instinct is [concrete guess]. I\'d verify that by [specific action]." This shows you can operate under uncertainty — a senior skill.',
          '0:50–1:00: Close with forward momentum: "I\'d want to deep-dive on this in my first two weeks. Would it be helpful if I followed up with a written perspective after I research it?" This transforms a gap into a demonstration of initiative.'
        ],
        caseStudy: {
          company: 'Linear',
          context: 'An engineering candidate interviewing for a systems role at Linear, encountering a question about CRDTs (a technology they hadn\'t implemented).',
          execution: 'The candidate said: "I haven\'t built a CRDT system, and I don\'t want to bluff through this." Then they said: "But I\'ve built distributed counters with vector clocks, which shares the causality tracking problem. My instinct is that CRDTs solve merge conflicts by making operations commutative — meaning order doesn\'t matter. If I\'m right, the hard part isn\'t the data structure, it\'s deciding what \'conflict\' means for your specific use case. What does that look like in Linear\'s editor?" The question back demonstrated curiosity and architectural thinking.',
          result: 'The candidate received an offer. The interviewer later said: "They were the only person who admitted they didn\'t know and then asked a better question than the people who pretended they did."'
        },
        psychology: 'The Pratfall Effect (Aronson, 1966) shows that competent individuals become more likeable after a minor stumble — but only if competence is established first. By acknowledging a gap after demonstrating strength in other areas, you trigger this effect precisely. Additionally, the "growth mindset" signal (Dweck, 2006) — showing how you learn rather than what you know — correlates strongly with interviewer confidence in long-term performance. Companies hiring for senior roles consistently report that they prefer candidates who "know what they don\'t know" over those who "know everything but can\'t learn."'
      }
    ]
  }
};
