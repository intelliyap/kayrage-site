// ---------------------------------------------------------------------------
// KAY-OS Technique Library -- Full 49-entry dataset
// ---------------------------------------------------------------------------

import type { Technique } from '@/lib/techniques/types';

/**
 * Complete technique library.
 *
 * 49 entries (48 unique techniques + 1 duplicate code for "Awareness of
 * Awareness" which appears as both P-06 and I-07).
 */
export const techniques: Technique[] = [
  // -----------------------------------------------------------------------
  // BREATH (B-01 .. B-09)
  // -----------------------------------------------------------------------
  {
    code: 'B-01',
    name: 'Breath Awareness',
    method: 'Breath',
    mode: 'Both',
    focusLevels: ['sync'],
    difficulty: 'Entry',
    minDuration: 3,
    cue: 'Feel the air moving in... and out.',
    source: 'VBT #1',
    description:
      'The foundational breath practice. Simply observe the natural rhythm of inhalation and exhalation without trying to change it.',
  },
  {
    code: 'B-02',
    name: 'Breath Turning Points',
    method: 'Breath',
    mode: 'Still',
    focusLevels: ['sync', 'edge'],
    difficulty: 'Entry',
    minDuration: 5,
    cue: 'In the gap after exhale... just rest.',
    source: 'VBT #2',
    description:
      'Resting attention in the natural pause between breaths. The still point after exhale is a doorway to deeper awareness.',
  },
  {
    code: 'B-03',
    name: 'Counted Breath (Box)',
    method: 'Breath',
    mode: 'Both',
    focusLevels: ['sync'],
    difficulty: 'Entry',
    minDuration: 3,
    cue: 'In for four. Hold for four. Out for four.',
    source: 'Pranayama',
    description:
      'A structured breathing pattern that uses equal-length phases to regulate the nervous system and anchor attention.',
  },
  {
    code: 'B-04',
    name: 'Alternate Nostril',
    method: 'Breath',
    mode: 'Still',
    focusLevels: ['sync'],
    difficulty: 'Entry',
    minDuration: 5,
    cue: 'Right nostril closed. Breathe in through the left.',
    source: 'Hatha Yoga',
    description:
      'Alternating the breath between left and right nostrils to balance the nervous system and harmonise the two hemispheres of the brain.',
  },
  {
    code: 'B-05',
    name: 'Breath of Fire',
    method: 'Breath',
    mode: 'Still',
    focusLevels: ['sync'],
    difficulty: 'Intermediate',
    minDuration: 5,
    cue: 'Sharp exhales through the nose.',
    source: 'Kundalini Yoga',
    description:
      'Rapid, rhythmic diaphragmatic breathing with emphasis on forceful exhales. Generates internal heat and heightened alertness.',
  },
  {
    code: 'B-06',
    name: 'Extended Exhale',
    method: 'Breath',
    mode: 'Both',
    focusLevels: ['sync', 'edge'],
    difficulty: 'Entry',
    minDuration: 3,
    cue: 'Breathe in for three. Now out... for six.',
    source: 'Pranayama',
    description:
      'Lengthening the exhalation relative to the inhalation activates the parasympathetic response, promoting deep calm.',
  },
  {
    code: 'B-07',
    name: 'Breath at Forehead',
    method: 'Breath',
    mode: 'Still',
    focusLevels: ['edge'],
    difficulty: 'Intermediate',
    minDuration: 7,
    cue: 'Follow the breath upward... between your eyebrows.',
    source: 'VBT #5',
    description:
      'Directing awareness to follow the breath as it rises to the space between the eyebrows, refining concentration into a single point.',
  },
  {
    code: 'B-08',
    name: 'Humming Breath',
    method: 'Breath',
    mode: 'Still',
    focusLevels: ['sync', 'edge'],
    difficulty: 'Entry',
    minDuration: 5,
    cue: 'Close your lips. Exhale with a steady hum.',
    source: 'Bhramari',
    description:
      'Producing a continuous humming sound on the exhale creates an internal vibration that quiets mental chatter and draws attention inward.',
  },
  {
    code: 'B-09',
    name: 'Breath Suspension',
    method: 'Breath',
    mode: 'Still',
    focusLevels: ['edge'],
    difficulty: 'Intermediate',
    minDuration: 7,
    cue: "Exhale completely. Don't breathe. Be in the gap.",
    source: 'VBT #4',
    description:
      'Resting in the space after a full exhale with lungs empty. The absence of breath can reveal awareness itself.',
  },

  // -----------------------------------------------------------------------
  // BODY (S-01 .. S-10)
  // -----------------------------------------------------------------------
  {
    code: 'S-01',
    name: 'Body Scan',
    method: 'Body',
    mode: 'Still',
    focusLevels: ['sync', 'edge'],
    difficulty: 'Entry',
    minDuration: 5,
    cue: 'Feel your feet... your ankles... your shins...',
    source: 'Yoga Nidra',
    description:
      'Systematically moving attention through the body from feet to head, relaxing each region and building body-awareness.',
  },
  {
    code: 'S-02',
    name: 'Body Dissolution',
    method: 'Body',
    mode: 'Still',
    focusLevels: ['edge'],
    difficulty: 'Intermediate',
    minDuration: 10,
    cue: 'Feel your feet... and let them dissolve.',
    source: 'VBT #20',
    description:
      'Progressive release of body-sense region by region, allowing the felt boundary of the body to soften and disappear.',
  },
  {
    code: 'S-03',
    name: 'Hollow Body',
    method: 'Body',
    mode: 'Still',
    focusLevels: ['edge'],
    difficulty: 'Intermediate',
    minDuration: 10,
    cue: 'Your body is a container... with nothing inside.',
    source: 'VBT #26',
    description:
      'Imagining the body as an empty vessel -- skin present, interior spacious and hollow. Loosens identification with physical form.',
  },
  {
    code: 'S-04',
    name: 'Whole Body Awareness',
    method: 'Body',
    mode: 'Both',
    focusLevels: ['sync'],
    difficulty: 'Intermediate',
    minDuration: 5,
    cue: 'Feel your entire body at once. Every surface.',
    source: 'VBT #40',
    description:
      'Expanding proprioceptive attention to encompass the entire body simultaneously rather than scanning sequentially.',
  },
  {
    code: 'S-05',
    name: 'Single Point Focus',
    method: 'Body',
    mode: 'Still',
    focusLevels: ['sync', 'edge'],
    difficulty: 'Entry',
    minDuration: 5,
    cue: 'All attention on one point. The center of your chest.',
    source: 'VBT #76',
    description:
      'Concentrating all attention on a single location in the body -- typically the heart center -- to develop one-pointed focus.',
  },
  {
    code: 'S-06',
    name: 'Sensation Without Reaction',
    method: 'Body',
    mode: 'Still',
    focusLevels: ['sync', 'edge'],
    difficulty: 'Entry',
    minDuration: 5,
    cue: "Something will arise. Don't move. Just watch.",
    source: 'Vipassana',
    description:
      'Observing bodily sensations -- itches, pulses, pressure -- without reacting or adjusting. Trains equanimity and non-reactivity.',
  },
  {
    code: 'S-07',
    name: 'Paired Sensations',
    method: 'Body',
    mode: 'Still',
    focusLevels: ['edge'],
    difficulty: 'Intermediate',
    minDuration: 7,
    cue: 'Feel heaviness... and lightness... at the same time.',
    source: 'Yoga Nidra',
    description:
      'Holding two opposing sensations simultaneously. The paradox destabilises habitual processing and opens a wider field of awareness.',
  },
  {
    code: 'S-08',
    name: 'Pre-Movement Awareness',
    method: 'Body',
    mode: 'Active',
    focusLevels: ['sync'],
    difficulty: 'Intermediate',
    minDuration: 5,
    cue: 'Before your foot lifts -- catch the impulse.',
    source: 'VBT #90',
    description:
      'Noticing the intention to move before the movement happens. Reveals the gap between volition and action.',
  },
  {
    code: 'S-09',
    name: 'Five Element Dissolution',
    method: 'Body',
    mode: 'Still',
    focusLevels: ['edge', 'expand'],
    difficulty: 'Intermediate',
    minDuration: 10,
    cue: 'Feel solidity dissolving... like earth into water.',
    source: 'VBT #23',
    description:
      'Guided dissolution through the five elements -- earth, water, fire, air, space -- each releasing a layer of physical identification.',
  },
  {
    code: 'S-10',
    name: 'Inner Fire',
    method: 'Body',
    mode: 'Still',
    focusLevels: ['edge', 'expand'],
    difficulty: 'Intermediate',
    minDuration: 10,
    cue: 'A point of warmth at your navel. It grows.',
    source: 'VBT #73',
    description:
      'Cultivating the sensation of internal heat originating at the navel center and expanding outward through the body.',
  },

  // -----------------------------------------------------------------------
  // VISUAL (V-01 .. V-10)
  // -----------------------------------------------------------------------
  {
    code: 'V-01',
    name: 'Point of Light',
    method: 'Visual',
    mode: 'Still',
    focusLevels: ['sync', 'edge'],
    difficulty: 'Entry',
    minDuration: 5,
    cue: 'A point of light between your eyebrows. Bright.',
    source: 'VBT #30',
    description:
      'Visualising a single luminous point at the third-eye centre. The simplest visual dharana -- a seed for deeper concentration.',
  },
  {
    code: 'V-02',
    name: 'Central Channel',
    method: 'Visual',
    mode: 'Still',
    focusLevels: ['edge', 'expand'],
    difficulty: 'Intermediate',
    minDuration: 10,
    cue: 'A column of light from base of spine to crown.',
    source: 'VBT #31',
    description:
      'Visualising an inner axis of light running vertically through the core of the body, connecting base to crown.',
  },
  {
    code: 'V-03',
    name: 'Heart Space',
    method: 'Visual',
    mode: 'Still',
    focusLevels: ['edge', 'expand'],
    difficulty: 'Intermediate',
    minDuration: 10,
    cue: 'The space inside your chest... vast... limitless.',
    source: 'VBT #28',
    description:
      'Turning attention inward to discover a spacious cavity in the heart region, then expanding it beyond the body.',
  },
  {
    code: 'V-04',
    name: 'Rising Energy',
    method: 'Visual',
    mode: 'Still',
    focusLevels: ['edge', 'expand'],
    difficulty: 'Intermediate',
    minDuration: 10,
    cue: 'Energy rising from the base... upward... to the crown.',
    source: 'VBT #24',
    description:
      'Tracking the felt sense of energy moving upward along the spine, from root to crown, with each breath cycle.',
  },
  {
    code: 'V-05',
    name: 'Body of Light',
    method: 'Visual',
    mode: 'Still',
    focusLevels: ['expand'],
    difficulty: 'Intermediate',
    minDuration: 10,
    cue: 'Your whole body glowing from inside. Every cell.',
    source: 'VBT #64',
    description:
      'Imagining every cell of the body filled with radiant light, until the boundary between body and light dissolves.',
  },
  {
    code: 'V-06',
    name: 'Five Elements Visual',
    method: 'Visual',
    mode: 'Still',
    focusLevels: ['edge', 'expand'],
    difficulty: 'Intermediate',
    minDuration: 10,
    cue: 'At the base... a golden light. Earth. Solid.',
    source: 'VBT #69',
    description:
      'Visualising each of the five elements as coloured light at successive points along the body, from earth at the base to space at the crown.',
  },
  {
    code: 'V-07',
    name: 'Dissolving Form',
    method: 'Visual',
    mode: 'Still',
    focusLevels: ['expand', 'void'],
    difficulty: 'Advanced',
    minDuration: 12,
    cue: 'Everything dissolving... becoming transparent.',
    source: 'VBT #19',
    description:
      'Allowing all visual content -- both external and internal imagery -- to soften, blur, and dissolve into formless awareness.',
  },
  {
    code: 'V-08',
    name: 'Spatial Expansion',
    method: 'Visual',
    mode: 'Still',
    focusLevels: ['expand'],
    difficulty: 'Advanced',
    minDuration: 12,
    cue: 'Awareness expanding... beyond the walls... into sky.',
    source: 'VBT #61',
    description:
      'Progressively expanding the felt boundary of awareness outward in all directions until it is unbounded.',
  },
  {
    code: 'V-09',
    name: 'Darkness Gazing',
    method: 'Visual',
    mode: 'Still',
    focusLevels: ['edge', 'expand'],
    difficulty: 'Intermediate',
    minDuration: 10,
    cue: 'Gaze into the darkness. Watch what appears.',
    source: 'VBT #103',
    description:
      'With eyes closed, observing the visual field of darkness itself. Patterns, colours, and forms arise spontaneously.',
  },
  {
    code: 'V-10',
    name: 'Intention Seed',
    method: 'Visual',
    mode: 'Still',
    focusLevels: ['edge'],
    difficulty: 'Entry',
    minDuration: 5,
    cue: 'State your intention. Present tense. Already true.',
    source: 'Yoga Nidra',
    description:
      'Planting a sankalpa -- a short, affirmative intention -- into the receptive mind at the threshold of deep relaxation.',
  },

  // -----------------------------------------------------------------------
  // SOUND (A-01 .. A-06)
  // -----------------------------------------------------------------------
  {
    code: 'A-01',
    name: 'Riding the Sound',
    method: 'Sound',
    mode: 'Both',
    focusLevels: ['sync', 'edge'],
    difficulty: 'Entry',
    minDuration: 5,
    cue: 'Let the sound carry you. Become it.',
    source: 'VBT #12',
    description:
      'Merging attention completely with an external or binaural tone, allowing it to become the sole object of awareness.',
  },
  {
    code: 'A-02',
    name: 'Inner Sound',
    method: 'Sound',
    mode: 'Still',
    focusLevels: ['edge', 'expand'],
    difficulty: 'Intermediate',
    minDuration: 10,
    cue: 'Listen for the sound inside. A ringing. A hum.',
    source: 'VBT #16',
    description:
      'Listening for the spontaneous inner sound (nada) that becomes audible in deep silence. A subtle, high-frequency ringing or hum.',
  },
  {
    code: 'A-03',
    name: 'Mantra Repetition',
    method: 'Sound',
    mode: 'Both',
    focusLevels: ['sync', 'edge'],
    difficulty: 'Entry',
    minDuration: 5,
    cue: 'Repeat silently. Again. Let it become automatic.',
    source: 'VBT #17',
    description:
      'Silent repetition of a single syllable or phrase. The rhythm entrains attention and gradually becomes effortless.',
  },
  {
    code: 'A-04',
    name: 'Silence After Sound',
    method: 'Sound',
    mode: 'Still',
    focusLevels: ['edge'],
    difficulty: 'Entry',
    minDuration: 5,
    cue: 'Enter the silence.',
    source: 'VBT #18',
    description:
      'Resting attention in the silence that follows a sound. The contrast sharpens awareness of the silent background.',
  },
  {
    code: 'A-05',
    name: 'Humming Resonance',
    method: 'Sound',
    mode: 'Still',
    focusLevels: ['sync'],
    difficulty: 'Entry',
    minDuration: 3,
    cue: 'Find a comfortable hum. Feel where it vibrates.',
    source: 'Nada Yoga',
    description:
      'Producing a sustained hum and tracking the vibration as it resonates through the skull, chest, and body.',
  },
  {
    code: 'A-06',
    name: 'Sensory Gating',
    method: 'Sound',
    mode: 'Still',
    focusLevels: ['edge', 'expand'],
    difficulty: 'Intermediate',
    minDuration: 7,
    cue: 'Close your eyes. Cover your ears. Seal inside.',
    source: 'VBT #49',
    description:
      'Progressively closing off external sensory input -- eyes, ears -- to turn attention entirely inward.',
  },

  // -----------------------------------------------------------------------
  // PERCEPTION (P-01 .. P-07)
  // -----------------------------------------------------------------------
  {
    code: 'P-01',
    name: 'Space Between Objects',
    method: 'Perception',
    mode: 'Active',
    focusLevels: ['sync'],
    difficulty: 'Entry',
    minDuration: 3,
    cue: "Don't look at things. Look at the space between.",
    source: 'VBT #34',
    description:
      'Shifting visual attention from objects to the empty space surrounding them. Reveals the ground of perception.',
  },
  {
    code: 'P-02',
    name: 'Soft Gaze',
    method: 'Perception',
    mode: 'Active',
    focusLevels: ['sync', 'edge'],
    difficulty: 'Entry',
    minDuration: 3,
    cue: 'Soften your gaze. Let the edges blur.',
    source: 'VBT #80',
    description:
      'Relaxing the muscles around the eyes and allowing peripheral vision to dominate. Defocusing shifts awareness from thinking to perceiving.',
  },
  {
    code: 'P-03',
    name: 'World as Art',
    method: 'Perception',
    mode: 'Active',
    focusLevels: ['sync'],
    difficulty: 'Entry',
    minDuration: 3,
    cue: 'Everything you see -- a moving painting.',
    source: 'VBT #74',
    description:
      'Perceiving the visual field as a flat image -- colours, shapes, and light -- stripped of labels and meaning.',
  },
  {
    code: 'P-04',
    name: 'Non-Reactive Perception',
    method: 'Perception',
    mode: 'Active',
    focusLevels: ['sync'],
    difficulty: 'Intermediate',
    minDuration: 5,
    cue: 'See everything. Follow nothing.',
    source: 'VBT #59',
    description:
      'Receiving the full sensory field without tracking any single element. Attention remains open, panoramic, and non-grasping.',
  },
  {
    code: 'P-05',
    name: 'Spatial Awareness Field',
    method: 'Perception',
    mode: 'Both',
    focusLevels: ['sync', 'edge'],
    difficulty: 'Entry',
    minDuration: 3,
    cue: 'Feel the space around your body. All sides.',
    source: 'VBT #106',
    description:
      'Extending proprioceptive awareness outward to include the space surrounding the body in all directions.',
  },
  {
    code: 'P-06',
    name: 'Awareness of Awareness',
    method: 'Perception',
    mode: 'Both',
    focusLevels: ['sync'],
    difficulty: 'Intermediate',
    minDuration: 5,
    cue: "Notice that you're noticing.",
    source: 'VBT #63',
    description:
      'Turning attention back on itself. Instead of being aware of an object, becoming aware of awareness itself.',
  },
  {
    code: 'P-07',
    name: 'Decision Point Awareness',
    method: 'Perception',
    mode: 'Active',
    focusLevels: ['sync'],
    difficulty: 'Intermediate',
    minDuration: 5,
    cue: 'Every micro-decision. Catch the choosing.',
    source: 'VBT #95',
    description:
      'Noticing the moment of choice in every small action -- where to look, when to step, what to reach for.',
  },

  // -----------------------------------------------------------------------
  // INQUIRY (I-01 .. I-07)
  // -----------------------------------------------------------------------
  {
    code: 'I-01',
    name: 'Who Am I?',
    method: 'Inquiry',
    mode: 'Still',
    focusLevels: ['expand', 'void'],
    difficulty: 'Advanced',
    minDuration: 12,
    cue: "Who am I? Don't answer. Just ask.",
    source: 'VBT #83',
    description:
      'The classic self-inquiry. Posing the question without seeking an intellectual answer, letting it dissolve the questioner.',
  },
  {
    code: 'I-02',
    name: 'I Am Without Attributes',
    method: 'Inquiry',
    mode: 'Still',
    focusLevels: ['expand', 'void'],
    difficulty: 'Advanced',
    minDuration: 12,
    cue: 'Drop your name. Drop your story. Just... I am.',
    source: 'VBT #60',
    description:
      'Systematically releasing identification with name, role, history, and body until only the bare sense of being remains.',
  },
  {
    code: 'I-03',
    name: 'Observing Thought',
    method: 'Inquiry',
    mode: 'Both',
    focusLevels: ['sync', 'edge'],
    difficulty: 'Entry',
    minDuration: 5,
    cue: 'Watch your thoughts. They come. They go.',
    source: 'VBT #37',
    description:
      'Observing thoughts as events arising and passing in awareness, without engaging their content or following their narrative.',
  },
  {
    code: 'I-04',
    name: 'Source of Thought',
    method: 'Inquiry',
    mode: 'Still',
    focusLevels: ['edge', 'expand'],
    difficulty: 'Advanced',
    minDuration: 12,
    cue: 'A thought appeared. Where did it come from?',
    source: 'VBT #89',
    description:
      'Tracing a thought back to its point of origin. Attention turns upstream, toward the source from which thoughts emerge.',
  },
  {
    code: 'I-05',
    name: 'Emotion as Energy',
    method: 'Inquiry',
    mode: 'Both',
    focusLevels: ['sync', 'edge'],
    difficulty: 'Intermediate',
    minDuration: 7,
    cue: "Drop the story. Feel only the energy.",
    source: 'VBT #65',
    description:
      'Stripping an emotion of its narrative and experiencing only the raw energetic sensation in the body.',
  },
  {
    code: 'I-06',
    name: 'Sitting With Desire',
    method: 'Inquiry',
    mode: 'Still',
    focusLevels: ['sync', 'edge'],
    difficulty: 'Intermediate',
    minDuration: 7,
    cue: "The wanting is here. Don't fight it. Don't feed it.",
    source: 'VBT #57',
    description:
      'Allowing desire to be fully present without acting on it or suppressing it. Pure observation of wanting itself.',
  },
  {
    code: 'I-07',
    name: 'Awareness of Awareness',
    method: 'Inquiry',
    mode: 'Still',
    focusLevels: ['void'],
    difficulty: 'Advanced',
    minDuration: 15,
    cue: 'Be aware... of being aware.',
    source: 'VBT #63',
    description:
      'The deepest form of self-referential awareness. Consciousness resting in itself with no object, no effort, no direction.',
  },
];

// ---------------------------------------------------------------------------
// Lookup map keyed by technique code for O(1) access
// ---------------------------------------------------------------------------

export const techniqueMap: Record<string, Technique> = Object.fromEntries(
  techniques.map((t) => [t.code, t]),
);
