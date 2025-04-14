import { useState, useRef, useEffect } from 'react';
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

  // Input ref for focus management
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Suggested prompts for new chat
  const suggestedPrompts = [
    "How can I improve my leadership skills?",
    "What are effective team building exercises?",
    "How to handle difficult conversations?",
    "Tips for better time management"
  ];

  // Personas data
  const personas: Persona[] = [
    {
      id: 'judicial',
      name: 'Judicial',
      description: 'Legal and judicial domain expertise',
      icon: '⚖️'
    },
    {
      id: 'insurance',
      name: 'Insurance',
      description: 'Insurance sector knowledge',
      icon: '🛡️'
    },
    {
      id: 'finance',
      name: 'Finance',
      description: 'Financial services expertise',
      icon: '💰'
    },
    {
      id: 'healthcare',
      name: 'Healthcare',
      description: 'Healthcare industry insights',
      icon: '🏥'
    }
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

  // Handle message submission
  const handleSubmit = async (input: string) => {
    if (!input.trim() || isGenerating) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      content: input.trim(),
      type: 'user',
      timestamp: new Date()
    };

    // Batch state updates
    setMessages(prev => [...prev, newMessage]);
    setIsGenerating(true);
    setIsNewChat(false);
    setCurrentInput('');

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: 'This is a simulated AI response.',
        type: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsGenerating(false);
      // Focus after response
      requestAnimationFrame(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      });
    }, 1000);
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
    try {
      // Validate file type
      const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
      if (!validTypes.includes(file.type)) {
        throw new Error('Invalid file type. Please upload PDF, DOC, DOCX, or TXT files.');
      }

      // Validate file size (10MB limit)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        throw new Error('File size exceeds 10MB limit.');
      }

      // Add system message for file upload
      const newMessage: Message = {
        id: Date.now().toString(),
        content: `File uploaded: ${file.name}`,
        type: 'system',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, newMessage]);
      
      // Here you would typically upload the file to your server
      console.log('Uploading file:', file.name);
      
    } catch (error) {
      console.error('Upload error:', error);
      // Add error message to chat
      const errorMessage: Message = {
        id: Date.now().toString(),
        content: `Upload error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        type: 'system',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const handlePersonaSelect = (persona: Persona) => {
    setSelectedPersona(persona);
    setIsPersonaModalOpen(false);
    
    // Add system message for persona selection
    const newMessage: Message = {
      id: Date.now().toString(),
      content: `Persona selected: ${persona.name} - ${persona.description}`,
      type: 'system',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768); // Use standard md breakpoint
    };

    // Set initial value
    handleResize();

    // Add event listener with debounce for better performance
    let timeoutId: NodeJS.Timeout;
    const debouncedResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleResize, 100);
    };

    window.addEventListener('resize', debouncedResize);

    // Cleanup
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', debouncedResize);
    };
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
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 
      transition-opacity duration-300 ${isPersonaModalOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div className="bg-light-bg-primary dark:bg-dark-bg-primary rounded-xl p-6 max-w-4xl w-full mx-4 transform transition-all duration-300">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary">Select Persona</h2>
          <button 
            onClick={() => setIsPersonaModalOpen(false)}
            className="text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text-primary dark:hover:text-dark-text-primary transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {personas.map(persona => (
            <button
              key={persona.id}
              onClick={() => handlePersonaSelect(persona)}
              className={`bg-light-bg-primary dark:bg-dark-bg-primary p-4 rounded-lg border-2 ${
                selectedPersona?.id === persona.id 
                  ? 'border-primary' 
                  : 'border-light-border dark:border-dark-border hover:border-primary'
              } transition-all duration-300 flex flex-col items-center text-center`}
            >
              <span className="text-4xl mb-2">{persona.icon}</span>
              <h3 className="font-semibold text-light-text-primary dark:text-dark-text-primary mb-1">{persona.name}</h3>
              <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">{persona.description}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

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
        inputRef={inputRef as React.RefObject<HTMLTextAreaElement>}
        onFileUpload={handleFileUpload}
        onPersonaSelect={handlePersonaSelect}
        selectedPersona={selectedPersona}
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
              isSourceMenuOpen={isSourceMenuOpen}
              isAttachMenuOpen={isAttachMenuOpen}
              onFileUpload={handleFileUpload}
            />
          </>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map(message => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg p-4 whitespace-pre-wrap break-words ${
                      message.type === 'user'
                        ? 'bg-primary text-white'
                        : message.type === 'system'
                        ? 'bg-light-bg-tertiary dark:bg-dark-bg-tertiary text-light-text-secondary dark:text-dark-text-secondary border border-light-border dark:border-dark-border'
                        : 'bg-light-bg-secondary dark:bg-dark-bg-secondary text-light-text-primary dark:text-dark-text-primary'
                    }`}
                  >
                    {message.content}
                  </div>
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
              isSourceMenuOpen={isSourceMenuOpen}
              isAttachMenuOpen={isAttachMenuOpen}
              onFileUpload={handleFileUpload}
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