import { useState, useRef, useEffect, RefObject } from 'react';
import { useNavigate } from 'react-router-dom';
import { Message, Citation, Conversation, Persona } from './types';
import MobileChatLayout from './MobileChatLayout';
import SettingsModal from '../settings/SettingsModal';
import { useAuth } from '../../hooks/useAuth';
import ChatInput from './ChatInput';

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

// Add API response types
interface ApiCitation {
  page_number: number;
  document_name: string;
  excerpt: string;
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
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [selectedSource, setSelectedSource] = useState<'internal' | 'external' | null>(null);
  const [experts, setExperts] = useState<string[]>([]);
  const [subExperts, setSubExperts] = useState<string[]>([]);
  const [selectedExpert, setSelectedExpert] = useState<string | null>(null);
  const [selectedSubExpert, setSelectedSubExpert] = useState<string | null>(null);

  // Input ref for focus management
  const inputRef = useRef<HTMLTextAreaElement>(null);

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

  // Add function to initialize expert context
  const initializeExpertContext = async (expert: string, subExpert: string | null) => {
    console.log('Initializing expert context:', { expert, subExpert }); // Debug log
    try {
      setIsGenerating(true);
      
      // Call backend to initialize expert context
      const response = await fetch('/initialize-expert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          expert,
          sub_expert: subExpert || "",
          session_id: Date.now().toString()
        })
      });

      console.log('Initialize expert response status:', response.status); // Debug log

      if (!response.ok) {
        throw new Error('Failed to initialize expert context');
      }

      const data = await response.json();
      console.log('Initialize expert response data:', data); // Debug log
      
      // Add expert's introduction message
      const expertIntroMessage: Message = {
        id: Date.now().toString(),
        type: 'ai',
        content: data.introduction || `I am your ${expert}${subExpert ? ` specialized in ${subExpert}` : ''} expert. How can I assist you today?`,
        timestamp: new Date(),
        expert: expert
      };

      setMessages(prev => [...prev, expertIntroMessage]);
      return true;
    } catch (error) {
      console.error('Error initializing expert context:', error); // Debug log
      const errorMessage: Message = {
        id: Date.now().toString(),
        type: 'system',
        content: 'Failed to initialize expert context. Please try selecting again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      return false;
    } finally {
      setIsGenerating(false);
    }
  };

  // Update expert selection to initialize context
  const handleExpertSelect = async (expert: string) => {
    console.log('handleExpertSelect called with:', expert); // Debug log

    if (!expert || typeof expert !== 'string') {
      console.error('Invalid expert selected:', expert);
      return;
    }

    setIsGenerating(true); // Show loading state
    
    try {
      // Normalize the expert name
      const normalizedExpert = expert.charAt(0).toUpperCase() + expert.slice(1).toLowerCase();
      console.log('Normalized expert name:', normalizedExpert); // Debug log
      
      // Create a persona object that matches the Persona interface
      const newPersona: Persona = {
        id: normalizedExpert.toLowerCase(),
        name: normalizedExpert,
        description: `${normalizedExpert} domain expertise`,
        icon: getExpertIcon(normalizedExpert)
      };
      console.log('Created new persona:', newPersona); // Debug log

      // Initialize expert context first
      const success = await initializeExpertContext(normalizedExpert, null);
      console.log('Expert context initialization:', success ? 'successful' : 'failed'); // Debug log
      
      if (success) {
        setSelectedExpert(normalizedExpert);
        setSelectedSubExpert(null);
        setSelectedPersona(newPersona);
        setIsPersonaModalOpen(false);
        setIsNewChat(false);
        
        console.log('Expert selection completed:', { 
          expert: normalizedExpert, 
          persona: newPersona 
        }); // Debug log
      }
    } catch (error) {
      console.error('Error in expert selection:', error);
      const errorMessage: Message = {
        id: Date.now().toString(),
        type: 'system',
        content: 'Failed to switch expert. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
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
      // Initialize context with new sub-expert
      const success = await initializeExpertContext(selectedExpert, subExpert);
      
      if (success) {
        setSelectedSubExpert(subExpert);
        console.log('Sub-expert context initialized:', { expert: selectedExpert, subExpert });
      }
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

    if (!selectedExpert) {
      const errorMessage: Message = {
        id: Date.now().toString(),
        content: 'Please select an expert before sending a message. The expert will determine how your question is answered.',
        type: 'system',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      return;
    }

    setIsNewChat(false);
    setIsGenerating(true);
    
    // Add user message to chat with expert context
    const userMessage: Message = {
      id: Date.now().toString(),
      content: input.trim(),
      type: 'user',
      timestamp: new Date(),
      expert: selectedExpert,
      attachments: attachedFiles.map(file => ({
        type: file.type || 'application/pdf',
        name: file.name,
        size: file.size
      }))
    };
    setMessages(prev => [...prev, userMessage]);
    setCurrentInput('');

    try {
      // Handle file uploads first
      if (attachedFiles.length > 0) {
        for (const file of attachedFiles) {
          const formData = new FormData();
          formData.append('file', file);
          
          const uploadResponse = await fetch('/upload-pdf/', {
            method: 'POST',
            body: formData
          });

          if (!uploadResponse.ok) {
            throw new Error('Failed to upload file');
          }
        }
      }

      // Send message with expert context
      const response = await fetch('/ask-question', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: input.trim(),
          expert: selectedExpert,
          sub_expert: selectedSubExpert || "",
          session_id: Date.now().toString() // You might want to use a proper session ID
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      
      // Add AI response to chat
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response,
        type: 'ai',
        timestamp: new Date(),
        expert: selectedExpert
      };
      setMessages(prev => [...prev, aiMessage]);

      // Update citations if any
      if (data.citations && data.citations.length > 0) {
        setCitations(data.citations.map((citation: ApiCitation) => ({
          id: Date.now().toString(),
          type: 'pdf',
          content: citation.excerpt,
          pageNumber: citation.page_number,
          documentName: citation.document_name,
          title: citation.document_name,
          timestamp: new Date()
        })));
      }
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
      setAttachedFiles([]);
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

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/upload-pdf/', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to upload file');
      }

      const data = await response.json();
      console.log('File uploaded successfully:', data.file_hash);
      
      setAttachedFiles(prev => [...prev, file]);
      setIsAttachMenuOpen(false); // Close the attach menu after successful upload
    } catch (error) {
      console.error('Error uploading file:', error);
      // You might want to show an error message to the user here
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
      setIsMobile(window.innerWidth < 1024); // Use lg breakpoint instead of md
    };

    // Set initial value
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
    <div className={`fixed right-0 top-0 w-80 h-screen bg-light-bg-primary dark:bg-dark-bg-primary border-l border-light-border dark:border-dark-border shadow-lg
      transform transition-transform duration-300 ease-in-out
      ${citations.length > 0 ? 'translate-x-0' : 'translate-x-full'}`}
    >
      <div className="p-4 border-b border-light-border dark:border-dark-border flex justify-between items-center">
        <h2 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary">Citations</h2>
        <button 
          onClick={() => setCitations([])} 
          className="text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text-primary dark:hover:text-dark-text-primary transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="p-4 space-y-4 overflow-y-auto h-[calc(100vh-65px)]">
        {citations.map(citation => (
          <div key={citation.id} className="bg-light-bg-secondary dark:bg-dark-bg-secondary p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary">
                {citation.type === 'pdf' ? `PDF - Page ${citation.pageNumber}` : 'Web Source'}
              </span>
            </div>
            <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">{citation.content}</p>
            {citation.url && (
              <a 
                href={citation.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary text-sm hover:underline mt-2 block"
              >
                View Source
              </a>
            )}
          </div>
        ))}
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

  // If mobile, use mobile layout
  if (isMobile) {
    return (
      <MobileChatLayout
        messages={messages}
        conversations={conversations}
        citations={citations}
        setMessages={setMessages}
        setConversations={setConversations}
        setCitations={setCitations}
        currentInput={currentInput}
        setCurrentInput={setCurrentInput}
        isNewChat={isNewChat}
        setIsNewChat={setIsNewChat}
        isGenerating={isGenerating}
        setIsGenerating={setIsGenerating}
        isSidebarCollapsed={isSidebarCollapsed}
        setIsSidebarCollapsed={setIsSidebarCollapsed}
        isPersonaModalOpen={isPersonaModalOpen}
        setIsPersonaModalOpen={setIsPersonaModalOpen}
        isAttachMenuOpen={isAttachMenuOpen}
        setIsAttachMenuOpen={setIsAttachMenuOpen}
        isSourceMenuOpen={isSourceMenuOpen}
        setIsSourceMenuOpen={setIsSourceMenuOpen}
        isRecording={isRecording}
        setIsRecording={setIsRecording}
        inputRef={inputRef as RefObject<HTMLTextAreaElement>}
        onFileUpload={handleFileUpload}
        onPersonaSelect={(persona) => {
          setSelectedPersona(persona);
          setSelectedExpert(persona.name);
          setSelectedSubExpert(null);
          setIsPersonaModalOpen(false);
        }}
        selectedPersona={selectedPersona}
        attachedFiles={attachedFiles}
        onRemoveFile={handleRemoveFile}
        setAttachedFiles={setAttachedFiles}
        selectedSource={selectedSource}
        onSourceSelect={handleSourceSelect}
        experts={experts}
        subExperts={subExperts}
        selectedExpert={selectedExpert}
        selectedSubExpert={selectedSubExpert}
        setSelectedSubExpert={setSelectedSubExpert}
      />
    );
  }

  // Desktop layout
  return (
    <div className="fixed inset-0 flex w-full h-full bg-light-bg-tertiary dark:bg-dark-bg-tertiary overflow-hidden">
      <LeftSidebar />
      
      <main className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out
        ${citations.length > 0 ? 'mr-80' : 'mr-0'}`}>
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
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              {messages.map(message => (
                <div
                  key={message.id}
                  className={`flex flex-col ${message.type === 'user' ? 'items-end' : 'items-start'}`}
                >
                  {message.attachments && message.attachments.length > 0 && (
                    <div className="mb-2 max-w-[70%]">
                      {message.attachments.map((file, index) => (
                        <div 
                          key={index} 
                          className="bg-primary/10 dark:bg-primary rounded-lg p-3 mb-2 last:mb-0"
                        >
                          <div className="flex items-center gap-3">
                            <div className="bg-rose-500/10 rounded-lg p-2">
                              <svg className="w-6 h-6 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </div>
                            <div>
                              <div className="font-medium text-light-text-primary dark:text-white">{file.name}</div>
                              <div className="text-sm text-light-text-secondary dark:text-dark-text-secondary">PDF</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {message.content && (
                    <div
                      className={`max-w-[70%] rounded-lg p-4 whitespace-pre-wrap break-words ${
                        message.type === 'user'
                          ? 'bg-gradient-to-br from-primary to-primary/90 text-white shadow-sm'
                          : message.type === 'system'
                          ? 'bg-light-bg-tertiary dark:bg-dark-bg-tertiary text-light-text-secondary dark:text-dark-text-secondary border border-light-border dark:border-dark-border'
                          : 'text-light-text-primary dark:text-dark-text-primary'
                      }`}
                    >
                      {message.content}
                    </div>
                  )}
                </div>
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