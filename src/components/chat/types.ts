export interface Message {
  id: string;
  content: string;
  type: 'user' | 'ai' | 'system';
  timestamp: Date;
  expert?: string;
  sessionId?: string;
  userId?: string;
  attachments?: Array<{
    type: string;
    name: string;
    size: number;
    url?: string;
  }>;
  citations?: Citation[];
}

export interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
  sessionId: string;
  userId: string;
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

export interface Session {
  id: string;
  userId: string;
  title: string;
  createdAt: Date;
  lastMessage: string;
  isActive: boolean;
  files?: Record<string, {
    storagePath: string;
    collectionName: string;
    uploadedAt: Date;
  }>;
}

export interface FileUploadState {
  file: File;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  collectionName?: string;
  error?: string;
  url?: string;
} 