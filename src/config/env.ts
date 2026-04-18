export const env = {
  port: process.env.PORT || 8000,
  appEnv: process.env.APP_ENV || "development",
  emailProvider: process.env.EMAIL_PROVIDER || "log",
  corsOrigins: process.env.CORS_ORIGINS?.split(",") || [],
  googleClientId: process.env.GOOGLE_CLIENT_ID || "google-client-id",
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || "google-client-secret",
  serverUrl: process.env.SERVER_URL || "http://localhost:8080",
  webUrl: process.env.WEB_URL || "http://localhost:5173",
  databaseUrl: process.env.DATABASE_URL || "",
  jwt: {
    accessTokenSecret: process.env.ACCESS_TOKEN_SECRET_KEY || "access_secret",
    refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET_KEY || "refresh_secret",
  },
};