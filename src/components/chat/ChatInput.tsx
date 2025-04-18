import React, { RefObject, Dispatch, SetStateAction, useRef, FormEvent, KeyboardEvent, useEffect, useState } from 'react';
import { Persona } from './types';
import { FaMicrophone, FaRecordVinyl } from 'react-icons/fa';
import { apiService } from '../../services/api';

// Web Speech API type declarations

interface ChatInputProps {
  inputRef: RefObject<HTMLTextAreaElement | null>;
  currentInput: string;
  setCurrentInput: Dispatch<SetStateAction<string>>;
  isGenerating: boolean;
  isRecording: boolean;
  onMicClick: () => void;
  onSubmit: (input: string) => Promise<void>;
  onAttachClick: () => void;
  onPersonaClick: () => void;
  onSourceClick: () => void;
  onSourceSelect: (source: 'internal' | 'external') => void;
  isSourceMenuOpen: boolean;
  isAttachMenuOpen: boolean;
  isPersonaMenuOpen: boolean;
  onFileUpload: (file: File) => Promise<void>;
  stagedFile: File | null;
  onRemoveFile: () => void;
  isFileProcessing?: boolean;
  selectedSource: 'internal' | 'external' | null;
  selectedPersona: Persona | null;
  availablePersonas?: Persona[];
  onPersonaSelect?: (persona: Persona) => void;
  onSendMessage: (message: string) => void;
  collectionName: string;
  userId: string;
}

const ChatInput: React.FC<ChatInputProps> = ({
  inputRef,
  currentInput,
  setCurrentInput,
  isGenerating,
  isRecording,
  onMicClick,
  onSubmit,
  onAttachClick,
  onPersonaClick,
  onSourceClick,
  onSourceSelect,
  isSourceMenuOpen,
  isAttachMenuOpen,
  isPersonaMenuOpen,
  onFileUpload,
  stagedFile,
  onRemoveFile,
  isFileProcessing = false,
  selectedSource,
  selectedPersona,
  availablePersonas,
  onPersonaSelect,
  onSendMessage,
  collectionName,
  userId,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [isAudioRecording, setIsAudioRecording] = useState(false);

  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && isAudioRecording) {
        mediaRecorderRef.current.stop();
      }
    };
  }, [isAudioRecording]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFileUpload(files[0]);
      onAttachClick();
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const cursorPosition = e.target.selectionStart;
    
    setCurrentInput(value);
    
    requestAnimationFrame(() => {
      if (inputRef.current) {
        inputRef.current.selectionStart = cursorPosition;
        inputRef.current.selectionEnd = cursorPosition;
      }
    });

    if (e.target) {
      e.target.style.height = 'auto';
      const maxHeight = 5 * 24;
      e.target.style.height = Math.min(e.target.scrollHeight, maxHeight) + 'px';
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isGenerating) return;

    const trimmedInput = currentInput.trim();
    if (!trimmedInput && !stagedFile) return;

    try {
      await onSubmit(trimmedInput);
      setCurrentInput('');
      if (inputRef.current) {
        inputRef.current.style.height = 'auto';
        inputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error submitting message:', error);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as FormEvent);
    }
  };

  // Handle audio recording
  const handleRecordClick = async () => {
    if (isAudioRecording) {
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
      }
      setIsAudioRecording(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          try {
            // Send audio directly to backend
            const response = await apiService.sendAudioQuestion(audioBlob, userId, collectionName);
            onSendMessage(response.text);
          } catch (error) {
            console.error('Error processing audio:', error);
          }
          stream.getTracks().forEach(track => track.stop());
        };

        mediaRecorder.start();
        setIsAudioRecording(true);
      } catch (error) {
        console.error('Error accessing microphone:', error);
      }
    }
  };

  return (
    <div className="px-4 py-2">
      <form onSubmit={handleSubmit} className="space-y-2">
        {stagedFile && (
          <div className="flex flex-wrap gap-2 mb-2">
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-800/30 backdrop-blur-sm rounded-lg">
              <div className="w-8 h-8 bg-rose-500/10 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-white">{stagedFile.name}</span>
                <span className="text-xs bg-rose-500/10 text-rose-500 px-2 py-0.5 rounded">PDF</span>
              </div>
              {isFileProcessing ? (
                <span className="text-sm text-gray-400">Reading documents</span>
              ) : (
                <button
                  type="button"
                  onClick={onRemoveFile}
                  className="p-1 hover:bg-gray-700/50 rounded-lg transition-colors text-gray-400 hover:text-white"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        )}
        <div className="relative">
          <textarea
            ref={inputRef}
            value={currentInput}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            disabled={isGenerating}
            placeholder={isGenerating ? "AI is generating..." : "Ask me anything..."}
            rows={1}
            style={{ resize: 'none' }}
            className="w-full px-4 py-2 pr-20 rounded-lg border border-light-border dark:border-dark-border 
              bg-light-bg-primary dark:bg-dark-bg-primary text-light-text-primary dark:text-dark-text-primary 
              focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 
              text-base placeholder:text-light-text-tertiary dark:placeholder:text-dark-text-tertiary
              min-h-[44px] max-h-[120px] overflow-y-auto leading-6
              custom-scrollbar"
            dir="ltr"
            autoFocus
          />
          
          <div className="absolute right-2 top-2 flex items-center gap-2">
            <button
              type="button"
              onClick={onMicClick}
              className={`p-2 rounded-lg transition-colors flex items-center gap-1
                ${isRecording 
                  ? 'text-red-500' 
                  : 'text-light-text-secondary dark:text-dark-text-secondary hover:text-primary'
                }`}
              title={isRecording ? "Stop listening" : "Start speech to text"}
            >
              <FaMicrophone className="w-4 h-4" />
              {isRecording && <span className="text-xs">Listening...</span>}
            </button>

            <button
              type="button"
              onClick={handleRecordClick}
              className={`p-2 rounded-lg transition-colors
                ${isAudioRecording 
                  ? 'text-red-500' 
                  : 'text-light-text-secondary dark:text-dark-text-secondary hover:text-primary'
                }`}
              title={isAudioRecording ? "Stop recording" : "Record audio message"}
            >
              <FaRecordVinyl className={`w-4 h-4 ${isAudioRecording ? 'animate-pulse' : ''}`} />
            </button>

            <button
              type="submit"
              disabled={isGenerating}
              className={`p-2 rounded-lg transition-colors flex items-center justify-center
                ${(!currentInput.trim() && !stagedFile) || isGenerating
                  ? 'text-light-text-tertiary dark:text-dark-text-tertiary'
                  : 'text-primary hover:text-primary/80'
                }`}
            >
              {isGenerating ? (
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3.478 2.404a.75.75 0 00-.926.941l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.404z" />
                </svg>
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 px-1">
          <div className="relative">
            <button
              type="button"
              onClick={onAttachClick}
              className="text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text-primary dark:hover:text-dark-text-primary transition-colors flex items-center gap-1 text-sm"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
              <span>Attach</span>
            </button>
            {isAttachMenuOpen && (
              <div className="absolute bottom-full left-0 mb-1 w-48 bg-light-bg-primary dark:bg-dark-bg-primary rounded-lg shadow-lg border border-light-border dark:border-dark-border py-1 z-10">
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
              multiple
            />
          </div>

          <button 
            type="button"
            className="text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text-primary dark:hover:text-dark-text-primary transition-colors flex items-center gap-1 text-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM3.6 9h16.8M3.6 15h16.8M12 3a15 15 0 0 1 4 10 15 15 0 0 1-4 10A15 15 0 0 1 8 13a15 15 0 0 1 4-10z" />
            </svg>
            <span>Search</span>
          </button>

          <div className="relative">
            <button 
              type="button"
              onClick={onPersonaClick}
              className="flex items-center gap-1 px-2.5 py-1 border border-light-border dark:border-dark-border rounded hover:bg-light-bg-tertiary dark:hover:bg-dark-bg-tertiary transition-colors text-light-text-primary dark:text-dark-text-primary text-sm"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              {selectedPersona ? (
                <>
                  <span>{selectedPersona.name}</span>
                  {selectedPersona.icon && <span className="ml-1">{selectedPersona.icon}</span>}
                </>
              ) : (
                <span>Persona</span>
              )}
              <svg className="w-3.5 h-3.5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {isPersonaMenuOpen && availablePersonas && (
              <div className="absolute bottom-full left-0 mb-1 w-48 bg-light-bg-primary dark:bg-dark-bg-primary rounded-lg shadow-lg border border-light-border dark:border-dark-border py-1 z-10">
                {availablePersonas.map((persona) => (
                  <button
                    key={persona.id}
                    onClick={() => onPersonaSelect?.(persona)}
                    className={`w-full px-3 py-1.5 text-left text-sm hover:bg-light-bg-tertiary dark:hover:bg-dark-bg-tertiary ${
                      selectedPersona?.id === persona.id ? 'text-primary' : 'text-light-text-primary dark:text-dark-text-primary'
                    } flex items-center gap-2`}
                  >
                    {persona.icon && <span>{persona.icon}</span>}
                    <span>{persona.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={onSourceClick}
              className="flex items-center gap-1 px-2.5 py-1 border border-light-border dark:border-dark-border rounded hover:bg-light-bg-tertiary dark:hover:bg-dark-bg-tertiary transition-colors text-light-text-primary dark:text-dark-text-primary text-sm"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <span>{selectedSource ? `${selectedSource.charAt(0).toUpperCase() + selectedSource.slice(1)}` : 'Source'}</span>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {isSourceMenuOpen && (
              <div className="absolute bottom-full left-0 mb-1 w-32 bg-light-bg-primary dark:bg-dark-bg-primary rounded-lg shadow-lg border border-light-border dark:border-dark-border py-1">
                <button 
                  onClick={() => onSourceSelect('internal')}
                  className="w-full px-3 py-1.5 text-left text-sm hover:bg-light-bg-tertiary dark:hover:bg-dark-bg-tertiary text-light-text-primary dark:text-dark-text-primary"
                >
                  Internal
                </button>
                <button 
                  onClick={() => onSourceSelect('external')}
                  className="w-full px-3 py-1.5 text-left text-sm hover:bg-light-bg-tertiary dark:hover:bg-dark-bg-tertiary text-light-text-primary dark:text-dark-text-primary"
                >
                  External
                </button>
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
};

export default ChatInput; 