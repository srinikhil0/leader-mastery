export interface Message {
  id: string;
  content: string;
  type: 'user' | 'ai' | 'system';
  timestamp: Date;
}

export interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
}

export interface Citation {
  id: string;
  title: string;
  content: string;
  url?: string;
  timestamp: Date;
  type: 'pdf' | 'web';
  pageNumber?: number;
}

export interface Persona {
  id: string;
  name: string;
  description: string;
  icon: string;
} 