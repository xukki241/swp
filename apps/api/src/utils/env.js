/**
 * Get environment variable with fallback support
 * @param {string} key - Environment variable key
 * @param {*} fallback - Fallback value if key doesn't exist
 * @returns {*} Environment variable value or fallback
 */
export const getEnv = (key, fallback = undefined) => {
  const value = process.env[key];
  return value !== undefined ? value : fallback;
};
/**
 * Get environment variable as number
 * @param {string} key - Environment variable key
 * @param {number} fallback - Fallback number value
 * @returns {number} Environment variable as number or fallback
 */
export const getEnvAsNumber = (key, fallback) => {
  const value = process.env[key];
  if (value === undefined) return fallback;
  const parsed = Number(value);
  return isNaN(parsed) ? fallback : parsed;
};
/**
 * Get environment variable as boolean
 * @param {string} key - Environment variable key
 * @param {boolean} fallback - Fallback boolean value
 * @returns {boolean} Environment variable as boolean or fallback
 */
export const getEnvAsBoolean = (key, fallback) => {
  const value = process.env[key];
  if (value === undefined) return fallback;
  return value.toLowerCase() === "true" || value === "1";
};
