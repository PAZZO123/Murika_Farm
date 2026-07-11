import React, { useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import {
  Send, Phone, PhoneOff, Paperclip, Hash,
  Mic, MicOff, FileText, Download, PhoneIncoming, Users,
} from 'lucide-react';

const API = 'http://localhost:5000';
const getHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// ── Small helpers ─────────────────────────────────────────────────────────
function initials(u) {
  return `${u?.firstName?.[0] || ''}${u?.lastName?.[0] || ''}`.toUpperCase() || '?';
}

function Avatar({ user, size = 9, online = false }) {
  return (
    <div className="relative shrink-0" style={{ width: size * 4, height: size * 4 }}>
      <div
        className="w-full h-full rounded-full bg-green-700 flex items-center justify-center
                   text-white font-bold text-sm select-none"
      >
        {initials(user)}
      </div>
      {online && (
        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2
                         border-white rounded-full" />
      )}
    </div>
  );
}

// ── Message bubble ────────────────────────────────────────────────────────
function Bubble({ msg, isOwn }) {
  const ts = new Date(msg.timestamp || msg.createdAt)
    .toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const body = () => {
    if (msg.mediaType === 'image' && msg.mediaUrl) {
      return (
        <div>
          <img
            src={`${API}${msg.mediaUrl}`}
            alt={msg.fileName || 'image'}
            className="max-w-xs rounded-xl cursor-pointer object-cover"
            style={{ maxHeight: 240 }}
            onClick={() => window.open(`${API}${msg.mediaUrl}`, '_blank')}
          />
          {msg.content && <p className="mt-1 text-sm">{msg.content}</p>}
        </div>
      );
    }
    if (msg.mediaType === 'video' && msg.mediaUrl) {
      return (
        <div>
          <video
            src={`${API}${msg.mediaUrl}`}
            controls
            className="max-w-xs rounded-xl"
            style={{ maxHeight: 240 }}
          />
          {msg.content && <p className="mt-1 text-sm">{msg.content}</p>}
        </div>
      );
    }
    if (msg.mediaType === 'document' && msg.mediaUrl) {
      return (
        <a
          href={`${API}${msg.mediaUrl}`}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/20
                     hover:bg-white/30 transition-colors min-w-[180px]"
        >
          <FileText className="w-5 h-5 shrink-0" />
          <span className="text-sm truncate flex-1">{msg.fileName || 'Document'}</span>
          <Download className="w-4 h-4 shrink-0" />
        </a>
      );
    }
    return (
      <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
    );
  };

  return (
    <div className={`flex items-end gap-2 mb-3 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
      {!isOwn && (
        <div
          className="w-8 h-8 rounded-full bg-green-700 flex items-center justify-center
                     text-white text-xs font-bold shrink-0"
        >
          {initials(msg.sender)}
        </div>
      )}
      <div className={`flex flex-col max-w-[65%] ${isOwn ? 'items-end' : 'items-start'}`}>
        {!isOwn && (
          <span className="text-xs text-green-700 font-semibold mb-0.5 ml-1">
            {msg.sender?.firstName} {msg.sender?.lastName}
            <span className="text-gray-400 font-normal ml-1">· {msg.sender?.role}</span>
          </span>
        )}
        <div
          className={`rounded-2xl px-3 py-2 shadow-sm
            ${isOwn
              ? 'bg-[#2d9e57] text-white rounded-br-none'
              : 'bg-white text-gray-800 rounded-bl-none border border-gray-100'}`}
        >
          {body()}
        </div>
        <span className="text-[10px] text-gray-400 mt-0.5 mx-1">{ts}</span>
      </div>
    </div>
  );
}

// ── Main Chat ─────────────────────────────────────────────────────────────
export default function Chat() {
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

  // ── State ─────────────────────────────────────────────────────────────
  const [activeView,      setActiveView]      = useState('group');
  const [selectedUser,    setSelectedUser]    = useState(null);
  const [groupMessages,   setGroupMessages]   = useState([]);
  const [privateMessages, setPrivateMessages] = useState({});   // { userId: [msg, …] }
  const [allUsers,        setAllUsers]        = useState([]);
  const [onlineIds,       setOnlineIds]       = useState([]);
  const [unread,          setUnread]          = useState({});   // { userId: count }
  const [input,           setInput]           = useState('');
  const inputRef = useRef('');          // always-current mirror of input state
  const [uploading,       setUploading]       = useState(false);

  // Voice-call state
  const [callState,    setCallState]    = useState('idle'); // idle|calling|in-call|receiving
  const [incomingCall, setIncomingCall] = useState(null);   // { callerId, callerName, offer }
  const [callPeer,     setCallPeer]     = useState(null);   // user object
  const [isMuted,      setIsMuted]      = useState(false);

  // ── Refs ─────────────────────────────────────────────────────────────
  const socketRef      = useRef(null);
  const bottomRef      = useRef(null);
  const fileInputRef   = useRef(null);
  const pcRef          = useRef(null);
  const localStreamRef = useRef(null);
  const remoteAudioRef = useRef(null);

  // ── WebRTC helpers ────────────────────────────────────────────────────
  const cleanupCall = useCallback(() => {
    pcRef.current?.close();
    pcRef.current = null;
    localStreamRef.current?.getTracks().forEach(t => t.stop());
    localStreamRef.current = null;
    if (remoteAudioRef.current) remoteAudioRef.current.srcObject = null;
    setCallState('idle');
    setCallPeer(null);
    setIsMuted(false);
    setIncomingCall(null);
  }, []);

  const makePeerConnection = useCallback((targetUserId) => {
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ],
    });
    pc.ontrack = (e) => {
      if (remoteAudioRef.current) remoteAudioRef.current.srcObject = e.streams[0];
    };
    pc.onicecandidate = (e) => {
      if (e.candidate) {
        socketRef.current?.emit('ice-candidate', { targetUserId, candidate: e.candidate });
      }
    };
    return pc;
  }, []);

  // ── Socket setup ──────────────────────────────────────────────────────
  useEffect(() => {
    const socket = io(API, { transports: ['websocket'] });
    socketRef.current = socket;

    socket.on('connect', () => socket.emit('user-online', currentUser._id));

    socket.on('online-users', (ids) => setOnlineIds(ids.map(String)));

    socket.on('new-group-message', (msg) => {
      setGroupMessages(prev => {
        if (prev.some(m => m._id === msg._id)) return prev;
        return [...prev, msg];
      });
    });

    socket.on('new-private-message', (msg) => {
      const senderId = String(msg.sender?._id || msg.sender);
      setPrivateMessages(prev => ({
        ...prev,
        [senderId]: [...(prev[senderId] || []), msg],
      }));
      setActiveView(cur => {
        if (cur !== senderId) {
          setUnread(u => ({ ...u, [senderId]: (u[senderId] || 0) + 1 }));
        }
        return cur;
      });
    });

    socket.on('incoming-call', ({ callerId, callerName, offer }) => {
      setIncomingCall({ callerId, callerName, offer });
      setCallState('receiving');
    });

    socket.on('call-answered', async ({ answer }) => {
      try {
        await pcRef.current?.setRemoteDescription(new RTCSessionDescription(answer));
        setCallState('in-call');
      } catch (_) {}
    });

    socket.on('ice-candidate', async ({ candidate }) => {
      try { await pcRef.current?.addIceCandidate(new RTCIceCandidate(candidate)); } catch (_) {}
    });

    socket.on('call-ended', () => cleanupCall());

    return () => socket.disconnect();
  }, [currentUser._id, cleanupCall]);

  // ── Fetch all users ───────────────────────────────────────────────────
  useEffect(() => {
    fetch(`${API}/api/auth/users`, { headers: getHeaders() })
      .then(r => r.json())
      .then(data => setAllUsers(data.filter(u => u._id !== currentUser._id)))
      .catch(console.error);
  }, [currentUser._id]);

  // ── Fetch group messages on mount ─────────────────────────────────────
  useEffect(() => {
    fetch(`${API}/api/group-messages`, { headers: getHeaders() })
      .then(r => r.json())
      .then(data => setGroupMessages(Array.isArray(data) ? data : []))
      .catch(console.error);
  }, []);

  // ── Fetch DM history when a user is selected ──────────────────────────
  useEffect(() => {
    if (!selectedUser) return;
    const uid = String(selectedUser._id);
    if (privateMessages[uid]) return;
    fetch(`${API}/api/messages/${uid}`, { headers: getHeaders() })
      .then(r => r.json())
      .then(data => setPrivateMessages(prev => ({ ...prev, [uid]: Array.isArray(data) ? data : [] })))
      .catch(console.error);
  }, [selectedUser]); // eslint-disable-line

  // ── Auto-scroll ───────────────────────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [groupMessages, privateMessages, activeView]);

  // ── Send text / media ─────────────────────────────────────────────────
  const sendMessage = useCallback(async (mediaData = null) => {
    const content = inputRef.current.trim();   // always read from ref, never stale
    if (!content && !mediaData) return;
    const body = { content: content || '', ...(mediaData || {}) };

    if (activeView === 'group') {
      await fetch(`${API}/api/group-messages`, {
        method:  'POST',
        headers: { ...getHeaders(), 'Content-Type': 'application/json' },
        body:    JSON.stringify(body),
      });
      // socket broadcasts it back — no local push needed
    } else if (selectedUser) {
      const saved = await fetch(`${API}/api/messages`, {
        method:  'POST',
        headers: { ...getHeaders(), 'Content-Type': 'application/json' },
        body:    JSON.stringify({ receiver: selectedUser._id, ...body }),
      }).then(r => r.json());

      // Optimistic local state (server already notified the receiver)
      const enriched = {
        ...saved,
        sender: {
          _id:       currentUser._id,
          firstName: currentUser.firstName,
          lastName:  currentUser.lastName,
          role:      currentUser.role,
        },
      };
      setPrivateMessages(prev => ({
        ...prev,
        [String(selectedUser._id)]: [...(prev[String(selectedUser._id)] || []), enriched],
      }));
    }
    setInput('');
    inputRef.current = '';
  }, [activeView, selectedUser, currentUser]);

  // ── File upload ───────────────────────────────────────────────────────
  const handleFileChange = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const { url, mediaType, fileName } = await fetch(`${API}/api/chat/upload`, {
        method:  'POST',
        headers: getHeaders(),
        body:    fd,
      }).then(r => r.json());
      await sendMessage({ mediaUrl: url, mediaType, fileName });
    } catch (err) {
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }, [sendMessage]);

  // ── Voice call actions ────────────────────────────────────────────────
  const startCall = useCallback(async (target) => {
    setCallPeer(target);
    setCallState('calling');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localStreamRef.current = stream;
      const pc = makePeerConnection(target._id);
      pcRef.current = pc;
      stream.getTracks().forEach(t => pc.addTrack(t, stream));
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socketRef.current?.emit('call-offer', {
        targetUserId: target._id,
        offer,
        callerId:   currentUser._id,
        callerName: `${currentUser.firstName} ${currentUser.lastName}`,
      });
    } catch (err) {
      console.error('startCall error:', err);
      cleanupCall();
    }
  }, [makePeerConnection, currentUser, cleanupCall]);

  const acceptCall = useCallback(async () => {
    if (!incomingCall) return;
    const { callerId, offer } = incomingCall;
    const peer = allUsers.find(u => String(u._id) === String(callerId))
               || { _id: callerId, firstName: incomingCall.callerName, lastName: '' };
    setCallPeer(peer);
    setCallState('in-call');
    setIncomingCall(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localStreamRef.current = stream;
      const pc = makePeerConnection(callerId);
      pcRef.current = pc;
      stream.getTracks().forEach(t => pc.addTrack(t, stream));
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socketRef.current?.emit('call-answer', { callerId, answer });
    } catch (err) {
      console.error('acceptCall error:', err);
      cleanupCall();
    }
  }, [incomingCall, allUsers, makePeerConnection, cleanupCall]);

  const endCall = useCallback(() => {
    const targetId = callPeer?._id || incomingCall?.callerId;
    if (targetId) socketRef.current?.emit('call-end', { targetUserId: targetId });
    cleanupCall();
  }, [callPeer, incomingCall, cleanupCall]);

  const toggleMute = useCallback(() => {
    const track = localStreamRef.current?.getAudioTracks()[0];
    if (!track) return;
    track.enabled = !track.enabled;
    setIsMuted(!track.enabled);
  }, []);

  const selectUser = (user) => {
    setSelectedUser(user);
    setActiveView(String(user._id));
    setUnread(u => ({ ...u, [String(user._id)]: 0 }));
  };

  // ── Derived values ────────────────────────────────────────────────────
  const messages = activeView === 'group'
    ? groupMessages
    : (privateMessages[activeView] || []);

  const chatTitle = activeView === 'group'
    ? '#general'
    : selectedUser ? `${selectedUser.firstName} ${selectedUser.lastName}` : '';

  const chatSub = activeView === 'group'
    ? `${allUsers.length + 1} members`
    : selectedUser
      ? onlineIds.includes(String(selectedUser._id)) ? 'Online' : selectedUser.role
      : '';

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <div className="flex h-full -m-4 overflow-hidden bg-gray-100">

      {/* ── SIDEBAR ── */}
      <aside className="w-72 flex flex-col shrink-0 bg-[#0b2e1a] text-white">

        {/* Profile strip */}
        <div className="px-4 py-3 flex items-center gap-3 bg-[#082312] border-b border-white/10">
          <div className="w-9 h-9 rounded-full bg-[#2d9e57] flex items-center justify-center
                          font-bold text-sm shrink-0">
            {initials(currentUser)}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-sm truncate leading-tight">
              {currentUser.firstName} {currentUser.lastName}
            </p>
            <p className="text-[11px] text-green-400 truncate capitalize">{currentUser.role}</p>
          </div>
        </div>

        {/* #general channel */}
        <div className="px-3 pt-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-green-500 mb-1.5 px-1">
            Channels
          </p>
          <button
            onClick={() => { setActiveView('group'); setSelectedUser(null); }}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm
              transition-colors ${activeView === 'group'
                ? 'bg-[#2d9e57] text-white'
                : 'text-green-100 hover:bg-white/10'}`}
          >
            <Hash className="w-4 h-4 shrink-0" />
            <span className="font-medium">general</span>
            <span className="ml-auto text-[10px] text-green-300">{allUsers.length + 1}</span>
          </button>
        </div>

        {/* DM list */}
        <div className="px-3 pt-4 flex-1 overflow-y-auto pb-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-green-500 mb-1.5 px-1">
            Direct Messages
          </p>
          {allUsers.map(user => {
            const uid      = String(user._id);
            const isOnline = onlineIds.includes(uid);
            const isActive = activeView === uid;
            const badge    = unread[uid] || 0;
            return (
              <button
                key={uid}
                onClick={() => selectUser(user)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm
                  mb-0.5 transition-colors ${isActive
                    ? 'bg-[#2d9e57] text-white'
                    : 'text-green-100 hover:bg-white/10'}`}
              >
                {/* Avatar */}
                <div className="relative shrink-0">
                  <div className="w-8 h-8 rounded-full bg-green-800 flex items-center
                                  justify-center text-xs font-bold">
                    {initials(user)}
                  </div>
                  {isOnline && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5
                                     bg-green-400 border-2 border-[#0b2e1a] rounded-full" />
                  )}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <p className="text-[13px] font-medium truncate">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className={`text-[11px] truncate ${isActive ? 'text-green-100' : 'text-green-400'}`}>
                    {user.role}
                  </p>
                </div>
                {badge > 0 && !isActive && (
                  <span className="bg-[#2d9e57] text-white text-[10px] font-bold rounded-full
                                   min-w-[18px] h-[18px] flex items-center justify-center px-1 shrink-0">
                    {badge > 99 ? '99+' : badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </aside>

      {/* ── MAIN AREA ── */}
      <main className="flex-1 flex flex-col min-w-0">

        {/* Chat header */}
        <div className="h-14 bg-white border-b border-gray-200 flex items-center
                        px-4 gap-3 shrink-0 shadow-sm z-10">
          {activeView === 'group' ? (
            <div className="w-9 h-9 rounded-full bg-[#1a6b3a] flex items-center
                            justify-center text-white shrink-0">
              <Hash className="w-5 h-5" />
            </div>
          ) : selectedUser ? (
            <Avatar
              user={selectedUser}
              size={9}
              online={onlineIds.includes(String(selectedUser._id))}
            />
          ) : null}

          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-800 truncate text-sm">{chatTitle}</p>
            <p className="text-[11px] text-gray-500 truncate">{chatSub}</p>
          </div>

          {/* Call controls */}
          {activeView !== 'group' && selectedUser && callState === 'idle' && (
            <button
              onClick={() => startCall(selectedUser)}
              title="Start voice call"
              className="w-9 h-9 rounded-full bg-green-500 hover:bg-green-600 text-white
                         flex items-center justify-center transition-colors"
            >
              <Phone className="w-4 h-4" />
            </button>
          )}
          {(callState === 'calling' || callState === 'in-call') && (
            <div className="flex items-center gap-2">
              <span className={`text-sm font-medium ${callState === 'in-call' ? 'text-green-600' : 'text-amber-500 animate-pulse'}`}>
                {callState === 'calling' ? `Calling ${callPeer?.firstName}…` : `In call · ${callPeer?.firstName}`}
              </span>
              <button
                onClick={toggleMute}
                title={isMuted ? 'Unmute' : 'Mute'}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors
                  ${isMuted ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
              <button
                onClick={endCall}
                title="End call"
                className="w-9 h-9 rounded-full bg-red-500 hover:bg-red-600 text-white
                           flex items-center justify-center transition-colors"
              >
                <PhoneOff className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Messages area */}
        <div
          className="flex-1 overflow-y-auto px-4 py-4"
          style={{ background: '#efeae2' }}
        >
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center gap-2 text-gray-400">
              {activeView === 'group'
                ? <><Hash className="w-10 h-10 text-green-300" /><p className="text-sm">Be the first to write in <b>#general</b></p></>
                : <><Users className="w-10 h-10 text-green-300" /><p className="text-sm">Say hello to {selectedUser?.firstName}</p></>
              }
            </div>
          ) : (
            messages.map((msg, i) => {
              const senderId = String(msg.sender?._id || msg.sender);
              return (
                <Bubble
                  key={msg._id || i}
                  msg={msg}
                  isOwn={senderId === String(currentUser._id)}
                />
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input bar */}
        <div className="bg-[#f0f2f5] border-t border-gray-200 px-3 py-2.5
                        flex items-center gap-2 shrink-0">
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar,.mp3,.wav"
            onChange={handleFileChange}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            title="Attach file"
            className="w-10 h-10 rounded-full text-gray-500 hover:bg-gray-200 flex items-center
                       justify-center transition-colors shrink-0"
          >
            {uploading ? (
              <svg className="animate-spin w-5 h-5 text-green-600" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
            ) : (
              <Paperclip className="w-5 h-5" />
            )}
          </button>

          <input
            type="text"
            value={input}
            onChange={e => { setInput(e.target.value); inputRef.current = e.target.value; }}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
            }}
            placeholder={
              activeView === 'group'
                ? 'Message #general…'
                : selectedUser ? `Message ${selectedUser.firstName}…` : 'Select a chat'
            }
            className="flex-1 bg-white rounded-full px-4 py-2 text-sm text-gray-800
                       focus:outline-none border border-gray-200 focus:border-green-400 transition"
          />

          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() && !uploading}
            className="w-10 h-10 rounded-full bg-[#2d9e57] hover:bg-[#1a6b3a] text-white
                       flex items-center justify-center transition-colors shrink-0
                       disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </main>

      {/* ── INCOMING CALL MODAL ── */}
      {callState === 'receiving' && incomingCall && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 flex flex-col items-center gap-5 w-72">
            <div className="w-20 h-20 rounded-full bg-green-500 flex items-center
                            justify-center shadow-lg animate-pulse">
              <PhoneIncoming className="w-9 h-9 text-white" />
            </div>
            <div className="text-center">
              <p className="font-bold text-gray-800 text-xl">{incomingCall.callerName}</p>
              <p className="text-sm text-gray-500 mt-0.5">Incoming voice call…</p>
            </div>
            <div className="flex gap-6">
              <div className="flex flex-col items-center gap-1">
                <button
                  onClick={endCall}
                  className="w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 text-white
                             flex items-center justify-center transition-colors shadow-md"
                >
                  <PhoneOff className="w-6 h-6" />
                </button>
                <span className="text-xs text-gray-400">Decline</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <button
                  onClick={acceptCall}
                  className="w-14 h-14 rounded-full bg-green-500 hover:bg-green-600 text-white
                             flex items-center justify-center transition-colors shadow-md"
                >
                  <Phone className="w-6 h-6" />
                </button>
                <span className="text-xs text-gray-400">Accept</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hidden audio element for remote voice stream */}
      <audio ref={remoteAudioRef} autoPlay />
    </div>
  );
}
