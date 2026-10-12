import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Search, MoreHorizontal, ArrowUpLeft, Paperclip, Mic, Pause, Play, Trash2,
  CheckCheck, Globe, Instagram, Twitter, Linkedin, BellOff, Bell, 
  Pin, X, Sparkles, Code2, CornerUpRight, Pencil, Copy, Check, 
  PanelRightClose, PanelRightOpen
} from 'lucide-react';
import { useProjectContext } from '../../context/ProjectContext';
import { cn } from '../../lib/utils';

export interface Reaction {
  emoji: string;
  count: number;
  users: string[];
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  timestamp: string;
  isMe: boolean;
  status: 'sent' | 'delivered' | 'read';
  imageUrl?: string;
  isEdited?: boolean;
  isPinned?: boolean;
  replyTo?: { id: string; senderName: string; content: string };
  codeSnippet?: { language: string; code: string };
  voiceNote?: { audioUrl?: string; duration: string; durationSeconds: number };
  reactions?: Reaction[];
}

export const MessagesView: React.FC = () => {
  const { currentUser, users, activeWorkspaceId, workspaces } = useProjectContext();
  
  const currentWorkspace = useMemo(() => {
    return workspaces?.find(w => w.id === activeWorkspaceId) || {
      id: activeWorkspaceId || 'ws_personal',
      name: 'میز کار جاری',
      members: [currentUser?.id || 'usr_master']
    };
  }, [workspaces, activeWorkspaceId, currentUser]);

  const workspaceMembers = useMemo(() => {
    if (!users || users.length === 0) return [];
    const memberIds = currentWorkspace.members || [];
    return users.filter(u => memberIds.includes(u.id));
  }, [users, currentWorkspace]);

  // Sidebar Resize States (Accurate RTL Bounding-Client-Rect tracking)
  const [sidebarWidth, setSidebarWidth] = useState(340);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const isDraggingRef = useRef(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Active Chat & Tab States
  const [activeTab, setActiveTab] = useState<'chats' | 'members'>('chats');
  const [sidebarSearch, setSidebarSearch] = useState('');

  const defaultContact = useMemo(() => {
    const other = workspaceMembers.find(m => m.id !== currentUser?.id);
    if (other) {
      return {
        id: other.id,
        name: other.name,
        role: other.role || 'عضو تیم',
        avatar: other.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${other.username || other.id}`,
        isOnline: true
      };
    }
    return {
      id: 'usr_lead',
      name: 'مهندس سهرابی',
      role: 'راهبر ارشد فنی',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      isOnline: true
    };
  }, [workspaceMembers, currentUser]);

  const [activeContact, setActiveContact] = useState<any>(defaultContact);

  useEffect(() => {
    if (defaultContact && (!activeContact || activeContact.id === 'usr_lead')) {
      setActiveContact(defaultContact);
    }
  }, [defaultContact]);

  // Message Interaction States
  const [inputText, setInputText] = useState('');
  const [isCodeMode, setIsCodeMode] = useState(false);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);

  // Right-Click Context Menu State
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; message: Message } | null>(null);

  // Real Hardware Audio Playback States
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const [playbackProgress, setPlaybackProgress] = useState(0);
  const activeAudioRef = useRef<HTMLAudioElement | null>(null);
  const playbackTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Hardware Microphone Recording Engine States (MediaRecorder API)
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordTimerRef = useRef<NodeJS.Timeout | null>(null);

  // In-Chat Search & Menu States
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [chatSearchQuery, setChatSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  const menuRef = useRef<HTMLDivElement>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initial Messages
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm1',
      senderId: 'contact',
      senderName: activeContact?.name || 'مهندس سهرابی',
      senderAvatar: activeContact?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      content: 'سلام علی جان، وضعیت زمانبندی تحویل پروژه جدید به چه صورت است؟',
      timestamp: '۰۸:۳۵',
      isMe: false,
      status: 'read',
      reactions: [{ emoji: '👍', count: 1, users: [currentUser?.id || 'me'] }]
    },
    {
      id: 'm2',
      senderId: currentUser?.id || 'me',
      senderName: currentUser?.name || 'علی طهمورث',
      senderAvatar: currentUser?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=alitahmores',
      content: 'سلام مهندس، فرآیند پیاده‌سازی طبق برنامه پیش میره و تسک‌ها بین اعضای دپارتمان تخصیص داده شد.',
      timestamp: '۰۸:۵۱',
      isMe: true,
      status: 'read'
    },
    {
      id: 'm3',
      senderId: currentUser?.id || 'me',
      senderName: currentUser?.name || 'علی طهمورث',
      senderAvatar: currentUser?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=alitahmores',
      content: 'این نمونه کد مربوط به هندلر بررسی تفاوت‌های داده است:',
      timestamp: '۰۸:۵۵',
      isMe: true,
      status: 'read',
      codeSnippet: {
        language: 'TypeScript',
        code: `export const computeDataDiff = <T extends { id: string }>(current: T[], fresh: T[]) => {\n  const existingIds = new Set(current.map(item => item.id));\n  return fresh.filter(item => !existingIds.has(item.id));\n};`
      }
    },
    {
      id: 'm4',
      senderId: currentUser?.id || 'me',
      senderName: currentUser?.name || 'علی طهمورث',
      senderAvatar: currentUser?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=alitahmores',
      content: 'پیام صوتی (توضیحات تکمیلی تسک‌ها)',
      timestamp: '۰۸:۵۷',
      isMe: true,
      status: 'read',
      voiceNote: { duration: '۰۰:۱۸', durationSeconds: 18 }
    }
  ]);

  // ===================================================================
  // 1. BULLETPROOF RTL SPLITTER RESIZING (BOUNDING-CLIENT-RECT)
  // ===================================================================
  const handleMouseDown = (_e: React.MouseEvent) => {
    isDraggingRef.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current || !sidebarRef.current) return;
      const sidebarRight = sidebarRef.current.getBoundingClientRect().right;
      const computedWidth = sidebarRight - e.clientX;
      if (computedWidth >= 240 && computedWidth <= 520) {
        setSidebarWidth(computedWidth);
      }
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  // ===================================================================
  // 2. HARDWARE-LEVEL MICROPHONE RECORDING (MEDIARECORDER API)
  // ===================================================================
  const handleStartRealRecording = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('MediaDevices not supported');
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];

      let mimeType = 'audio/webm';
      if (typeof MediaRecorder !== 'undefined') {
        if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
          mimeType = 'audio/webm;codecs=opus';
        } else if (MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')) {
          mimeType = 'audio/ogg;codecs=opus';
        } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
          mimeType = 'audio/mp4';
        }
      }

      const mediaRecorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start(100);
      setIsRecording(true);
      setIsPaused(false);
      setRecordSeconds(0);

      recordTimerRef.current = setInterval(() => {
        setRecordSeconds((prev) => prev + 1);
      }, 1000);
    } catch {
      // Fallback for sandboxed environments or denied permissions: activate timer-based recorder
      audioChunksRef.current = [];
      setIsRecording(true);
      setIsPaused(false);
      setRecordSeconds(0);

      recordTimerRef.current = setInterval(() => {
        setRecordSeconds((prev) => prev + 1);
      }, 1000);
    }
  };

  const handlePauseResumeRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      if (isPaused) {
        if (mediaRecorderRef.current.state === 'paused') {
          mediaRecorderRef.current.resume();
        }
        setIsPaused(false);
        recordTimerRef.current = setInterval(() => setRecordSeconds((prev) => prev + 1), 1000);
      } else {
        if (mediaRecorderRef.current.state === 'recording') {
          mediaRecorderRef.current.pause();
        }
        setIsPaused(true);
        if (recordTimerRef.current) clearInterval(recordTimerRef.current);
      }
    } else {
      // Timer-based toggle
      if (isPaused) {
        setIsPaused(false);
        recordTimerRef.current = setInterval(() => setRecordSeconds((prev) => prev + 1), 1000);
      } else {
        setIsPaused(true);
        if (recordTimerRef.current) clearInterval(recordTimerRef.current);
      }
    }
  };

  const handleCancelRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream?.getTracks().forEach((track) => track.stop());
      } catch {
        // Safe catch
      }
    }
    if (recordTimerRef.current) clearInterval(recordTimerRef.current);
    setIsRecording(false);
    setIsPaused(false);
    setRecordSeconds(0);
    audioChunksRef.current = [];
  };

  const handleSendVoiceNote = () => {
    if (recordSeconds < 1) {
      handleCancelRecording();
      return;
    }

    const durationSec = Math.max(recordSeconds, 1);
    const mins = String(Math.floor(durationSec / 60)).padStart(2, '0');
    const secs = String(durationSec % 60).padStart(2, '0');
    const durationLabel = `${mins}:${secs}`;

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.onstop = () => {
        let localAudioUrl: string | undefined = undefined;
        if (audioChunksRef.current.length > 0) {
          const audioBlob = new Blob(audioChunksRef.current, { type: mediaRecorderRef.current?.mimeType || 'audio/webm' });
          localAudioUrl = URL.createObjectURL(audioBlob);
        }

        const newMsg: Message = {
          id: `msg_${Date.now()}`,
          senderId: currentUser?.id || 'me',
          senderName: currentUser?.name || 'علی طهمورث',
          senderAvatar: currentUser?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=alitahmores',
          content: `پیام صوتی (${durationLabel})`,
          timestamp: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
          isMe: true,
          status: 'sent',
          voiceNote: { audioUrl: localAudioUrl, duration: durationLabel, durationSeconds: durationSec }
        };

        setMessages((prev) => [...prev, newMsg]);
        mediaRecorderRef.current?.stream?.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current.stop();
    } else {
      // Fallback voice note without raw blob URL
      const newMsg: Message = {
        id: `msg_${Date.now()}`,
        senderId: currentUser?.id || 'me',
        senderName: currentUser?.name || 'علی طهمورث',
        senderAvatar: currentUser?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=alitahmores',
        content: `پیام صوتی (${durationLabel})`,
        timestamp: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
        isMe: true,
        status: 'sent',
        voiceNote: { duration: durationLabel, durationSeconds: durationSec }
      };

      setMessages((prev) => [...prev, newMsg]);
    }

    if (recordTimerRef.current) clearInterval(recordTimerRef.current);
    setIsRecording(false);
    setIsPaused(false);
    setRecordSeconds(0);
  };

  // ===================================================================
  // 3. REAL HARDWARE AUDIO PLAYBACK ENGINE
  // ===================================================================
  const handleTogglePlayVoice = (msgId: string, audioUrl?: string, durationSeconds = 15) => {
    // If clicking on currently playing audio: Pause and reset
    if (playingVoiceId === msgId) {
      if (activeAudioRef.current) {
        activeAudioRef.current.pause();
        activeAudioRef.current = null;
      }
      if (playbackTimerRef.current) {
        clearInterval(playbackTimerRef.current);
      }
      setPlayingVoiceId(null);
      setPlaybackProgress(0);
      return;
    }

    // Stop any existing playback
    if (activeAudioRef.current) {
      activeAudioRef.current.pause();
      activeAudioRef.current = null;
    }
    if (playbackTimerRef.current) {
      clearInterval(playbackTimerRef.current);
    }

    setPlayingVoiceId(msgId);
    setPlaybackProgress(0);

    if (audioUrl) {
      // Real audio playback
      const audio = new Audio(audioUrl);
      activeAudioRef.current = audio;

      audio.ontimeupdate = () => {
        if (audio.duration && !isNaN(audio.duration) && audio.duration > 0) {
          setPlaybackProgress((audio.currentTime / audio.duration) * 100);
        }
      };

      audio.onended = () => {
        setPlayingVoiceId(null);
        setPlaybackProgress(0);
        activeAudioRef.current = null;
      };

      audio.onpause = () => {
        if (audio.currentTime >= audio.duration) {
          setPlayingVoiceId(null);
          setPlaybackProgress(0);
          activeAudioRef.current = null;
        }
      };

      audio.play().catch(() => {
        // If browser blocks autoplay or format fails, fallback to animated timer
        runSimulatedPlayback(msgId, durationSeconds);
      });
    } else {
      // Synthetic visual playback for seeded messages
      runSimulatedPlayback(msgId, durationSeconds);
    }
  };

  const runSimulatedPlayback = (msgId: string, durationSec = 15) => {
    const stepMs = 100;
    const totalSteps = (durationSec * 1000) / stepMs;
    const stepIncrement = 100 / Math.max(totalSteps, 1);

    playbackTimerRef.current = setInterval(() => {
      setPlaybackProgress(prev => {
        if (prev >= 100) {
          if (playbackTimerRef.current) clearInterval(playbackTimerRef.current);
          setPlayingVoiceId(null);
          return 0;
        }
        return prev + stepIncrement;
      });
    }, stepMs);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (activeAudioRef.current) {
        activeAudioRef.current.pause();
      }
      if (playbackTimerRef.current) {
        clearInterval(playbackTimerRef.current);
      }
      if (recordTimerRef.current) {
        clearInterval(recordTimerRef.current);
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        try {
          mediaRecorderRef.current.stop();
          mediaRecorderRef.current.stream?.getTracks().forEach((track) => track.stop());
        } catch {
          // ignore
        }
      }
    };
  }, []);

  // Message Sending & Smart Code Mode Logic
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    if (editingMessage) {
      setMessages(prev => prev.map(m => 
        m.id === editingMessage.id ? { ...m, content: inputText, isEdited: true } : m
      ));
      setEditingMessage(null);
      setInputText('');
      return;
    }

    const isCode = isCodeMode || (inputText.startsWith('```') && inputText.endsWith('```'));
    const cleanCode = inputText.replace(/^```[a-z]*\n?|```$/gi, '');

    const newMessage: Message = {
      id: `msg_${Date.now()}`,
      senderId: currentUser?.id || 'me',
      senderName: currentUser?.name || 'علی طهمورث',
      senderAvatar: currentUser?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=alitahmores',
      content: isCode ? 'سورس کد به اشتراک گذاشته شده:' : inputText,
      timestamp: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
      isMe: true,
      status: 'sent',
      codeSnippet: isCode ? { language: 'TypeScript', code: cleanCode } : undefined,
      replyTo: replyingTo ? { id: replyingTo.id, senderName: replyingTo.senderName, content: replyingTo.content } : undefined
    };

    setMessages(prev => [...prev, newMessage]);
    setInputText('');
    setIsCodeMode(false);
    setReplyingTo(null);
  };

  // Right-Click Context Menu Handler
  const handleContextMenu = (e: React.MouseEvent, msg: Message) => {
    e.preventDefault();
    setContextMenu({
      x: Math.min(e.clientX, window.innerWidth - 220),
      y: Math.min(e.clientY, window.innerHeight - 300),
      message: msg
    });
  };

  const handleToggleReaction = (messageId: string, emoji: string) => {
    setMessages(prev => prev.map(m => {
      if (m.id !== messageId) return m;
      const currentReactions = m.reactions || [];
      const existing = currentReactions.find(r => r.emoji === emoji);
      let updated: Reaction[];

      if (existing) {
        if (existing.users.includes(currentUser?.id || 'me')) {
          updated = currentReactions
            .map(r => r.emoji === emoji ? { ...r, count: r.count - 1, users: r.users.filter(u => u !== (currentUser?.id || 'me')) } : r)
            .filter(r => r.count > 0);
        } else {
          updated = currentReactions.map(r => r.emoji === emoji ? { ...r, count: r.count + 1, users: [...r.users, currentUser?.id || 'me'] } : r);
        }
      } else {
        updated = [...currentReactions, { emoji, count: 1, users: [currentUser?.id || 'me'] }];
      }

      return { ...m, reactions: updated };
    }));
    setContextMenu(null);
  };

  // Select Contact
  const handleSelectContact = (member: any) => {
    setActiveContact({
      id: member.id,
      name: member.name,
      role: member.role || 'عضو دپارتمان',
      avatar: member.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.username || member.id}`,
      isOnline: member.isOnline !== false
    });
  };

  // In-Chat Search & Suggestion Engine
  const { filteredMessages, suggestions } = useMemo(() => {
    const q = chatSearchQuery.trim().toLowerCase();
    if (!q) return { filteredMessages: messages, suggestions: [] };

    const matches = messages.filter(m => m.content.toLowerCase().includes(q));
    let wordSuggestions: string[] = [];
    if (matches.length === 0) {
      const allTokens: string[] = Array.from(new Set(
        messages.flatMap(m => m.content.split(/\s+/).filter(w => w.length >= 3))
      ));
      wordSuggestions = allTokens.filter((t: string) => t.toLowerCase().includes(q) || q.split('').some(char => t.includes(char))).slice(0, 4);
    }

    return { filteredMessages: matches, suggestions: wordSuggestions };
  }, [messages, chatSearchQuery]);

  // Filtered members for sidebar
  const filteredSidebarMembers = useMemo(() => {
    if (!sidebarSearch.trim()) return workspaceMembers;
    const q = sidebarSearch.toLowerCase();
    return workspaceMembers.filter(m => 
      m.name?.toLowerCase().includes(q) || 
      m.username?.toLowerCase().includes(q) ||
      m.email?.toLowerCase().includes(q) ||
      m.role?.toLowerCase().includes(q)
    );
  }, [workspaceMembers, sidebarSearch]);

  const pinnedMessage = messages.find(m => m.isPinned);

  // Close context menu on outside click
  useEffect(() => {
    const handleCloseMenu = (e: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(e.target as Node)) {
        setContextMenu(null);
      }
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleCloseMenu);
    return () => document.removeEventListener('mousedown', handleCloseMenu);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="w-full h-[calc(100vh-125px)] min-h-[600px] flex gap-2 pb-6 select-none relative" dir="rtl">
      
      {/* =================================================================== */}
      {/* 1. SIDEBAR: FULL VIEW / SLIM AVATAR RAIL WITH STATUS DOTS           */}
      {/* =================================================================== */}
      {!isSidebarCollapsed ? (
        <div 
          ref={sidebarRef}
          style={{ width: `${sidebarWidth}px` }}
          className="flex flex-col bg-white dark:bg-[#0d121f] rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm overflow-hidden shrink-0"
        >
          {/* Top Profile Header */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 text-center flex flex-col items-center relative">
            <button
              type="button"
              title="بستن سایدبار"
              onClick={() => setIsSidebarCollapsed(true)}
              className="absolute top-3 left-3 p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <PanelRightClose className="w-4 h-4"/>
            </button>

            <div className="relative mb-1.5">
              <img
                src={currentUser?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=alitahmores"}
                alt=""
                className="w-14 h-14 rounded-full object-cover border-2 border-blue-500/30 p-0.5"
              />
              <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 absolute bottom-0 right-0 border-2 border-white dark:border-[#0d121f]" />
            </div>

            <h3 className="text-xs font-black text-slate-800 dark:text-slate-100">{currentUser?.name || 'علی طهمورث'}</h3>
            <span className="text-[10px] font-bold text-slate-400">{currentUser?.role === 'OWNER' ? 'OWNER' : currentUser?.role || 'مدیر سیستم'}</span>

            {/* Social Links */}
            <div className="flex items-center gap-1.5 mt-2.5 text-slate-400">
              <button type="button" className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 hover:text-blue-600 flex items-center justify-center transition-colors cursor-pointer"><Globe className="w-3 h-3"/></button>
              <button type="button" className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 hover:text-rose-500 flex items-center justify-center transition-colors cursor-pointer"><Instagram className="w-3 h-3"/></button>
              <button type="button" className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 hover:text-cyan-500 flex items-center justify-center transition-colors cursor-pointer"><Twitter className="w-3 h-3"/></button>
              <button type="button" className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 hover:text-blue-700 flex items-center justify-center transition-colors cursor-pointer"><Linkedin className="w-3 h-3"/></button>
            </div>
          </div>

          {/* Compact Online Colleagues Strip */}
          <div className="p-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between text-xs font-bold mb-2">
              <span className="text-slate-700 dark:text-slate-200 flex items-center gap-1.5 text-[11px]">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                همکاران آنلاین ({workspaceMembers.length || 1})
              </span>
              <span className="text-[10px] text-blue-600 dark:text-blue-400 cursor-pointer hover:underline">مشاهده همه</span>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {workspaceMembers.map(member => (
                <div 
                  key={member.id}
                  onClick={() => handleSelectContact(member)}
                  className="relative cursor-pointer shrink-0 group"
                  title={member.name}
                >
                  <img
                    src={member.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.username || member.id}`}
                    alt=""
                    className={cn(
                      "w-9 h-9 rounded-2xl object-cover border transition-colors",
                      activeContact?.id === member.id ? "border-blue-500 ring-2 ring-blue-500/20" : "border-slate-200 dark:border-slate-700 group-hover:border-blue-500"
                    )}
                  />
                  <span className={cn(
                    "w-2.5 h-2.5 rounded-full absolute -bottom-0.5 -right-0.5 border-2 border-white dark:border-[#0d121f]",
                    member.isOnline !== false ? "bg-emerald-500" : "bg-slate-400"
                  )} />
                </div>
              ))}
              {workspaceMembers.length === 0 && (
                <div 
                  onClick={() => handleSelectContact(defaultContact)}
                  className="relative cursor-pointer shrink-0 group"
                >
                  <img
                    src={defaultContact.avatar}
                    alt=""
                    className="w-9 h-9 rounded-2xl object-cover border border-blue-500"
                  />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 absolute -bottom-0.5 -right-0.5 border-2 border-white dark:border-[#0d121f]" />
                </div>
              )}
            </div>
          </div>

          {/* Tabs & Search */}
          <div className="p-2.5 space-y-2 border-b border-slate-100 dark:border-slate-800">
            <div className="p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl grid grid-cols-2 gap-1 text-[11px]">
              <button
                type="button"
                onClick={() => setActiveTab('chats')}
                className={cn("py-1 rounded-lg font-bold transition-all cursor-pointer", activeTab === 'chats' ? "bg-white dark:bg-slate-900 text-blue-600 shadow-sm" : "text-slate-500")}
              >
                گفتگوها
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('members')}
                className={cn("py-1 rounded-lg font-bold transition-all cursor-pointer", activeTab === 'members' ? "bg-white dark:bg-slate-900 text-blue-600 shadow-sm" : "text-slate-500")}
              >
                همکاران
              </button>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2"/>
              <input
                type="text"
                value={sidebarSearch}
                onChange={(e) => setSidebarSearch(e.target.value)}
                placeholder="جستجوی گفتگو با همکاران..."
                className="w-full h-8 pr-8 pl-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500 text-right"
              />
            </div>
          </div>

          {/* Conversations / Members List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {activeTab === 'chats' ? (
              <div 
                onClick={() => handleSelectContact(activeContact)}
                className="p-2.5 rounded-2xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800/60 shadow-sm flex items-center justify-between gap-2.5 cursor-pointer"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="relative shrink-0">
                    <img src={activeContact.avatar} alt="" className="w-9 h-9 rounded-2xl object-cover border border-slate-200 dark:border-slate-700"/>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 absolute -bottom-0.5 -right-0.5 border-2 border-white dark:border-[#0d121f]" />
                  </div>
                  <div className="text-right min-w-0">
                    <h4 className="text-xs font-bold text-blue-600 dark:text-blue-400 truncate">{activeContact.name}</h4>
                    <p className="text-[10px] text-slate-400 truncate mt-0.5">
                      {messages[messages.length - 1]?.content || 'سلام مهندس، سورس کد ارسال شد...'}
                    </p>
                  </div>
                </div>
                <span className="text-[9px] font-mono text-slate-400 shrink-0">
                  {messages[messages.length - 1]?.timestamp || '۰۸:۵۵'}
                </span>
              </div>
            ) : (
              filteredSidebarMembers.map(member => (
                <div
                  key={member.id}
                  onClick={() => handleSelectContact(member)}
                  className={cn(
                    "p-2 rounded-2xl flex items-center justify-between gap-2.5 cursor-pointer transition-colors select-none",
                    activeContact?.id === member.id
                      ? "bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800/60"
                      : "hover:bg-slate-50 dark:hover:bg-slate-800/60"
                  )}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="relative shrink-0">
                      <img 
                        src={member.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.username || member.id}`} 
                        alt="" 
                        className="w-8 h-8 rounded-xl object-cover border border-slate-200 dark:border-slate-700"
                      />
                      <span className={cn(
                        "w-2 h-2 rounded-full absolute -bottom-0.5 -right-0.5 border border-white dark:border-[#0d121f]",
                        member.isOnline !== false ? "bg-emerald-500" : "bg-slate-400"
                      )} />
                    </div>
                    <div className="text-right min-w-0">
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">{member.name}</h4>
                      <span className="text-[10px] text-slate-400 block truncate">{member.role || 'عضو تیم'}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        /* Slim Collapsed Rail with Full Teammates List & Online/Offline Dots */
        <div className="w-16 shrink-0 bg-white dark:bg-[#0d121f] rounded-3xl p-2.5 flex flex-col items-center gap-3 border border-slate-200/90 dark:border-slate-800 shadow-sm py-4">
          <button
            type="button"
            title="باز کردن سایدبار"
            onClick={() => setIsSidebarCollapsed(false)}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-blue-600 transition-colors cursor-pointer"
          >
            <PanelRightOpen className="w-4 h-4"/>
          </button>
          
          <div className="w-8 border-t border-slate-100 dark:border-slate-800 my-1" />

          {/* Interactive Teammates Rail */}
          <div className="flex-1 overflow-y-auto space-y-2.5 scrollbar-none w-full flex flex-col items-center">
            {workspaceMembers.map(member => (
              <div 
                key={member.id}
                onClick={() => handleSelectContact(member)}
                className={cn(
                  "relative cursor-pointer p-0.5 rounded-2xl transition-all hover:scale-105",
                  activeContact?.id === member.id ? "ring-2 ring-blue-500" : ""
                )}
                title={`${member.name} (${member.isOnline !== false ? 'آنلاین' : 'آفلاین'})`}
              >
                <img 
                  src={member.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.username || member.id}`} 
                  alt="" 
                  className="w-10 h-10 rounded-2xl object-cover border border-slate-200 dark:border-slate-700"
                />
                <span className={cn(
                  "w-3 h-3 rounded-full absolute -bottom-0.5 -right-0.5 border-2 border-white dark:border-[#0d121f]",
                  member.isOnline !== false ? "bg-emerald-500" : "bg-slate-400"
                )} />
              </div>
            ))}
            {workspaceMembers.length === 0 && (
              <div 
                onClick={() => handleSelectContact(defaultContact)}
                className={cn(
                  "relative cursor-pointer p-0.5 rounded-2xl transition-all hover:scale-105",
                  activeContact?.id === defaultContact.id ? "ring-2 ring-blue-500" : ""
                )}
                title={defaultContact.name}
              >
                <img 
                  src={defaultContact.avatar} 
                  alt="" 
                  className="w-10 h-10 rounded-2xl object-cover border border-slate-200 dark:border-slate-700"
                />
                <span className="w-3 h-3 rounded-full bg-emerald-500 absolute -bottom-0.5 -right-0.5 border-2 border-white dark:border-[#0d121f]" />
              </div>
            )}
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 2. DRAGGABLE SPLITTER (100% RTL ACCURATE VIA BOUNDING CLIENT RECT)   */}
      {/* =================================================================== */}
      {!isSidebarCollapsed && (
        <div
          onMouseDown={handleMouseDown}
          className="w-1.5 hover:w-2 hover:bg-blue-500/50 active:bg-blue-600 cursor-col-resize rounded-full transition-all shrink-0 z-20"
        />
      )}

      {/* =================================================================== */}
      {/* 3. CHAT CANVAS & CONVERSATION STREAM                                */}
      {/* =================================================================== */}
      <div className="flex-1 flex flex-col bg-white dark:bg-[#0d121f] rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm overflow-hidden">
        
        {/* Chat Top Bar */}
        <div className="p-3.5 px-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-slate-900/30">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img src={activeContact.avatar} alt="" className="w-10 h-10 rounded-2xl object-cover border border-slate-200 dark:border-slate-700"/>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 absolute -bottom-0.5 -right-0.5 border-2 border-white dark:border-[#0d121f]" />
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1.5">
                <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100">{activeContact.name}</h3>
                {isMuted && <BellOff className="w-3 h-3 text-slate-400"/>}
              </div>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                آنلاین و در دسترس • {activeContact.role || 'عضو تیم'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 text-slate-400 relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className={cn("p-2 rounded-xl transition-colors cursor-pointer", isSearchOpen ? "bg-blue-50 text-blue-600 dark:bg-blue-950/60" : "hover:bg-slate-100 dark:hover:bg-slate-800")}
              title="جستجو در پیام‌ها"
            >
              <Search className="w-4 h-4"/>
            </button>

            <button
              type="button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 transition-colors cursor-pointer"
              title="تنظیمات گفتگو"
            >
              <MoreHorizontal className="w-4 h-4"/>
            </button>

            {/* 3-Dot Dropdown Menu */}
            {isMenuOpen && (
              <div className="absolute top-10 left-0 z-50 w-48 p-1.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-0.5 animate-in fade-in zoom-in-95 text-xs text-right">
                <button
                  type="button"
                  onClick={() => { setIsMuted(!isMuted); setIsMenuOpen(false); }}
                  className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium cursor-pointer"
                >
                  <span>{isMuted ? 'فعال‌سازی اعلان‌ها' : 'بی‌صدا کردن اعلان‌ها'}</span>
                  {isMuted ? <Bell className="w-3.5 h-3.5"/> : <BellOff className="w-3.5 h-3.5"/>}
                </button>
                <div className="border-t border-slate-100 dark:border-slate-800 my-1"/>
                <button
                  type="button"
                  onClick={() => { 
                    setMessages([]); 
                    setIsMenuOpen(false); 
                  }}
                  className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-600 font-medium cursor-pointer"
                >
                  <span>پاکسازی تاریخچه گفتگو</span>
                  <Trash2 className="w-3.5 h-3.5 text-rose-500"/>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Pinned Message Banner */}
        {pinnedMessage && (
          <div className="p-2.5 px-6 bg-amber-50/80 dark:bg-amber-950/30 border-b border-amber-200/80 dark:border-amber-900/40 flex items-center justify-between text-xs animate-in fade-in">
            <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200 truncate">
              <Pin className="w-3.5 h-3.5 text-amber-600 shrink-0 fill-amber-600"/>
              <span className="font-bold shrink-0">پیام سنجاق‌شده:</span>
              <span className="truncate text-[11px] text-amber-700 dark:text-amber-300">{pinnedMessage.content}</span>
            </div>
            <button 
              type="button"
              onClick={() => setMessages(prev => prev.map(m => ({ ...m, isPinned: false })))} 
              className="text-amber-600 hover:text-amber-800 cursor-pointer p-1"
            >
              <X className="w-3.5 h-3.5"/>
            </button>
          </div>
        )}

        {/* In-Chat Search Bar */}
        {isSearchOpen && (
          <div className="p-3 px-6 bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200/80 dark:border-slate-800 animate-in fade-in slide-in-from-top-2">
            <div className="relative flex items-center">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 pointer-events-none"/>
              <input
                type="text"
                autoFocus
                value={chatSearchQuery}
                onChange={(e) => setChatSearchQuery(e.target.value)}
                placeholder="جستجو در متن پیام‌ها..."
                className="w-full h-8 pr-8 pl-8 text-xs rounded-xl bg-white dark:bg-[#0d121f] border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500 text-right"
              />
              {chatSearchQuery && (
                <button 
                  type="button"
                  onClick={() => setChatSearchQuery('')} 
                  className="absolute left-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5"/>
                </button>
              )}
            </div>

            {suggestions.length > 0 && (
              <div className="flex items-center gap-1.5 mt-2 text-[10px] text-slate-500">
                <Sparkles className="w-3 h-3 text-amber-500 shrink-0"/>
                <span>پیشنهادات مرتبط:</span>
                <div className="flex items-center gap-1 flex-wrap">
                  {suggestions.map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setChatSearchQuery(s)}
                      className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 hover:bg-blue-100 font-medium cursor-pointer transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* =================================================================== */}
        {/* MESSAGES STREAM: ASYMMETRICAL AVATARS & REAL PLAYABLE VOICE CARDS   */}
        {/* =================================================================== */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {filteredMessages.map((msg) => (
            <div
              key={msg.id}
              onContextMenu={(e) => handleContextMenu(e, msg)}
              className={cn(
                "flex gap-2.5 max-w-[80%] sm:max-w-[75%] group relative select-text",
                msg.isMe ? "justify-start items-end" : "mr-auto flex-row-reverse items-start"
              )}
            >
              {/* Asymmetrical Avatar Placement (Me=Bottom, Them=Top) */}
              <img
                src={msg.senderAvatar}
                alt=""
                className={cn(
                  "w-8 h-8 rounded-xl object-cover shrink-0 border border-slate-200 dark:border-slate-700 shadow-xs",
                  msg.isMe ? "mb-0.5 mt-auto" : "mt-0.5"
                )}
              />

              <div className="space-y-1 relative max-w-full min-w-0">
                {!msg.isMe && (
                  <span className="text-[10px] font-bold text-slate-400 block px-1 text-left">{msg.senderName}</span>
                )}

                {/* Reply Quote Banner */}
                {msg.replyTo && (
                  <div className={cn(
                    "p-2 px-3 rounded-xl text-[11px] mb-1 border-r-2 flex items-center justify-between",
                    msg.isMe ? "bg-blue-700/60 text-blue-100 border-white" : "bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-blue-500"
                  )}>
                    <div>
                      <span className="font-bold block">{msg.replyTo.senderName}</span>
                      <span className="truncate block opacity-80">{msg.replyTo.content}</span>
                    </div>
                  </div>
                )}

                {/* Message Bubble Container */}
                <div
                  className={cn(
                    "p-3.5 text-xs leading-relaxed text-right relative shadow-sm",
                    msg.isMe
                      ? "bg-blue-600 text-white rounded-[20px] rounded-br-[4px]" 
                      : "bg-slate-100 dark:bg-[#131b2e] text-slate-800 dark:text-slate-100 rounded-[20px] rounded-tl-[4px] border border-slate-200/70 dark:border-slate-800"
                  )}
                >
                  {/* Code Snippet Card with Styled Scrollbar */}
                  {msg.codeSnippet && (
                    <div className="mb-2 rounded-xl overflow-hidden border border-slate-700 bg-[#090d16] text-slate-100 font-mono text-[11px]" dir="ltr">
                      <div className="flex items-center justify-between p-2 px-3 bg-slate-900 border-b border-slate-800">
                        <span className="text-[10px] text-cyan-400 font-bold">{msg.codeSnippet.language}</span>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(msg.codeSnippet!.code);
                            setCopiedCodeId(msg.id);
                            setTimeout(() => setCopiedCodeId(null), 2000);
                          }}
                          className="text-slate-400 hover:text-white flex items-center gap-1 text-[10px] cursor-pointer transition-colors"
                        >
                          {copiedCodeId === msg.id ? <Check className="w-3 h-3 text-emerald-400"/> : <Copy className="w-3 h-3"/>}
                          <span>{copiedCodeId === msg.id ? 'کپی شد' : 'کپی کد'}</span>
                        </button>
                      </div>
                      <pre className="p-3 overflow-x-auto text-left leading-normal scrollbar-thin scrollbar-thumb-slate-700">{msg.codeSnippet.code}</pre>
                    </div>
                  )}

                  {/* Playable Voice Note Card with Real Hardware Audio Support */}
                  {msg.voiceNote && (
                    <div className="flex items-center gap-3 py-1 min-w-[210px]" dir="ltr">
                      <button
                        type="button"
                        onClick={() => handleTogglePlayVoice(msg.id, msg.voiceNote?.audioUrl, msg.voiceNote?.durationSeconds)}
                        className={cn(
                          "w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer shrink-0 shadow-sm",
                          msg.isMe ? "bg-white text-blue-600 hover:bg-blue-50" : "bg-blue-600 text-white hover:bg-blue-500"
                        )}
                      >
                        {playingVoiceId === msg.id ? <Pause className="w-4 h-4"/> : <Play className="w-4 h-4 ml-0.5 fill-current"/>}
                      </button>

                      <div className="flex-1 space-y-1">
                        {/* Audio Waveform Bars with dynamic playback animation */}
                        <div className="flex items-center gap-0.5 h-5">
                          {[40, 70, 30, 90, 60, 100, 45, 80, 50, 75, 35, 95, 65, 85].map((h, i) => (
                            <span
                              key={i}
                              style={{ height: `${h}%` }}
                              className={cn(
                                "w-1 rounded-full transition-all duration-150",
                                playingVoiceId === msg.id && (i / 14) * 100 <= playbackProgress
                                  ? (msg.isMe ? "bg-cyan-300" : "bg-blue-600")
                                  : (msg.isMe ? "bg-white/40" : "bg-slate-300 dark:bg-slate-700")
                              )}
                            />
                          ))}
                        </div>
                        <span className={cn("text-[9px] font-mono block", msg.isMe ? "text-blue-100" : "text-slate-400")}>
                          {msg.voiceNote.duration}
                        </span>
                      </div>
                    </div>
                  )}

                  {!msg.voiceNote && <p className="whitespace-pre-wrap">{msg.content}</p>}

                  {/* Timestamp & Receipts */}
                  <div className={cn(
                    "flex items-center gap-1.5 mt-1 text-[10px] font-mono select-none",
                    msg.isMe ? "justify-end text-blue-100" : "justify-start text-slate-400"
                  )}>
                    {msg.isEdited && <span className="text-[9px] opacity-80">(ویرایش شده)</span>}
                    <span>{msg.timestamp}</span>
                    {msg.isMe && <CheckCheck className="w-3.5 h-3.5 text-blue-200"/>}
                  </div>
                </div>

                {/* Reaction Badges */}
                {msg.reactions && msg.reactions.length > 0 && (
                  <div className="flex items-center gap-1 mt-1 flex-wrap">
                    {msg.reactions.map(r => (
                      <button
                        key={r.emoji}
                        type="button"
                        onClick={() => handleToggleReaction(msg.id, r.emoji)}
                        className={cn(
                          "px-2 py-0.5 rounded-full text-[11px] flex items-center gap-1 border shadow-xs transition-transform active:scale-90 cursor-pointer",
                          r.users.includes(currentUser?.id || 'me')
                            ? "bg-blue-50 border-blue-200 text-blue-600 dark:bg-blue-950/60 dark:border-blue-800"
                            : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                        )}
                      >
                        <span>{r.emoji}</span>
                        <span className="font-bold text-[10px]">{r.count}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* =================================================================== */}
        {/* 4. RIGHT-CLICK CONTEXT MENU (ANCHORED TO CURSOR)                    */}
        {/* =================================================================== */}
        {contextMenu && (
          <div
            ref={contextMenuRef}
            style={{ top: `${contextMenu.y}px`, left: `${contextMenu.x}px` }}
            className="fixed z-[99999] w-52 p-1.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl space-y-1 animate-in fade-in zoom-in-95 text-xs text-right"
            dir="rtl"
          >
            {/* Emojis Strip */}
            <div className="flex items-center justify-between p-1.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl mb-1">
              {['👍', '❤️', '🔥', '🚀', '👏', '👀'].map(emoji => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => handleToggleReaction(contextMenu.message.id, emoji)}
                  className="hover:scale-125 transition-transform text-sm cursor-pointer p-0.5"
                >
                  {emoji}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => { setReplyingTo(contextMenu.message); setContextMenu(null); }}
              className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium cursor-pointer"
            >
              <span>پاسخ (Reply)</span>
              <CornerUpRight className="w-3.5 h-3.5 text-slate-400"/>
            </button>

            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(contextMenu.message.content);
                setContextMenu(null);
              }}
              className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium cursor-pointer"
            >
              <span>کپی متن پیام</span>
              <Copy className="w-3.5 h-3.5 text-slate-400"/>
            </button>

            <button
              type="button"
              onClick={() => {
                setMessages(prev => prev.map(m => m.id === contextMenu.message.id ? { ...m, isPinned: !m.isPinned } : m));
                setContextMenu(null);
              }}
              className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium cursor-pointer"
            >
              <span>{contextMenu.message.isPinned ? 'برداشتن سنجاق' : 'سنجاق کردن پیام'}</span>
              <Pin className="w-3.5 h-3.5 text-slate-400"/>
            </button>

            {contextMenu.message.isMe && (
              <button
                type="button"
                onClick={() => {
                  setEditingMessage(contextMenu.message);
                  setInputText(contextMenu.message.content);
                  setContextMenu(null);
                }}
                className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium cursor-pointer"
              >
                <span>ویرایش پیام</span>
                <Pencil className="w-3.5 h-3.5 text-slate-400"/>
              </button>
            )}

            <div className="border-t border-slate-100 dark:border-slate-800 my-1"/>

            <button
              type="button"
              onClick={() => {
                setMessages(prev => prev.filter(m => m.id !== contextMenu.message.id));
                setContextMenu(null);
              }}
              className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-600 font-medium cursor-pointer"
            >
              <span>حذف پیام</span>
              <Trash2 className="w-3.5 h-3.5 text-rose-500"/>
            </button>
          </div>
        )}

        {/* Reply/Edit Active Banner */}
        {(replyingTo || editingMessage) && (
          <div className="p-2.5 px-6 bg-slate-100 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs animate-in fade-in slide-from-bottom-2">
            <div className="flex items-center gap-2">
              {replyingTo ? <CornerUpRight className="w-4 h-4 text-blue-600"/> : <Pencil className="w-4 h-4 text-amber-500"/>}
              <div>
                <span className="font-bold text-slate-700 dark:text-slate-200">
                  {replyingTo ? `پاسخ به ${replyingTo.senderName}:` : 'ویرایش پیام:'}
                </span>
                <p className="text-[11px] text-slate-400 truncate max-w-md">
                  {replyingTo ? replyingTo.content : editingMessage?.content}
                </p>
              </div>
            </div>
            <button 
              type="button"
              onClick={() => { setReplyingTo(null); setEditingMessage(null); setInputText(''); }} 
              className="text-slate-400 hover:text-slate-600 cursor-pointer p-1"
            >
              <X className="w-4 h-4"/>
            </button>
          </div>
        )}

        {/* =================================================================== */}
        {/* 5. BOTTOM INPUT BAR (UP-LEFT ARROW & RIGHT TOOL CLUSTER)            */}
        {/* =================================================================== */}
        <div className="p-3 px-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 flex items-center gap-2">
          
          {isRecording ? (
            /* Active Live Voice Recording View with Real Timer & Waveform */
            <div className="flex-1 flex items-center justify-between h-11 px-4 rounded-2xl bg-rose-50/80 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 animate-in fade-in">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-rose-600 animate-ping" />
                <span className="text-xs font-mono font-bold text-rose-600 dark:text-rose-400">
                  {String(Math.floor(recordSeconds / 60)).padStart(2, '0')}:{String(recordSeconds % 60).padStart(2, '0')}
                </span>
                <span className="text-[11px] text-slate-500 font-medium">
                  {isPaused ? 'ضبط متوقف شد (مکث)' : 'در حال ضبط صدای زنده از میکروفون...'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePauseResumeRecording}
                  className="p-2 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-xs cursor-pointer"
                  title={isPaused ? "ادامه ضبط" : "توقف موقت"}
                >
                  {isPaused ? <Play className="w-4 h-4 fill-current"/> : <Pause className="w-4 h-4"/>}
                </button>

                <button
                  type="button"
                  onClick={handleCancelRecording}
                  className="p-2 rounded-xl bg-white dark:bg-slate-800 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors shadow-xs cursor-pointer"
                  title="لغو ضبط"
                >
                  <Trash2 className="w-4 h-4"/>
                </button>

                <button
                  type="button"
                  onClick={handleSendVoiceNote}
                  className="h-8 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1 shadow-sm cursor-pointer active:scale-95 transition-transform"
                >
                  <span>ارسال ویس</span>
                  <ArrowUpLeft className="w-3.5 h-3.5"/>
                </button>
              </div>
            </div>
          ) : (
            /* Standard Input Bar with Left Action (ArrowUpLeft) and Right Tools */
            <form onSubmit={handleSendMessage} className="flex-1 flex items-center gap-2">
              
              {/* Left Action: Stylized Send Button with Up-Left Icon */}
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="h-11 px-4 rounded-2xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/20 transition-all active:scale-95 cursor-pointer shrink-0"
              >
                <span>{editingMessage ? 'ویرایش' : 'ارسال'}</span>
                <ArrowUpLeft className="w-4 h-4"/>
              </button>

              {/* Text / Code Input */}
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={isCodeMode ? "سورس کد خود را در اینجا وارد کنید..." : "پیام خود را بنویسید..."}
                className={cn(
                  "flex-1 h-11 px-4 text-xs rounded-2xl border transition-all shadow-sm text-right",
                  isCodeMode 
                    ? "bg-slate-900 text-cyan-300 font-mono border-cyan-500/80 focus:ring-2 focus:ring-cyan-500/20" 
                    : "bg-white dark:bg-[#0d121f] border-slate-200/90 dark:border-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                )}
              />

              {/* Right Tools Group: Mic + Inline Code Toggle + Attachment */}
              <button
                type="button"
                onClick={handleStartRealRecording}
                className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer shrink-0"
                title="ضبط پیام صوتی از میکروفون"
              >
                <Mic className="w-4 h-4"/>
              </button>

              <button
                type="button"
                onClick={() => setIsCodeMode(!isCodeMode)}
                className={cn(
                  "p-2.5 rounded-xl transition-colors cursor-pointer shrink-0",
                  isCodeMode 
                    ? "bg-cyan-500 text-white shadow-sm" 
                    : "bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-950/40"
                )}
                title="حالت ارسال سورس کد"
              >
                <Code2 className="w-4 h-4"/>
              </button>

              <button
                type="button"
                className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors cursor-pointer shrink-0"
                title="پیوست فایل"
              >
                <Paperclip className="w-4 h-4"/>
              </button>
            </form>
          )}

        </div>
      </div>

    </div>
  );
};
