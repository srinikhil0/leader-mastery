import { db, storage } from '../config/firebase';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  getDocs, 
  Timestamp,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  QueryDocumentSnapshot
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL,
  deleteObject
} from 'firebase/storage';
import { Message, Session, FileUploadState } from '../components/chat/types';

// Custom error types
class FirebaseError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'FirebaseError';
  }
}

interface SessionFile {
  storagePath: string;
  collectionName: string;
  uploadedAt: Date;
}

interface FileMetadata {
  id?: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploadedAt: Date;
  userId: string;
  sessionId?: string;
}

const convertMessageTimestamp = (doc: QueryDocumentSnapshot): Message => {
  const data = doc.data();
  return {
    ...data,
    id: doc.id,
    timestamp: data.timestamp?.toDate() || new Date()
  } as Message;
};

const convertFileMetadata = (doc: QueryDocumentSnapshot): FileMetadata => {
  const data = doc.data();
  return {
    ...data,
    id: doc.id,
    uploadedAt: data.uploadedAt?.toDate() || new Date()
  } as FileMetadata;
};

export const firebaseService = {
  // Chat History
  async saveMessage(message: Message): Promise<void> {
    console.log('[Firebase] Saving message:', { 
      messageId: message.id,
      type: message.type,
      userId: message.userId,
      sessionId: message.sessionId,
      timestamp: message.timestamp,
      expert: message.expert
    });
    
    try {
      const docRef = await addDoc(collection(db, 'messages'), {
        id: message.id,
        content: message.content,
        type: message.type,
        timestamp: new Date(),
        userId: message.userId || message.sessionId?.split('_')[0],
        sessionId: message.sessionId || null,
        expert: message.expert || null,
        attachments: message.attachments || null,
        citations: message.citations || null
      });
      console.log('[Firebase] Message saved successfully:', { 
        docId: docRef.id,
        messageId: message.id
      });
    } catch (error) {
      console.error('[Firebase] Error saving message:', error);
      throw new FirebaseError('Failed to save message', 'SAVE_MESSAGE_ERROR');
    }
  },

  async getChatHistory(userId: string, sessionId?: string): Promise<Message[]> {
    console.log('[Firebase] Fetching chat history:', { userId, sessionId });
    
    try {
      if (!userId) {
        console.error('[Firebase] Invalid user ID provided');
        throw new FirebaseError('User ID is required', 'INVALID_USER_ID');
      }

      const q = sessionId
        ? query(
            collection(db, 'messages'),
            where('userId', '==', userId),
            where('sessionId', '==', sessionId),
            orderBy('timestamp', 'asc')
          )
        : query(
            collection(db, 'messages'),
            where('userId', '==', userId),
            orderBy('timestamp', 'asc')
          );

      console.log('[Firebase] Executing query for messages');
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        console.log('[Firebase] No messages found for user:', userId);
        return [];
      }

      const messages = querySnapshot.docs.map(convertMessageTimestamp);
      console.log('[Firebase] Retrieved messages:', { 
        count: messages.length,
        userId,
        sessionId
      });
      
      return messages;
    } catch (error) {
      console.error('[Firebase] Error in getChatHistory:', error);
      return [];
    }
  },

  // Sessions
  async createSession(userId: string, title: string): Promise<string> {
    try {
      const sessionsRef = collection(db, 'sessions');
      const docRef = await addDoc(sessionsRef, {
        userId,
        title,
        createdAt: Timestamp.now(),
        lastMessage: '',
        isActive: true,
        files: {}
      });
      return docRef.id;
    } catch {
      throw new FirebaseError('Failed to create session', 'CREATE_SESSION_ERROR');
    }
  },

  async getSessions(userId: string) {
    try {
      const sessionsRef = collection(db, 'users', userId, 'sessions');
      const q = query(sessionsRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
        createdAt: new Date(doc.data().createdAt)
      })) as Session[];
    } catch (error) {
      console.error('Error getting sessions:', error);
      throw error;
    }
  },

  async updateSessionMetadata(sessionId: string, updates: Partial<Session>): Promise<void> {
    try {
      const sessionRef = doc(db, 'sessions', sessionId);
      await updateDoc(sessionRef, {
        ...updates,
        lastUpdated: Timestamp.now()
      });
    } catch {
      throw new FirebaseError('Failed to update session', 'UPDATE_SESSION_ERROR');
    }
  },

  async getSession(sessionId: string): Promise<Session | null> {
    try {
      const sessionRef = doc(db, 'sessions', sessionId);
      const sessionDoc = await getDoc(sessionRef);
      if (!sessionDoc.exists()) return null;
      
      const data = sessionDoc.data();
      return {
        id: sessionDoc.id,
        userId: data.userId,
        createdAt: data.createdAt.toDate(),
        title: data.title,
        lastMessage: data.lastMessage,
        files: data.files || {},
        isActive: data.isActive ?? true
      };
    } catch {
      throw new FirebaseError('Failed to get session', 'GET_SESSION_ERROR');
    }
  },

  // File Operations
  async getFileMetadata(fileId: string): Promise<FileMetadata | null> {
    try {
      const fileDoc = await getDoc(doc(db, 'files', fileId));
      if (!fileDoc.exists()) return null;
      return convertFileMetadata(fileDoc as QueryDocumentSnapshot);
    } catch {
      throw new FirebaseError('Failed to get file metadata', 'GET_FILE_METADATA_ERROR');
    }
  },

  async uploadFile(userId: string, file: File, sessionId?: string): Promise<FileUploadState> {
    console.log('[Firebase] Starting file upload:', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      userId,
      sessionId
    });

    try {
      const storageRef = ref(storage, `users/${userId}/files/${file.name}`);
      console.log('[Firebase] Created storage reference:', storageRef.fullPath);
      
      const snapshot = await uploadBytes(storageRef, file);
      console.log('[Firebase] File uploaded to storage:', {
        path: snapshot.ref.fullPath,
        size: snapshot.metadata.size
      });
      
      const url = await getDownloadURL(snapshot.ref);
      console.log('[Firebase] Got download URL:', url);

      const fileMetadata: FileMetadata = {
        name: file.name,
        url,
        type: file.type,
        size: file.size,
        uploadedAt: new Date(),
        userId,
        sessionId
      };

      const docRef = await addDoc(collection(db, 'files'), fileMetadata);
      fileMetadata.id = docRef.id;
      console.log('[Firebase] File metadata saved:', {
        docId: docRef.id,
        metadata: fileMetadata
      });

      // Get collection name from backend
      const formData = new FormData();
      formData.append('user_id', userId);
      formData.append('file_pdf', new Blob([await fetch(url).then(r => r.blob())], { type: 'application/pdf' }), 'file.pdf');

      const response = await fetch('/api/upload_pdf', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to get collection name from backend');
      }

      const data = await response.json();
      const collectionName = data.coll_name;

      if (sessionId) {
        await this.addFileToSession(sessionId, file.name, {
          storagePath: url,
          collectionName,
          uploadedAt: new Date()
        });
      }

      return {
        file,
        status: 'completed',
        url,
        collectionName
      };
    } catch (error) {
      console.error('[Firebase] Error uploading file:', error);
      return {
        file,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  },

  async getFiles(userId: string, sessionId?: string): Promise<FileMetadata[]> {
    try {
      const q = sessionId
        ? query(
            collection(db, 'files'),
            where('userId', '==', userId),
            where('sessionId', '==', sessionId),
            orderBy('uploadedAt', 'desc')
          )
        : query(
            collection(db, 'files'),
            where('userId', '==', userId),
            orderBy('uploadedAt', 'desc')
          );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(convertFileMetadata);
    } catch {
      throw new FirebaseError('Failed to get files', 'GET_FILES_ERROR');
    }
  },

  async deleteFile(userId: string, fileId: string): Promise<void> {
    try {
      const fileDoc = await getDoc(doc(db, 'files', fileId));
      if (!fileDoc.exists()) {
        throw new FirebaseError('File not found', 'FILE_NOT_FOUND');
      }

      const fileData = fileDoc.data() as FileMetadata;
      
      // Delete from Storage
      const storageRef = ref(storage, `users/${userId}/files/${fileData.name}`);
      await deleteObject(storageRef);
      
      // Delete from Firestore
      await deleteDoc(doc(db, 'files', fileId));

      // If file was associated with a session, remove it
      if (fileData.sessionId) {
        const session = await this.getSession(fileData.sessionId);
        if (session && session.files) {
          const remainingFiles = { ...session.files };
          delete remainingFiles[fileData.name];
          await this.updateSessionMetadata(fileData.sessionId, { files: remainingFiles });
        }
      }
    } catch (error) {
      if (error instanceof FirebaseError) throw error;
      throw new FirebaseError('Failed to delete file', 'DELETE_FILE_ERROR');
    }
  },

  // Session File Operations
  async checkFileInSession(sessionId: string, fileName: string): Promise<SessionFile | null> {
    const session = await this.getSession(sessionId);
    if (!session || !session.files) return null;
    return session.files[fileName] || null;
  },

  async addFileToSession(sessionId: string, fileName: string, fileData: SessionFile): Promise<void> {
    try {
      const sessionRef = doc(db, 'sessions', sessionId);
      await updateDoc(sessionRef, {
        [`files.${fileName}`]: {
          ...fileData,
          uploadedAt: Timestamp.fromDate(fileData.uploadedAt)
        }
      });
    } catch {
      throw new FirebaseError('Failed to add file to session', 'ADD_FILE_TO_SESSION_ERROR');
    }
  },

  // PDF operations
  async uploadPDF(userId: string, file: File, sessionId: string): Promise<{ url: string, collectionName: string }> {
    // Check if file already exists in session
    const existingFile = await this.checkFileInSession(sessionId, file.name);
    if (existingFile) {
      return {
        url: existingFile.storagePath,
        collectionName: 'Real Estate'
      };
    }

    // Upload new file
    const storageRef = ref(storage, `users/${userId}/pdfs/${file.name}`);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    
    // Add to session
    await this.addFileToSession(sessionId, file.name, {
      storagePath: downloadURL,
      collectionName: 'Real Estate',
      uploadedAt: new Date()
    });

    return {
      url: downloadURL,
      collectionName: 'Real Estate'
    };
  }
}; 