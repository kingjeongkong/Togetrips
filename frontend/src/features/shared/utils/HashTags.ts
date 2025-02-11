const splitHashTags = (input: string) => {
  return input.split('#').filter((tag) => tag.trim() !== '');
};

const formatHashTags = (input: string) => {
  const tags = splitHashTags(input);
  return tags.map((tag) => `#${tag}`).join(' ');
};

export { splitHashTags, formatHashTags };
