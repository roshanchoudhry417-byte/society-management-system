/**
 * Generate a random numeric OTP of given length.
 * Used for visitor verification.
 */
const generateOTP = (length = 6) => {
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += Math.floor(Math.random() * 10);
  }
  return otp;
};

module.exports = generateOTP;
