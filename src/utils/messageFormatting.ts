export const formatMessageContent = (content: string): string => {
  // Replace Markdown bold syntax with HTML
  return content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
}; 