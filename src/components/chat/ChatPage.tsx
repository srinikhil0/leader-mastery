import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import type { Citation, Persona } from './types';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import SettingsModal from '../settings/SettingsModal';
import ChatInput from './ChatInput';
import { useChatState } from './hooks/useChatState';
import { useSpeechRecognition } from './hooks/useSpeechRecognition';
import PersonaModal from './components/PersonaModal';
import { MessageComponent } from './components/MessageComponent';
import { LeftSidebar } from './components/LeftSidebar';
import { RightSidebar } from './components/RightSidebar';
import { NewChatWelcome } from './components/NewChatWelcome';
import { getExpertIcon } from './utils/expertUtils';

const ChatPage = () => {
  console.log('[ChatPage] Component rendering');
  
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  
  // State declarations
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isPersonaModalOpen, setIsPersonaModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSourceMenuOpen, setIsSourceMenuOpen] = useState(false);
  const [isAttachMenuOpen, setIsAttachMenuOpen] = useState(false);
  const [currentInput, setCurrentInput] = useState('');
  const [pageScale, setPageScale] = useState(1.0);
  const [selectedSource, setSelectedSource] = useState<'internal' | 'external' | null>(null);
  const [selectedExpert, setSelectedExpert] = useState<string | null>(null);
  const [selectedSubExpert, setSelectedSubExpert] = useState<string | null>(null);
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);

  // Custom hooks
  const {
    messages,
    sessions,
    currentSessionId,
    isNewChat,
    isGenerating,
    isLoadingSessions,
    handleSubmit,
    handleFileUpload,
    handleRemoveFile,
    handleExpertSelect: handleExpertSelectFromHook,
    handleSubExpertSelect: handleSubExpertSelectFromHook,
    handleSessionSelect,
    startNewChat,
    showCitations,
    activeCitations,
    isCitationsVisible,
    hideCitations,
    stagedFile,
    isFileProcessing
  } = useChatState({ userId: currentUser?.uid || '' });

  const {
    isRecording,
    startRecording,
    stopRecording
  } = useSpeechRecognition();

  // Effect to log state changes
  useEffect(() => {
    console.log('[ChatPage] State Update:', {
      messages,
      sessions,
      currentSessionId,
      isNewChat,
      isGenerating,
      isLoadingSessions,
      selectedExpert,
      selectedSubExpert,
      selectedPersona,
      activeCitations
    });
  }, [messages, sessions, currentSessionId, isNewChat, isGenerating, isLoadingSessions, selectedExpert, selectedSubExpert, selectedPersona, activeCitations]);

  const handleExpertSelect = async (expert: string) => {
    console.log('[ChatPage] Expert selected:', expert);
    if (!expert) {
      console.warn('[ChatPage] Expert selection called with empty expert');
      return;
    }

    try {
      const icon = getExpertIcon(expert);
      console.log('[ChatPage] Expert icon retrieved:', icon);
      
      if (!icon) {
        console.warn('[ChatPage] No icon found for expert:', expert);
        return;
      }
      
      setSelectedExpert(expert);
      setSelectedSubExpert(null);
      setSelectedPersona({
        id: expert.toLowerCase(),
        name: expert,
        description: '',
        icon
      });

      await handleExpertSelectFromHook(expert);
    } catch (error) {
      console.error('[ChatPage] Error in expert selection:', error);
    }
  };

  const handleSubExpertSelect = async (subExpert: string) => {
    console.log('[ChatPage] Sub-expert selected:', subExpert);
    if (!subExpert || !selectedExpert) {
      console.warn('[ChatPage] Invalid sub-expert selection:', { subExpert, selectedExpert });
      return;
    }

    try {
      setSelectedSubExpert(subExpert);
      
      if (selectedPersona) {
        setSelectedPersona({
          ...selectedPersona,
          description: subExpert
        });
      }

      await handleSubExpertSelectFromHook(subExpert);
    } catch (error) {
      console.error('[ChatPage] Error in sub-expert selection:', error);
    }
  };

  const handleClearSubExpert = () => {
    console.log('[ChatPage] Clearing sub-expert selection');
    setSelectedSubExpert(null);
    if (selectedPersona) {
      setSelectedPersona({
        ...selectedPersona,
        description: ''
      });
    }
  };

  const handleShowCitations = (messageCitations: Citation[]) => {
    console.log('[ChatPage] Showing citations:', messageCitations.length);
    showCitations(messageCitations);
  };

  const handleMicClick = () => {
    console.log('[ChatPage] Microphone clicked, recording state:', isRecording);
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleSourceSelect = (source: 'internal' | 'external') => {
    console.log('[ChatPage] Source selected:', source);
    setSelectedSource(source);
    setIsSourceMenuOpen(false);
  };

  const handleFeedback = (messageId: string, isPositive: boolean) => {
    console.log('[ChatPage] Feedback received:', { messageId, isPositive });
    // TODO: Implement feedback handling
  };

  const handlePersonaSelect = (persona: Persona) => {
    console.log('[ChatPage] Persona selected:', persona);
    handleExpertSelect(persona.name);
  };

  // Log when component renders
  console.log('[ChatPage] Rendering with current state:', {
    isNewChat,
    messagesCount: messages.length,
    currentSessionId,
    selectedExpert,
    selectedSubExpert
  });

  return (
    <div className="flex h-screen bg-light-bg-primary dark:bg-dark-bg-primary">
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

      <div className="flex-1 flex flex-col bg-light-bg-primary dark:bg-dark-bg-primary">
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
          selectedSource={selectedSource}
          selectedPersona={selectedPersona}
          onPersonaSelect={handlePersonaSelect}
          onSendMessage={handleSubmit}
          collectionName={currentUser?.uid || ''}
          userId={currentUser?.uid || ''}
        />
      </div>

      <RightSidebar
        isCitationsVisible={isCitationsVisible}
        activeCitations={activeCitations}
        pdfFile={null}
        pageScale={pageScale}
        onScaleChange={setPageScale}
        onClose={hideCitations}
      />

      <PersonaModal
        isOpen={isPersonaModalOpen}
        onClose={() => setIsPersonaModalOpen(false)}
        experts={[
          'Leadership',
          'Management',
          'Communication',
          'Strategy'
        ]}
        selectedExpert={selectedExpert}
        subExperts={selectedExpert ? [
          'Team Building',
          'Conflict Resolution',
          'Decision Making',
          'Change Management'
        ] : []}
        selectedSubExpert={selectedSubExpert}
        onExpertSelect={handleExpertSelect}
        onSubExpertSelect={handleSubExpertSelect}
        onClearSubExpert={handleClearSubExpert}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        user={currentUser}
      />
    </div>
  );
};

export default ChatPage;
