import React from 'react';

interface NewChatWelcomeProps {
  suggestedPrompts: string[];
  onPromptSelect: (prompt: string) => void;
}

export const NewChatWelcome: React.FC<NewChatWelcomeProps> = ({
  suggestedPrompts,
  onPromptSelect
}) => {
  return (
    <div className="flex flex-col items-center justify-center flex-1 p-8">
      <img 
        src="./leader-mastery-emblem-text.png" 
        alt="Leader Mastery"
        className="h-24 w-24 mb-8" 
      />
      <h1 className="text-4xl font-bold text-light-text-primary dark:text-dark-text-primary mb-4">
        Welcome to Leader Mastery
      </h1>
      <p className="text-light-text-secondary dark:text-dark-text-secondary mb-8 text-center max-w-md">
        Your AI-powered leadership development assistant. Ask me anything about leadership, management, and professional growth.
      </p>
      <div className="grid grid-cols-2 gap-4 w-full max-w-2xl">
        {suggestedPrompts.map((prompt, index) => (
          <button
            key={index}
            onClick={() => onPromptSelect(prompt)}
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
}; 