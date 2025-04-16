import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Message, Conversation, Persona } from './types';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import SettingsModal from '../settings/SettingsModal';
import { useAuth } from '../../hooks/useAuth';
import ChatInput from './ChatInput';
import { apiService } from '../../services/api';

// Set up worker for react-pdf using ESM import with Vite
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

// Web Speech API type declarations
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
}

interface SpeechRecognitionEvent {
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

interface SpeechRecognitionErrorEvent {
  error: string;
}

// Add window type declaration
declare global {
  interface Window {
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

interface FileUploadState {
  file: File;
  status: 'pending' | 'uploading' | 'completed' | 'failed';
  collectionName?: string;
  error?: string;
}

interface Citation {
  id: string;
  type: 'pdf' | 'web';
  content: string;
  pageNumber: number;
  documentName: string;
  title: string;
  timestamp: Date;
  url?: string;
  isLoading?: boolean;
}

const ChatPage = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [citations, setCitations] = useState<Citation[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [isNewChat, setIsNewChat] = useState(true);
  const [isPersonaModalOpen, setIsPersonaModalOpen] = useState(false);
  const [isAttachMenuOpen, setIsAttachMenuOpen] = useState(false);
  const [isSourceMenuOpen, setIsSourceMenuOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);
  const [attachedFiles, setAttachedFiles] = useState<FileUploadState[]>([]);
  const [selectedSource, setSelectedSource] = useState<'internal' | 'external' | null>(null);
  const [experts, setExperts] = useState<string[]>([]);
  const [subExperts, setSubExperts] = useState<string[]>([]);
  const [selectedExpert, setSelectedExpert] = useState<string | null>(null);
  const [selectedSubExpert, setSelectedSubExpert] = useState<string | null>(null);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [isCitationsVisible, setIsCitationsVisible] = useState(false);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pageScale, setPageScale] = useState(1.0);

  // Input ref for focus management
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Add ref for chat area
  const chatAreaRef = useRef<HTMLDivElement>(null);

  // Suggested prompts for new chat
  const suggestedPrompts = [
    "How can I improve my leadership skills?",
    "What are effective team building exercises?",
    "How to handle difficult conversations?",
    "Tips for better time management"
  ];

  // Add focus management with proper dependencies
  useEffect(() => {
    const focusInput = () => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    };
    focusInput();
  }, []);  // Empty dependency array since we only want this on mount

  // Handle Escape key and click outside for menus
  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsAttachMenuOpen(false);
        setIsPersonaModalOpen(false);
        setIsSourceMenuOpen(false);
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      // Close attach menu if clicking outside
      if (isAttachMenuOpen && !target.closest('[data-attach-menu]')) {
        setIsAttachMenuOpen(false);
      }
      
      // Close source menu if clicking outside
      if (isSourceMenuOpen && !target.closest('[data-source-menu]')) {
        setIsSourceMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscKey);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isAttachMenuOpen, isSourceMenuOpen]);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        // Update input with both final and interim results
        setCurrentInput(prev => {
          // Remove any previous interim results
          const cleanPrev = prev.replace(/\[.*?\]/g, '');
          // Add new interim results in brackets
          return cleanPrev + finalTranscript + (interimTranscript ? ` [${interimTranscript}]` : '');
        });
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
        // Clean up any remaining interim results
        setCurrentInput(prev => prev.replace(/\[.*?\]/g, ''));
      };

      setRecognition(recognition);
    }
  }, []);

  // Fetch sub-experts when an expert is selected
  useEffect(() => {
    const fetchSubExperts = async () => {
      if (!selectedExpert) {
        setSubExperts([]);
        return;
      }
      try {
        const response = await fetch(`/sub_experts/?expert=${encodeURIComponent(selectedExpert)}`, {
          method: 'GET',
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch sub-experts: ${response.status}`);
        }

        const data = await response.json();

        if (!data || !data.sub_experts || !Array.isArray(data.sub_experts)) {
          console.error('Invalid sub-experts data received:', data);
          return;
        }

        setSubExperts(data.sub_experts);
        console.log('Sub-experts fetched successfully:', data.sub_experts); // Debug log
      } catch (error) {
        console.error('Failed to fetch sub-experts:', error);
      }
    };
    fetchSubExperts();
  }, [selectedExpert]);

  // Fetch experts on component mount
  useEffect(() => {
    const controller = new AbortController();
    let isMounted = true;

    const fetchExperts = async () => {
      try {
        const response = await fetch('/experts/', {
          method: 'GET',
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          },
          signal: controller.signal
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch experts: ${response.status}`);
        }

        const data = await response.json();
        
        if (!data || !data.experts || !Array.isArray(data.experts)) {
          console.error('Invalid experts data received:', data);
          return;
        }

        if (isMounted) {
          setExperts(data.experts);
          console.log('Experts fetched successfully:', data.experts);
        }
      } catch (error: unknown) {
        if (error instanceof Error && error.name === 'AbortError') {
          return; // Ignore abort errors
        }
        console.error('Failed to fetch experts:', error);
      }
    };

    fetchExperts();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, []);

  // Update expert selection to initialize context without validation
  const handleExpertSelect = async (expert: string) => {
    console.log('handleExpertSelect called with:', expert);

    if (!expert || typeof expert !== 'string') {
      console.error('Invalid expert selected:', expert);
      return;
    }

    setIsGenerating(true);
    
    try {
      // Normalize the expert name
      const normalizedExpert = expert.charAt(0).toUpperCase() + expert.slice(1).toLowerCase();
      console.log('Normalized expert name:', normalizedExpert);
      
      // Create a persona object that matches the Persona interface
      const newPersona: Persona = {
        id: normalizedExpert.toLowerCase(),
        name: normalizedExpert,
        description: `${normalizedExpert} domain expertise`,
        icon: getExpertIcon(normalizedExpert)
      };
      console.log('Created new persona:', newPersona);

      // Set the expert and persona directly
      setSelectedExpert(normalizedExpert);
      setSelectedSubExpert(null);
      setSelectedPersona(newPersona);
      setIsPersonaModalOpen(false);

      // Only show welcome message if it's a new chat
      if (isNewChat) {
        setIsNewChat(false);
        // Add a welcome message from the expert
        const expertWelcomeMessage: Message = {
          id: Date.now().toString(),
          type: 'ai',
          content: `I am your ${normalizedExpert} expert. How can I assist you today?`,
          timestamp: new Date(),
          expert: normalizedExpert
        };
        setMessages(prev => [...prev, expertWelcomeMessage]);
      }
      
      console.log('Expert selection completed:', { 
        expert: normalizedExpert, 
        persona: newPersona 
      });
    } catch (error) {
      console.error('Error in expert selection:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Update sub-expert selection to reinitialize context
  const handleSubExpertSelect = async (subExpert: string) => {
    if (!subExpert || typeof subExpert !== 'string' || !selectedExpert) {
      console.error('Invalid sub-expert selection:', { subExpert, selectedExpert });
      return;
    }

    setIsGenerating(true);

    try {
      setSelectedSubExpert(subExpert);
      
      // Add a message about specialization selection
      const systemMessage: Message = {
        id: Date.now().toString(),
        type: 'system',
        content: `Switched to ${selectedExpert} expert, specialized in ${subExpert}.`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, systemMessage]);
      
      console.log('Sub-expert selection completed:', { expert: selectedExpert, subExpert });
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

  // Get icon for expert with proper type checking
  const getExpertIcon = (expert: string): string => {
    if (!expert || typeof expert !== 'string') {
      return '👤'; // Default icon for invalid input
    }

    const normalizedExpert = expert.toLowerCase();
    
    // Enhanced icon mapping
    const iconMap: { [key: string]: string } = {
      'finance': '💰',
      'judicial': '⚖️',
      'healthcare': '🏥',
      'leadership': '👥',
      'management': '📊',
      'technology': '💻',
      'hr': '👥',
      'marketing': '📢'
    };

    return iconMap[normalizedExpert] || '👤';
  };

  // Update handleSubmit to include session context
  const handleSubmit = async (input: string) => {
    if (!input.trim() && !attachedFiles.length) return;

    setIsNewChat(false);
    setIsGenerating(true);

    // Generate numeric user ID as expected by the API
    const numericUserId = parseInt(currentUser?.uid?.replace(/\D/g, '') || '1', 10) || 1;

    // Check for pending or uploading files
    const pendingUploads = attachedFiles.filter(f => 
      f.status === 'pending' || f.status === 'uploading'
    );

    if (pendingUploads.length > 0) {
      const waitMessage: Message = {
        id: Date.now().toString(),
        content: 'Waiting for file uploads to complete...',
        type: 'system',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, waitMessage]);

      // Wait for all uploads to complete
      await Promise.all(
        pendingUploads.map(async (uploadState) => {
          if (uploadState.status === 'pending') {
            await handleFileUpload(uploadState.file);
          }
          // For uploading files, they're already in progress
        })
      );
    }

    // Add user message to chat
    const userMessage: Message = {
      id: Date.now().toString(),
      content: input.trim(),
      type: 'user',
      timestamp: new Date(),
      expert: selectedExpert || undefined,
      attachments: attachedFiles
        .filter(f => f.status === 'completed')
        .map(f => ({
          type: f.file.type,
          name: f.file.name,
          size: f.file.size
        }))
    };

    try {
      setMessages(prev => [...prev, userMessage]);

      // Get collection name from the first completed upload, or use default
      const collectionName = attachedFiles.find(f => f.status === 'completed')?.collectionName || 'default';

      // Get answer using retrieve_chunks endpoint
      const response = await apiService.askQuestion(
        input.trim(),
        numericUserId,
        collectionName
      );

      console.log('API Response:', response); // Debug log

      // Add AI response to chat
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: Array.isArray(response.retrieved_docs) 
          ? response.retrieved_docs.join('\n\n')
          : typeof response.retrieved_docs === 'string' 
            ? response.retrieved_docs
            : JSON.stringify(response.retrieved_docs),
        type: 'ai',
        timestamp: new Date(),
        expert: selectedExpert || undefined
      };
      setMessages(prev => [...prev, aiMessage]);

      // Update citations if any page numbers are returned
      if (response.page_numbers && Array.isArray(response.page_numbers) && response.page_numbers.length > 0) {
        const newCitations: Citation[] = response.page_numbers.map((pageNum, index) => {
          let content = `Content from page ${pageNum}`;
          
          // Use page_contents if available
          if (response.page_contents && response.page_contents[index]) {
            content = response.page_contents[index];
          }
          // Otherwise try to get content from retrieved_docs if it's an array
          else if (Array.isArray(response.retrieved_docs) && response.retrieved_docs[index]) {
            content = response.retrieved_docs[index];
          }
          
          return {
            id: Date.now().toString() + pageNum,
            type: 'pdf',
            content,
            pageNumber: pageNum,
            documentName: collectionName,
            title: collectionName,
            timestamp: new Date()
          };
        });
        setCitations(newCitations);
      }

      // Clear attached files after successful submission
      setAttachedFiles([]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        id: Date.now().toString(),
        content: 'Sorry, I encountered an error while processing your request. Please try again.',
        type: 'system',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsGenerating(false);
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  // Handle new chat
  const startNewChat = () => {
    setMessages([]);
    setCurrentInput('');
    setIsNewChat(true);
    setCitations([]);
    inputRef.current?.focus();
  };

  // Handle conversation selection
  const selectConversation = (conv: Conversation) => {
    setIsNewChat(false);
    setMessages([]); // In real app, load conversation messages
    setConversations(prev => prev.map(c => c.id === conv.id ? {...c, active: true} : {...c, active: false}));
    setCitations([]);
  };

  const handleMicClick = () => {
    if (!recognition) {
      console.error('Speech recognition not supported');
      return;
    }

    if (isRecording) {
      recognition.stop();
      setIsRecording(false);
    } else {
      recognition.start();
      setIsRecording(true);
    }
  };

  const handleUploadClick = () => {
    setIsAttachMenuOpen(!isAttachMenuOpen);
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    if (!file.type || !file.type.includes('pdf')) {
      const errorMessage: Message = {
        id: Date.now().toString(),
        content: 'Only PDF files are allowed.',
        type: 'system',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      return;
    }

    // Add file to state with pending status
    setAttachedFiles(prev => [...prev, { file, status: 'pending' }]);
    setIsAttachMenuOpen(false);

    // Generate numeric user ID as expected by the API
    const numericUserId = parseInt(currentUser?.uid?.replace(/\D/g, '') || '1', 10) || 1;

    try {
      // Update status to uploading
      setAttachedFiles(prev => 
        prev.map(f => f.file === file ? { ...f, status: 'uploading' } : f)
      );

      // Start upload
      const response = await apiService.uploadPDF(file, numericUserId);

      // Update status to completed with collection name
      setAttachedFiles(prev => 
        prev.map(f => f.file === file ? 
          { ...f, status: 'completed', collectionName: response.coll_name } : f
        )
      );
    } catch (error) {
      // Update status to failed with error
      setAttachedFiles(prev => 
        prev.map(f => f.file === file ? 
          { ...f, status: 'failed', error: error instanceof Error ? error.message : 'Unknown error' } : f
        )
      );

      // Add error message to chat
      const errorMessage: Message = {
        id: Date.now().toString(),
        content: `Failed to upload "${file.name}": ${error instanceof Error ? error.message : 'Unknown error'}`,
        type: 'system',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleRemoveFile = (fileIndex: number) => {
    setAttachedFiles(prev => prev.filter((_, index) => index !== fileIndex));
  };

  // Add source selection handler
  const handleSourceSelect = (source: 'internal' | 'external') => {
    setSelectedSource(source);
    setIsSourceMenuOpen(false);
    setIsNewChat(false);
  };

  useEffect(() => {
    const handleResize = () => {
      const isMobileView = window.innerWidth < 1024; // Use lg breakpoint
      setIsMobile(isMobileView);
      setIsSidebarCollapsed(isMobileView); // Collapse sidebar only on mobile
    };

    // Set initial value
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Add scroll to bottom effect
  const scrollToBottom = () => {
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
    }
  };

  // Add effect to scroll when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Update PDF file when attachedFiles changes
  useEffect(() => {
    const completedPdf = attachedFiles.find(f => f.status === 'completed')?.file;
    if (completedPdf) {
      setPdfFile(completedPdf);
    }
  }, [attachedFiles]);

  // Function to handle PDF load success
  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    console.log(`Loaded ${numPages} pages`); // Just log it for now
  };

  // Left Sidebar Component
  const LeftSidebar = () => (
    <div className={`${isSidebarCollapsed ? 'w-12' : 'w-64'} h-screen bg-light-bg-primary dark:bg-dark-bg-primary flex flex-col transition-all duration-300 relative`}>
      {isSidebarCollapsed ? (
        // Collapsed State - Only Burger Icon
        <button 
          onClick={() => setIsSidebarCollapsed(false)}
          className="p-3 hover:bg-light-bg-tertiary dark:hover:bg-dark-bg-tertiary transition-colors absolute top-4 right-0 rounded-l-none rounded-r-lg border border-l-0 border-light-border dark:border-dark-border bg-light-bg-primary dark:bg-dark-bg-primary"
        >
          <svg className="w-5 h-5 text-light-text-secondary dark:text-dark-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      ) : (
        // Expanded State
        <>
          {/* Logo and Toggle */}
          <div className="p-4 border-b border-light-border dark:border-dark-border flex items-center justify-between">
            <img 
              src="./leader-mastery-emblem-text.png" 
              alt="Leader Mastery"
              className="h-8 w-auto"
            />
            <button 
              onClick={() => setIsSidebarCollapsed(true)}
              className="p-1 hover:bg-light-bg-tertiary dark:hover:bg-dark-bg-tertiary rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-light-text-secondary dark:text-dark-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          {/* New Chat Button */}
          <button 
            onClick={startNewChat}
            className="mx-4 mt-4 bg-primary text-white py-2 px-4 rounded-lg
              flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>New Chat</span>
          </button>

          {/* Conversation History */}
          <div className="flex-1 overflow-y-auto py-4">
            {conversations.map(conv => (
              <button
                key={conv.id}
                onClick={() => selectConversation(conv)}
                className="w-full px-4 py-3 hover:bg-light-bg-tertiary dark:hover:bg-dark-bg-tertiary flex flex-col items-start"
              >
                <span className="font-medium text-light-text-primary dark:text-dark-text-primary truncate w-full text-left">
                  {conv.title}
                </span>
                <span className="text-sm text-light-text-tertiary dark:text-dark-text-tertiary truncate w-full text-left">
                  {conv.lastMessage}
                </span>
              </button>
            ))}
          </div>

          {/* Bottom Buttons */}
          <div className="p-4 border-t border-light-border dark:border-dark-border space-y-2">
            <button 
              onClick={() => navigate('/documents')}
              className="w-full py-2 px-4 rounded-lg hover:bg-light-bg-tertiary dark:hover:bg-dark-bg-tertiary flex items-center gap-2 text-light-text-primary dark:text-dark-text-primary"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Documents</span>
            </button>
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="w-full py-2 px-4 rounded-lg hover:bg-light-bg-tertiary dark:hover:bg-dark-bg-tertiary flex items-center gap-2 text-light-text-primary dark:text-dark-text-primary"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Settings</span>
            </button>
          </div>
        </>
      )}
    </div>
  );

  // Right Sidebar Component for Citations
  const RightSidebar = () => (
    <div 
      className={`fixed right-0 top-0 w-[600px] h-screen bg-light-bg-primary dark:bg-dark-bg-primary 
        transform transition-all duration-300 ease-out shadow-lg border-l border-light-border dark:border-dark-border
        ${isCitationsVisible ? 'translate-x-0' : 'translate-x-full'}`}
    >
      <div className="h-full flex flex-col">
        <div className="p-4 border-b border-light-border dark:border-dark-border flex justify-between items-center bg-light-bg-secondary dark:bg-dark-bg-secondary">
          <h2 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary flex items-center gap-2">
            <svg className="w-5 h-5 text-primary" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path fill="currentColor" d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
            </svg>
            Source Pages ({citations.length})
          </h2>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPageScale(scale => Math.max(0.5, scale - 0.1))}
              className="p-2 hover:bg-light-bg-tertiary dark:hover:bg-dark-bg-tertiary rounded-lg transition-all duration-200 text-light-text-secondary dark:text-dark-text-secondary hover:text-primary group"
              title="Zoom out"
            >
              <svg className="w-5 h-5 transform group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </button>
            <div className="px-2 py-1 bg-light-bg-tertiary dark:bg-dark-bg-tertiary rounded-lg text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
              {Math.round(pageScale * 100)}%
            </div>
            <button
              onClick={() => setPageScale(scale => Math.min(2.0, scale + 0.1))}
              className="p-2 hover:bg-light-bg-tertiary dark:hover:bg-dark-bg-tertiary rounded-lg transition-all duration-200 text-light-text-secondary dark:text-dark-text-secondary hover:text-primary group"
              title="Zoom in"
            >
              <svg className="w-5 h-5 transform group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
            <div className="w-px h-6 bg-light-border dark:bg-dark-border mx-1"></div>
            <button 
              onClick={() => setIsCitationsVisible(false)}
              className="p-2 hover:bg-red-500/10 rounded-lg transition-all duration-200 text-light-text-secondary dark:text-dark-text-secondary hover:text-red-500 group"
              title="Close citations"
            >
              <svg className="w-5 h-5 transform group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        {citations.length > 0 ? (
          <div className="p-4 space-y-8 overflow-y-auto h-[calc(100vh-65px)] custom-scrollbar">
            {citations.map(citation => (
              <div key={citation.id} className="space-y-4">
                <div className="bg-light-bg-secondary dark:bg-dark-bg-secondary p-4 rounded-lg border border-light-border dark:border-dark-border">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="flex items-center gap-2 text-sm font-medium text-light-text-primary dark:text-dark-text-primary">
                      <svg className="w-4 h-4 text-primary" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                      </svg>
                      Page {citation.pageNumber}
                    </span>
                    <span className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary">
                      {new Date(citation.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary whitespace-pre-wrap">
                      {citation.content}
                    </p>
                  </div>
                </div>
                
                {/* PDF Page Render */}
                {pdfFile && (
                  <div className="flex justify-center bg-light-bg-secondary dark:bg-dark-bg-secondary p-4 rounded-lg border border-light-border dark:border-dark-border shadow-sm">
                    <Document
                      file={pdfFile}
                      onLoadSuccess={onDocumentLoadSuccess}
                      loading={
                        <div className="flex items-center justify-center h-[500px]">
                          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
                        </div>
                      }
                    >
                      <Page
                        pageNumber={citation.pageNumber}
                        scale={pageScale}
                        loading={
                          <div className="flex items-center justify-center h-[500px]">
                            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
                          </div>
                        }
                      />
                    </Document>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-[calc(100vh-65px)] text-light-text-tertiary dark:text-dark-text-tertiary">
            <svg className="w-16 h-16 mb-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path fill="currentColor" d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
            </svg>
            <p className="text-lg font-medium">No citations available</p>
            <p className="text-sm">Citations will appear here when available</p>
          </div>
        )}
      </div>
    </div>
  );

  // Persona Modal Component
  const PersonaModal = () => (
    <div 
      className={`fixed inset-0 flex items-center justify-center z-50 
        ${isPersonaModalOpen ? 'visible' : 'invisible'}`}
    >
      <div className={`fixed inset-0 bg-black transition-opacity duration-300
        ${isPersonaModalOpen ? 'opacity-50' : 'opacity-0'}`}
      />
      <div 
        className={`bg-light-bg-primary dark:bg-dark-bg-primary rounded-xl p-6 max-w-4xl w-full mx-4 
          transform transition-all duration-300 relative z-50
          ${isPersonaModalOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary">
            Select Expert ({experts.length} available)
          </h2>
          <button 
            onClick={() => {
              console.log('Closing persona modal');
              setIsPersonaModalOpen(false);
            }}
            className="text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text-primary dark:hover:text-dark-text-primary transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {experts.map(expert => (
            <button
              key={expert}
              onClick={() => {
                console.log('Expert button clicked:', expert);
                handleExpertSelect(expert);
              }}
              className={`bg-light-bg-primary dark:bg-dark-bg-primary p-4 rounded-lg border-2 
                ${selectedExpert === expert 
                  ? 'border-primary shadow-md bg-primary/5' 
                  : 'border-light-border dark:border-dark-border hover:border-primary hover:bg-primary/5'
                } transition-all duration-300 flex flex-col items-center text-center group cursor-pointer`}
            >
              <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">{getExpertIcon(expert)}</span>
              <h3 className="font-semibold text-light-text-primary dark:text-dark-text-primary mb-1 group-hover:text-primary">{expert}</h3>
              <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                {expert} domain expertise
              </p>
            </button>
          ))}
        </div>
        {selectedExpert && subExperts.length > 0 && (
          <div className="mt-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary">
                Select Specialization
              </h3>
              <button
                onClick={() => {
                  setSelectedSubExpert(null);
                  const systemMessage: Message = {
                    id: Date.now().toString(),
                    type: 'system',
                    content: `Cleared specialization for ${selectedExpert} expert.`,
                    timestamp: new Date()
                  };
                  setMessages(prev => [...prev, systemMessage]);
                }}
                className="text-sm text-primary hover:text-primary/80 transition-colors"
              >
                Clear selection
            </button>
          </div>
            <div className="grid grid-cols-2 gap-4">
              {subExperts.map(subExpert => (
            <button
                  key={subExpert}
                  onClick={() => handleSubExpertSelect(subExpert)}
                  className={`bg-light-bg-primary dark:bg-dark-bg-primary p-3 rounded-lg border-2
                    ${selectedSubExpert === subExpert
                      ? 'border-primary shadow-md bg-primary/5'
                      : 'border-light-border dark:border-dark-border hover:border-primary hover:bg-primary/5'
                    } transition-all duration-300 group`}
                >
                  <span className="text-light-text-primary dark:text-dark-text-primary group-hover:text-primary">
                    {subExpert}
                  </span>
            </button>
              ))}
              </div>
              </div>
            )}
          </div>
    </div>
  );

  // Add console log to track modal state changes
  useEffect(() => {
    console.log('PersonaModal visibility:', isPersonaModalOpen);
    console.log('Available experts:', experts);
  }, [isPersonaModalOpen, experts]);

  // New Chat Welcome Component
  const NewChatWelcome = () => (
    <div className="flex flex-col items-center justify-center flex-1 p-8">
      <img 
        src="./leader-mastery-emblem-text.png" 
        alt="Leader Mastery"
        className="h-24 w-24 mb-8" 
      />
      <h1 className="text-4xl font-bold text-light-text-primary dark:text-dark-text-primary mb-4">Welcome to Leader Mastery</h1>
      <p className="text-light-text-secondary dark:text-dark-text-secondary mb-8 text-center max-w-md">
        Your AI-powered leadership development assistant. Ask me anything about leadership, management, and professional growth.
      </p>
      <div className="grid grid-cols-2 gap-4 w-full max-w-2xl">
        {suggestedPrompts.map((prompt, index) => (
          <button
            key={index}
            onClick={() => setCurrentInput(prompt)}
            className="p-4 text-left rounded-lg border border-light-border dark:border-dark-border hover:border-primary 
              bg-light-bg-primary dark:bg-dark-bg-primary hover:bg-light-bg-tertiary dark:hover:bg-dark-bg-tertiary 
              transition-all duration-300 text-light-text-primary dark:text-dark-text-primary"
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );

  // Add handler functions for message interactions
  const handleFeedback = (messageId: string, isPositive: boolean) => {
    console.log(`Feedback for message ${messageId}: ${isPositive ? 'positive' : 'negative'}`);
  };

  const handleCopyMessage = (messageId: string, content: string) => {
    navigator.clipboard.writeText(content)
      .then(() => {
        setCopiedMessageId(messageId);
        setTimeout(() => {
          setCopiedMessageId(null);
        }, 2000);
      })
      .catch(err => {
        console.error('Failed to copy message:', err);
      });
  };

  const handleShowCitations = () => {
    if (citations.length > 0) {
      setIsCitationsVisible(!isCitationsVisible); // Toggle visibility
    }
  };

  // Message Component
  const MessageComponent = ({ message }: { message: Message }) => (
    <div
      key={message.id}
      className={`flex flex-col ${message.type === 'user' ? 'items-end' : 'items-start'}`}
    >
      {/* Display attachments if present */}
      {message.attachments && message.attachments.length > 0 && (
        <div className="w-full max-w-[300px] mb-2 space-y-2">
          {message.attachments.map((attachment, index) => (
            <div 
              key={index}
              className="flex items-center gap-2 p-3 rounded-lg bg-light-bg-secondary dark:bg-dark-bg-secondary border border-light-border dark:border-dark-border"
            >
              <div className="p-2 rounded-lg bg-primary/10">
                <svg className="w-6 h-6 text-primary" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20M13,13V18H15V13H13M9,13V18H11V13H9Z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary truncate">
                  {attachment.name}
                </p>
                <p className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary">
                  {(attachment.size / 1024).toFixed(1)} KB • PDF
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="max-w-[90%]">
        <div
          className={`rounded-lg p-4 whitespace-pre-wrap break-words ${
            message.type === 'user'
              ? 'bg-gradient-to-br from-primary to-primary/90 text-white shadow-sm'
              : message.type === 'system'
              ? 'bg-light-bg-tertiary dark:bg-dark-bg-tertiary text-light-text-secondary dark:text-dark-text-secondary border border-light-border dark:border-dark-border'
              : 'bg-light-bg-tertiary dark:bg-dark-bg-tertiary text-light-text-primary dark:text-dark-text-primary'
          }`}
        >
          {message.content}
        </div>
      
        {/* Action buttons for AI messages */}
        {message.type === 'ai' && (
          <div className="flex items-center space-x-3 mt-2 text-light-text-secondary dark:text-dark-text-secondary">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleFeedback(message.id, true)}
                className="p-1.5 rounded-full hover:-translate-y-0.5 transition-transform duration-200 ease-in-out"
                title="Helpful"
              >
                <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M2 20h2c.55 0 1-.45 1-1v-9c0-.55-.45-1-1-1H2v11zm19.83-7.12c.11-.25.17-.52.17-.8V11c0-1.1-.9-2-2-2h-5.5l.92-4.65c.05-.22.02-.46-.08-.66-.23-.45-.52-.86-.88-1.22L14 2 7.59 8.41C7.21 8.79 7 9.3 7 9.83v7.84C7 18.95 8.05 20 9.34 20h8.11c.7 0 1.36-.37 1.72-.97l2.66-6.15z"/>
                </svg>
              </button>
              <button
                onClick={() => handleFeedback(message.id, false)}
                className="p-1.5 rounded-full hover:-translate-y-0.5 transition-transform duration-200 ease-in-out"
                title="Not helpful"
              >
                <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22 4h-2c-.55 0-1 .45-1 1v9c0 .55.45 1 1 1h2V4zM2.17 11.12c-.11.25-.17.52-.17.8V13c0 1.1.9 2 2 2h5.5l-.92 4.65c-.05.22-.02.46.08.66.23.45.52.86.88 1.22L10 22l6.41-6.41c.38-.38.59-.89.59-1.42V6.34C17 5.05 15.95 4 14.66 4h-8.1c-.71 0-1.36.37-1.72.97l-2.67 6.15z"/>
                </svg>
              </button>
            </div>
            <div className="w-px h-4 bg-light-border dark:bg-dark-border" />
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleCopyMessage(message.id, message.content)}
                className="p-1.5 rounded-full hover:-translate-y-0.5 transition-transform duration-200 ease-in-out"
                title={copiedMessageId === message.id ? "Copied!" : "Copy message"}
              >
                <div className="relative">
                  <svg 
                    className={`w-4 h-4 absolute transition-all duration-300 ease-in-out ${
                      copiedMessageId === message.id ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
                    }`} 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 24 24"
                  >
                    <path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                  </svg>
                  <svg 
                    className={`w-4 h-4 transition-all duration-300 ease-in-out ${
                      copiedMessageId === message.id ? 'opacity-0 scale-50' : 'opacity-100 scale-100'
                    }`} 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 24 24"
                  >
                    <path fill="currentColor" d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                  </svg>
                </div>
              </button>
              <button
                onClick={() => handleShowCitations()}
                className="p-1.5 rounded-full hover:-translate-y-0.5 transition-transform duration-200 ease-in-out"
                title={isCitationsVisible ? "Hide citations" : "Show citations"}
              >
                <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // If mobile, use mobile layout
  if (isMobile) {
    return (
      <div className="flex flex-col h-screen bg-light-bg-tertiary dark:bg-dark-bg-tertiary">
        {/* Mobile header */}
        <div className="flex items-center justify-between p-4 bg-light-bg-primary dark:bg-dark-bg-primary border-b border-light-border dark:border-dark-border">
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="p-2 rounded-lg hover:bg-light-bg-tertiary dark:hover:bg-dark-bg-tertiary"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <img 
            src="./leader-mastery-emblem-text.png" 
            alt="Leader Mastery"
            className="h-8"
          />
          <div className="w-10" /> {/* Spacer */}
        </div>

        {/* Mobile content */}
        <div className="flex-1 overflow-y-auto">
          {isNewChat ? (
            <NewChatWelcome />
          ) : (
            <div ref={chatAreaRef} className="p-4 space-y-4">
              {messages.map(message => (
                <MessageComponent key={message.id} message={message} />
              ))}
            </div>
          )}
        </div>

        {/* Mobile input */}
        <div className="border-t border-light-border dark:border-dark-border bg-light-bg-primary dark:bg-dark-bg-primary p-4">
          <ChatInput
            inputRef={inputRef}
            currentInput={currentInput}
            setCurrentInput={setCurrentInput}
            isGenerating={isGenerating}
            isRecording={isRecording}
            onMicClick={handleMicClick}
            onSubmit={handleSubmit}
            onAttachClick={handleUploadClick}
            onPersonaClick={() => setIsPersonaModalOpen(true)}
            onSourceClick={() => setIsSourceMenuOpen(!isSourceMenuOpen)}
            onSourceSelect={handleSourceSelect}
            isSourceMenuOpen={isSourceMenuOpen}
            isAttachMenuOpen={isAttachMenuOpen}
            isPersonaMenuOpen={isPersonaModalOpen}
            onFileUpload={handleFileUpload}
            attachedFiles={attachedFiles}
            onRemoveFile={handleRemoveFile}
            selectedSource={selectedSource}
            selectedPersona={selectedPersona}
          />
        </div>

        {/* Mobile modals */}
        <PersonaModal />
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          user={currentUser}
        />
      </div>
    );
  }

  // Desktop layout
  return (
    <div className="fixed inset-0 flex w-full h-full bg-light-bg-tertiary dark:bg-dark-bg-tertiary overflow-hidden">
      <LeftSidebar />
      
      <main className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-out
        ${isCitationsVisible ? 'mr-[600px]' : 'mr-0'}`}>
        {isNewChat ? (
          <>
            <NewChatWelcome />
            <ChatInput
              inputRef={inputRef}
              currentInput={currentInput}
              setCurrentInput={setCurrentInput}
              isGenerating={isGenerating}
              isRecording={isRecording}
              onMicClick={handleMicClick}
              onSubmit={handleSubmit}
              onAttachClick={handleUploadClick}
              onPersonaClick={() => setIsPersonaModalOpen(true)}
              onSourceClick={() => setIsSourceMenuOpen(!isSourceMenuOpen)}
              onSourceSelect={handleSourceSelect}
              isSourceMenuOpen={isSourceMenuOpen}
              isAttachMenuOpen={isAttachMenuOpen}
              isPersonaMenuOpen={isPersonaModalOpen}
              onFileUpload={handleFileUpload}
              attachedFiles={attachedFiles}
              onRemoveFile={handleRemoveFile}
              selectedSource={selectedSource}
              selectedPersona={selectedPersona}
            />
          </>
        ) : (
          <>
            <div ref={chatAreaRef} className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              {messages.map(message => (
                <MessageComponent key={message.id} message={message} />
              ))}
            </div>
            <ChatInput
              inputRef={inputRef}
              currentInput={currentInput}
              setCurrentInput={setCurrentInput}
              isGenerating={isGenerating}
              isRecording={isRecording}
              onMicClick={handleMicClick}
              onSubmit={handleSubmit}
              onAttachClick={handleUploadClick}
              onPersonaClick={() => setIsPersonaModalOpen(true)}
              onSourceClick={() => setIsSourceMenuOpen(!isSourceMenuOpen)}
              onSourceSelect={handleSourceSelect}
              isSourceMenuOpen={isSourceMenuOpen}
              isAttachMenuOpen={isAttachMenuOpen}
              isPersonaMenuOpen={isPersonaModalOpen}
              onFileUpload={handleFileUpload}
              attachedFiles={attachedFiles}
              onRemoveFile={handleRemoveFile}
              selectedSource={selectedSource}
              selectedPersona={selectedPersona}
            />
          </>
        )}
      </main>

      <RightSidebar />
      <PersonaModal />
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        user={currentUser}
      />
    </div>
  );
};

export default ChatPage; 