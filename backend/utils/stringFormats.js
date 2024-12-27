/**
 * Converts a camelCase string to a space-separated, title-case string.
 * @param {string} str - The camelCase string.
 * @returns {string} - The space-separated, title-case string.
 */
const camelCaseToTitleCase = (str) => {
  return str
    .replace(/([A-Z])/g, ' $1') // Insert a space before each uppercase letter
    .replace(/^./, (char) => char.toUpperCase()) // Capitalize the first character
    .trim(); // Remove any leading or trailing spaces
};

module.exports = {camelCaseToTitleCase};
