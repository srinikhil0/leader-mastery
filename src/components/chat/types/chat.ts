// Speech Recognition Types
export interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
}

export interface SpeechRecognitionEvent {
  resultIndex: number;
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
      isFinal: boolean;
    };
    length: number;
  };
}

export interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

// Message Types
export interface Message {
  id: string;
  content: string;
  type: 'user' | 'ai' | 'system';
  timestamp: Date;
  expert?: string;
  sessionId?: string;
  attachments?: Array<{
    name: string;
    type: string;
    size: number;
  }>;
  citations?: Citation[];
}

export interface Citation {
  id: string;
  type: string;
  content: string;
  pageNumber: number;
  documentName: string;
  title: string;
  timestamp: Date;
}

// Persona Types
export interface Persona {
  id: string;
  name: string;
  description: string;
  icon?: string;
}

// Session Types
export interface FirebaseSession {
  id: string;
  title: string;
  createdAt: Date;
  lastMessage: string;
  isActive: boolean;
  lastUpdated?: Date;
  files?: Record<string, {
    storagePath: string;
    collectionName: string;
    uploadedAt: Date;
  }>;
}

// API Response Types
export interface RetrieveChunksResponse {
  question: string;
  retrieved_docs: string;
  page_numbers: number[];
  page_contents?: string[];
  answer?: string;
}

// Declare global window interface
declare global {
  interface Window {
    webkitSpeechRecognition: new () => SpeechRecognition;
    SpeechRecognition: new () => SpeechRecognition;
  }
} 