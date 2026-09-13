import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { connectSocket, getSocket } from '../socket.js';
import './practiceCall.css';

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

export default function PracticeCall() {
  const { sessionId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const mode = location.state?.mode || 'both';

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [callState, setCallState] = useState('idle'); // idle | connecting | connected | ended
  const [micOn, setMicOn] = useState(true);
  const [peerLeft, setPeerLeft] = useState(false);
  const [activeView, setActiveView] = useState(mode === 'text' ? 'chat' : 'call');

  const localStreamRef = useRef(null);
  const pcRef = useRef(null);
  const remoteAudioRef = useRef(null);
  const chatEndRef = useRef(null);
  const isCallerRef = useRef(false); // whoever's socket id sorts first initiates the offer

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!user) return;
    const socket = connectSocket(user._id || user.id);
    socket.emit('session:join', sessionId);

    // ── Text chat ──
    const onMessage = ({ message, from }) => {
      setMessages(prev => [...prev, { text: message, from, mine: false }]);
    };

    // ── WebRTC signaling (only relevant if mode includes voice) ──
    const onOffer = async ({ offer }) => {
      const pc = ensurePeerConnection();
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit('webrtc:answer', { sessionId, answer });
      setCallState('connected');
    };
    const onAnswer = async ({ answer }) => {
      await pcRef.current?.setRemoteDescription(new RTCSessionDescription(answer));
      setCallState('connected');
    };
    const onIceCandidate = async ({ candidate }) => {
      try {
        await pcRef.current?.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (e) { /* ignore late candidates */ }
    };
    const onPeerLeft = () => {
      setPeerLeft(true);
      setCallState('ended');
    };

    socket.on('session:message', onMessage);
    socket.on('webrtc:offer', onOffer);
    socket.on('webrtc:answer', onAnswer);
    socket.on('webrtc:ice-candidate', onIceCandidate);
    socket.on('session:peer-left', onPeerLeft);

    // If voice is part of the mode, set up media + kick off the call.
    if (mode !== 'text') {
      startVoiceCall(socket);
    }

    return () => {
      socket.off('session:message', onMessage);
      socket.off('webrtc:offer', onOffer);
      socket.off('webrtc:answer', onAnswer);
      socket.off('webrtc:ice-candidate', onIceCandidate);
      socket.off('session:peer-left', onPeerLeft);
      cleanupCall();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, sessionId]);

  const ensurePeerConnection = () => {
    if (pcRef.current) return pcRef.current;
    const pc = new RTCPeerConnection(ICE_SERVERS);

    pc.onicecandidate = (e) => {
      if (e.candidate) {
        getSocket().emit('webrtc:ice-candidate', { sessionId, candidate: e.candidate });
      }
    };
    pc.ontrack = (e) => {
      if (remoteAudioRef.current) {
        remoteAudioRef.current.srcObject = e.streams[0];
      }
    };
    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        setCallState('ended');
      }
    };

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => pc.addTrack(track, localStreamRef.current));
    }

    pcRef.current = pc;
    return pc;
  };

  const startVoiceCall = async (socket) => {
    setCallState('connecting');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localStreamRef.current = stream;
      const pc = ensurePeerConnection();

      // Simple tie-break: whoever's socket id is lexicographically smaller
      // initiates the offer, avoiding a double-offer race.
      const myId = socket.id;
      // Ask the peer to reply with their id so we can decide who offers.
      // Simpler approach: just have the first person to join create the offer
      // after a short delay, giving both clients time to attach listeners.
      setTimeout(async () => {
        if (!pcRef.current || pcRef.current.signalingState !== 'stable') return;
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit('webrtc:offer', { sessionId, offer });
      }, 1000);
    } catch (err) {
      alert('Could not access microphone. Please allow mic permission and retry.');
      setCallState('idle');
    }
  };

  const cleanupCall = () => {
    localStreamRef.current?.getTracks().forEach(t => t.stop());
    pcRef.current?.close();
    pcRef.current = null;
  };

  const toggleMic = () => {
    if (!localStreamRef.current) return;
    localStreamRef.current.getAudioTracks().forEach(t => { t.enabled = !t.enabled; });
    setMicOn(m => !m);
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const socket = getSocket();
    socket.emit('session:message', { sessionId, message: input, from: user.username });
    setMessages(prev => [...prev, { text: input, from: user.username, mine: true }]);
    setInput('');
  };

  const endSession = () => {
    getSocket().emit('session:leave', sessionId);
    cleanupCall();
    navigate('/find-partner');
  };

  return (
    <div className="pc-page">
      <div className="pc-card">
        <div className="pc-header">
          <div className="pc-header-left">
            <span className={`pc-status-dot${callState === 'connected' ? ' live' : ''}`}></span>
            <span className="pc-status-text">
              {peerLeft ? 'Partner left the session' :
               callState === 'connecting' ? 'Connecting…' :
               callState === 'connected' ? 'Connected' :
               mode === 'text' ? 'Text session' : 'Waiting to connect…'}
            </span>
          </div>
          <button className="pc-end-btn" onClick={endSession}>End Session</button>
        </div>

        {mode === 'both' && (
          <div className="pc-view-toggle">
            <button className={activeView === 'call' ? 'active' : ''} onClick={() => setActiveView('call')}>🎙️ Voice</button>
            <button className={activeView === 'chat' ? 'active' : ''} onClick={() => setActiveView('chat')}>💬 Chat</button>
          </div>
        )}

        {mode !== 'text' && (activeView === 'call' || mode === 'voice') && (
          <div className="pc-call-panel">
            <audio ref={remoteAudioRef} autoPlay />
            <div className="pc-call-avatar-row">
              <div className="pc-call-avatar you">
                <span>You</span>
              </div>
              <div className="pc-call-wave">
                {[...Array(5)].map((_, i) => <span key={i} style={{ animationDelay: `${i * 0.12}s` }}></span>)}
              </div>
              <div className="pc-call-avatar partner">
                <span>Partner</span>
              </div>
            </div>
            <button className={`pc-mic-btn${!micOn ? ' muted' : ''}`} onClick={toggleMic}>
              {micOn ? '🎤 Mute' : '🔇 Unmute'}
            </button>
          </div>
        )}

        {(mode === 'text' || activeView === 'chat') && (
          <div className="pc-chat-panel">
            <div className="pc-chat-window">
              {messages.length === 0 ? (
                <div className="pc-chat-empty">Say hello to get the conversation started!</div>
              ) : (
                messages.map((m, i) => (
                  <div key={i} className={`pc-bubble${m.mine ? ' mine' : ''}`}>
                    <div className="pc-bubble-from">{m.mine ? 'You' : m.from}</div>
                    <p>{m.text}</p>
                  </div>
                ))
              )}
              <div ref={chatEndRef} />
            </div>
            <form className="pc-chat-input-row" onSubmit={sendMessage}>
              <input
                className="pc-chat-input"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Type a message…"
              />
              <button type="submit" className="pc-chat-send">Send</button>
            </form>
          </div>
        )}

        {peerLeft && (
          <div className="pc-ended-overlay">
            <h3>Your partner left</h3>
            <p>You can find a new practice partner anytime.</p>
            <button className="btn-primary" onClick={() => navigate('/find-partner')}>Find Another Partner</button>
          </div>
        )}
      </div>
    </div>
  );
}