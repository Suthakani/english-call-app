import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig.js';
import '../homepage.css';
import BottomNav from '../components/BottomNav.jsx';

// Voice-activity-detection tuning — same values as CallPractice.jsx,
// since that pipeline is proven to work reliably.
const SPEECH_RMS_THRESHOLD = 0.035;
const MIN_UNBROKEN_SPEECH_MS = 300;
const HANGOVER_MS = 250;
const SILENCE_AFTER_SPEECH_MS = 900;
const INITIAL_SILENCE_TIMEOUT_MS = 6000;
const MAX_RECORDING_MS = 20000;

const HALLUCINATION_PHRASES = new Set([
  "the user is speaking english.",
  "the user is speaking english",
  "this is a voice conversation practice.",
  "this is a voice conversation practice. the user is speaking english.",
  "thank you.",
  "thank you",
  "thanks for watching.",
  "please subscribe.",
]);

export default function ChallengePage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [challenge, setChallenge] = useState(null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [loadError, setLoadError] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // listeningId: question currently recording. transcribingId: question
  // whose recorded audio is being sent to the backend for transcription.
  const [listeningId, setListeningId] = useState(null);
  const [transcribingId, setTranscribingId] = useState(null);

  const streamRef = useRef(null);
  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const vadFrameRef = useRef(null);
  const hasSpokenRef = useRef(false);
  const lastSpeechTimeRef = useRef(0);
  const recordingStartRef = useRef(0);
  const voiceStreakStartRef = useRef(null);
  const lastAboveThresholdRef = useRef(null);
  const recordingStartedRef = useRef(false);
  const activeQuestionIdRef = useRef(null);

  useEffect(() => {
    api.get('/challenge/today')
      .then(({ data }) => setChallenge(data.challenge))
      .catch(err => {
        console.error('Failed to load challenge:', err.response?.status, err.response?.data || err.message);
        setLoadError(true);
      });
  }, [slug]);

  useEffect(() => {
    return () => cleanupMic();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cleanupMic = () => {
    cancelAnimationFrame(vadFrameRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try { mediaRecorderRef.current.stop(); } catch {}
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (audioCtxRef.current) {
      try { audioCtxRef.current.close(); } catch {}
      audioCtxRef.current = null;
    }
  };

  const startVoiceInput = async questionId => {
    // Tap again on the same question while it's recording → stop early
    // and transcribe whatever was captured so far.
    if (listeningId === questionId) {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      return;
    }

    // Switching questions mid-recording — clean up the previous mic session first.
    if (listeningId !== null) {
      cleanupMic();
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
      streamRef.current = stream;

      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const audioCtx = new AudioContext();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 512;
      source.connect(analyser);
      audioCtxRef.current = audioCtx;
      analyserRef.current = analyser;
    } catch (err) {
      console.error('[voice] mic access failed:', err);
      alert("Couldn't access the microphone. Check permission and try again.");
      return;
    }

    activeQuestionIdRef.current = questionId;
    chunksRef.current = [];
    hasSpokenRef.current = false;
    recordingStartedRef.current = false;
    lastSpeechTimeRef.current = Date.now();
    recordingStartRef.current = Date.now();
    voiceStreakStartRef.current = null;
    lastAboveThresholdRef.current = null;
    mediaRecorderRef.current = null;

    setListeningId(questionId);
    watchVolume();
  };

  const beginActualRecording = () => {
    if (recordingStartedRef.current || !streamRef.current) return;
    recordingStartedRef.current = true;

    const recorder = new MediaRecorder(streamRef.current, { mimeType: 'audio/webm' });
    recorder.ondataavailable = e => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };
    recorder.onstop = handleRecordingStop;
    recorder.start();
    mediaRecorderRef.current = recorder;
  };

  const watchVolume = () => {
    const analyser = analyserRef.current;
    if (!analyser) return;
    const data = new Uint8Array(analyser.fftSize);

    const tick = () => {
      analyser.getByteTimeDomainData(data);

      let sumSquares = 0;
      for (let i = 0; i < data.length; i++) {
        const v = (data[i] - 128) / 128;
        sumSquares += v * v;
      }
      const rms = Math.sqrt(sumSquares / data.length);
      const now = Date.now();

      if (rms > SPEECH_RMS_THRESHOLD) {
        if (voiceStreakStartRef.current === null) voiceStreakStartRef.current = now;
        lastAboveThresholdRef.current = now;

        if (!recordingStartedRef.current) {
          beginActualRecording();
        }

        const streakDuration = now - voiceStreakStartRef.current;
        if (streakDuration >= MIN_UNBROKEN_SPEECH_MS) {
          hasSpokenRef.current = true;
        }
        lastSpeechTimeRef.current = now;
      } else if (voiceStreakStartRef.current !== null) {
        const quietFor = now - (lastAboveThresholdRef.current || now);
        if (quietFor > HANGOVER_MS) {
          voiceStreakStartRef.current = null;
        }
      }

      const elapsedSinceStart = now - recordingStartRef.current;
      const silenceSinceSpeech = now - lastSpeechTimeRef.current;

      const shouldStopForSilence = hasSpokenRef.current && silenceSinceSpeech > SILENCE_AFTER_SPEECH_MS;
      const shouldStopNoSpeech = !hasSpokenRef.current && elapsedSinceStart > INITIAL_SILENCE_TIMEOUT_MS;
      const shouldStopMaxTime = recordingStartedRef.current && elapsedSinceStart > MAX_RECORDING_MS;

      if (shouldStopForSilence || shouldStopMaxTime) {
        console.log(`[VAD] stopping — hasSpoken=${hasSpokenRef.current}, reason=${shouldStopForSilence ? 'silence-after-speech' : 'max-time'}`);
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          try { mediaRecorderRef.current.stop(); } catch {}
        }
        return;
      }

      if (shouldStopNoSpeech) {
        // Never picked up any speech — just cancel back to idle, nothing to transcribe.
        console.log('[VAD] no speech detected within timeout — cancelling');
        cleanupMic();
        setListeningId(null);
        return;
      }

      if (!tick.lastLog || now - tick.lastLog > 400) {
        tick.lastLog = now;
        const streakMs = voiceStreakStartRef.current ? now - voiceStreakStartRef.current : 0;
        console.log(`[VAD] rms=${rms.toFixed(4)} threshold=${SPEECH_RMS_THRESHOLD} streakMs=${streakMs} hasSpoken=${hasSpokenRef.current} recording=${recordingStartedRef.current}`);
      }

      vadFrameRef.current = requestAnimationFrame(tick);
    };

    vadFrameRef.current = requestAnimationFrame(tick);
  };

  const handleRecordingStop = async () => {
    cancelAnimationFrame(vadFrameRef.current);
    const questionId = activeQuestionIdRef.current;
    cleanupMic();
    setListeningId(null);

    if (!hasSpokenRef.current || !questionId) return;

    setTranscribingId(questionId);

    const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
    const formData = new FormData();
    formData.append('audio', blob, 'recording.webm');

    try {
      const { data } = await api.post('/conversation/transcribe', formData, {
        headers: { 'Content-Type': undefined },
      });

      const text = (data.text || '').trim();
      const normalized = text.toLowerCase();
      console.log(`[Transcribe] raw="${text}"`);

      if (text && !HALLUCINATION_PHRASES.has(normalized)) {
        setAnswers(a => ({ ...a, [questionId]: ((a[questionId] || '') + ' ' + text).trim() }));
      }
    } catch (err) {
      console.error('[Transcribe] failed:', err.response?.data || err.message);
      alert("Couldn't transcribe your answer. Please try again or type it in.");
    } finally {
      setTranscribingId(null);
    }
  };

  const submit = async () => {
    setSubmitting(true);
    try {
      const payload = Object.entries(answers).map(([questionId, text]) => ({ questionId, text }));
      const { data } = await api.post(`/challenge/${challenge.slug}/submit`, { answers: payload });
      setResult(data);
    } catch (err) {
      console.error('Submit failed:', err.response?.data || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const pageShell = children => (
    <div className="homepage-body" style={{ minHeight: '100vh', padding: '140px 20px 80px' }}>
      <div className="bg-blobs">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
      </div>
      <div className="noise"></div>
      <div className="challenge-card">{children}</div>
      <BottomNav />
    </div>
  );

  if (loadError) {
    return pageShell(
      <>
        <p>Couldn't load today's challenge. Please go back and try again.</p>
        <button className="btn-secondary" onClick={() => navigate('/')}>Back to Home</button>
      </>
    );
  }

  if (!challenge) return null;

  return pageShell(
    <>
      <button className="challenge-back" onClick={() => navigate('/')}>← Back</button>
      <h2 className="challenge-title">{challenge.title}</h2>

      {!result ? (
        <>
        {challenge.audioUrl && (
  <audio controls src={challenge.audioUrl} style={{ width: '100%', marginBottom: '24px' }} />
)}
          {challenge.questions.map(q => {
            const isListening = listeningId === q.id;
            const isTranscribing = transcribingId === q.id;
            return (
              <div className="challenge-question" key={q.id}>
                <label>{q.text}</label>
                <div className="challenge-input-row">
                  <textarea
                    className="form-textarea"
                    value={answers[q.id] || ''}
                    onChange={e => setAnswers(a => ({ ...a, [q.id]: e.target.value }))}
                    placeholder="Type your answer, or use the mic to speak it..."
                  />
                  <button
                    type="button"
                    className={`challenge-mic-btn${isListening ? ' listening' : ''}`}
                    onClick={() => startVoiceInput(q.id)}
                    disabled={isTranscribing}
                    title={isListening ? 'Stop and use this' : 'Speak your answer'}
                  >
                    {isListening ? '● Listening…' : isTranscribing ? '⏳ Transcribing…' : '🎤 Speak'}
                  </button>
                </div>
              </div>
            );
          })}
          <button className="btn-primary challenge-submit-btn" onClick={submit} disabled={submitting}>
            {submitting ? 'Submitting…' : 'Submit Answers'}
          </button>
        </>
      ) : (
        <div className="challenge-result">
          <h3>{result.score}/{result.maxScore}</h3>
          {result.badgeAwarded && <div className="challenge-badge-earned">🏅 Daily Challenge Badge earned!</div>}
          <ul>
            {result.feedback.map(f => (
              <li key={f.questionId} className={f.correct ? 'ok' : 'weak'}>
                {f.correct ? '✓ Good answer' : `✗ ${f.tip}`}
              </li>
            ))}
          </ul>
          <button className="btn-secondary" onClick={() => navigate('/profile')}>View in Profile</button>
        </div>
      )}
    </>
  );
}