// backend/data/eventQuestionBank.js
//
// Curated (not AI-generated) so the weekly Proficiency Challenge stays
// consistent quality and fair across all participants. Deterministically
// selected per week by pickEventQuestions.js using the periodKey as a
// seed, so everyone in the same week's event gets the same set, and each
// week draws a different subset.
//
// Image URLs point to Pexels' public CDN (images.pexels.com/photos/<id>/...),
// using real photo IDs — verified to exist, not guessed.

const pexels = (id) => `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=600`;

const GRAMMAR_VOCAB = [
  // difficulty: "easy" (1pt), "medium" (2pts), "hard" (3pts)
  { id: "gv1", difficulty: "easy", q: "Choose the correct word: They ___ watching a movie right now.", options: ["is", "am", "are", "be"], answer: "are" },
  { id: "gv2", difficulty: "medium", q: "Choose the correct sentence.", options: [
      "If I was you, I would apologize.",
      "If I were you, I would apologize.",
      "If I am you, I would apologize.",
      "If I be you, I would apologize.",
    ], answer: "If I were you, I would apologize." },
  { id: "gv3", difficulty: "medium", q: "Which word best fits: The manager was ___ about the missed deadline.", options: ["please", "pleasant", "pleased", "pleasing"], answer: "pleased" },
  { id: "gv4", difficulty: "medium", q: "Choose the correctly punctuated sentence.", options: [
      "Although it was raining, we went for a walk.",
      "Although it was raining we went for a walk.",
      "Although, it was raining, we went for a walk.",
      "Although it was raining; we went for a walk.",
    ], answer: "Although it was raining, we went for a walk." },
  { id: "gv5", difficulty: "medium", q: "Choose the correct passive form: They built this bridge in 1990.", options: [
      "This bridge was built in 1990.",
      "This bridge is built in 1990.",
      "This bridge built in 1990.",
      "This bridge has build in 1990.",
    ], answer: "This bridge was built in 1990." },
  { id: "gv6", difficulty: "hard", q: "Choose the sentence with correct subject-verb agreement.", options: [
      "Neither of the students have finished the test.",
      "Neither of the students has finished the test.",
      "Neither of the students finishing the test.",
      "Neither of the students finish the test.",
    ], answer: "Neither of the students has finished the test." },
  { id: "gv7", difficulty: "hard", q: "What does the idiom 'to bite the bullet' mean?", options: [
      "To avoid a difficult situation",
      "To face a difficult situation with courage",
      "To argue aggressively",
      "To eat quickly",
    ], answer: "To face a difficult situation with courage" },
  { id: "gv8", difficulty: "hard", q: "Choose the most precise word: The negotiations were ___ , lasting well past midnight.", options: ["long", "protracted", "big", "slow-ish"], answer: "protracted" },
  { id: "gv9", difficulty: "hard", q: "Choose the sentence that uses the subjunctive mood correctly.", options: [
      "The committee insists that he attends the meeting.",
      "The committee insists that he attend the meeting.",
      "The committee insists that he is attending the meeting.",
      "The committee insists that he will attend the meeting.",
    ], answer: "The committee insists that he attend the meeting." },
  { id: "gv10", difficulty: "hard", q: "Choose the word closest in meaning to 'ambiguous'.", options: ["clear", "vague", "loud", "certain"], answer: "vague" },
];

const LISTENING_SCENARIOS = [
  {
    id: "l1", difficulty: "medium",
    scenario: "Imagine a voicemail says: \"Hi, this is Priya from the dentist's office. Your appointment on Thursday has been moved to Friday at 3 PM. Please call us back to confirm.\"",
    q: "What should the listener do?",
    options: ["Go to the dentist on Thursday", "Ignore the message", "Call back to confirm Friday's appointment", "Cancel the appointment"],
    answer: "Call back to confirm Friday's appointment",
  },
  {
    id: "l2", difficulty: "hard",
    scenario: "Imagine a colleague says: \"I know we said we'd launch on the 1st, but given the testing delays, I think we should push it back a week rather than risk shipping something buggy.\"",
    q: "What is the speaker proposing?",
    options: [
      "Launch earlier than planned",
      "Cancel the launch entirely",
      "Delay the launch by a week to avoid bugs",
      "Ship the product with known bugs",
    ],
    answer: "Delay the launch by a week to avoid bugs",
  },
  {
    id: "l3", difficulty: "hard",
    scenario: "Imagine a news clip says: \"Despite early setbacks, the startup managed to turn a profit within its first year — a rare feat in an industry known for slow, uncertain returns.\"",
    q: "What is notable about the startup's achievement?",
    options: [
      "It failed within a year",
      "It is typical for this industry",
      "It profited quickly, which is unusual for this industry",
      "It received government funding",
    ],
    answer: "It profited quickly, which is unusual for this industry",
  },
  {
    id: "l4", difficulty: "hard",
    scenario: "Imagine a manager says: \"Honestly, the numbers aren't bad, but I was expecting more given how much we invested in the campaign.\"",
    q: "What is the manager's real attitude?",
    options: [
      "Fully satisfied with the results",
      "Angry and wants to cancel the campaign",
      "Mildly disappointed given the investment made",
      "Completely unaware of the numbers",
    ],
    answer: "Mildly disappointed given the investment made",
  },
  {
    id: "l5", difficulty: "medium",
    scenario: "Imagine an announcement says: \"Attention passengers, the 10:15 train to Chennai has been delayed by 20 minutes due to signal issues.\"",
    q: "What is the reason for the delay?",
    options: ["Bad weather", "Signal issues", "A strike", "Mechanical failure"],
    answer: "Signal issues",
  },
];

// ── NEW: Image-based Vocabulary ──
const IMAGE_VOCAB = [
  {
    id: "iv1", difficulty: "hard",
    imageUrl: pexels(461593),
    q: "Which word best describes this scene?",
    options: ["arduous", "leisurely", "futile", "decorative"],
    answer: "arduous",
  },
  {
    id: "iv2", difficulty: "hard",
    imageUrl: pexels(18670323),
    q: "Which word best fits this setting?",
    options: ["scholarly", "frivolous", "industrial", "nautical"],
    answer: "scholarly",
  },
];

// ── NEW: Idioms & Phrasal Verbs (with images) ──
const IDIOMS_IMAGES = [
  {
    id: "id1", difficulty: "hard",
    imageUrl: pexels(9660),
    q: "Which idiom does this image best represent?",
    options: ["Break the bank", "Bite the bullet", "Spill the beans", "Hit the books"],
    answer: "Break the bank",
  },
  {
    id: "id2", difficulty: "hard",
    imageUrl: pexels(20091878),
    q: "Which idiom does this image best represent?",
    options: ["Tie the knot", "Burn bridges", "Cut corners", "Turn the tables"],
    answer: "Tie the knot",
  },
  {
    id: "id3", difficulty: "hard",
    imageUrl: pexels(30215686),
    q: "Which idiom does this image best represent?",
    options: ["Burn the midnight oil", "Once in a blue moon", "Beat around the bush", "Let the cat out of the bag"],
    answer: "Burn the midnight oil",
  },
];

// ── NEW: Reading Comprehension (passage + image clue) ──
const READING_COMPREHENSION = [
  {
    id: "rc1",
    imageUrl: pexels(13085571),
    passage:
      "Meera had ignored the weather forecast all week, confident the sun would hold. On the morning of her interview, the sky broke without warning. She sprinted the last block, arriving drenched and ten minutes late — only to find the interviewer had rescheduled everyone due to a citywide transit delay caused by the same downpour.",
    questions: [
      {
        id: "rc1-1", difficulty: "hard",
        q: "Why did Meera arrive late and wet?",
        options: [
          "She left home late on purpose",
          "She ignored the forecast and got caught in unexpected rain",
          "She took the wrong route",
          "Her umbrella broke",
        ],
        answer: "She ignored the forecast and got caught in unexpected rain",
      },
      {
        id: "rc1-2", difficulty: "hard",
        q: "What can be inferred about the interview outcome?",
        options: [
          "Meera lost the opportunity because she was late",
          "The rescheduling had nothing to do with Meera's lateness",
          "Meera was the only candidate affected",
          "The interview was cancelled permanently",
        ],
        answer: "The rescheduling had nothing to do with Meera's lateness",
      },
    ],
  },
];

const WRITING_PROMPTS = [
  "Describe a challenge you overcame recently and what you learned from it. (4-5 sentences)",
  "Explain why learning a new language is valuable, in your own words. (4-5 sentences)",
  "Describe your ideal weekend and why you'd enjoy it. (4-5 sentences)",
  "Explain a piece of advice you'd give to someone starting a new job. (4-5 sentences)",
  "Describe a place you'd love to visit and why. (4-5 sentences)",
];

module.exports = {
  GRAMMAR_VOCAB,
  LISTENING_SCENARIOS,
  IMAGE_VOCAB,
  IDIOMS_IMAGES,
  READING_COMPREHENSION,
  WRITING_PROMPTS,
};