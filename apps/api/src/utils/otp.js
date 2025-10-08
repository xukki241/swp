/**
 * Generate random OTP code
 * @param {number} length - OTP length (default 6)
 * @returns {string} OTP code
 */
export const generateOTP = (length = 6) => {
  const digits = "0123456789";
  let otp = "";

  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
  }

  return otp;
};

/**
 * Get OTP expiration time
 * @param {number} minutes - Expiration time in minutes (default 10)
 * @returns {Date} Expiration date
 */
export const getOTPExpiration = (minutes = 10) => {
  const now = new Date();
  return new Date(now.getTime() + minutes * 60 * 1000);
};

/**
 * Check if OTP is expired
 * @param {Date} expiresAt - Expiration date
 * @returns {boolean} Is expired
 */
export const isOTPExpired = (expiresAt) => {
  return new Date() > new Date(expiresAt);
};
