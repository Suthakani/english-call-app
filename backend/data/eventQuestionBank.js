// backend/data/eventQuestionBank.js
//
// Curated (not AI-generated) so the weekly Proficiency Challenge stays
// consistent quality and fair across all participants. Deterministically
// selected per week by pickEventQuestions.js using the periodKey as a
// seed, so everyone in the same week's event gets the same set, and each
// week draws a different subset.

const GRAMMAR_VOCAB = [
  // difficulty: "easy" (1pt), "medium" (2pts), "hard" (3pts)
  { id: "gv1", difficulty: "easy", q: "Choose the correct word: She ___ to school every day.", options: ["go", "goes", "going", "gone"], answer: "goes" },
  { id: "gv2", difficulty: "easy", q: "Choose the correct word: They ___ watching a movie right now.", options: ["is", "am", "are", "be"], answer: "are" },
  { id: "gv3", difficulty: "easy", q: "What is the opposite of 'increase'?", options: ["decrease", "raise", "grow", "expand"], answer: "decrease" },
  { id: "gv4", difficulty: "medium", q: "Choose the correct sentence.", options: [
      "If I was you, I would apologize.",
      "If I were you, I would apologize.",
      "If I am you, I would apologize.",
      "If I be you, I would apologize.",
    ], answer: "If I were you, I would apologize." },
  { id: "gv5", difficulty: "medium", q: "Which word best fits: The manager was ___ about the missed deadline.", options: ["please", "pleasant", "pleased", "pleasing"], answer: "pleased" },
  { id: "gv6", difficulty: "medium", q: "Choose the correctly punctuated sentence.", options: [
      "Although it was raining, we went for a walk.",
      "Although it was raining we went for a walk.",
      "Although, it was raining, we went for a walk.",
      "Although it was raining; we went for a walk.",
    ], answer: "Although it was raining, we went for a walk." },
  { id: "gv7", difficulty: "hard", q: "Choose the sentence with correct subject-verb agreement.", options: [
      "Neither of the students have finished the test.",
      "Neither of the students has finished the test.",
      "Neither of the students finishing the test.",
      "Neither of the students finish the test.",
    ], answer: "Neither of the students has finished the test." },
  { id: "gv8", difficulty: "hard", q: "What does the idiom 'to bite the bullet' mean?", options: [
      "To avoid a difficult situation",
      "To face a difficult situation with courage",
      "To argue aggressively",
      "To eat quickly",
    ], answer: "To face a difficult situation with courage" },
  { id: "gv9", difficulty: "hard", q: "Choose the most precise word: The negotiations were ___ , lasting well past midnight.", options: ["long", "protracted", "big", "slow-ish"], answer: "protracted" },
  { id: "gv10", difficulty: "medium", q: "Choose the correct passive form: They built this bridge in 1990.", options: [
      "This bridge was built in 1990.",
      "This bridge is built in 1990.",
      "This bridge built in 1990.",
      "This bridge has build in 1990.",
    ], answer: "This bridge was built in 1990." },
];

const LISTENING_SCENARIOS = [
  {
    id: "l1", difficulty: "easy",
    scenario: "Imagine someone says: \"Excuse me, could you tell me where the nearest pharmacy is? I have a bad headache.\"",
    q: "What does the speaker need?",
    options: ["Directions to a restaurant", "Directions to a pharmacy", "A glass of water", "A doctor's appointment"],
    answer: "Directions to a pharmacy",
  },
  {
    id: "l2", difficulty: "medium",
    scenario: "Imagine a voicemail says: \"Hi, this is Priya from the dentist's office. Your appointment on Thursday has been moved to Friday at 3 PM. Please call us back to confirm.\"",
    q: "What should the listener do?",
    options: ["Go to the dentist on Thursday", "Ignore the message", "Call back to confirm Friday's appointment", "Cancel the appointment"],
    answer: "Call back to confirm Friday's appointment",
  },
  {
    id: "l3", difficulty: "medium",
    scenario: "Imagine an announcement says: \"Attention passengers, the 10:15 train to Chennai has been delayed by 20 minutes due to signal issues.\"",
    q: "What is the reason for the delay?",
    options: ["Bad weather", "Signal issues", "A strike", "Mechanical failure"],
    answer: "Signal issues",
  },
  {
    id: "l4", difficulty: "hard",
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
    id: "l5", difficulty: "hard",
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
];

const WRITING_PROMPTS = [
  "Describe a challenge you overcame recently and what you learned from it. (4-5 sentences)",
  "Explain why learning a new language is valuable, in your own words. (4-5 sentences)",
  "Describe your ideal weekend and why you'd enjoy it. (4-5 sentences)",
  "Explain a piece of advice you'd give to someone starting a new job. (4-5 sentences)",
  "Describe a place you'd love to visit and why. (4-5 sentences)",
];

module.exports = { GRAMMAR_VOCAB, LISTENING_SCENARIOS, WRITING_PROMPTS };