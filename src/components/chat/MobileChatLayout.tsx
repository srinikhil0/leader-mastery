import { Dispatch, SetStateAction, useState, useRef } from 'react';
import { Message, Conversation, Citation, Persona } from './types';
import { useNavigate } from 'react-router-dom';
import SettingsModal from '../settings/SettingsModal';
import { useAuth } from '../../hooks/useAuth';

interface MobileChatLayoutProps {
  messages: Message[];
  conversations: Conversation[];
  citations: Citation[];
  setMessages: Dispatch<SetStateAction<Message[]>>;
  setConversations: Dispatch<SetStateAction<Conversation[]>>;
  setCitations: (citations: Citation[]) => void;
  currentInput: string;
  setCurrentInput: (input: string) => void;
  isNewChat: boolean;
  setIsNewChat: Dispatch<SetStateAction<boolean>>;
  isGenerating: boolean;
  setIsGenerating: Dispatch<SetStateAction<boolean>>;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: Dispatch<SetStateAction<boolean>>;
  isPersonaModalOpen: boolean;
  setIsPersonaModalOpen: Dispatch<SetStateAction<boolean>>;
  isAttachMenuOpen: boolean;
  setIsAttachMenuOpen: Dispatch<SetStateAction<boolean>>;
  isSourceMenuOpen: boolean;
  setIsSourceMenuOpen: Dispatch<SetStateAction<boolean>>;
  isRecording: boolean;
  setIsRecording: (isRecording: boolean) => void;
  inputRef: React.RefObject<HTMLTextAreaElement>;
  onFileUpload: (file: File) => void;
  onPersonaSelect: (persona: Persona) => void;
  selectedPersona: Persona | null;
}

export default function MobileChatLayout({
  messages,
  conversations,
  citations,
  setMessages,
  setConversations,
  setCitations,
  currentInput,
  setCurrentInput,
  isNewChat,
  setIsNewChat,
  isGenerating,
  setIsGenerating,
  isSidebarCollapsed,
  setIsSidebarCollapsed,
  isPersonaModalOpen,
  setIsPersonaModalOpen,
  isAttachMenuOpen,
  setIsAttachMenuOpen,
  isSourceMenuOpen,
  setIsSourceMenuOpen,
  isRecording,
  setIsRecording,
  inputRef,
  onFileUpload,
  onPersonaSelect,
  selectedPersona
}: MobileChatLayoutProps) {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileUpload(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col h-screen bg-light-bg-secondary dark:bg-dark-bg-secondary">
      {/* Mobile Header */}
      <header className="fixed top-0 left-0 right-0 h-14 bg-light-bg-primary dark:bg-dark-bg-primary border-b border-light-border dark:border-dark-border flex items-center px-4 z-30">
        <button 
          onClick={() => setIsSidebarCollapsed(false)}
          className="p-2 hover:bg-light-bg-tertiary dark:hover:bg-dark-bg-tertiary rounded-lg transition-colors"
        >
          <svg className="w-5 h-5 text-light-text-secondary dark:text-dark-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <img 
          src="./leader-mastery-emblem-text.png" 
          alt="Leader Mastery"
          className="h-8 w-auto ml-3" 
        />
      </header>

      {/* Mobile Content Area */}
      <main className="flex-1 overflow-hidden mt-14 mb-[120px]">
        {messages.length === 0 && isNewChat ? (
          <div className="h-full flex flex-col items-center justify-center p-4">
            <img 
              src="./leader-mastery-emblem-text.png" 
              alt="Leader Mastery"
              className="h-16 w-16 mb-6" 
            />
            <p className="text-light-text-secondary dark:text-dark-text-secondary text-center text-sm max-w-xs">
              Your AI-powered leadership development assistant. Ask me anything about leadership and management.
            </p>
          </div>
        ) : (
          <div className="h-full overflow-y-auto px-4 py-6 space-y-6">
            {messages.map(message => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[85%] rounded-lg p-3 ${
                  message.type === 'user'
                    ? 'bg-primary text-white'
                    : 'bg-light-bg-tertiary dark:bg-dark-bg-tertiary text-light-text-primary dark:text-dark-text-primary'
                }`}>
                  {message.content}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Citations Drawer */}
      <div className={`fixed inset-y-0 right-0 w-[80%] max-w-md bg-light-bg-primary dark:bg-dark-bg-primary transform transition-transform duration-300 ease-in-out z-40 ${
        citations.length > 0 ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="h-full flex flex-col pt-14">
          <div className="p-4 border-b border-light-border dark:border-dark-border flex justify-between items-center">
            <h2 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary">Citations</h2>
            <button onClick={() => setCitations([])}>
              <svg className="w-5 h-5 text-light-text-secondary dark:text-dark-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
      </div>

      {/* Mobile Input Area */}
      <div className="fixed bottom-0 left-0 right-0 bg-light-bg-primary dark:bg-dark-bg-primary border-t border-light-border dark:border-dark-border p-4 z-20">
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            if (currentInput.trim() && !isGenerating) {
              setIsGenerating(true);
              const newMessage: Message = {
                id: Date.now().toString(),
                content: currentInput.trim(),
                type: 'user',
                timestamp: new Date()
              };
              setMessages((prev: Message[]) => [...prev, newMessage]);
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
                inputRef.current?.focus();
              }, 1000);
            }
          }}
          className="space-y-3"
        >
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
                const maxHeight = 5 * 24; // 5 lines * 24px (line height)
                target.style.height = Math.min(target.scrollHeight, maxHeight) + 'px';
              }}
              className="w-full px-4 py-2 pr-20 rounded-lg border border-light-border dark:border-dark-border 
                bg-light-bg-primary dark:bg-dark-bg-primary text-light-text-primary dark:text-dark-text-primary 
                focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 
                text-base placeholder:text-light-text-tertiary dark:placeholder:text-dark-text-tertiary
                min-h-[44px] max-h-[120px] overflow-y-auto leading-6"
              autoFocus
            />
            
            {/* Character count */}
            {currentInput.length > 0 && (
              <div className="absolute right-20 bottom-2 text-xs text-light-text-tertiary dark:text-dark-text-tertiary">
                {currentInput.length} characters
              </div>
            )}

            <div className="absolute right-2 top-2 flex items-center gap-2">
              <button 
                type="button"
                disabled={isGenerating}
                onClick={() => setIsRecording(!isRecording)}
                className={`p-1.5 rounded-full ${isRecording ? 'text-error' : 'text-light-text-secondary dark:text-dark-text-secondary'}`}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </button>
              <button
                type="submit"
                disabled={!currentInput.trim() || isGenerating}
                className="p-1.5 text-primary disabled:opacity-50"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3.478 2.404a.75.75 0 00-.926.941l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.404z" />
                </svg>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-4">
              <div className="relative">
                <button 
                  type="button" 
                  className="text-light-text-secondary dark:text-dark-text-secondary p-1.5" 
                  onClick={() => setIsAttachMenuOpen(!isAttachMenuOpen)}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                </button>
                {isAttachMenuOpen && (
                  <div className="absolute bottom-full left-0 mb-1 w-48 bg-light-bg-primary dark:bg-dark-bg-primary rounded-lg shadow-lg border border-light-border dark:border-dark-border py-1 z-50">
                    <button className="w-full px-3 py-1.5 text-left text-sm hover:bg-light-bg-tertiary dark:hover:bg-dark-bg-tertiary text-light-text-primary dark:text-dark-text-primary">
                      Connect to Drive
                    </button>
                    <button className="w-full px-3 py-1.5 text-left text-sm hover:bg-light-bg-tertiary dark:hover:bg-dark-bg-tertiary text-light-text-primary dark:text-dark-text-primary">
                      Connect to DB
                    </button>
                    <button 
                      onClick={handleUploadClick}
                      className="w-full px-3 py-1.5 text-left text-sm hover:bg-light-bg-tertiary dark:hover:bg-dark-bg-tertiary text-light-text-primary dark:text-dark-text-primary"
                    >
                      Upload from Device
                    </button>
                  </div>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.txt"
                />
              </div>
              <button type="button" className="text-light-text-secondary dark:text-dark-text-secondary p-1.5">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM3.6 9h16.8M3.6 15h16.8M12 3a15 15 0 0 1 4 10 15 15 0 0 1-4 10A15 15 0 0 1 8 13a15 15 0 0 1 4-10z" />
                </svg>
              </button>
              <button type="button" className="text-light-text-secondary dark:text-dark-text-secondary p-1.5" onClick={() => setIsPersonaModalOpen(true)}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </button>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsSourceMenuOpen(!isSourceMenuOpen)}
                  className="text-light-text-secondary dark:text-dark-text-secondary p-1.5 flex items-center gap-1"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {isSourceMenuOpen && (
                  <div className="absolute bottom-full left-0 mb-1 w-32 bg-light-bg-primary dark:bg-dark-bg-primary rounded-lg shadow-lg border border-light-border dark:border-dark-border py-1 z-50">
                    <button className="w-full px-3 py-1.5 text-left text-sm hover:bg-light-bg-tertiary dark:hover:bg-dark-bg-tertiary text-light-text-primary dark:text-dark-text-primary">Internal</button>
                    <button className="w-full px-3 py-1.5 text-left text-sm hover:bg-light-bg-tertiary dark:hover:bg-dark-bg-tertiary text-light-text-primary dark:text-dark-text-primary">External</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Mobile Sidebar Overlay */}
      {!isSidebarCollapsed && (
        <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setIsSidebarCollapsed(true)} />
      )}

      {/* Mobile Sidebar */}
      <div className={`fixed top-0 left-0 h-full w-[280px] bg-light-bg-primary dark:bg-dark-bg-primary z-50 transform transition-transform duration-300 ${
        isSidebarCollapsed ? '-translate-x-full' : 'translate-x-0'
      }`}>
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="p-4 border-b border-light-border dark:border-dark-border flex items-center justify-between">
            <img 
              src="./leader-mastery-emblem-text.png" 
              alt="Leader Mastery"
              className="h-8 w-auto"
            />
            <button 
              onClick={() => setIsSidebarCollapsed(true)}
              className="p-2 hover:bg-light-bg-tertiary dark:hover:bg-dark-bg-tertiary rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-light-text-secondary dark:text-dark-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* New Chat Button */}
          <button 
            onClick={() => {
              setIsNewChat(true);
              setIsSidebarCollapsed(true);
            }}
            className="mx-4 mt-4 bg-primary text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors"
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
                onClick={() => {
                  setIsNewChat(false);
                  setIsSidebarCollapsed(true);
                  setConversations((prev: Conversation[]) => prev.map((c: Conversation) => ({
                    ...c,
                    active: c.id === conv.id
                  })));
                  setMessages([]); // Clear messages when switching conversations
                }}
                className="w-full px-4 py-3 hover:bg-light-bg-tertiary dark:hover:bg-dark-bg-tertiary flex flex-col items-start"
              >
                <span className="font-medium text-light-text-primary dark:text-dark-text-primary truncate w-full text-left">
                  {conv.title}
                </span>
                <span className="text-sm text-light-text-secondary dark:text-dark-text-secondary truncate w-full text-left">
                  {conv.lastMessage}
                </span>
              </button>
            ))}
          </div>

          {/* Bottom Buttons */}
          <div className="p-4 border-t border-light-border dark:border-dark-border space-y-2">
            <button 
              onClick={() => {
                navigate('/documents');
                setIsSidebarCollapsed(true);
              }}
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
        </div>
      </div>

      {/* Persona Modal */}
      {isPersonaModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
          <div className="bg-light-bg-primary dark:bg-dark-bg-primary rounded-xl p-6 m-4 w-full max-w-lg">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-light-text-primary dark:text-dark-text-primary">Select Persona</h2>
              <button 
                onClick={() => setIsPersonaModalOpen(false)}
                className="text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text-primary dark:hover:text-dark-text-primary"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
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
              ].map(persona => (
                <button 
                  key={persona.id}
                  onClick={() => onPersonaSelect(persona)}
                  className={`bg-light-bg-primary dark:bg-dark-bg-primary p-4 rounded-lg border-2 ${
                    selectedPersona?.id === persona.id 
                      ? 'border-primary' 
                      : 'border-light-border dark:border-dark-border hover:border-primary'
                  } transition-all duration-300 flex flex-col items-center text-center`}
                >
                  <span className="text-3xl mb-2">{persona.icon}</span>
                  <h3 className="font-semibold text-light-text-primary dark:text-dark-text-primary mb-1">{persona.name}</h3>
                  <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">{persona.description}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        user={currentUser}
      />
    </div>
  );
};
