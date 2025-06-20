// Extract hashtags from text
function extractHashtags(text) {
  if (!text) return [];
  const hashtagRegex = /#[\w\u0590-\u05ff]+/g;
  const hashtags = text.match(hashtagRegex) || [];
  return hashtags.map(tag => tag.slice(1)); // Remove # from tags
}

module.exports = extractHashtags;