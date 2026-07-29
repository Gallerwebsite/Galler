function decodeHtmlEntities(value) {
  if (typeof value !== 'string') return value;

  let decoded = value;
  for (let i = 0; i < 3; i += 1) {
    const next = decoded
      .replace(/&amp;/g, '&')
      .replace(/&#x27;/gi, "'")
      .replace(/&#39;/g, "'")
      .replace(/&quot;/g, '"')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>');

    if (next === decoded) break;
    decoded = next;
  }

  return decoded;
}

function decodeContentValues(value) {
  if (typeof value === 'string') return decodeHtmlEntities(value);
  if (Array.isArray(value)) return value.map(decodeContentValues);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [key, decodeContentValues(entry)])
    );
  }
  return value;
}

module.exports = { decodeHtmlEntities, decodeContentValues };
