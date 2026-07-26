import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  User, 
  Users, 
  MessageSquare, 
  Search, 
  Plus, 
  ArrowLeft, 
  X, 
  MoreVertical, 
  Check, 
  Shield, 
  RefreshCw, 
  Camera, 
  Phone, 
  Video, 
  Paperclip, 
  Mic, 
  Smile, 
  Pin, 
  CheckCheck, 
  Bell, 
  Lock, 
  HardDrive, 
  HelpCircle, 
  Info, 
  LogOut, 
  Moon, 
  Image as ImageIcon, 
  FileText, 
  MapPin, 
  UserCheck, 
  UserPlus, 
  UserMinus, 
  Settings as SettingsIcon, 
  Edit3, 
  Share2, 
  Crown, 
  Trash2, 
  CheckSquare, 
  Square,
  BadgeCheck,
  Film,
  Download,
  Volume2,
  Play,
  Pause,
  Navigation
} from 'lucide-react';
import { UserProfile, UserChatMessage, ChatGroup } from '../types';
import { getCurrentUser, getStoredUsers } from '../services/authService';

const USER_MESSAGES_KEY = 'eduzoon_user_chat_messages';
const CHAT_GROUPS_KEY = 'eduzoon_chat_groups';
const READ_MSGS_KEY = 'zoonchat_read_msg_ids';
const VERIFIED_USERS_KEY = 'zoonchat_verified_usernames';

type MessengerTab = 'chats' | 'updates' | 'calls';

type ActiveViewMode = 
  | { type: 'dashboard' }
  | { type: 'chat'; target: { kind: 'direct'; user: UserProfile } | { kind: 'group'; group: ChatGroup } }
  | { type: 'profile' }
  | { type: 'settings' };

interface CustomStatusUpdate {
  id: string;
  userName: string;
  userAvatar: string;
  time: string;
  caption?: string;
}

export const UserChatView: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(getCurrentUser());
  const [registeredUsers, setRegisteredUsers] = useState<UserProfile[]>([]);
  
  // Navigation & Sub-views
  const [activeTab, setActiveTab] = useState<MessengerTab>('chats');
  const [viewMode, setViewMode] = useState<ActiveViewMode>({ type: 'dashboard' });

  // Read message tracking
  const [readMessageIds, setReadMessageIds] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(READ_MSGS_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    return [];
  });

  // Search & Inputs
  const [searchQuery, setSearchQuery] = useState('');
  const [inputMsg, setInputMsg] = useState('');
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showGroupInfoModal, setShowGroupInfoModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [addMemberSearch, setAddMemberSearch] = useState('');

  // Reactions for messages
  const [reactions, setReactions] = useState<{ [msgId: string]: string }>({});

  // Active Call Overlay State
  const [activeCall, setActiveCall] = useState<{ isVideo: boolean; name: string; avatar: string } | null>(null);

  // Group Creation Modal State
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [groupUserSearchQuery, setGroupUserSearchQuery] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  // Pinned chats tracking
  const [pinnedUsernames, setPinnedUsernames] = useState<string[]>([]);

  // Messages & Groups state from localStorage
  const [messages, setMessages] = useState<UserChatMessage[]>(() => {
    try {
      const raw = localStorage.getItem(USER_MESSAGES_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    return [];
  });

  const [groups, setGroups] = useState<ChatGroup[]>(() => {
    try {
      const raw = localStorage.getItem(CHAT_GROUPS_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    return [];
  });

  // Verified Usernames State (mdrafidbinhabib is admin and always verified)
  const [verifiedUsernames, setVerifiedUsernames] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(VERIFIED_USERS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          return Array.from(new Set(['mdrafidbinhabib', ...parsed]));
        }
      }
    } catch {}
    return ['mdrafidbinhabib'];
  });

  // Admin user manage modal
  const [adminUserManageModal, setAdminUserManageModal] = useState<{
    username: string;
    fullName: string;
  } | null>(null);

  // Helper functions for verification
  const isUserVerified = (username?: string) => {
    if (!username) return false;
    const lower = username.toLowerCase();
    if (lower === 'mdrafidbinhabib') return true;
    return verifiedUsernames.some((u) => u.toLowerCase() === lower);
  };

  const renderVerifiedBadge = (username?: string, sizeClass = 'w-3.5 h-3.5') => {
    if (!username) return null;
    if (isUserVerified(username)) {
      return (
        <span className="inline-flex items-center text-blue-400" title="Verified Account">
          <BadgeCheck className={`${sizeClass} fill-blue-500/20 text-blue-400 inline-block shrink-0 ml-0.5`} />
        </span>
      );
    }
    return null;
  };

  const toggleVerifyUser = (targetUsername: string) => {
    if (currentUser?.username?.toLowerCase() !== 'mdrafidbinhabib') return; // Only mdrafidbinhabib
    if (targetUsername.toLowerCase() === 'mdrafidbinhabib') return; // Admin itself cannot be unverified

    setVerifiedUsernames((prev) => {
      const lowerTarget = targetUsername.toLowerCase();
      const isCurrentlyVerified = prev.some((u) => u.toLowerCase() === lowerTarget);
      let next: string[];
      if (isCurrentlyVerified) {
        next = prev.filter((u) => u.toLowerCase() !== lowerTarget);
      } else {
        next = [...prev, targetUsername];
      }
      next = Array.from(new Set(['mdrafidbinhabib', ...next]));
      try {
        localStorage.setItem(VERIFIED_USERS_KEY, JSON.stringify(next));
        const channel = new BroadcastChannel('zoonchat_broadcast');
        channel.postMessage({ type: 'VERIFICATION_UPDATED', verifiedUsernames: next });
        channel.close();
      } catch {}
      return next;
    });
  };

  // Media Attachment State
  const [pendingAttachment, setPendingAttachment] = useState<{
    mediaType: 'image' | 'video' | 'audio' | 'document' | 'location';
    mediaUrl: string;
    fileName?: string;
    fileSize?: string;
  } | null>(null);

  // Fullscreen media preview modal
  const [previewMediaUrl, setPreviewMediaUrl] = useState<string | null>(null);

  // File Input Refs
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  // Voice Recording States & Refs
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<any>(null);

  // Sending lock ref to prevent duplicate sends on Enter / Form submit
  const isSendingRef = useRef(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initial Sync & Realtime Broadcast setup
  useEffect(() => {
    const users = getStoredUsers();
    setRegisteredUsers(users);
    const active = getCurrentUser();
    setCurrentUser(active);

    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel('zoonchat_broadcast');
      channel.onmessage = (e) => {
        if (e.data?.type === 'NEW_MESSAGE' && e.data?.message) {
          setMessages((prev) => {
            if (prev.some((m) => m.id === e.data.message.id)) return prev;
            return [...prev, e.data.message];
          });
        } else if (e.data?.type === 'NEW_GROUP') {
          setGroups((prev) => [e.data.group, ...prev]);
        } else if (e.data?.type === 'UPDATE_GROUP') {
          setGroups((prev) => prev.map((g) => (g.id === e.data.group.id ? e.data.group : g)));
        } else if (e.data?.type === 'DELETE_GROUP') {
          setGroups((prev) => prev.filter((g) => g.id !== e.data.groupId));
        } else if (e.data?.type === 'VERIFICATION_UPDATED' && Array.isArray(e.data.verifiedUsernames)) {
          setVerifiedUsernames(e.data.verifiedUsernames);
        }
      };
    } catch {}

    const handleStorage = (e: StorageEvent) => {
      if (e.key === USER_MESSAGES_KEY && e.newValue) {
        try {
          const parsed: UserChatMessage[] = JSON.parse(e.newValue);
          setMessages((prev) => {
            const map = new Map<string, UserChatMessage>();
            prev.forEach((m) => map.set(m.id, m));
            parsed.forEach((m) => map.set(m.id, m));
            return Array.from(map.values()).sort((a, b) => (a.createdAtMs || 0) - (b.createdAtMs || 0));
          });
        } catch {}
      }
      if (e.key === CHAT_GROUPS_KEY && e.newValue) {
        try { setGroups(JSON.parse(e.newValue)); } catch {}
      }
      if (e.key === READ_MSGS_KEY && e.newValue) {
        try { setReadMessageIds(JSON.parse(e.newValue)); } catch {}
      }
      if (e.key === VERIFIED_USERS_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) {
            setVerifiedUsernames(Array.from(new Set(['mdrafidbinhabib', ...parsed])));
          }
        } catch {}
      }
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener('storage', handleStorage);
      if (channel) channel.close();
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    };
  }, []);

  // Save read message IDs
  const markMessagesAsRead = (msgIds: string[]) => {
    if (!msgIds.length) return;
    setReadMessageIds((prev) => {
      const updated = Array.from(new Set([...prev, ...msgIds]));
      try {
        localStorage.setItem(READ_MSGS_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // When opening a chat, mark its unread messages as read
  useEffect(() => {
    if (viewMode.type === 'chat' && currentUser) {
      const target = viewMode.target;
      let unreadIds: string[] = [];

      if (target.kind === 'direct') {
        unreadIds = messages
          .filter(
            (m) =>
              m.senderUsername === target.user.username &&
              m.receiverUsername === currentUser.username &&
              !readMessageIds.includes(m.id)
          )
          .map((m) => m.id);
      } else if (target.kind === 'group') {
        unreadIds = messages
          .filter(
            (m) =>
              m.groupId === target.group.id &&
              m.senderUsername !== currentUser.username &&
              !readMessageIds.includes(m.id)
          )
          .map((m) => m.id);
      }

      if (unreadIds.length > 0) {
        markMessagesAsRead(unreadIds);
      }

      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [viewMode, messages]);

  const saveAndBroadcastMsg = (newList: UserChatMessage[], newMsg: UserChatMessage) => {
    setMessages(newList);
    try {
      localStorage.setItem(USER_MESSAGES_KEY, JSON.stringify(newList));
      const channel = new BroadcastChannel('zoonchat_broadcast');
      channel.postMessage({ type: 'NEW_MESSAGE', message: newMsg });
      channel.close();
    } catch (err) {
      console.error('Failed to save/broadcast message:', err);
    }
  };

  const saveAndBroadcastGroup = (newGroup: ChatGroup) => {
    const existingIndex = groups.findIndex((g) => g.id === newGroup.id);
    let updated: ChatGroup[];
    let actionType = 'NEW_GROUP';

    if (existingIndex >= 0) {
      updated = groups.map((g) => (g.id === newGroup.id ? newGroup : g));
      actionType = 'UPDATE_GROUP';
    } else {
      updated = [newGroup, ...groups];
    }

    setGroups(updated);
    try {
      localStorage.setItem(CHAT_GROUPS_KEY, JSON.stringify(updated));
      const channel = new BroadcastChannel('zoonchat_broadcast');
      channel.postMessage({ type: actionType, group: newGroup });
      channel.close();
    } catch {}
  };

  const deleteAndBroadcastGroup = (groupId: string) => {
    const updated = groups.filter((g) => g.id !== groupId);
    setGroups(updated);
    try {
      localStorage.setItem(CHAT_GROUPS_KEY, JSON.stringify(updated));
      const channel = new BroadcastChannel('zoonchat_broadcast');
      channel.postMessage({ type: 'DELETE_GROUP', groupId });
      channel.close();
    } catch {}
    setShowGroupInfoModal(false);
    setViewMode({ type: 'dashboard' });
  };

  // Helper file handlers
  const compressAndSelectImage = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxDim = 1200;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
          setPendingAttachment({
            mediaType: 'image',
            mediaUrl: dataUrl,
            fileName: file.name,
            fileSize: `${(file.size / 1024).toFixed(0)} KB`,
          });
          setShowAttachmentMenu(false);
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleImageSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) compressAndSelectImage(file);
    e.target.value = '';
  };

  const handleVideoSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 15 * 1024 * 1024) {
      alert('ভিডিও ক্লিপটি ১৫ মেগাবাইটের মধ্যে হতে হবে।');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPendingAttachment({
        mediaType: 'video',
        mediaUrl: ev.target?.result as string,
        fileName: file.name,
        fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      });
      setShowAttachmentMenu(false);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleDocumentSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      alert('ফাইলটি ১০ মেগাবাইটের মধ্যে হতে হবে।');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPendingAttachment({
        mediaType: 'document',
        mediaUrl: ev.target?.result as string,
        fileName: file.name,
        fileSize: file.size > 1024 * 1024 ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` : `${(file.size / 1024).toFixed(0)} KB`,
      });
      setShowAttachmentMenu(false);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleAudioSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPendingAttachment({
        mediaType: 'audio',
        mediaUrl: ev.target?.result as string,
        fileName: file.name,
        fileSize: `${(file.size / 1024).toFixed(0)} KB`,
      });
      setShowAttachmentMenu(false);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Voice recording
  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64Audio = reader.result as string;
          handleSendMessage('🎤 ভয়েস নোট', {
            mediaType: 'audio',
            mediaUrl: base64Audio,
            fileName: 'Voice_Note.webm',
            fileSize: `${(audioBlob.size / 1024).toFixed(0)} KB`,
          });
        };
        reader.readAsDataURL(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecordingVoice(true);
      setRecordingSeconds(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      alert('মাইক্রোফোন অ্যাক্সেস করতে সমস্যা হয়েছে।');
    }
  };

  const stopAndSendVoiceRecording = () => {
    if (mediaRecorderRef.current && isRecordingVoice) {
      mediaRecorderRef.current.stop();
      setIsRecordingVoice(false);
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    }
  };

  const cancelVoiceRecording = () => {
    if (mediaRecorderRef.current && isRecordingVoice) {
      mediaRecorderRef.current.onstop = null;
      mediaRecorderRef.current.stop();
      setIsRecordingVoice(false);
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    }
  };

  // Share GPS Location
  const handleShareLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude.toFixed(6);
          const lng = pos.coords.longitude.toFixed(6);
          const mapUrl = `https://www.google.com/maps?q=${lat},${lng}`;
          setPendingAttachment({
            mediaType: 'location',
            mediaUrl: mapUrl,
            fileName: `Location: ${lat}, ${lng}`,
          });
          setShowAttachmentMenu(false);
        },
        () => {
          const mapUrl = `https://www.google.com/maps?q=23.8103,90.4125`;
          setPendingAttachment({
            mediaType: 'location',
            mediaUrl: mapUrl,
            fileName: 'Location: Dhaka, Bangladesh',
          });
          setShowAttachmentMenu(false);
        }
      );
    } else {
      alert('আপনার ডিভাইসে জিওলোকেশন সার্ভিস পাওয়া যায়নি।');
    }
  };

  const handleSendMessage = (
    textToSend?: string,
    directAttachment?: {
      mediaType: 'image' | 'video' | 'audio' | 'document' | 'location';
      mediaUrl: string;
      fileName?: string;
      fileSize?: string;
    }
  ) => {
    if (isSendingRef.current) return;

    const content = textToSend !== undefined ? textToSend : inputMsg;
    const activeAttachment = directAttachment || pendingAttachment;

    if ((!content.trim() && !activeAttachment) || !currentUser || viewMode.type !== 'chat') return;

    isSendingRef.current = true;

    const now = new Date();
    const timestamp = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const createdAtMs = Date.now() + Math.floor(Math.random() * 1000);
    const target = viewMode.target;

    let newMsg: UserChatMessage = {
      id: 'umsg-' + createdAtMs,
      senderUsername: currentUser.username,
      senderFullName: currentUser.fullName,
      text: content.trim(),
      timestamp,
      createdAtMs,
    };

    if (activeAttachment) {
      newMsg.mediaType = activeAttachment.mediaType;
      newMsg.mediaUrl = activeAttachment.mediaUrl;
      newMsg.fileName = activeAttachment.fileName;
      newMsg.fileSize = activeAttachment.fileSize;
    }

    if (target.kind === 'direct') {
      newMsg.receiverUsername = target.user.username;
    } else if (target.kind === 'group') {
      newMsg.groupId = target.group.id;
    }

    setMessages((prev) => {
      const updated = [...prev, newMsg];
      saveAndBroadcastMsg(updated, newMsg);
      return updated;
    });

    markMessagesAsRead([newMsg.id]);

    setInputMsg('');
    setPendingAttachment(null);
    setShowAttachmentMenu(false);
    setShowEmojiPicker(false);

    setTimeout(() => {
      isSendingRef.current = false;
    }, 250);
  };

  const handleReaction = (msgId: string, emoji: string) => {
    setReactions((prev) => ({
      ...prev,
      [msgId]: prev[msgId] === emoji ? '' : emoji,
    }));
  };

  const handleFinalizeGroup = () => {
    if (!newGroupName.trim() || !currentUser) return;
    const members = Array.from(new Set([currentUser.username, ...selectedMembers]));
    const nowMs = Date.now();
    const newGroup: ChatGroup = {
      id: 'grp-' + nowMs,
      name: newGroupName.trim(),
      createdBy: currentUser.username,
      members,
      createdAt: new Date().toLocaleDateString('bn-BD'),
      createdAtMs: nowMs,
    };
    saveAndBroadcastGroup(newGroup);
    setIsCreatingGroup(false);
    setNewGroupName('');
    setSelectedMembers([]);
    setGroupUserSearchQuery('');
    setViewMode({ type: 'chat', target: { kind: 'group', group: newGroup } });
  };

  // Admin remove member from group
  const handleRemoveGroupMember = (group: ChatGroup, memberUsername: string) => {
    if (!currentUser || group.createdBy !== currentUser.username) return;
    const updatedMembers = group.members.filter((m) => m !== memberUsername);
    const updatedGroup = { ...group, members: updatedMembers };
    saveAndBroadcastGroup(updatedGroup);

    // Update current active chat view
    if (viewMode.type === 'chat' && viewMode.target.kind === 'group') {
      setViewMode({ type: 'chat', target: { kind: 'group', group: updatedGroup } });
    }
  };

  // Admin add member to group
  const handleAddGroupMember = (group: ChatGroup, newUsername: string) => {
    if (group.members.includes(newUsername)) return;
    const updatedGroup = { ...group, members: [...group.members, newUsername] };
    saveAndBroadcastGroup(updatedGroup);

    if (viewMode.type === 'chat' && viewMode.target.kind === 'group') {
      setViewMode({ type: 'chat', target: { kind: 'group', group: updatedGroup } });
    }
  };

  // Helper to extract last message for a chat
  const getLastMessage = (kind: 'direct' | 'group', targetId: string) => {
    const matches = messages.filter((m) => {
      if (kind === 'direct' && currentUser) {
        return (
          (m.senderUsername === currentUser.username && m.receiverUsername === targetId) ||
          (m.senderUsername === targetId && m.receiverUsername === currentUser.username)
        );
      }
      if (kind === 'group') {
        return m.groupId === targetId;
      }
      return false;
    });

    if (matches.length === 0) return null;
    return matches[matches.length - 1];
  };

  // Helper to count unread messages for a chat
  const getUnreadInfo = (kind: 'direct' | 'group', targetId: string) => {
    if (!currentUser) return { count: 0, latestUnreadMsg: null };

    const unreads = messages.filter((m) => {
      if (m.senderUsername === currentUser.username) return false;
      if (readMessageIds.includes(m.id)) return false;

      if (kind === 'direct') {
        return m.senderUsername === targetId && m.receiverUsername === currentUser.username;
      }
      if (kind === 'group') {
        return m.groupId === targetId;
      }
      return false;
    });

    return {
      count: unreads.length,
      latestUnreadMsg: unreads.length > 0 ? unreads[unreads.length - 1] : null,
    };
  };

  // Filter registered users (only real registered users, minus current logged-in user and legacy rafid ahmed accounts)
  const otherRegisteredUsers = registeredUsers.filter((u) => {
    if (u.username === currentUser?.username) return false;
    const lowerName = (u.fullName || '').toLowerCase();
    const lowerUname = (u.username || '').toLowerCase();
    if ((lowerName.includes('rafid ahmed') || lowerName.includes('রাফিদ আহমেদ')) && lowerUname !== 'mdrafidbinhabib') {
      return false;
    }
    return true;
  });

  // Group list filtered for current user (only groups where current user is a member or creator)
  const myGroups = groups.filter((g) => currentUser && g.members.includes(currentUser.username));

  // Combine and sort ALL chats (direct & groups) by latest message timestamp chronologically
  interface ChatItem {
    kind: 'direct' | 'group';
    id: string;
    title: string;
    subtitle: string;
    avatarLetter: string;
    userObject?: UserProfile;
    groupObject?: ChatGroup;
    lastMsg: UserChatMessage | null;
    lastTimestampMs: number;
    unreadCount: number;
    latestUnreadMsg: UserChatMessage | null;
  }

  const allChatItems: ChatItem[] = [];

  // 1. Direct chats with registered users
  otherRegisteredUsers.forEach((usr) => {
    const lastMsg = getLastMessage('direct', usr.username);
    const { count, latestUnreadMsg } = getUnreadInfo('direct', usr.username);
    const lastTimestampMs = lastMsg?.createdAtMs || 0;

    allChatItems.push({
      kind: 'direct',
      id: usr.username,
      title: usr.fullName,
      subtitle: `@${usr.username}`,
      avatarLetter: usr.fullName.charAt(0).toUpperCase(),
      userObject: usr,
      lastMsg,
      lastTimestampMs,
      unreadCount: count,
      latestUnreadMsg,
    });
  });

  // 2. Groups
  myGroups.forEach((grp) => {
    const lastMsg = getLastMessage('group', grp.id);
    const { count, latestUnreadMsg } = getUnreadInfo('group', grp.id);
    const lastTimestampMs = lastMsg?.createdAtMs || grp.createdAtMs || 0;

    allChatItems.push({
      kind: 'group',
      id: grp.id,
      title: grp.name,
      subtitle: `${grp.members.length} members`,
      avatarLetter: grp.name.charAt(0).toUpperCase(),
      groupObject: grp,
      lastMsg,
      lastTimestampMs,
      unreadCount: count,
      latestUnreadMsg,
    });
  });

  // Sort chronologically by latest message timestamp (most recent first!)
  allChatItems.sort((a, b) => b.lastTimestampMs - a.lastTimestampMs);

  // Search filter for inbox dashboard
  const filteredChatItems = allChatItems.filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Search filter for group creation user list
  const filteredUsersForGroup = otherRegisteredUsers.filter(
    (u) =>
      u.fullName.toLowerCase().includes(groupUserSearchQuery.toLowerCase()) ||
      u.username.toLowerCase().includes(groupUserSearchQuery.toLowerCase())
  );

  // Active chat messages
  const activeChatMessages = messages.filter((m) => {
    if (viewMode.type !== 'chat') return false;
    const target = viewMode.target;
    if (target.kind === 'direct' && currentUser) {
      return (
        (m.senderUsername === currentUser.username && m.receiverUsername === target.user.username) ||
        (m.senderUsername === target.user.username && m.receiverUsername === currentUser.username)
      );
    }
    if (target.kind === 'group') {
      return m.groupId === target.group.id;
    }
    return false;
  });

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] max-w-md mx-auto px-2 pt-1 pb-20 font-sans text-slate-100 select-none">
      
      {/* =========================================================================
          VIEW MODE 1: CHAT DETAIL SCREEN (CONVERSATION THREAD)
         ========================================================================= */}
      {viewMode.type === 'chat' ? (
        <div className="flex flex-col h-full bg-slate-950 rounded-3xl border border-slate-800/80 shadow-2xl overflow-hidden relative">
          
          {/* Top Android App Bar */}
          <div className="bg-slate-900/90 backdrop-blur-xl border-b border-slate-800 px-3 py-2.5 flex items-center justify-between z-20">
            <div className="flex items-center gap-2 min-w-0">
              <button
                onClick={() => {
                  setShowMoreMenu(false);
                  setViewMode({ type: 'dashboard' });
                }}
                className="p-1.5 rounded-full hover:bg-slate-800 text-slate-300 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              <div
                onClick={() => {
                  if (viewMode.target.kind === 'group') {
                    setShowGroupInfoModal(true);
                  } else {
                    setViewMode({ type: 'profile' });
                  }
                }}
                className="relative cursor-pointer flex items-center gap-2.5 min-w-0"
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-emerald-500 text-white font-bold flex items-center justify-center text-sm shadow-md flex-shrink-0">
                  {viewMode.target.kind === 'direct'
                    ? viewMode.target.user.fullName.charAt(0).toUpperCase()
                    : viewMode.target.group.name.charAt(0).toUpperCase()}
                </div>
                
                <div className="min-w-0">
                  <h3 className="text-xs font-bold text-white truncate leading-tight flex items-center gap-1">
                    <span>
                      {viewMode.target.kind === 'direct'
                        ? viewMode.target.user.fullName
                        : viewMode.target.group.name}
                    </span>
                    {viewMode.target.kind === 'direct' && renderVerifiedBadge(viewMode.target.user.username)}
                    {viewMode.target.kind === 'group' && (
                      <span className="text-[9px] bg-blue-500/20 text-blue-300 px-1.5 py-0.2 rounded-full border border-blue-500/30">
                        Group
                      </span>
                    )}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-medium truncate flex items-center gap-1">
                    <span>
                      {viewMode.target.kind === 'direct'
                        ? `@${viewMode.target.user.username}`
                        : `${viewMode.target.group.members.length} members (Tap for info)`}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-1 text-blue-400">
              <button
                onClick={() =>
                  setActiveCall({
                    isVideo: false,
                    name:
                      viewMode.target.kind === 'direct'
                        ? viewMode.target.user.fullName
                        : viewMode.target.group.name,
                    avatar:
                      viewMode.target.kind === 'direct'
                        ? viewMode.target.user.fullName.charAt(0)
                        : viewMode.target.group.name.charAt(0),
                  })
                }
                className="p-2 rounded-full hover:bg-slate-800 transition-colors"
                title="Voice Call"
              >
                <Phone className="w-4 h-4" />
              </button>

              <button
                onClick={() =>
                  setActiveCall({
                    isVideo: true,
                    name:
                      viewMode.target.kind === 'direct'
                        ? viewMode.target.user.fullName
                        : viewMode.target.group.name,
                    avatar:
                      viewMode.target.kind === 'direct'
                        ? viewMode.target.user.fullName.charAt(0)
                        : viewMode.target.group.name.charAt(0),
                  })
                }
                className="p-2 rounded-full hover:bg-slate-800 transition-colors"
                title="Video Call"
              >
                <Video className="w-4 h-4" />
              </button>

              <button
                onClick={() => setShowMoreMenu(!showMoreMenu)}
                className="p-2 rounded-full hover:bg-slate-800 text-slate-300 transition-colors"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* More Menu Dropdown */}
          {showMoreMenu && (
            <div className="absolute top-14 right-3 z-30 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-1.5 w-48 text-xs animate-in fade-in zoom-in-95">
              {viewMode.target.kind === 'group' && (
                <button
                  onClick={() => {
                    setShowMoreMenu(false);
                    setShowGroupInfoModal(true);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-800 rounded-xl flex items-center gap-2 text-slate-200"
                >
                  <Users className="w-3.5 h-3.5 text-blue-400" />
                  <span>Group Info & Members</span>
                </button>
              )}
              {viewMode.target.kind === 'direct' && (
                <button
                  onClick={() => {
                    setShowMoreMenu(false);
                    setViewMode({ type: 'profile' });
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-800 rounded-xl flex items-center gap-2 text-slate-200"
                >
                  <User className="w-3.5 h-3.5 text-blue-400" />
                  <span>View Profile</span>
                </button>
              )}
              <button
                onClick={() => {
                  setShowMoreMenu(false);
                  setViewMode({ type: 'settings' });
                }}
                className="w-full text-left px-3 py-2 hover:bg-slate-800 rounded-xl flex items-center gap-2 text-slate-200"
              >
                <SettingsIcon className="w-3.5 h-3.5 text-purple-400" />
                <span>Chat Settings</span>
              </button>
            </div>
          )}

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px]">
            <div className="flex justify-center my-2">
              <span className="text-[10px] font-semibold bg-slate-900/90 text-slate-400 px-3 py-1 rounded-full border border-slate-800 shadow-sm">
                Today
              </span>
            </div>

            {activeChatMessages.length === 0 ? (
              <div className="text-center py-16 text-slate-500 space-y-2">
                <MessageSquare className="w-8 h-8 mx-auto opacity-30 text-blue-400" />
                <p className="text-xs font-medium">কোনো মেসেজ নেই। নতুন কথোপকথন শুরু করুন!</p>
              </div>
            ) : (
              activeChatMessages.map((msg) => {
                const isSelf = msg.senderUsername === currentUser?.username;
                const activeReaction = reactions[msg.id];

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isSelf ? 'items-end' : 'items-start'} group relative`}
                  >
                    {!isSelf && (
                      <span className="text-[10px] font-bold text-blue-400 ml-2 mb-0.5 flex items-center gap-0.5">
                        <span>{msg.senderFullName}</span>
                        {renderVerifiedBadge(msg.senderUsername, 'w-3 h-3')}
                        <span className="text-slate-500 ml-0.5">(@{msg.senderUsername})</span>
                      </span>
                    )}

                    <div
                      className={`relative max-w-[82%] rounded-[22px] px-3.5 py-2.5 shadow-md text-xs leading-relaxed transition-all ${
                        isSelf
                          ? 'bg-gradient-to-tr from-blue-600 via-blue-500 to-emerald-500 text-white rounded-br-xs'
                          : 'bg-slate-900/90 border border-slate-800 text-slate-100 rounded-bl-xs backdrop-blur-md'
                      }`}
                    >
                      {/* IMAGE ATTACHMENT */}
                      {msg.mediaType === 'image' && msg.mediaUrl && (
                        <div className="mb-2 cursor-pointer overflow-hidden rounded-xl border border-slate-700/60 bg-black/40">
                          <img
                            src={msg.mediaUrl}
                            alt="photo attachment"
                            className="max-h-64 w-full rounded-xl object-cover hover:opacity-90 transition-opacity"
                            onClick={() => setPreviewMediaUrl(msg.mediaUrl!)}
                          />
                        </div>
                      )}

                      {/* VIDEO ATTACHMENT */}
                      {msg.mediaType === 'video' && msg.mediaUrl && (
                        <div className="mb-2 overflow-hidden rounded-xl border border-slate-700/60 bg-black">
                          <video src={msg.mediaUrl} controls className="max-h-64 w-full rounded-xl" />
                        </div>
                      )}

                      {/* AUDIO / VOICE ATTACHMENT */}
                      {msg.mediaType === 'audio' && msg.mediaUrl && (
                        <div className="mb-2 p-2 bg-slate-950/80 rounded-2xl border border-slate-800/80 flex flex-col gap-1 min-w-[200px]">
                          <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-[11px]">
                            <Volume2 className="w-4 h-4 animate-pulse" />
                            <span>{msg.fileName || 'ভয়েস বার্তা'}</span>
                          </div>
                          <audio src={msg.mediaUrl} controls className="w-full h-8" />
                        </div>
                      )}

                      {/* DOCUMENT ATTACHMENT */}
                      {msg.mediaType === 'document' && msg.mediaUrl && (
                        <div className="mb-2 p-2.5 bg-slate-950/80 rounded-2xl border border-slate-800/80 flex items-center justify-between gap-3 min-w-[210px]">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 shrink-0">
                              <FileText className="w-5 h-5" />
                            </div>
                            <div className="min-w-0 text-left">
                              <p className="text-xs font-bold text-slate-100 truncate">{msg.fileName || 'Document'}</p>
                              <p className="text-[9px] text-slate-400">{msg.fileSize || 'File'}</p>
                            </div>
                          </div>
                          <a
                            href={msg.mediaUrl}
                            download={msg.fileName || 'document_file'}
                            className="p-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white shrink-0 transition-colors shadow-md"
                            title="ডাউনলোড করুন"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                        </div>
                      )}

                      {/* LOCATION ATTACHMENT */}
                      {msg.mediaType === 'location' && msg.mediaUrl && (
                        <div className="mb-2 p-2.5 bg-slate-950/80 rounded-2xl border border-slate-800/80 flex flex-col gap-1.5 min-w-[200px]">
                          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                            <MapPin className="w-4 h-4 fill-amber-500/20" />
                            <span>{msg.fileName || 'Shared Location'}</span>
                          </div>
                          <a
                            href={msg.mediaUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors"
                          >
                            <Navigation className="w-3.5 h-3.5" />
                            <span>গুগল ম্যাপসে খুলুন</span>
                          </a>
                        </div>
                      )}

                      {msg.text && <p className="whitespace-pre-wrap">{msg.text}</p>}

                      <div className="flex items-center justify-end gap-1 mt-1 text-[9px] opacity-80">
                        <span>{msg.timestamp}</span>
                        {isSelf && <CheckCheck className="w-3 h-3 text-emerald-200" />}
                      </div>

                      {activeReaction && (
                        <div className="absolute -bottom-2 right-2 bg-slate-900 border border-slate-700 text-xs px-1.5 py-0.5 rounded-full shadow-lg">
                          {activeReaction}
                        </div>
                      )}
                    </div>

                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 mt-1 bg-slate-900/90 px-2 py-0.5 rounded-full border border-slate-800 shadow-md">
                      <button onClick={() => handleReaction(msg.id, '❤️')} className="hover:scale-125 transition-transform text-xs">❤️</button>
                      <button onClick={() => handleReaction(msg.id, '👍')} className="hover:scale-125 transition-transform text-xs">👍</button>
                      <button onClick={() => handleReaction(msg.id, '🔥')} className="hover:scale-125 transition-transform text-xs">🔥</button>
                    </div>
                  </div>
                );
              })
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Attachment Drawer */}
          {showAttachmentMenu && (
            <div className="bg-slate-900/95 border-t border-slate-800 p-3 grid grid-cols-5 gap-2 animate-in slide-in-from-bottom-5">
              <button
                onClick={() => imageInputRef.current?.click()}
                className="flex flex-col items-center gap-1.5 p-2 bg-slate-950 rounded-2xl border border-slate-800 hover:border-blue-500 text-blue-400"
              >
                <ImageIcon className="w-5 h-5" />
                <span className="text-[9px] font-bold text-slate-300">Photo</span>
              </button>

              <button
                onClick={() => videoInputRef.current?.click()}
                className="flex flex-col items-center gap-1.5 p-2 bg-slate-950 rounded-2xl border border-slate-800 hover:border-teal-500 text-teal-400"
              >
                <Film className="w-5 h-5" />
                <span className="text-[9px] font-bold text-slate-300">Video</span>
              </button>

              <button
                onClick={() => documentInputRef.current?.click()}
                className="flex flex-col items-center gap-1.5 p-2 bg-slate-950 rounded-2xl border border-slate-800 hover:border-emerald-500 text-emerald-400"
              >
                <FileText className="w-5 h-5" />
                <span className="text-[9px] font-bold text-slate-300">Document</span>
              </button>

              <button
                onClick={() => audioInputRef.current?.click()}
                className="flex flex-col items-center gap-1.5 p-2 bg-slate-950 rounded-2xl border border-slate-800 hover:border-purple-500 text-purple-400"
              >
                <Volume2 className="w-5 h-5" />
                <span className="text-[9px] font-bold text-slate-300">Audio</span>
              </button>

              <button
                onClick={handleShareLocation}
                className="flex flex-col items-center gap-1.5 p-2 bg-slate-950 rounded-2xl border border-slate-800 hover:border-amber-500 text-amber-400"
              >
                <MapPin className="w-5 h-5" />
                <span className="text-[9px] font-bold text-slate-300">Location</span>
              </button>
            </div>
          )}

          {/* Emoji Picker */}
          {showEmojiPicker && (
            <div className="bg-slate-900 border-t border-slate-800 p-2 flex gap-3 overflow-x-auto no-scrollbar">
              {['😊', '😂', '🔥', '👍', '❤️', '🎓', '📚', '⚡', '🎉', '🚀', '💯', '✨'].map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => {
                    setInputMsg((prev) => prev + emoji);
                    setShowEmojiPicker(false);
                  }}
                  className="text-lg hover:scale-125 transition-transform"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}

          {/* Pending Attachment Preview Bar */}
          {pendingAttachment && (
            <div className="bg-slate-950 border-t border-slate-800 p-2.5 flex items-center justify-between gap-2 animate-in slide-in-from-bottom-2">
              <div className="flex items-center gap-2 min-w-0">
                {pendingAttachment.mediaType === 'image' && (
                  <img src={pendingAttachment.mediaUrl} alt="preview" className="w-10 h-10 rounded-lg object-cover border border-slate-700" />
                )}
                {pendingAttachment.mediaType === 'video' && (
                  <div className="w-10 h-10 rounded-lg bg-teal-500/20 border border-teal-500/30 text-teal-400 flex items-center justify-center">
                    <Film className="w-5 h-5" />
                  </div>
                )}
                {pendingAttachment.mediaType === 'audio' && (
                  <div className="w-10 h-10 rounded-lg bg-purple-500/20 border border-purple-500/30 text-purple-400 flex items-center justify-center">
                    <Volume2 className="w-5 h-5" />
                  </div>
                )}
                {pendingAttachment.mediaType === 'document' && (
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                )}
                {pendingAttachment.mediaType === 'location' && (
                  <div className="w-10 h-10 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center">
                    <MapPin className="w-5 h-5" />
                  </div>
                )}

                <div className="min-w-0 text-left">
                  <p className="text-xs font-bold text-white truncate">{pendingAttachment.fileName || 'সংযুক্ত মিডিয়া'}</p>
                  <p className="text-[10px] text-emerald-400 font-semibold">{pendingAttachment.fileSize || 'রেডি টু সেন্ড'}</p>
                </div>
              </div>

              <button
                onClick={() => setPendingAttachment(null)}
                className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Hidden File Inputs for Attachments */}
          <input type="file" ref={imageInputRef} accept="image/*" className="hidden" onChange={handleImageSelected} />
          <input type="file" ref={videoInputRef} accept="video/*" className="hidden" onChange={handleVideoSelected} />
          <input type="file" ref={documentInputRef} accept=".pdf,.doc,.docx,.txt,.zip,.rar,.ppt,.pptx,.xls,.xlsx,*" className="hidden" onChange={handleDocumentSelected} />
          <input type="file" ref={audioInputRef} accept="audio/*" className="hidden" onChange={handleAudioSelected} />

          {/* Input Bar or Voice Recorder Bar */}
          {isRecordingVoice ? (
            <div className="bg-slate-900 border-t border-slate-800/80 p-2.5 flex items-center justify-between gap-3 animate-pulse">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping"></span>
                <span className="text-xs font-bold text-rose-400">
                  ভয়েস রেকর্ড হচ্ছে... {Math.floor(recordingSeconds / 60)}:{(recordingSeconds % 60).toString().padStart(2, '0')}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={cancelVoiceRecording}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>বাতিল</span>
                </button>

                <button
                  onClick={stopAndSendVoiceRecording}
                  className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 text-white text-xs font-bold flex items-center gap-1 shadow-md hover:opacity-90"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>পাঠান</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 border-t border-slate-800/80 p-2.5 flex items-center gap-2">
              <button
                onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
                className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-blue-400 transition-colors"
              >
                <Paperclip className="w-4 h-4" />
              </button>

              <button
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-amber-400 transition-colors"
              >
                <Smile className="w-4 h-4" />
              </button>

              <input
                type="text"
                value={inputMsg}
                onChange={(e) => setInputMsg(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="মেসেজ লিখুন..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-full px-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />

              <button
                onClick={startVoiceRecording}
                className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-emerald-400 transition-colors"
                title="ভয়েস রেকর্ড করুন"
              >
                <Mic className="w-4 h-4" />
              </button>

              <button
                onClick={() => handleSendMessage()}
                disabled={!inputMsg.trim() && !pendingAttachment}
                className="p-2.5 rounded-full bg-gradient-to-tr from-blue-600 to-emerald-500 text-white shadow-lg shadow-blue-500/30 hover:opacity-90 transition-all disabled:opacity-40"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* GROUP INFO & MEMBER MANAGEMENT MODAL */}
          {showGroupInfoModal && viewMode.target.kind === 'group' && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
              <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl relative animate-in zoom-in-95 max-h-[85vh] flex flex-col">
                
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-2xl bg-blue-600/20 border border-blue-500/30 text-blue-400 font-bold flex items-center justify-center">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">{viewMode.target.group.name}</h3>
                      <p className="text-[10px] text-slate-400">
                        এডমিন: @{viewMode.target.group.createdBy}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowGroupInfoModal(false)}
                    className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Add Member Button for Admin */}
                {currentUser?.username === viewMode.target.group.createdBy && (
                  <div className="mb-3 flex gap-2">
                    <button
                      onClick={() => setShowAddMemberModal(true)}
                      className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>নতুন মেম্বার যুক্ত করুন</span>
                    </button>

                    <button
                      onClick={() => deleteAndBroadcastGroup(viewMode.target.group.id)}
                      className="py-2 px-3 bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/30 text-rose-300 font-bold text-xs rounded-xl flex items-center justify-center gap-1"
                      title="গ্রুপ ডিলিট করুন"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Member List */}
                <div className="flex-1 overflow-y-auto space-y-2 my-1 pr-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    গ্রুপ মেম্বারবৃন্দ ({viewMode.target.group.members.length} জন)
                  </div>

                  {viewMode.target.group.members.map((mUsername) => {
                    const memberProfile = registeredUsers.find((u) => u.username === mUsername);
                    const isAdmin = mUsername === viewMode.target.group.createdBy;
                    const isSelf = mUsername === currentUser?.username;
                    const canRemove = currentUser?.username === viewMode.target.group.createdBy && !isAdmin;

                    return (
                      <div
                        key={mUsername}
                        className="p-2.5 bg-slate-950 border border-slate-800/80 rounded-2xl flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-xl bg-purple-600/20 border border-purple-500/30 text-purple-300 font-bold text-xs flex items-center justify-center">
                            {memberProfile ? memberProfile.fullName.charAt(0).toUpperCase() : mUsername.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-white truncate flex items-center gap-1">
                              <span>{memberProfile ? memberProfile.fullName : mUsername}</span>
                              {renderVerifiedBadge(mUsername)}
                              {isAdmin && (
                                <span className="bg-amber-500/20 text-amber-300 text-[9px] px-1.5 py-0.2 rounded-md border border-amber-500/30 flex items-center gap-0.5">
                                  <Crown className="w-2.5 h-2.5" />
                                  <span>Admin</span>
                                </span>
                              )}
                              {isSelf && (
                                <span className="text-[9px] text-slate-500">(You)</span>
                              )}
                            </h4>
                            <p className="text-[10px] text-slate-400 truncate">@{mUsername}</p>
                          </div>
                        </div>

                        {canRemove && (
                          <button
                            onClick={() =>
                              handleRemoveGroupMember(
                                (viewMode.target as any).group,
                                mUsername
                              )
                            }
                            className="px-2 py-1 bg-rose-600/20 border border-rose-500/30 hover:bg-rose-600/40 text-rose-300 text-[10px] font-bold rounded-xl flex items-center gap-1 transition-colors"
                          >
                            <UserMinus className="w-3 h-3" />
                            <span>রিমুভ</span>
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>

              </div>
            </div>
          )}

          {/* ADD MEMBER MODAL FOR ADMIN */}
          {showAddMemberModal && viewMode.target.kind === 'group' && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
              <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl relative animate-in zoom-in-95 max-h-[80vh] flex flex-col">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
                  <h3 className="text-xs font-bold text-white">গ্রুপে মেম্বার যুক্ত করুন</h3>
                  <button
                    onClick={() => setShowAddMemberModal(false)}
                    className="p-1 rounded-full bg-slate-800 text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="relative mb-3">
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={addMemberSearch}
                    onChange={(e) => setAddMemberSearch(e.target.value)}
                    placeholder="ইউজার খুঁজুন..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none"
                  />
                </div>

                <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
                  {otherRegisteredUsers
                    .filter((u) => !viewMode.target.group.members.includes(u.username))
                    .filter(
                      (u) =>
                        u.fullName.toLowerCase().includes(addMemberSearch.toLowerCase()) ||
                        u.username.toLowerCase().includes(addMemberSearch.toLowerCase())
                    )
                    .map((usr) => (
                      <div
                        key={usr.username}
                        className="p-2 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between"
                      >
                        <div>
                          <h4 className="text-xs font-bold text-white">{usr.fullName}</h4>
                          <p className="text-[10px] text-slate-400">@{usr.username}</p>
                        </div>
                        <button
                          onClick={() =>
                            handleAddGroupMember(
                              (viewMode.target as any).group,
                              usr.username
                            )
                          }
                          className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px] rounded-lg"
                        >
                          এড করুন
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

        </div>
      ) : viewMode.type === 'profile' ? (
        
        /* =========================================================================
            VIEW MODE 2: PROFILE SCREEN
           ========================================================================= */
        <div className="flex flex-col h-full bg-slate-950 rounded-3xl border border-slate-800 shadow-2xl overflow-y-auto">
          <div className="p-3 flex items-center justify-between border-b border-slate-800/80 bg-slate-900/60 sticky top-0 backdrop-blur-xl z-20">
            <button
              onClick={() => setViewMode({ type: 'dashboard' })}
              className="p-1.5 rounded-full bg-slate-800 text-slate-300 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <h3 className="text-xs font-bold text-white">Profile Details</h3>
            <button
              onClick={() => setViewMode({ type: 'settings' })}
              className="p-1.5 rounded-full bg-slate-800 text-slate-300 hover:text-white"
            >
              <SettingsIcon className="w-4 h-4" />
            </button>
          </div>

          <div className="h-32 bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500 relative">
            <div className="absolute inset-0 bg-black/20"></div>
          </div>

          <div className="px-5 pb-5 -mt-12 relative z-10 flex flex-col items-center text-center">
            <div className="relative">
              <div className="w-24 h-24 rounded-full border-4 border-slate-950 bg-gradient-to-tr from-blue-600 to-emerald-500 text-white font-bold text-3xl flex items-center justify-center shadow-2xl">
                {currentUser?.fullName.charAt(0).toUpperCase() || 'U'}
              </div>
            </div>

            <h2 className="text-base font-bold text-white mt-3 flex items-center justify-center gap-1">
              <span>{currentUser?.fullName || 'EduZoon Student'}</span>
              {renderVerifiedBadge(currentUser?.username, 'w-4 h-4')}
            </h2>
            <p className="text-xs font-semibold text-blue-400">@{currentUser?.username || 'user'}</p>
            
            <p className="text-xs text-slate-300 mt-2 max-w-xs leading-relaxed bg-slate-900/80 border border-slate-800/80 p-2.5 rounded-2xl shadow-inner">
              🚀 Registered Student | EduZoon Messenger
            </p>

            <div className="w-full max-w-xs mt-5 space-y-2 text-left bg-slate-900/90 border border-slate-800 p-4 rounded-3xl text-xs">
              <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Mobile</span>
                <span className="text-slate-200 font-medium">{currentUser?.mobile || 'Not set'}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Email</span>
                <span className="text-slate-200 font-medium">{currentUser?.email}</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-400">Registered</span>
                <span className="text-slate-200 font-medium">
                  {currentUser?.registeredAt ? new Date(currentUser.registeredAt).toLocaleDateString('bn-BD') : 'Registered'}
                </span>
              </div>
            </div>
          </div>
        </div>

      ) : viewMode.type === 'settings' ? (
        
        /* =========================================================================
            VIEW MODE 3: SETTINGS SCREEN
           ========================================================================= */
        <div className="flex flex-col h-full bg-slate-950 rounded-3xl border border-slate-800 shadow-2xl overflow-y-auto">
          <div className="p-3 flex items-center justify-between border-b border-slate-800/80 bg-slate-900/60 sticky top-0 backdrop-blur-xl z-20">
            <button
              onClick={() => setViewMode({ type: 'dashboard' })}
              className="p-1.5 rounded-full bg-slate-800 text-slate-300 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <h3 className="text-xs font-bold text-white">Settings</h3>
            <div className="w-6"></div>
          </div>

          <div className="p-4 space-y-4">
            <div
              onClick={() => setViewMode({ type: 'profile' })}
              className="p-3 bg-gradient-to-r from-slate-900 to-slate-900/80 border border-slate-800 hover:border-blue-500/50 rounded-3xl cursor-pointer flex items-center gap-3 transition-all"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-600 to-emerald-500 text-white font-bold text-lg flex items-center justify-center">
                {currentUser?.fullName.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-bold text-white truncate">{currentUser?.fullName}</h4>
                <p className="text-[10px] text-slate-400">@{currentUser?.username}</p>
              </div>
              <Edit3 className="w-4 h-4 text-blue-400" />
            </div>

            <div className="bg-slate-900/90 border border-slate-800/80 rounded-3xl p-2 space-y-1 text-xs">
              <div className="flex items-center justify-between p-3 hover:bg-slate-800/50 rounded-2xl cursor-pointer">
                <div className="flex items-center gap-3 text-slate-200">
                  <Moon className="w-4 h-4 text-blue-400" />
                  <span>Dark Mode</span>
                </div>
                <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full">
                  Active
                </span>
              </div>

              <div className="flex items-center justify-between p-3 hover:bg-slate-800/50 rounded-2xl cursor-pointer">
                <div className="flex items-center gap-3 text-slate-200">
                  <Bell className="w-4 h-4 text-emerald-400" />
                  <span>Notifications</span>
                </div>
                <span className="text-[10px] text-slate-400">On</span>
              </div>

              <div className="flex items-center justify-between p-3 hover:bg-slate-800/50 rounded-2xl cursor-pointer">
                <div className="flex items-center gap-3 text-slate-200">
                  <Lock className="w-4 h-4 text-amber-400" />
                  <span>Privacy & Security</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 hover:bg-slate-800/50 rounded-2xl cursor-pointer">
                <div className="flex items-center gap-3 text-slate-200">
                  <Info className="w-4 h-4 text-pink-400" />
                  <span>About ZoonChat</span>
                </div>
                <span className="text-[10px] text-slate-500">v3.0</span>
              </div>
            </div>
          </div>
        </div>

      ) : (
        
        /* =========================================================================
            VIEW MODE 4: MESSENGER DASHBOARD (CHATS LIST - CHRONOLOGICAL & UNREAD HIGHLIGHT)
           ========================================================================= */
        <div className="flex flex-col h-full bg-slate-950 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden relative">
          
          {/* Top Home App Bar */}
          <div className="bg-slate-900/90 backdrop-blur-xl border-b border-slate-800/80 p-3 shadow-md">
            <div className="flex items-center justify-between mb-3">
              <div
                onClick={() => setViewMode({ type: 'profile' })}
                className="flex items-center gap-2.5 cursor-pointer group"
              >
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-emerald-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/30 font-extrabold text-sm group-hover:scale-105 transition-transform">
                  ⚡
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-white tracking-wide flex items-center gap-1.5">
                    <span>ZoonChat</span>
                    <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded-full border border-emerald-500/30">
                      Realtime
                    </span>
                  </h3>
                  <p className="text-[10px] text-slate-400">
                    {currentUser ? `@${currentUser.username}` : 'Guest'}
                  </p>
                </div>
              </div>

              {/* Header Action Buttons */}
              <div className="flex items-center gap-1.5 text-slate-300">
                <button
                  onClick={() => setIsCreatingGroup(true)}
                  className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-md transition-all active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>ক্রিয়েট গ্রুপ</span>
                </button>

                <button
                  onClick={() => setViewMode({ type: 'settings' })}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                  title="More Options"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ইউজার বা গ্রুপ খুঁজুন..."
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Tab Switcher */}
          <div className="grid grid-cols-3 bg-slate-900 border-b border-slate-800/80 p-1 text-center">
            {(['chats', 'updates', 'calls'] as MessengerTab[]).map((tab) => {
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-2 text-xs font-bold capitalize transition-all relative ${
                    isActive ? 'text-blue-400' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>{tab}</span>
                  {isActive && (
                    <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-gradient-to-r from-blue-500 to-emerald-400 rounded-full"></span>
                  )}
                </button>
              );
            })}
          </div>

          {/* TAB 1: CHATS LIST (Chronologically ordered & Unread Highlighting) */}
          {activeTab === 'chats' && (
            <div className="flex-1 overflow-y-auto p-2.5 space-y-2">
              
              {filteredChatItems.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs bg-slate-900/40 rounded-3xl border border-slate-800/60 mt-4 space-y-2">
                  <MessageSquare className="w-8 h-8 mx-auto opacity-30 text-blue-400" />
                  <p>কোনো ইউজার বা গ্রুপ পাওয়া যায়নি</p>
                  <p className="text-[10px] text-slate-600">
                    অন্য ইউজার একাউন্ট রেজিস্টার করলে তাদের সাথে সরাসরি চ্যাট করতে পারবেন।
                  </p>
                </div>
              ) : (
                filteredChatItems.map((item) => {
                  const hasUnread = item.unreadCount > 0;
                  const latestMsg = item.lastMsg;

                  return (
                    <div
                      key={item.kind + '-' + item.id}
                      onClick={() => {
                        if (item.kind === 'direct' && item.userObject) {
                          setViewMode({ type: 'chat', target: { kind: 'direct', user: item.userObject } });
                        } else if (item.kind === 'group' && item.groupObject) {
                          setViewMode({ type: 'chat', target: { kind: 'group', group: item.groupObject } });
                        }
                      }}
                      className={`p-3 rounded-2xl cursor-pointer transition-all active:scale-98 flex items-center gap-3 relative border ${
                        hasUnread
                          ? 'bg-gradient-to-r from-blue-950/70 via-slate-900 to-slate-900 border-blue-500/80 shadow-lg shadow-blue-500/10 ring-1 ring-blue-500/50'
                          : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {/* Avatar */}
                      <div className="relative flex-shrink-0">
                        <div
                          className={`w-11 h-11 rounded-full font-bold text-sm flex items-center justify-center border ${
                            item.kind === 'group'
                              ? 'bg-purple-600/20 border-purple-500/40 text-purple-300'
                              : 'bg-blue-600/20 border-blue-500/40 text-blue-300'
                          }`}
                        >
                          {item.avatarLetter}
                        </div>
                      </div>

                      {/* Info & Last Message Snippet */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className={`text-xs font-bold truncate flex items-center gap-1 ${hasUnread ? 'text-white font-extrabold' : 'text-slate-100'}`}>
                            <span>{item.title}</span>
                            {item.kind === 'direct' && renderVerifiedBadge(item.id)}
                            {item.kind === 'group' && (
                              <span className="text-[9px] bg-purple-500/20 text-purple-300 px-1.5 py-0.2 rounded-md ml-1">
                                Group
                              </span>
                            )}
                          </h4>

                          <div className="flex items-center gap-1.5">
                            {currentUser?.username?.toLowerCase() === 'mdrafidbinhabib' && item.kind === 'direct' && item.userObject && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setAdminUserManageModal(item.userObject!);
                                }}
                                className="px-1.5 py-0.5 rounded-md bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 text-[9px] font-bold flex items-center gap-0.5 border border-blue-500/30 transition-colors"
                                title="Manage Verification"
                              >
                                <Shield className="w-2.5 h-2.5" />
                                <span>Verify</span>
                              </button>
                            )}
                            <span className={`text-[10px] ${hasUnread ? 'text-emerald-400 font-bold' : 'text-slate-500'}`}>
                              {latestMsg?.timestamp || ''}
                            </span>
                          </div>
                        </div>

                        {/* Message Preview */}
                        <div className="flex items-center justify-between mt-0.5">
                          <p className={`text-[11px] truncate ${hasUnread ? 'text-blue-300 font-bold' : 'text-slate-400'}`}>
                            {latestMsg ? (
                              <span>
                                <strong className="text-slate-300">{latestMsg.senderFullName}: </strong>
                                {latestMsg.text}
                              </span>
                            ) : (
                              item.subtitle
                            )}
                          </p>

                          {/* Unread Highlight Badge */}
                          {hasUnread && (
                            <span className="ml-2 px-1.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-extrabold text-[9px] shadow-md animate-bounce flex-shrink-0">
                              NEW ({item.unreadCount})
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}

            </div>
          )}

          {/* TAB 2: UPDATES */}
          {activeTab === 'updates' && (
            <div className="flex-1 overflow-y-auto p-3 space-y-4">
              <div className="flex items-center gap-3 p-3 bg-slate-900 border border-slate-800 rounded-2xl">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-600 to-emerald-500 text-white font-bold text-lg flex items-center justify-center">
                    {currentUser?.fullName.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="w-5 h-5 rounded-full bg-blue-600 border-2 border-slate-900 flex items-center justify-center text-white absolute bottom-0 right-0">
                    <Plus className="w-3 h-3" />
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">My Status</h4>
                  <p className="text-[10px] text-slate-400">স্ট্যাটাস পোস্ট করতে ট্যাপ করুন</p>
                </div>
              </div>

              <div className="text-center py-10 text-slate-500 text-xs">
                কোনো নতুন স্ট্যাটাস আপডেট নেই
              </div>
            </div>
          )}

          {/* TAB 3: CALLS */}
          {activeTab === 'calls' && (
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                সাম্প্রতিক কল হিস্ট্রি
              </div>
              <div className="text-center py-12 text-slate-500 text-xs">
                কোনো সাম্প্রতিক কল রেকর্ড নেই
              </div>
            </div>
          )}

        </div>
      )}

      {/* =========================================================================
          MODAL: CREATE GROUP WITH USER SEARCH
         ========================================================================= */}
      {isCreatingGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl relative animate-in zoom-in-95 max-h-[85vh] flex flex-col">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">নতুন গ্রুপ খুলুন</h3>
                  <p className="text-[10px] text-slate-400">ইউজার সার্চ করে মেম্বার যুক্ত করুন</p>
                </div>
              </div>

              <button
                onClick={() => {
                  setIsCreatingGroup(false);
                  setNewGroupName('');
                  setSelectedMembers([]);
                  setGroupUserSearchQuery('');
                }}
                className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Group Name Input */}
            <div className="mb-3">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                গ্রুপের নাম (Group Name)
              </label>
              <input
                type="text"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="যেমন: Study Squad 2026"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* User Search Input */}
            <div className="relative mb-2">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                value={groupUserSearchQuery}
                onChange={(e) => setGroupUserSearchQuery(e.target.value)}
                placeholder="ইউজার সার্চ করুন (নাম বা ইউজারনেম)..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* User Checklist */}
            <div className="flex-1 overflow-y-auto space-y-1.5 my-1 pr-1 border-t border-slate-800/60 pt-2">
              <div className="text-[10px] font-bold text-slate-400 uppercase mb-1 flex justify-between">
                <span>ইউজার নির্বাচন করুন</span>
                <span className="text-blue-400">{selectedMembers.length} জন সিলেক্টেড</span>
              </div>

              {filteredUsersForGroup.length === 0 ? (
                <p className="text-center py-6 text-xs text-slate-500">
                  কোনো ইউজার পাওয়া যায়নি
                </p>
              ) : (
                filteredUsersForGroup.map((usr) => {
                  const isSelected = selectedMembers.includes(usr.username);
                  return (
                    <div
                      key={usr.username}
                      onClick={() => {
                        if (isSelected) {
                          setSelectedMembers(selectedMembers.filter((m) => m !== usr.username));
                        } else {
                          setSelectedMembers([...selectedMembers, usr.username]);
                        }
                      }}
                      className={`p-2.5 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                        isSelected
                          ? 'bg-blue-600/20 border-blue-500 text-white'
                          : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-blue-600/30 text-blue-300 flex items-center justify-center font-bold text-xs">
                          {usr.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold flex items-center gap-1">
                            <span>{usr.fullName}</span>
                            {renderVerifiedBadge(usr.username)}
                          </h4>
                          <p className="text-[10px] text-slate-400">@{usr.username}</p>
                        </div>
                      </div>

                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-blue-400" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-600" />
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Final Create Button */}
            <div className="pt-3 border-t border-slate-800">
              <button
                onClick={handleFinalizeGroup}
                disabled={!newGroupName.trim() || selectedMembers.length === 0}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/30 transition-all disabled:opacity-40 flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>গ্রুপ তৈরি নিশ্চিত করুন</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ACTIVE VOICE/VIDEO CALL OVERLAY */}
      {activeCall && (
        <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-xl flex flex-col items-center justify-between p-6 animate-in fade-in">
          <div className="text-center mt-8">
            <span className="text-xs font-semibold bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full border border-emerald-500/30">
              {activeCall.isVideo ? 'Video Calling...' : 'Voice Calling...'}
            </span>
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-blue-600 to-emerald-500 text-white font-bold text-3xl flex items-center justify-center my-6 mx-auto shadow-2xl animate-pulse">
              {activeCall.avatar}
            </div>
            <h2 className="text-lg font-bold text-white">{activeCall.name}</h2>
            <p className="text-xs text-slate-400 mt-1">Connecting...</p>
          </div>

          <div className="flex items-center gap-4 bg-slate-900 border border-slate-800 px-6 py-3 rounded-full shadow-2xl mb-8">
            <button
              onClick={() => setActiveCall(null)}
              className="p-4 bg-rose-600 hover:bg-rose-500 text-white rounded-full shadow-lg transition-transform active:scale-90"
              title="End Call"
            >
              <Phone className="w-6 h-6 rotate-[135deg]" />
            </button>
          </div>
        </div>
      )}

      {/* ADMIN USER VERIFICATION MANAGEMENT MODAL */}
      {adminUserManageModal && currentUser?.username?.toLowerCase() === 'mdrafidbinhabib' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl relative space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-9 h-9 rounded-2xl bg-blue-600/20 border border-blue-500/30 text-blue-400 font-bold flex items-center justify-center shrink-0">
                  <Shield className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-white flex items-center gap-1 truncate">
                    <span>{adminUserManageModal.fullName}</span>
                    {renderVerifiedBadge(adminUserManageModal.username, 'w-4 h-4')}
                  </h3>
                  <p className="text-[10px] text-slate-400 truncate">@{adminUserManageModal.username}</p>
                </div>
              </div>
              <button
                onClick={() => setAdminUserManageModal(null)}
                className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800/80 text-xs text-slate-300 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">বর্তমান স্ট্যাটাস:</span>
                <span className={`font-bold flex items-center gap-1 ${isUserVerified(adminUserManageModal.username) ? 'text-blue-400' : 'text-slate-500'}`}>
                  {isUserVerified(adminUserManageModal.username) ? 'ভেরিফাইড (Verified 🔵)' : 'সাধারণ (Unverified)'}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 mt-2 leading-relaxed">
                এডমিন (mdrafidbinhabib) হিসেবে আপনি এই ইউজারের অ্যাকাউন্টে ভেরিফাইড ব্যাজ দিতে বা সরাতে পারবেন।
              </p>
            </div>

            {adminUserManageModal.username.toLowerCase() === 'mdrafidbinhabib' ? (
              <p className="text-center text-xs text-amber-400 font-medium">প্রধান এডমিন সবসময় ভেরিফাইড থাকে।</p>
            ) : (
              <button
                onClick={() => {
                  toggleVerifyUser(adminUserManageModal.username);
                  setAdminUserManageModal(null);
                }}
                className={`w-full py-2.5 text-xs font-bold rounded-xl shadow-lg flex items-center justify-center gap-1.5 transition-all ${
                  isUserVerified(adminUserManageModal.username)
                    ? 'bg-rose-600/20 border border-rose-500/30 text-rose-300 hover:bg-rose-600/40'
                    : 'bg-gradient-to-tr from-blue-600 to-emerald-500 text-white hover:opacity-90'
                }`}
              >
                <BadgeCheck className="w-4 h-4" />
                <span>
                  {isUserVerified(adminUserManageModal.username)
                    ? 'আনভেরিফাইড করুন (Remove Badge)'
                    : 'ভেরিফাইড করুন (Make Verified)'}
                </span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Fullscreen Image Preview Modal */}
      {previewMediaUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in"
          onClick={() => setPreviewMediaUrl(null)}
        >
          <div className="relative max-w-3xl max-h-[90vh] overflow-hidden rounded-2xl shadow-2xl border border-slate-800">
            <button
              onClick={() => setPreviewMediaUrl(null)}
              className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-slate-900/80 text-white flex items-center justify-center hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
            <img src={previewMediaUrl} alt="preview full" className="max-h-[85vh] max-w-full object-contain" />
          </div>
        </div>
      )}

    </div>
  );
};
