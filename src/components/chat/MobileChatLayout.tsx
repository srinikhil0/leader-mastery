import { Dispatch, SetStateAction, useState, RefObject, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Message, FirebaseSession } from './types/chat';
import SettingsModal from '../settings/SettingsModal';
import { useAuth } from '../../hooks/useAuth';
import { useChatState } from './hooks/useChatState';
import { useSpeechRecognition } from './hooks/useSpeechRecognition';
import { LeftSidebar } from './components/LeftSidebar';
import { RightSidebar } from './components/RightSidebar';
import PersonaModal from './components/PersonaModal';
import { NewChatWelcome } from './components/NewChatWelcome';
import { MessageComponent } from './components/MessageComponent';
import ChatInput from './ChatInput';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

interface MobileChatLayoutProps {
  messages: Message[];
  sessions: FirebaseSession[];
  currentInput: string;
  setCurrentInput: Dispatch<SetStateAction<string>>;
  isNewChat: boolean;
  isGenerating: boolean;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: Dispatch<SetStateAction<boolean>>;
  isPersonaModalOpen: boolean;
  setIsPersonaModalOpen: Dispatch<SetStateAction<boolean>>;
  isSourceMenuOpen: boolean;
  setIsSourceMenuOpen: Dispatch<SetStateAction<boolean>>;
  isRecording: boolean;
  inputRef: RefObject<HTMLTextAreaElement>;
  currentSessionId: string | null;
  isLoadingSessions: boolean;
  onSendMessage: (message: string) => void;
  collectionName: string;
  stagedFile: File | null;
  isFileProcessing: boolean;
}

const MobileChatLayout: React.FC<MobileChatLayoutProps> = ({
  messages,
  sessions,
  currentInput,
  setCurrentInput,
  isNewChat,
  isGenerating,
  isSidebarCollapsed,
  setIsSidebarCollapsed,
  isPersonaModalOpen,
  setIsPersonaModalOpen,
  isSourceMenuOpen,
  setIsSourceMenuOpen,
  isRecording,
  inputRef,
  currentSessionId,
  isLoadingSessions,
  onSendMessage,
  collectionName,
  stagedFile,
  isFileProcessing
}: MobileChatLayoutProps) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { currentUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isAttachMenuOpen, setIsAttachMenuOpen] = useState(false);
  const navigate = useNavigate();
  const [pageScale, setPageScale] = useState(1.0);

  // Use custom hooks
  const {
    handleSubmit,
    handleFileUpload,
    handleRemoveFile,
    handleSessionSelect,
    startNewChat,
    showCitations,
    hideCitations,
    isCitationsVisible,
    activeCitations,
    currentPdfFile
  } = useChatState({ userId: currentUser?.uid || '' });

  const {
    startRecording,
    stopRecording
  } = useSpeechRecognition();

  const handleMicClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleSourceSelect = () => {
    setIsSourceMenuOpen(false);
  };

  const handleFeedback = (messageId: string, isPositive: boolean) => {
    // TODO: Implement feedback handling
    console.log(`Feedback for message ${messageId}: ${isPositive ? 'positive' : 'negative'}`);
  };

  const handleShowCitations = () => {
    if (activeCitations.length > 0) {
      showCitations(activeCitations);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-light-bg-primary dark:bg-dark-bg-primary">
      {/* Mobile Header */}
      <div className="bg-light-bg-primary dark:bg-dark-bg-primary border-b border-light-border dark:border-dark-border p-4 flex items-center justify-between">
        <button
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="p-2 hover:bg-light-bg-tertiary dark:hover:bg-dark-bg-tertiary rounded-lg transition-colors"
        >
          <svg className="w-5 h-5 text-light-text-secondary dark:text-dark-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <img 
          src="./leader-mastery-emblem-text.png" 
          alt="Leader Mastery"
          className="h-8 w-auto dark:drop-shadow-[0_0_0.3rem_#ffffff70]" 
        />
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="p-2 hover:bg-light-bg-tertiary dark:hover:bg-dark-bg-tertiary rounded-lg transition-colors"
        >
          <svg className="w-5 h-5 text-light-text-secondary dark:text-dark-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>

      {/* Mobile Sidebar */}
      {isSidebarCollapsed && (
        <div className="fixed inset-0 bg-black/50 z-40">
          <div className="w-64 h-full bg-light-bg-primary dark:bg-dark-bg-primary">
            <LeftSidebar
              isSidebarCollapsed={false}
              setIsSidebarCollapsed={setIsSidebarCollapsed}
              sessions={sessions}
              currentSessionId={currentSessionId}
              isLoadingSessions={isLoadingSessions}
              onSessionSelect={handleSessionSelect}
              onNewChat={startNewChat}
              onNavigateToDocuments={() => navigate('/documents')}
              onOpenSettings={() => setIsSettingsOpen(true)}
            />
          </div>
        </div>
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto px-4 py-6">
          {isNewChat && messages.length === 0 ? (
            <NewChatWelcome
              suggestedPrompts={[
                "What are the key principles of effective leadership?",
                "How can I improve my team's productivity?",
                "What are some strategies for conflict resolution?",
                "How can I develop my emotional intelligence?"
              ]}
              onPromptSelect={handleSubmit}
            />
          ) : (
            <div className="space-y-6">
              {messages.map(message => (
                <MessageComponent
                  key={message.id}
                  message={message}
                  onFeedback={handleFeedback}
                  onShowCitations={handleShowCitations}
                />
              ))}
            </div>
          )}
        </div>

        <ChatInput
          inputRef={inputRef}
          currentInput={currentInput}
          setCurrentInput={setCurrentInput}
          isGenerating={isGenerating}
          isRecording={isRecording}
          onMicClick={handleMicClick}
          onSubmit={handleSubmit}
          onAttachClick={() => setIsAttachMenuOpen(!isAttachMenuOpen)}
          onPersonaClick={() => setIsPersonaModalOpen(true)}
          onSourceClick={() => setIsSourceMenuOpen(!isSourceMenuOpen)}
          onSourceSelect={handleSourceSelect}
          isSourceMenuOpen={isSourceMenuOpen}
          isAttachMenuOpen={isAttachMenuOpen}
          isPersonaMenuOpen={isPersonaModalOpen}
          onFileUpload={handleFileUpload}
          stagedFile={stagedFile}
          onRemoveFile={handleRemoveFile}
          isFileProcessing={isFileProcessing}
          selectedSource={null}
          selectedPersona={null}
          onPersonaSelect={() => {}}
          onSendMessage={onSendMessage}
          collectionName={collectionName}
          userId={currentUser?.uid || ''}
        />
      </div>

      {/* Citations Sidebar */}
      {isCitationsVisible && (
        <div className="fixed inset-0 z-50">
          <RightSidebar
            isCitationsVisible={isCitationsVisible}
            activeCitations={activeCitations}
            pdfFile={currentPdfFile}
            pageScale={pageScale}
            onScaleChange={setPageScale}
            onClose={hideCitations}
          />
        </div>
      )}

      {/* Persona Modal */}
      <PersonaModal
        isOpen={isPersonaModalOpen}
        onClose={() => setIsPersonaModalOpen(false)}
        experts={['Leadership', 'Management', 'Communication', 'Strategy']}
        selectedExpert={null}
        subExperts={[]}
        selectedSubExpert={null}
        onExpertSelect={() => {}}
        onSubExpertSelect={() => {}}
        onClearSubExpert={() => {}}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        user={currentUser}
      />

      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept=".pdf,.doc,.docx,.txt"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFileUpload(e.target.files[0]);
          }
        }}
      />
    </div>
  );
};

export default MobileChatLayout;
