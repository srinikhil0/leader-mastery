import { db, storage } from '../config/firebase';
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  getDocs, 
  Timestamp,
  doc,
  getDoc,
  updateDoc,
  QueryDocumentSnapshot,
  onSnapshot
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL
} from 'firebase/storage';
import { Message } from '../components/chat/types';

interface FirebaseSession {
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

// Custom error types
class FirebaseError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'FirebaseError';
  }
}

// Convert Firestore timestamp to Date
const convertMessageTimestamp = (doc: QueryDocumentSnapshot): Message => {
  const data = doc.data();
  return {
    ...data,
    id: doc.id,
    timestamp: data.timestamp?.toDate() || new Date()
  } as Message;
};

export const firebaseService = {
  // Create a new session
  async createSession(userId: string, title: string): Promise<string> {
    try {
      const sessionsRef = collection(db, 'users', userId, 'sessions');
      const docRef = await addDoc(sessionsRef, {
        title,
        createdAt: Timestamp.now(),
        lastMessage: '',
        isActive: true
      });
      return docRef.id;
    } catch (error) {
      console.error('[Firebase] Error creating session:', error);
      throw new FirebaseError('Failed to create session', 'CREATE_SESSION_ERROR');
    }
  },

  // Save a message to a session
  async saveMessage(userId: string, sessionId: string, message: Message): Promise<void> {
    try {
      const messagesRef = collection(db, 'users', userId, 'sessions', sessionId, 'messages');
      await addDoc(messagesRef, {
        content: message.content,
        type: message.type,
        timestamp: Timestamp.now(),
        attachments: message.attachments || null,
        citations: message.citations || null,
        expert: message.expert || null,
        sessionId: message.sessionId || null
      });

      // Update session's last message
      const sessionRef = doc(db, 'users', userId, 'sessions', sessionId);
      await updateDoc(sessionRef, {
        lastMessage: message.content,
        lastUpdated: Timestamp.now()
      });
    } catch (error) {
      console.error('[Firebase] Error saving message:', error);
      throw new FirebaseError('Failed to save message', 'SAVE_MESSAGE_ERROR');
    }
  },

  // Get chat history for a session
  async getChatHistory(userId: string, sessionId: string): Promise<Message[]> {
    try {
      const messagesRef = collection(db, 'users', userId, 'sessions', sessionId, 'messages');
      const q = query(messagesRef, orderBy('timestamp', 'asc'));
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(convertMessageTimestamp);
    } catch (error) {
      console.error('[Firebase] Error getting chat history:', error);
      throw new FirebaseError('Failed to get chat history', 'GET_CHAT_HISTORY_ERROR');
    }
  },

  // Upload PDF file
  async uploadPDF(userId: string, sessionId: string, file: File): Promise<{ url: string, name: string }> {
    try {
      // Create a unique filename
      const timestamp = Date.now();
      const fileName = `${timestamp}_${file.name}`;
      
      // Upload to Firebase Storage
      const storageRef = ref(storage, `users/${userId}/sessions/${sessionId}/pdfs/${fileName}`);
      await uploadBytes(storageRef, file);
      
      // Get download URL
      const url = await getDownloadURL(storageRef);
      
      return {
        url,
        name: file.name
      };
    } catch (error) {
      console.error('[Firebase] Error uploading PDF:', error);
      throw new FirebaseError('Failed to upload PDF', 'UPLOAD_PDF_ERROR');
    }
  },

  // Get all sessions for a user
  async getSessions(userId: string): Promise<FirebaseSession[]> {
    try {
      const sessionsRef = collection(db, 'users', userId, 'sessions');
      const q = query(sessionsRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate()
      })) as FirebaseSession[];
    } catch (error) {
      console.error('[Firebase] Error getting sessions:', error);
      throw new FirebaseError('Failed to get sessions', 'GET_SESSIONS_ERROR');
    }
  },

  // Get a specific session
  async getSession(userId: string, sessionId: string): Promise<FirebaseSession | null> {
    try {
      const sessionRef = doc(db, 'users', userId, 'sessions', sessionId);
      const sessionDoc = await getDoc(sessionRef);
      
      if (!sessionDoc.exists()) {
        return null;
      }
      
      return {
        id: sessionDoc.id,
        ...sessionDoc.data(),
        createdAt: sessionDoc.data().createdAt.toDate()
      } as FirebaseSession;
    } catch (error) {
      console.error('[Firebase] Error getting session:', error);
      throw new FirebaseError('Failed to get session', 'GET_SESSION_ERROR');
    }
  },

  // Add real-time listener for sessions
  onSessionsUpdate(userId: string, callback: (sessions: FirebaseSession[]) => void): () => void {
    const sessionsRef = collection(db, 'users', userId, 'sessions');
    const q = query(sessionsRef, orderBy('createdAt', 'desc'));
    
    // Set up real-time listener
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const sessions = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate()
      })) as FirebaseSession[];
      
      callback(sessions);
    });

    return unsubscribe;
  }
}; 