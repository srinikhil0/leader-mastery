import React from 'react';
import { FirebaseSession } from '../types/chat';

interface LeftSidebarProps {
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (collapsed: boolean) => void;
  sessions: FirebaseSession[];
  currentSessionId: string | null;
  isLoadingSessions: boolean;
  onSessionSelect: (session: FirebaseSession) => void;
  onNewChat: () => void;
  onNavigateToDocuments: () => void;
  onOpenSettings: () => void;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
  isSidebarCollapsed,
  setIsSidebarCollapsed,
  sessions,
  currentSessionId,
  isLoadingSessions,
  onSessionSelect,
  onNewChat,
  onNavigateToDocuments,
  onOpenSettings
}) => {
  return (
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
            onClick={onNewChat}
            className="mx-4 mt-4 bg-primary text-white py-2 px-4 rounded-lg
              flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>New Chat</span>
          </button>

          {/* Chat History */}
          <div className="flex-1 overflow-y-auto py-4">
            {isLoadingSessions ? (
              // Loading skeleton
              <div className="space-y-2 px-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-light-bg-tertiary dark:bg-dark-bg-tertiary rounded w-3/4"></div>
                  </div>
                ))}
              </div>
            ) : sessions.length > 0 ? (
              sessions.map(session => (
                <button
                  key={session.id}
                  onClick={() => onSessionSelect(session)}
                  className={`w-full px-4 py-2.5 hover:bg-light-bg-tertiary dark:hover:bg-dark-bg-tertiary flex items-center gap-2
                    ${currentSessionId === session.id ? 'bg-light-bg-tertiary dark:bg-dark-bg-tertiary' : ''}`}
                >
                  <svg className="w-0 h-4 text-light-text-tertiary dark:text-dark-text-tertiary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  </svg>
                  <span className="font-medium text-light-text-primary dark:text-dark-text-primary truncate">
                    {session.title || 'New Chat'}
                  </span>
                </button>
              ))
            ) : (
              <div className="px-4 text-light-text-tertiary dark:text-dark-text-tertiary text-center">
                No chat history
              </div>
            )}
          </div>

          {/* Bottom Buttons */}
          <div className="p-4 border-t border-light-border dark:border-dark-border space-y-2">
            <button 
              onClick={onNavigateToDocuments}
              className="w-full py-2 px-4 rounded-lg hover:bg-light-bg-tertiary dark:hover:bg-dark-bg-tertiary flex items-center gap-2 text-light-text-primary dark:text-dark-text-primary"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Documents</span>
            </button>
            <button 
              onClick={onOpenSettings}
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
}; 