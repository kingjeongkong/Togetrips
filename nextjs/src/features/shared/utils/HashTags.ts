export const formatHashTags = (tags: string): string => {
  if (!tags) return '';

  return tags
    .split(',')
    .map((tag) => `#${tag.trim()}`)
    .join(' ');
};
