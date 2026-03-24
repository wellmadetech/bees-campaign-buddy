import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(10),
  JWT_EXPIRES_IN: z.string().default('15m'),
  BEES_SSO_CLIENT_ID: z.string().default('campaign-buddy'),
  BEES_SSO_CLIENT_SECRET: z.string().default('dev-secret'),
  BEES_SSO_ISSUER_URL: z.string().url().default('https://sso.bees-one.com'),
  BEES_SSO_CALLBACK_URL: z.string().url().default('http://localhost:4000/api/auth/sso/callback'),
  BRAZE_API_KEY: z.string().default('dev-braze-key'),
  BRAZE_REST_ENDPOINT: z.string().url().default('https://rest.iad-01.braze.com'),
  BRAZE_WEBHOOK_SECRET: z.string().default('dev-webhook-secret'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const config = parsed.data;
