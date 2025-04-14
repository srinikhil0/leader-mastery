import React, { RefObject, Dispatch, SetStateAction, useRef } from 'react';
import { Persona } from './types';

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
  onFileUpload: (file: File) => void;
  attachedFiles: File[];
  onRemoveFile: (fileIndex: number) => void;
  selectedSource: 'internal' | 'external' | null;
  selectedPersona: Persona | null;
  availablePersonas?: Persona[];
  onPersonaSelect?: (persona: Persona) => void;
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
  attachedFiles,
  onRemoveFile,
  selectedSource,
  selectedPersona,
  availablePersonas,
  onPersonaSelect
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        onFileUpload(file);
      });
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const cursorPosition = e.target.selectionStart;
    
    // Set the input value
    setCurrentInput(value);
    
    // Maintain cursor position
    requestAnimationFrame(() => {
      if (inputRef.current) {
        inputRef.current.selectionStart = cursorPosition;
        inputRef.current.selectionEnd = cursorPosition;
      }
    });

    // Adjust textarea height
    if (e.target) {
      e.target.style.height = 'auto';
      const maxHeight = 5 * 24; // 5 lines * 24px (line height)
      e.target.style.height = Math.min(e.target.scrollHeight, maxHeight) + 'px';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (currentInput.trim() && !isGenerating) {
        onSubmit(currentInput);
      }
    }
  };

  return (
    <div className="border-t border-light-border dark:border-dark-border px-4 py-2">
      <form onSubmit={(e) => {
        e.preventDefault();
        onSubmit(currentInput);
      }} className="space-y-2">
        {attachedFiles.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {attachedFiles.map((file, index) => (
              <div key={index} className="inline-flex items-center gap-2 px-3 py-1.5 bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-lg max-w-[300px]">
                <svg className="w-4 h-4 shrink-0 text-light-text-secondary dark:text-dark-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
                <span className="text-sm text-light-text-primary dark:text-dark-text-primary truncate">{file.name}</span>
                <button
                  type="button"
                  onClick={() => onRemoveFile(index)}
                  className="p-0.5 hover:bg-light-bg-tertiary dark:hover:bg-dark-bg-tertiary rounded-full text-light-text-secondary dark:text-dark-text-secondary"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
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
              text-left direction-ltr custom-scrollbar"
            dir="ltr"
            autoFocus
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
              onClick={onMicClick}
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
              <div data-attach-menu className="absolute bottom-full left-0 mb-1 w-48 bg-light-bg-primary dark:bg-dark-bg-primary rounded-lg shadow-lg border border-light-border dark:border-dark-border py-1 z-10">
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
              <div data-persona-menu className="absolute bottom-full left-0 mb-1 w-48 bg-light-bg-primary dark:bg-dark-bg-primary rounded-lg shadow-lg border border-light-border dark:border-dark-border py-1 z-10">
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
              <div data-source-menu className="absolute bottom-full left-0 mb-1 w-32 bg-light-bg-primary dark:bg-dark-bg-primary rounded-lg shadow-lg border border-light-border dark:border-dark-border py-1">
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