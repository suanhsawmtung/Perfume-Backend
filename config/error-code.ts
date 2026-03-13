export const errorCode = {
  invalid: "Error_Invalid",
  unauthenticated: "Error_Unauthenticated",
  attack: "Error_Attack",
  accessTokenExpired: "Error_AccessTokenExpired",
  otpExpired: "Error_OtpExpired",
  requestExpired: "Error_RequestExpired",
  overLimit: "Error_OverLimit",
  alreadyExists: "Error_AlreadyExists",
  accountFreeze: "Error_AccountFreeze",
  notFound: "Error_NotFound",
  notAllowed: "Error_NotAllowed",
  maintenance: "Error_Maintenance",
  retry: "Error_Retry",
  retryAndLogout: "Error_RetryAndLogout",
  authNotFound: "Error_AuthNotFound",
};

// Error codes for auth processes: register, verify-otp, verify-password-otp, confirm-password, reset-password
export const authProcessErrorCode = {
  userAlreadyExists: "Error_UserAlreadyExists",
  otpNotExist: "Error_OtpNotExist",
  otpErrorCountLimitExceeded: "Error_OtpErrorCountLimitExceeded",
  otpCountLimitExceeded: "Error_OtpCountLimitExceeded",
  invalidToken: "Error_InvalidToken",
  expiredOtp: "Error_ExpiredOtp",
  invalidOrWrongOtp: "Error_InvalidOrWrongOtp",
  otpNotVerified: "Error_OtpNotVerified",
  userNotFound: "Error_UserNotFound",
};
