// Simple Web Audio API beeps — no external mp3 files needed.
// Respects the user's "Sound effects" setting in localStorage.
export function playSound(type) {
  if (localStorage.getItem('soundEffects') === 'off') return;

  const AudioContext = window.AudioContext || window.webkitAudioContext;
  const ctx = new AudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.connect(gain);
  gain.connect(ctx.destination);

  if (type === 'correct') {
    osc.frequency.value = 880; // A5 — pleasant high note
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
  } else {
    osc.frequency.value = 220; // A3 — lower "wrong" tone
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
  }

  osc.start();
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
  osc.stop(ctx.currentTime + 0.3);
}