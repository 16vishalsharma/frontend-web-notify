export const truncateText = (text: string, maxLength: number = 200): string => {
  if (!text) return '';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};
