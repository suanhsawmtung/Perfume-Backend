export const env = {
  port: process.env.PORT || 8000,
  appEnv: process.env.APP_ENV || "development",
  emailProvider: process.env.EMAIL_PROVIDER || "log",
  corsOrigins: process.env.CORS_ORIGINS?.split(",") || [],
  databaseUrl: process.env.DATABASE_URL || "",
  jwt: {
    accessTokenSecret: process.env.ACCESS_TOKEN_SECRET_KEY || "access_secret",
    refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET_KEY || "refresh_secret",
  },
};