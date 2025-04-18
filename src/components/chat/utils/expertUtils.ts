// Icon mapping for different expert types
const expertIconMap: Record<string, string> = {
  'finance': '💰',
  'judicial': '⚖️',
  'healthcare': '🏥',
  'leadership': '👥',
  'management': '📊',
  'technology': '💻',
  'hr': '👥',
  'marketing': '📢'
};

/**
 * Get the appropriate icon for a given expert type
 * @param expert The expert type
 * @returns An emoji icon representing the expert type
 */
export const getExpertIcon = (expert: string): string => {
  if (!expert || typeof expert !== 'string') {
    return '👤'; // Default icon for invalid input
  }

  const normalizedExpert = expert.toLowerCase();
  return expertIconMap[normalizedExpert] || '👤';
};

/**
 * Normalize an expert name (capitalize first letter)
 * @param expert The expert name to normalize
 * @returns The normalized expert name
 */
export const normalizeExpertName = (expert: string): string => {
  if (!expert || typeof expert !== 'string') {
    return expert;
  }
  return expert.charAt(0).toUpperCase() + expert.slice(1).toLowerCase();
}; 