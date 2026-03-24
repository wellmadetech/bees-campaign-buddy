import axios, { AxiosInstance, AxiosError } from 'axios';
import { config } from '../../config/index.js';

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function createBrazeClient(): AxiosInstance {
  const client = axios.create({
    baseURL: config.BRAZE_REST_ENDPOINT,
    timeout: 30_000,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.BRAZE_API_KEY}`,
    },
  });

  // Request logging
  client.interceptors.request.use((req) => {
    console.log(`[Braze] ${req.method?.toUpperCase()} ${req.url}`);
    return req;
  });

  // Response logging + retry with exponential backoff
  client.interceptors.response.use(
    (res) => {
      console.log(`[Braze] ${res.status} ${res.config.url}`);
      return res;
    },
    async (error: AxiosError) => {
      const cfg = error.config;
      if (!cfg) throw error;

      const cfgAny = cfg as unknown as Record<string, unknown>;
      const retryCount = (cfgAny.__retryCount as number) ?? 0;

      // Retry on rate limit (429) or server errors (5xx)
      const status = error.response?.status ?? 0;
      if ((status === 429 || status >= 500) && retryCount < MAX_RETRIES) {
        cfgAny.__retryCount = retryCount + 1;
        const delay = RETRY_DELAY_MS * Math.pow(2, retryCount);
        console.log(`[Braze] Retrying in ${delay}ms (attempt ${retryCount + 1}/${MAX_RETRIES})`);
        await sleep(delay);
        return client(cfg);
      }

      console.error(`[Braze] Error ${status}: ${error.message}`);
      throw error;
    },
  );

  return client;
}

export const brazeClient = createBrazeClient();
