module.exports = [
  {
    slug: 'daily-listening', icon: 'play-circle',
    title: "Catch the Details",
    desc: "Listen to a short clip and answer 5 comprehension questions.",
    audioUrl: '/audio/daily-listening.mp3',
    questions: [
      { id: 'q1', text: 'What was the main topic of the conversation?', keywords: ['topic','main','about','subject','discuss','discussion','regarding','talking about'] },
      { id: 'q2', text: 'Who were the speakers?', keywords: ['speaker','person','they','speakers','man','woman','he','she','caller','two people'] },
      { id: 'q3', text: 'What decision did they make?', keywords: ['decide','decision','agreed','decided','agree','chose','choice','concluded','settled on'] },
      { id: 'q4', text: "Name one word you didn't understand.", keywords: [] },
      { id: 'q5', text: 'Summarize it in one sentence.', keywords: ['because','so','then','therefore','overall','basically','in summary','in short'] },
    ],
  },
  {
    slug: 'speaking', icon: 'mic',
    title: "Ace a Job Interview",
    desc: "Answer 5 common interview questions and get instant feedback.",
    questions: [
      { id: 'q1', text: 'Tell me about yourself.', keywords: ['i am','experience','years','work','i\'m','i have','working','job','currently','background','my name'] },
      { id: 'q2', text: 'What is your biggest strength?', keywords: ['strength','good at','skill','strong','skilled','talent','excel','particularly good'] },
      { id: 'q3', text: 'What is your biggest weakness?', keywords: ['weakness','improve','improving','working on','not good at','struggle','area to improve','still learning','trying to improve','manage my time','time management','attention to detail','small details','efficient','efficiently'] },
      { id: 'q4', text: 'Why should we hire you?', keywords: ['because','hire','fit','contribute','right fit','add value','bring','help your team','qualified','deserve'] },
      { id: 'q5', text: 'Where do you see yourself in 5 years?', keywords: ['years','future','grow','goal','in five years','long term','career goal','aspire','grow into','see myself'] },
    ],
  },
  {
    slug: 'grammar', icon: 'message-square',
    title: "Fix the Sentence",
    desc: "Correct 5 grammatically wrong sentences.",
    questions: [
      { id: 'q1', text: 'Correct: "She go to school every day."', keywords: ['goes'] },
      { id: 'q2', text: 'Correct: "I has two brothers."', keywords: ['have'] },
      { id: 'q3', text: 'Correct: "He don\'t like coffee."', keywords: ["doesn't", "does not", "doesnt"] },
      { id: 'q4', text: 'Correct: "They was late."', keywords: ['were'] },
      { id: 'q5', text: 'Correct: "I am agree with you."', keywords: ['agree'] },
    ],
  },
  {
    slug: 'vocabulary', icon: 'bar-chart-3',
    title: "Word of the Day Challenge",
    desc: "Use 5 new words correctly in your own sentences.",
    questions: [
      { id: 'q1', text: 'Use the word "resilient" in a sentence.', keywords: ['resilient', 'resilience'] },
      { id: 'q2', text: 'Use the word "articulate" in a sentence.', keywords: ['articulate', 'articulated', 'articulately'] },
      { id: 'q3', text: 'Use the word "candid" in a sentence.', keywords: ['candid', 'candidly'] },
      { id: 'q4', text: 'Use the word "meticulous" in a sentence.', keywords: ['meticulous', 'meticulously'] },
      { id: 'q5', text: 'Use the word "ambitious" in a sentence.', keywords: ['ambitious', 'ambition'] },
    ],
  },
  {
    slug: 'pronunciation', icon: 'sparkles',
    title: "Say It Clearly",
    desc: "Record yourself saying 5 tricky phrases and get feedback.",
    questions: [
      { id: 'q1', text: 'Say: "She sells seashells by the seashore."', keywords: [] },
      { id: 'q2', text: 'Say: "Thirty-three thieves thought."', keywords: [] },
      { id: 'q3', text: 'Say: "Red lorry, yellow lorry."', keywords: [] },
      { id: 'q4', text: 'Say: "I would like a cup of coffee."', keywords: [] },
      { id: 'q5', text: 'Say: "Can you understand what I am saying?"', keywords: [] },
    ],
  },
  // innum epdi venumnalum add pannunga — list periusa iruntha, adhu repeat aaga edukura naal adhigam aagum
];