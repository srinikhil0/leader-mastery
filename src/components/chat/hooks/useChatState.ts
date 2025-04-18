import { useState, useEffect } from 'react';
import { Message, FirebaseSession, Citation, Persona, RetrieveChunksResponse } from '../types/chat';
import { firebaseService } from '../../../services/firebaseService';
import { apiService } from '../../../services/api';
import { normalizeExpertName } from '../utils/expertUtils';

interface UseChatStateProps {
  userId: string | undefined;
}

interface UseChatStateReturn {
  messages: Message[];
  sessions: FirebaseSession[];
  currentSessionId: string | null;
  isNewChat: boolean;
  isGenerating: boolean;
  isLoadingSessions: boolean;
  currentCollectionName: string;
  selectedPersona: Persona | null;
  selectedExpert: string | null;
  selectedSubExpert: string | null;
  activeCitations: Citation[];
  isCitationsVisible: boolean;
  stagedFile: File | null;
  isFileProcessing: boolean;
  currentPdfFile: string | null;
  handleSubmit: (input: string) => Promise<void>;
  handleFileUpload: (file: File) => Promise<void>;
  handleRemoveFile: () => void;
  handleExpertSelect: (expert: string) => Promise<void>;
  handleSubExpertSelect: (subExpert: string) => Promise<void>;
  handleSessionSelect: (session: FirebaseSession) => Promise<void>;
  startNewChat: () => Promise<void>;
  showCitations: (citations: Citation[]) => void;
  hideCitations: () => void;
}

export const useChatState = ({ userId }: UseChatStateProps): UseChatStateReturn => {
  // State
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessions, setSessions] = useState<FirebaseSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isNewChat, setIsNewChat] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const [currentCollectionName, setCurrentCollectionName] = useState<string>('default');
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);
  const [selectedExpert, setSelectedExpert] = useState<string | null>(null);
  const [selectedSubExpert, setSelectedSubExpert] = useState<string | null>(null);
  const [activeCitations, setActiveCitations] = useState<Citation[]>([]);
  const [isCitationsVisible, setIsCitationsVisible] = useState(false);
  const [stagedFile, setStagedFile] = useState<File | null>(null);
  const [isFileProcessing, setIsFileProcessing] = useState(false);
  const [currentPdfFile, setCurrentPdfFile] = useState<string | null>(null);

  // Load sessions and initialize
  useEffect(() => {
    let isInitialized = false;
    let unsubscribe: (() => void) | undefined;

    const initializeChat = async () => {
      if (!userId || isInitialized) return;
      
      try {
        setIsLoadingSessions(true);
        
        // Set up real-time listener for session updates first
        unsubscribe = firebaseService.onSessionsUpdate(userId, async (updatedSessions) => {
          setSessions(updatedSessions);
          
          // Only handle initialization once
          if (!isInitialized) {
            isInitialized = true;
            
            // Get URL parameter for session
            const sessionIdFromUrl = new URLSearchParams(window.location.search).get('c');
            
            // If there's a valid session ID in URL, try to load that session
            if (sessionIdFromUrl) {
              const session = updatedSessions.find(s => s.id === sessionIdFromUrl);
              if (session) {
                setCurrentSessionId(sessionIdFromUrl);
                const history = await firebaseService.getChatHistory(userId, sessionIdFromUrl);
                setMessages(history);
                setIsNewChat(false);
                setIsLoadingSessions(false);
                return;
              }
            }
            
            // If no valid URL session, find the most recently updated session
            if (updatedSessions.length > 0) {
              const sortedSessions = [...updatedSessions].sort((a, b) => {
                const dateA = a.lastUpdated ? new Date(a.lastUpdated) : new Date(a.createdAt);
                const dateB = b.lastUpdated ? new Date(b.lastUpdated) : new Date(b.createdAt);
                return dateB.getTime() - dateA.getTime();
              });
              
              const mostRecentSession = sortedSessions[0];
              setCurrentSessionId(mostRecentSession.id);
              const history = await firebaseService.getChatHistory(userId, mostRecentSession.id);
              setMessages(history);
              setIsNewChat(false);
              window.history.replaceState({}, '', `?c=${mostRecentSession.id}`);
            } else {
              // Only create new session if user has no sessions
              const sessionId = await firebaseService.createSession(userId, 'New Chat');
              setCurrentSessionId(sessionId);
              setMessages([]);
              setIsNewChat(true);
              window.history.replaceState({}, '', `?c=${sessionId}`);
            }
            setIsLoadingSessions(false);
          }
        });
      } catch (error) {
        console.error('[Chat] Error initializing chat:', error);
        setIsLoadingSessions(false);
      }
    };

    initializeChat();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [userId]);

  const handleSubmit = async (input: string) => {
    if (!userId || !currentSessionId) return;
    if (!input.trim() && !stagedFile) return;

    setIsGenerating(true);

    // Create user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: input.trim(),
      type: 'user',
      timestamp: new Date(),
      sessionId: currentSessionId,
      attachments: stagedFile ? [{
        name: stagedFile.name,
        type: stagedFile.type,
        size: stagedFile.size
      }] : undefined
    };

    // Add message to chat and clear staged file
    setMessages(prev => [...prev, userMessage]);
    setStagedFile(null);

    try {
      let uploadState: { url: string, name: string } | null = null;
      let collectionName = currentCollectionName;

      if (stagedFile) {
        setIsFileProcessing(true);

        // Upload to FastAPI to get collection name
        const apiResponse = await apiService.uploadPDF(stagedFile, userId);
        collectionName = apiResponse.coll_name;
        setCurrentCollectionName(collectionName);

        // Upload to Firebase Storage
        uploadState = await firebaseService.uploadPDF(userId, currentSessionId, stagedFile);
        
        if (!uploadState) {
          throw new Error('Failed to upload file');
        }
      }

      // Save message to Firebase
      await firebaseService.saveMessage(userId, currentSessionId, userMessage);

      // Get answer
      const response = await apiService.askQuestion(
        input.trim(),
        collectionName,
        userId
      ) as RetrieveChunksResponse;

      // Add AI response
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response.retrieved_docs || response.answer || 'No answer available',
        type: 'ai',
        timestamp: new Date(),
        expert: selectedPersona?.name,
        sessionId: currentSessionId,
        citations: response.page_numbers ? response.page_numbers.map((pageNum, index) => ({
          id: `${Date.now()}-${index}`,
          type: 'pdf',
          content: response.page_contents?.[index] || `Content from page ${pageNum}`,
          pageNumber: pageNum,
          documentName: collectionName,
          title: collectionName,
          timestamp: new Date()
        })) : undefined
      };

      await firebaseService.saveMessage(userId, currentSessionId, aiMessage);
      setMessages(prev => [...prev, aiMessage]);

      if (aiMessage.citations) {
        setActiveCitations(aiMessage.citations);
      }
    } catch (error) {
      console.error('[Chat] Error in handleSubmit:', error);
      const errorMessage: Message = {
        id: Date.now().toString(),
        content: 'Sorry, I encountered an error while processing your request. Please try again.',
        type: 'system',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsGenerating(false);
      setIsFileProcessing(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!userId || !currentSessionId) return;
    setStagedFile(file);
    if (file.type === 'application/pdf') {
      const fileUrl = URL.createObjectURL(file);
      setCurrentPdfFile(fileUrl);
    }
  };

  const handleRemoveFile = () => {
    setStagedFile(null);
    if (currentPdfFile) {
      URL.revokeObjectURL(currentPdfFile);
      setCurrentPdfFile(null);
    }
  };

  const handleExpertSelect = async (expert: string) => {
    if (!expert) return;

    setIsGenerating(true);
    
    try {
      const normalizedExpert = normalizeExpertName(expert);
      
      const newPersona: Persona = {
        id: normalizedExpert.toLowerCase(),
        name: normalizedExpert,
        description: `${normalizedExpert} domain expertise`
      };

      setSelectedExpert(normalizedExpert);
      setSelectedSubExpert(null);
      setSelectedPersona(newPersona);

      if (isNewChat) {
        setIsNewChat(false);
        const expertWelcomeMessage: Message = {
          id: Date.now().toString(),
          type: 'ai',
          content: `I am your ${normalizedExpert} expert. How can I assist you today?`,
          timestamp: new Date(),
          expert: normalizedExpert
        };
        setMessages(prev => [...prev, expertWelcomeMessage]);
      }
    } catch (error) {
      console.error('Error in expert selection:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubExpertSelect = async (subExpert: string) => {
    if (!subExpert || !selectedExpert) return;

    setIsGenerating(true);

    try {
      setSelectedSubExpert(subExpert);
      
      const systemMessage: Message = {
        id: Date.now().toString(),
        type: 'system',
        content: `Switched to ${selectedExpert} expert, specialized in ${subExpert}.`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, systemMessage]);
    } catch (error) {
      console.error('Error in sub-expert selection:', error);
      const errorMessage: Message = {
        id: Date.now().toString(),
        type: 'system',
        content: 'Failed to switch specialization. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSessionSelect = async (session: FirebaseSession) => {
    if (!userId) return;
    
    try {
      setIsGenerating(true);
      setCurrentSessionId(session.id);
      
      const history = await firebaseService.getChatHistory(userId, session.id);
      setMessages(history);
      setIsNewChat(false);
      
      setActiveCitations([]);
      setIsCitationsVisible(false);
    } catch (error) {
      console.error('[Chat] Error switching session:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const startNewChat = async () => {
    if (!userId) return;
    
    try {
      const sessionId = await firebaseService.createSession(userId, 'New Chat');
      setCurrentSessionId(sessionId);
      setMessages([]);
      setIsNewChat(true);
      setActiveCitations([]);
    } catch (error) {
      console.error('Error creating new session:', error);
    }
  };

  const showCitations = (citations: Citation[]) => {
    setActiveCitations(citations);
    setIsCitationsVisible(true);
  };

  const hideCitations = () => {
    setIsCitationsVisible(false);
  };

  return {
    messages,
    sessions,
    currentSessionId,
    isNewChat,
    isGenerating,
    isLoadingSessions,
    currentCollectionName,
    selectedPersona,
    selectedExpert,
    selectedSubExpert,
    activeCitations,
    isCitationsVisible,
    stagedFile,
    isFileProcessing,
    currentPdfFile,
    handleSubmit,
    handleFileUpload,
    handleRemoveFile,
    handleExpertSelect,
    handleSubExpertSelect,
    handleSessionSelect,
    startNewChat,
    showCitations,
    hideCitations
  };
}; 