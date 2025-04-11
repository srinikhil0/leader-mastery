import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Message, Citation, Conversation, Persona } from './types';
import MobileChatLayout from './MobileChatLayout';
import SettingsModal from '../settings/SettingsModal';

const ChatPage = () => {
  const navigate = useNavigate();
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

  // Mock user data
  const mockUser = {
    name: 'John Doe',
    email: 'john@example.com',
    lastLogin: new Date()
  };

  // Handle message submission
  const handleSubmit = async (input: string) => {
    if (!input.trim() || isGenerating) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      content: input.trim(),
      type: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMessage]);
    setCurrentInput('');
    setIsGenerating(true);
    setIsNewChat(false);

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
      inputRef.current?.focus();
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

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
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

  // Modal Component for Personas
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
              onClick={() => {
                // Handle persona selection
                setIsPersonaModalOpen(false);
              }}
              className="bg-light-bg-primary dark:bg-dark-bg-primary p-4 rounded-lg border-2 border-light-border dark:border-dark-border hover:border-primary 
                transition-all duration-300 flex flex-col items-center text-center"
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

  // Chat Input Component
  const ChatInput = () => (
    <div className="border-t border-light-border dark:border-dark-border px-4 py-2">
      <form 
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit(currentInput);
        }}
        className="space-y-2"
      >
        {/* Text Input */}
        <div className="relative">
          <textarea
            ref={inputRef}
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            disabled={isGenerating}
            placeholder={isGenerating ? "AI is generating..." : "Ask me anything..."}
            rows={1}
            style={{ resize: 'none' }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = 'auto';
              target.style.height = `${Math.min(target.scrollHeight, 200)}px`; // Increased max height to 200px
            }}
            className="w-full px-4 py-3 pr-20 rounded-lg border border-light-border dark:border-dark-border 
              bg-light-bg-primary dark:bg-dark-bg-primary text-light-text-primary dark:text-dark-text-primary 
              focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 
              transition-all duration-300 text-base placeholder:text-light-text-tertiary 
              dark:placeholder:text-dark-text-tertiary disabled:bg-light-bg-secondary 
              dark:disabled:bg-dark-bg-secondary disabled:cursor-not-allowed
              min-h-[44px] max-h-[200px] overflow-y-auto leading-6"
          />
          
          {/* Character count */}
          {currentInput.length > 0 && (
            <div className="absolute right-20 bottom-2 text-xs text-light-text-tertiary dark:text-dark-text-tertiary">
              {currentInput.length} characters
            </div>
          )}

          {/* Send and Mic Buttons */}
          <div className="absolute right-2 top-2 flex items-center gap-2">
            <button 
              type="button"
              disabled={isGenerating}
              onClick={() => setIsRecording(!isRecording)}
              className={`p-1 rounded transition-colors ${isRecording ? 'text-error' : 'text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text-primary dark:hover:text-dark-text-primary'} disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </button>
            <button
              type="submit"
              disabled={!currentInput.trim() || isGenerating}
              className="p-1 text-primary hover:text-primary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3.478 2.404a.75.75 0 00-.926.941l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.404z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 px-1">

          {/* Attach Button */}{/* Attach Button with Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsAttachMenuOpen(!isAttachMenuOpen)}
              className="text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text-primary dark:hover:text-dark-text-primary transition-colors flex items-center gap-1 text-sm"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
              <span>Attach</span>
            </button>
            {isAttachMenuOpen && (
              <div className="absolute bottom-full left-0 mb-1 w-48 bg-light-bg-primary dark:bg-dark-bg-primary rounded-lg shadow-lg border border-light-border dark:border-dark-border py-1 z-10">
                <button className="w-full px-3 py-1.5 text-left text-sm hover:bg-light-bg-tertiary dark:hover:bg-dark-bg-tertiary text-light-text-primary dark:text-dark-text-primary flex items-center gap-2">
                  <svg className="w-4 h-4 text-light-text-secondary dark:text-dark-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  From Drive
                </button>
                <button className="w-full px-3 py-1.5 text-left text-sm hover:bg-light-bg-tertiary dark:hover:bg-dark-bg-tertiary text-light-text-primary dark:text-dark-text-primary flex items-center gap-2">
                  <svg className="w-4 h-4 text-light-text-secondary dark:text-dark-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  Upload File
                </button>
                <button className="w-full px-3 py-1.5 text-left text-sm hover:bg-light-bg-tertiary dark:hover:bg-dark-bg-tertiary text-light-text-primary dark:text-dark-text-primary flex items-center gap-2">
                  <svg className="w-4 h-4 text-light-text-secondary dark:text-dark-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                  </svg>
                  Connect Database
                </button>
              </div>
            )}
          </div>
          
          {/* Search Button */}
          <button 
            type="button"
            className="text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text-primary dark:hover:text-dark-text-primary transition-colors flex items-center gap-1 text-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM3.6 9h16.8M3.6 15h16.8M12 3a15 15 0 0 1 4 10 15 15 0 0 1-4 10A15 15 0 0 1 8 13a15 15 0 0 1 4-10z" />
            </svg>
            <span>Search</span>
          </button>

          {/* Persona Button */}
          <button 
            type="button"
            onClick={() => setIsPersonaModalOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1 border border-light-border dark:border-dark-border rounded hover:bg-light-bg-tertiary dark:hover:bg-dark-bg-tertiary transition-colors text-light-text-primary dark:text-dark-text-primary text-sm"
          >
            <span>Persona</span>
          </button>

          {/* Source Button with Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsSourceMenuOpen(!isSourceMenuOpen)}
              className="flex items-center gap-1 px-2.5 py-1 border border-light-border dark:border-dark-border rounded hover:bg-light-bg-tertiary dark:hover:bg-dark-bg-tertiary transition-colors text-light-text-primary dark:text-dark-text-primary text-sm"
            >
              <span>Source</span>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {isSourceMenuOpen && (
              <div className="absolute bottom-full left-0 mb-1 w-32 bg-light-bg-primary dark:bg-dark-bg-primary rounded-lg shadow-lg border border-light-border dark:border-dark-border py-1 z-10">
                <button className="w-full px-3 py-1.5 text-left text-sm hover:bg-light-bg-tertiary dark:hover:bg-dark-bg-tertiary text-light-text-primary dark:text-dark-text-primary">Internal</button>
                <button className="w-full px-3 py-1.5 text-left text-sm hover:bg-light-bg-tertiary dark:hover:bg-dark-bg-tertiary text-light-text-primary dark:text-dark-text-primary">External</button>
              </div>
            )}
          </div>
        </div>
      </form>

      <p className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary text-center mt-2">
        AI can make mistakes. Please verify the responses.
      </p>
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

  // Chat Messages Component
  const ChatMessages = () => (
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
                : 'bg-light-bg-secondary dark:bg-dark-bg-secondary text-light-text-primary dark:text-dark-text-primary'
            }`}
          >
            {message.content}
          </div>
        </div>
      ))}
    </div>
  );

  // If mobile, use mobile layout
  if (isMobile) {
    return (
      <MobileChatLayout
        messages={messages}
        conversations={conversations}
        citations={citations}
        setCitations={setCitations}
        setMessages={setMessages}
        setConversations={setConversations}
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
      />
    );
  }

  // Desktop layout
  return (
    <div className="flex w-full h-screen bg-light-bg-tertiary dark:bg-dark-bg-tertiary">
      <LeftSidebar />
      
      <main className={`flex-1 flex flex-col transition-all duration-300 ease-in-out
        ${citations.length > 0 ? 'mr-80' : 'mr-0'}`}>
        {isNewChat ? (
          <>
            <NewChatWelcome />
            <ChatInput />
          </>
        ) : (
          <>
            <ChatMessages />
            <ChatInput />
          </>
        )}
      </main>

      <RightSidebar />
      <PersonaModal />
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        user={mockUser}
      />
    </div>
  );
};

export default ChatPage; 