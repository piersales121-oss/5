export interface UserProfile {
  fullName: string;
  username: string;
  email: string;
  mobile: string;
  profilePic?: string;
  isLoggedIn: boolean;
  registeredAt: string;
}

export type ToolCategory = 
  | 'all'
  | 'ocr'
  | 'writing'
  | 'question'
  | 'math_science'
  | 'coding'
  | 'tutor_voice'
  | 'study_pdf';

export interface AITool {
  id: string;
  nameBn: string;
  nameEn: string;
  descBn: string;
  category: ToolCategory;
  iconName: string;
  placeholderBn: string;
  systemPrompt: string;
  requiresImage?: boolean;
  requiresPDF?: boolean;
  supportsVoice?: boolean;
  badge?: string;
  quickAccess?: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  imageUrl?: string;
  pdfName?: string;
  timestamp: string;
}

export interface AIChatSession {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
}

export interface ChatGroup {
  id: string;
  name: string;
  createdBy: string;
  members: string[]; // usernames of group members
  createdAt: string;
  createdAtMs?: number;
}

export interface UserChatMessage {
  id: string;
  senderUsername: string;
  senderFullName: string;
  text: string;
  timestamp: string;
  createdAtMs?: number;
  receiverUsername?: string; // username for direct message
  groupId?: string; // if sending to a specific group
  
  // Media attachments
  mediaType?: 'image' | 'video' | 'audio' | 'document' | 'location';
  mediaUrl?: string; // Data URL / Base64 string
  fileName?: string;
  fileSize?: string;
}

export interface StudyNote {
  id: string;
  title: string;
  content: string;
  category: string;
  date: string;
}

export interface AppSettings {
  darkMode: boolean;
  language: 'bn' | 'en';
  fontSize: 'sm' | 'md' | 'lg';
  notifications: boolean;
  autoUpdate: boolean;
  googleSheetsUrl: string;
}

