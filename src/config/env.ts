// Environment configuration
export const ENV_CONFIG = {
  JWT_SECRET: process.env.JWT_SECRET || 'masapp-default-jwt-secret-key-2024',
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
  CSRF_SECRET: process.env.CSRF_SECRET || 'masapp-default-csrf-secret-2024',
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || '10000',
} as const;

// Validate required environment variables
export function validateEnv() {
  const required = ['JWT_SECRET', 'CSRF_SECRET'];
  
  for (const key of required) {
    if (!process.env[key]) {
      console.warn(`Warning: ${key} environment variable is not set`);
    }
  }
}

// Initialize environment validation
validateEnv();
