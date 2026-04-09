export const isValidProjectTitle = (title) => {
  if (typeof title !== "string") return false;

  const trimmed = title.trim();

  if (!trimmed) return false;              // empty or spaces
  if (trimmed.length < 3) return false;   // too short
  if (trimmed.length > 100) return false; // too long

  return true;
};

export const isValidProjectDescription = (description) => {
  if (typeof description !== "string") return false;

  const trimmed = description.trim();

  if (!trimmed) return false;
  if (trimmed.length < 10) return false;   // meaningful desc
  if (trimmed.length > 2000) return false; // limit

  return true;
};

export const isValidStringArray = (arr) => {
  if (!Array.isArray(arr)) return false;

  for (const item of arr) {
    if (typeof item !== "string" || !item.trim()) {
      return false;
    }
  }

  return true;
};

export const isValidRepoLink = (link) => {
  if (link === undefined || link === null) return true; // optional field

  if (typeof link !== "string") return false;

  const trimmed = link.trim();

  if (!trimmed) return true; // allow empty string

  // simple URL check
  return /^https?:\/\/.+/.test(trimmed);
};