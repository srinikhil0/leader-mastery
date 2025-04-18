import { Dispatch, SetStateAction, useState, RefObject } from 'react';
import { useNavigate } from 'react-router-dom';
import { Message, FirebaseSession } from './types/chat';
import { Persona } from './types';
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

interface DesktopChatLayoutProps {
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
  inputRef?: RefObject<HTMLTextAreaElement>;
  selectedPersona: Persona | null;
  onPersonaSelect: (persona: Persona) => void;
  onSendMessage: (message: string) => void;
  collectionName: string;
}

const DesktopChatLayout: React.FC<DesktopChatLayoutProps> = ({
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
  onSendMessage,
  collectionName
}: DesktopChatLayoutProps) => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [pageScale, setPageScale] = useState(1.0);
  const [isAttachMenuOpen, setIsAttachMenuOpen] = useState(false);

  // Use custom hooks
  const {
    currentSessionId,
    isLoadingSessions,
    handleSubmit,
    handleFileUpload,
    handleRemoveFile,
    handleSessionSelect,
    startNewChat,
    showCitations,
    hideCitations,
    isCitationsVisible,
    activeCitations,
    stagedFile,
    isFileProcessing,
    currentPdfFile
  } = useChatState({ userId: currentUser?.uid || '' });

  const {
    startRecording,
    stopRecording
  } = useSpeechRecognition();

  const handleFeedback = (messageId: string, isPositive: boolean) => {
    // TODO: Implement feedback handling
    console.log(`Feedback for message ${messageId}: ${isPositive ? 'positive' : 'negative'}`);
  };

  const handleShowCitations = () => {
    if (activeCitations.length > 0) {
      showCitations(activeCitations);
    }
  };

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

  return (
    <div className="flex h-screen bg-gray-50">
      <LeftSidebar
        isSidebarCollapsed={isSidebarCollapsed}
        setIsSidebarCollapsed={setIsSidebarCollapsed}
        sessions={sessions}
        currentSessionId={currentSessionId}
        isLoadingSessions={isLoadingSessions}
        onSessionSelect={handleSessionSelect}
        onNewChat={startNewChat}
        onNavigateToDocuments={() => navigate('/documents')}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

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
          inputRef={inputRef || { current: null }}
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

      <RightSidebar
        isCitationsVisible={isCitationsVisible}
        activeCitations={activeCitations}
        pdfFile={currentPdfFile}
        pageScale={pageScale}
        onScaleChange={setPageScale}
        onClose={hideCitations}
      />

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

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        user={currentUser}
      />
    </div>
  );
};

export default DesktopChatLayout; 