import React, { useState } from 'react';
import { Message, Citation } from '../types/chat';
import { formatMessageContent } from '../../../utils/messageFormatting';

interface MessageComponentProps {
  message: Message;
  onFeedback?: (messageId: string, isPositive: boolean) => void;
  onShowCitations?: (citations: Citation[]) => void;
}

export const MessageComponent: React.FC<MessageComponentProps> = ({
  message,
  onFeedback,
  onShowCitations
}) => {
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);

  const handleCopyMessage = async (messageId: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (err) {
      console.error('Failed to copy message:', err);
    }
  };

  return (
    <div className={`flex flex-col ${message.type === 'user' ? 'items-end' : 'items-start'}`}>
      {/* Display attachments if present */}
      {message.attachments && message.attachments.length > 0 && (
        <div className="w-full max-w-[300px] mb-2">
          {message.attachments.map((attachment, index) => (
            <div 
              key={index}
              className="flex items-center gap-2 p-3 rounded-lg bg-gray-800/50 backdrop-blur-sm border border-gray-700"
            >
              <div className="flex-shrink-0 w-10 h-10 bg-rose-500 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {attachment.name}
                </p>
                <p className="text-xs text-gray-400 flex items-center gap-1">
                  <span className="bg-gray-700 px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wider">
                    {attachment.type.split('/')[1]?.toUpperCase() || 'FILE'}
                  </span>
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
          dangerouslySetInnerHTML={{ __html: formatMessageContent(message.content) }}
        />
      
        {/* Action buttons for AI messages */}
        {message.type === 'ai' && (
          <div className="flex items-center space-x-3 mt-2 text-light-text-secondary dark:text-dark-text-secondary">
            {onFeedback && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onFeedback(message.id, true)}
                  className="p-1.5 rounded-full hover:-translate-y-0.5 transition-transform duration-200 ease-in-out"
                  title="Helpful"
                >
                  <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M2 20h2c.55 0 1-.45 1-1v-9c0-.55-.45-1-1-1H2v11zm19.83-7.12c.11-.25.17-.52.17-.8V11c0-1.1-.9-2-2-2h-5.5l.92-4.65c.05-.22.02-.46-.08-.66-.23-.45-.52-.86-.88-1.22L14 2 7.59 8.41C7.21 8.79 7 9.3 7 9.83v7.84C7 18.95 8.05 20 9.34 20h8.11c.7 0 1.36-.37 1.72-.97l2.66-6.15z"/>
                  </svg>
                </button>
                <button
                  onClick={() => onFeedback(message.id, false)}
                  className="p-1.5 rounded-full hover:-translate-y-0.5 transition-transform duration-200 ease-in-out"
                  title="Not helpful"
                >
                  <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22 4h-2c-.55 0-1 .45-1 1v9c0 .55.45 1 1 1h2V4zM2.17 11.12c-.11.25-.17.52-.17.8V13c0 1.1.9 2 2 2h5.5l-.92 4.65c-.05.22-.02.46.08.66.23.45.52.86.88 1.22L10 22l6.41-6.41c.38-.38.59-.89.59-1.42V6.34C17 5.05 15.95 4 14.66 4h-8.1c-.71 0-1.36.37-1.72.97l-2.67 6.15z"/>
                  </svg>
                </button>
              </div>
            )}
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
              {onShowCitations && (
                <button
                  onClick={() => message.citations && onShowCitations(message.citations)}
                  className={`p-1.5 rounded-full hover:-translate-y-0.5 transition-transform duration-200 ease-in-out 
                    ${message.citations?.length 
                      ? 'text-light-text-primary dark:text-dark-text-primary hover:text-light-text-secondary dark:hover:text-dark-text-secondary' 
                      : 'text-light-text-tertiary dark:text-dark-text-tertiary'
                    }`}
                  title={message.citations?.length ? "Show citations" : "No citations available"}
                  disabled={!message.citations?.length}
                >
                  <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                  </svg>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 